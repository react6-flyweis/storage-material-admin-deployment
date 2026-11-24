import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSocket } from "@/utils/socketContextProvider";
import { useChatHistoryQuery } from "@/modules/leads/leads.hooks";
import {
  getLeadChatStatusProvider,
  getLeadTranscriptsProvider,
  type ChatMessage,
  type ChatStatusData,
} from "@/modules/leads/leads.api";
import ChatDropOffDialog from "@/components/leads/chat-dropoff-dialog";
import ChannelBadge from "@/components/leads/channel-badge";
import {
  getMessageSource,
  getMessageSourceLabel,
  resolveChatChannel,
} from "@/lib/chat-source";

/**
 * Shared admin "Open Chat" panel for a lead (website widget or Facebook Messenger).
 * Used by the lead list chat dialog, the lead detail Open Chat tab and the /leads/:id/chats-ui page.
 *
 * - Joins the lead room on the /admin socket, shows history and live messages.
 * - Every bubble shows where it was sent (Website / Facebook / Phone) from `sourceLabel`.
 * - Staff replies always go through `sales_message`; the backend delivers to Messenger.
 */

export type LeadChatPanelProps = {
  /** Mongo _id of the lead. */
  leadId: string;
  /** Display id shown under the title (job id). */
  displayId?: string;
  customerName?: string;
  /** lead.source when known — fallback for the channel until chat-status loads. */
  leadSource?: string | null;
  /** Set false while a surrounding dialog is closed to avoid fetching / joining. */
  enabled?: boolean;
  /** Element used for the title, e.g. DialogTitle inside a dialog. */
  titleAs?: React.ElementType;
  className?: string;
  headerClassName?: string;
  messagesClassName?: string;
};

type ChatStatusSocketPayload = Partial<ChatStatusData> & {
  leadId?: string;
  leadIsOnline?: boolean;
};

type CustomerOnlineStatusPayload = {
  leadId?: string;
  leadIsOnline?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

const formatTime = (isoString?: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

function formatLastSeen(timestamp?: string | null) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getInitials(value?: string | null, fallback = "UN") {
  const initials = (value ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || fallback;
}

/**
 * History endpoints have returned several shapes over time — accept all of them.
 * Returns the first non-empty message list (an empty `messages: []` must not hide `chat.messages`).
 */
function extractHistoryMessages(historyRes: unknown): ChatMessage[] {
  if (!historyRes || typeof historyRes !== "object") return [];
  const raw = historyRes as Record<string, any>;
  const data = raw.data ?? raw;
  const candidates = [
    data,
    data?.chat?.messages,
    data?.messages,
    data?.messenger?.messages,
    data?.recentMessages,
    data?.data?.recentMessages,
    data?.data?.messages,
    data?.data,
    raw.chat?.messages,
    raw.messages,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate as ChatMessage[];
    }
  }
  return [];
}

function sortByCreatedAt(list: ChatMessage[]) {
  return [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function messageKey(m: ChatMessage) {
  return m._id || `${m.createdAt}|${m.senderType}|${m.content}`;
}

/** Merge lists, de-duplicating by id (later lists win), oldest first. */
function mergeMessages(...lists: ChatMessage[][]) {
  const byKey = new Map<string, ChatMessage>();
  for (const list of lists) {
    for (const m of list) byKey.set(messageKey(m), m);
  }
  return sortByCreatedAt(Array.from(byKey.values()));
}

export default function LeadChatPanel({
  leadId,
  displayId,
  customerName,
  leadSource,
  enabled = true,
  titleAs: TitleTag = "h3",
  className,
  headerClassName,
  messagesClassName,
}: LeadChatPanelProps) {
  const isValidMongoId = Boolean(leadId && leadId.length === 24);
  const isActive = enabled && isValidMongoId;

  // Staff transcript endpoint: full website + Facebook Messenger thread.
  // The public history endpoint is the website widget's and may not include Messenger
  // messages, so it is only merged in as a fallback.
  const { data: transcriptsRes, isLoading: isTranscriptsLoading } = useQuery({
    queryKey: ["admin", "leads", "chat-transcript", leadId],
    queryFn: () => getLeadTranscriptsProvider(leadId, "chat"),
    enabled: isActive,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const { data: historyRes, isLoading: isHistoryLoading } = useChatHistoryQuery(
    leadId,
    isActive,
  );
  const isLoading = isTranscriptsLoading && isHistoryLoading;
  const { data: chatStatusRes } = useQuery({
    queryKey: ["admin", "leads", "chat-status", leadId],
    queryFn: () => getLeadChatStatusProvider(leadId),
    enabled: isActive,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isDropOffDialogOpen, setIsDropOffDialogOpen] = useState(false);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  // null = unknown yet (do not lock the composer until we know).
  const [isCustomerOnline, setIsCustomerOnline] = useState<boolean | null>(null);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [statusChannel, setStatusChannel] = useState<string | null>(null);
  const [canStaffSend, setCanStaffSend] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const channel = resolveChatChannel(statusChannel, { source: leadSource });
  const isFacebook = channel === "facebook";
  const name = customerName?.trim() || "Customer";

  const applyStatus = useCallback((status: ChatStatusSocketPayload) => {
    const online = status.isCustomerOnline ?? status.leadIsOnline;
    if (typeof online === "boolean") setIsCustomerOnline(online);
    if (status.channel) setStatusChannel(status.channel);
    if (typeof status.canStaffSend === "boolean") setCanStaffSend(status.canStaffSend);
    const seen = status.leadLastSeenAt ?? status.customerOnline?.lastSeenAt;
    if (seen !== undefined) setLastSeenAt(seen ?? null);
  }, []);

  useEffect(() => {
    if (chatStatusRes?.success && chatStatusRes.data) {
      applyStatus(chatStatusRes.data);
    }
  }, [chatStatusRes, applyStatus]);

  useEffect(() => {
    if (!historyRes && !transcriptsRes) return;
    const fromHistory = extractHistoryMessages(historyRes);
    const fromTranscript = extractHistoryMessages(transcriptsRes);
    setMessages((prev) => mergeMessages(prev, fromHistory, fromTranscript));
  }, [historyRes, transcriptsRes]);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, enabled]);

  useEffect(() => {
    if (!isActive || !socket || !isConnected) return;

    socket.emit("join_lead_chat", { leadId });
    socket.emit("mark_messages_read", { leadId });

    const onNewMessage = (msg: ChatMessage) => {
      if (msg.leadId !== leadId) return;
      setMessages((prev) => {
        if (msg._id && prev.some((m) => m._id === msg._id)) return prev;
        const withoutTemp = prev.filter(
          (m) =>
            !(
              m._id?.startsWith("temp-") &&
              m.content === msg.content &&
              m.senderType === msg.senderType
            ),
        );
        return mergeMessages(withoutTemp, [msg]);
      });
      socket.emit("mark_messages_read", { leadId });
    };

    const onCustomerTyping = (data: { isTyping?: boolean; leadId?: string }) => {
      if (data.leadId && data.leadId !== leadId) return;
      setIsCustomerTyping(Boolean(data.isTyping));
    };

    // e.g. "Saved in the CRM, but Facebook did not accept the reply"
    const onError = (data: { message?: string }) => {
      toast.error(data?.message ?? "An unexpected chat error occurred.");
    };

    const onChatStatus = (status: ChatStatusSocketPayload) => {
      if (status.leadId && status.leadId !== leadId) return;
      applyStatus(status);
    };

    const onCustomerOnlineStatus = (payload: CustomerOnlineStatusPayload) => {
      if (payload.leadId !== leadId) return;
      const online = payload.leadIsOnline ?? payload.isOnline;
      if (typeof online === "boolean") setIsCustomerOnline(online);
      if (payload.lastSeenAt) setLastSeenAt(payload.lastSeenAt);
    };

    socket.on("new_message", onNewMessage);
    socket.on("customer_typing", onCustomerTyping);
    socket.on("error", onError);
    socket.on("chat_status", onChatStatus);
    socket.on("customer_online_status", onCustomerOnlineStatus);

    return () => {
      socket.emit("leave_lead_chat", { leadId });
      socket.off("new_message", onNewMessage);
      socket.off("customer_typing", onCustomerTyping);
      socket.off("error", onError);
      socket.off("chat_status", onChatStatus);
      socket.off("customer_online_status", onCustomerOnlineStatus);
    };
  }, [isActive, socket, isConnected, leadId, applyStatus]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Website: the composer closes when the customer leaves the site.
  // Facebook: Messenger delivers replies while the customer is away, so only
  // lock when the backend says staff cannot send (e.g. chat ended).
  const isComposerLocked = isFacebook
    ? canStaffSend === false
    : isCustomerOnline === false;
  const lockedMessage = isFacebook
    ? "Replies are disabled for this chat."
    : "Customer is offline. Chat is closed.";
  const showFacebookAwayHint =
    isFacebook && !isComposerLocked && isCustomerOnline === false;

  const presence = useMemo(() => {
    if (!isConnected) {
      return { dot: "bg-red-500", text: "Disconnected", tone: "text-red-500" };
    }
    if (isCustomerOnline) {
      return {
        dot: "bg-green-500",
        text: isFacebook ? "Active on Facebook" : "Customer Online",
        tone: "text-green-600",
      };
    }
    if (isCustomerOnline === false) {
      return {
        dot: "bg-gray-400",
        text: lastSeenAt ? `Last seen ${formatLastSeen(lastSeenAt)}` : "Customer Offline",
        tone: "text-gray-500",
      };
    }
    return { dot: "bg-gray-300", text: "Checking status…", tone: "text-gray-400" };
  }, [isConnected, isCustomerOnline, isFacebook, lastSeenAt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socket || !isConnected) return;

    socket.emit("sales_typing_start", { leadId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("sales_typing_stop", { leadId });
    }, 2000);
  };

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !socket || !isConnected || isComposerLocked) return;

    // Same event for website and Facebook — backend routes Messenger delivery.
    socket.emit("sales_message", { leadId, content, senderType: "admin" });
    setInput("");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("sales_typing_stop", { leadId });
  };

  return (
    <div className={cn("flex flex-col overflow-hidden", className)}>
      <div className={cn("px-6 py-4 border-b", headerClassName)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 bg-gray-100 shrink-0">
              <AvatarFallback className="text-sm text-gray-600 font-medium uppercase">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <TitleTag className="text-base font-semibold">Chat with {name}</TitleTag>
                <ChannelBadge
                  source={channel}
                  label={isFacebook ? "Facebook Messenger" : "Website chat"}
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {displayId ? <span>{displayId}</span> : null}
                <span className={cn("flex items-center gap-1", presence.tone)}>
                  <span className={cn("h-2 w-2 rounded-full", presence.dot)} />
                  {presence.text}
                </span>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs shrink-0"
            onClick={() => setIsDropOffDialogOpen(true)}
          >
            Follow-up
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        className={cn(
          "flex-1 overflow-y-auto px-6 py-4 flex flex-col relative",
          messagesClassName,
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-sm text-gray-500">
            No messages yet.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, index) => {
              const isYou = m.senderType === "admin" || m.senderType === "sales";
              const isBot = m.senderType === "ai";
              const senderLabel = isBot
                ? `${m.senderName || "Assistant"} • `
                : isYou && m.senderName
                  ? `${m.senderName} • `
                  : "";

              return (
                <div
                  key={m._id ?? `${m.createdAt}-${index}`}
                  className={`flex gap-2 ${isYou ? "justify-end" : "justify-start"}`}
                >
                  {!isYou && (
                    <Avatar className="h-8 w-8 bg-gray-100 flex-shrink-0">
                      <AvatarFallback className="text-xs text-gray-600 uppercase">
                        {isBot ? "AI" : getInitials(m.senderName || name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div
                      className={`whitespace-pre-wrap p-3 rounded-lg text-sm ${
                        isYou
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : isBot
                            ? "bg-purple-100 text-purple-900 rounded-bl-sm border border-purple-200"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-xs text-gray-400 ${
                        isYou ? "justify-end" : "justify-start"
                      }`}
                    >
                      <ChannelBadge
                        source={getMessageSource(m)}
                        label={getMessageSourceLabel(m)}
                      />
                      <span>
                        {senderLabel}
                        {formatTime(m.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {isCustomerTyping && (
              <div className="flex gap-2 justify-start">
                <Avatar className="h-8 w-8 bg-gray-100 flex-shrink-0">
                  <AvatarFallback className="text-xs text-gray-600 uppercase">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 text-gray-500 rounded-lg rounded-bl-sm p-3 text-sm italic">
                  typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t bg-gray-50 mt-auto relative">
        {isComposerLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/50 backdrop-blur-[1px]">
            <span className="text-sm font-medium text-gray-500 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-gray-100">
              {lockedMessage}
            </span>
          </div>
        )}
        <div
          className={`flex items-center gap-2 transition-all ${
            isComposerLocked ? "opacity-40 pointer-events-none blur-[1px]" : ""
          }`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
            disabled={!isConnected}
            className="flex-1 bg-white"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected || isComposerLocked}
            size="icon"
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {showFacebookAwayHint ? (
          <div className="mt-2 text-xs text-gray-500">
            Customer is away on Facebook — they&apos;ll see your reply in Messenger.
          </div>
        ) : null}
      </div>

      <ChatDropOffDialog
        open={isDropOffDialogOpen}
        onOpenChange={setIsDropOffDialogOpen}
        leadId={leadId}
        customerName={name}
      />
    </div>
  );
}
