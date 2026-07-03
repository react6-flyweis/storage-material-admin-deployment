import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { useSocket } from "@/utils/socketContextProvider";
import { useChatHistoryQuery } from "@/modules/leads/leads.hooks";
import { toast } from "sonner";
import type { ChatMessage } from "@/modules/leads/leads.api";

type Lead = {
  id: string;
  _id?: string;
  backendId?: string;
  name: string;
  chatCount?: number;
  assignedToName?: string;
};

type Props = {
  lead: Lead;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const formatTime = (isoString: string) => {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export default function ChatDialog({
  lead,
  trigger,
  open,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDialogOpen = open ?? internalOpen;

  const actualLeadId = lead.backendId || lead._id || lead.id;
  
  // Ensure we don't query with display ID, only valid Mongo ID
  const isValidMongoId = Boolean(actualLeadId && actualLeadId.length === 24);
  
  const { data: historyRes, isLoading } = useChatHistoryQuery(
    actualLeadId, 
    isDialogOpen && isValidMongoId
  );
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [isCustomerOnline, setIsCustomerOnline] = useState(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (historyRes?.data) {
      const resData = historyRes.data as any;
      const msgs = Array.isArray(resData) 
        ? resData 
        : (resData.recentMessages || resData.messages || resData.data?.recentMessages || resData.data || []);
      setMessages(msgs);
    }
  }, [historyRes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isDialogOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isDialogOpen]);

  useEffect(() => {
    if (!isDialogOpen || !socket || !isConnected) return;

    socket.emit("join_lead_chat", { leadId: actualLeadId });
    socket.emit("mark_messages_read", { leadId: actualLeadId });

    const onNewMessage = (msg: ChatMessage) => {
      if (msg.leadId === actualLeadId) {
        setMessages((prev) => {
          if (prev.find((m) => m._id && m._id === msg._id)) return prev;
          
          const withoutTemp = prev.filter(m => !(m._id?.startsWith("temp-") && m.content === msg.content && m.senderType === msg.senderType));
          return [...withoutTemp, msg];
        });
        socket.emit("mark_messages_read", { leadId: actualLeadId });
      }
    };

    const onCustomerTyping = (data: { isTyping: boolean }) => {
      setIsCustomerTyping(data.isTyping);
    };

    const onError = (data: { message: string }) => {
      toast.error(data.message);
    };

    const onChatStatus = (status: any) => {
      if (status.leadId === actualLeadId) {
        setIsCustomerOnline(status.isCustomerOnline ?? status.leadIsOnline ?? true);
      }
    };

    const onCustomerOnlineStatus = (payload: any) => {
      if (payload.leadId === actualLeadId) {
        setIsCustomerOnline(payload.leadIsOnline);
      }
    };

    socket.on("new_message", onNewMessage);
    socket.on("customer_typing", onCustomerTyping);
    socket.on("error", onError);
    socket.on("chat_status", onChatStatus);
    socket.on("customer_online_status", onCustomerOnlineStatus);

    return () => {
      socket.emit("leave_lead_chat", { leadId: actualLeadId });
      socket.off("new_message", onNewMessage);
      socket.off("customer_typing", onCustomerTyping);
      socket.off("error", onError);
      socket.off("chat_status", onChatStatus);
      socket.off("customer_online_status", onCustomerOnlineStatus);
    };
  }, [isDialogOpen, socket, isConnected, actualLeadId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socket || !isConnected) return;

    socket.emit("sales_typing_start", { leadId: actualLeadId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("sales_typing_stop", { leadId: actualLeadId });
    }, 2000);
  };

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected) return;

    socket.emit("sales_message", { leadId: actualLeadId, content: input.trim(), senderType: "admin" });
    
    setInput("");
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("sales_typing_stop", { leadId: actualLeadId });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const rawName = lead.assignedToName || lead.name;
  const displayName = typeof rawName === 'object' && rawName !== null ? (rawName as any).name || "User" : String(rawName || "User");

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-3xl h-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-gray-100">
                <AvatarFallback className="text-sm text-gray-600 font-medium uppercase">
                  {displayName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Chat with {displayName}
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{lead.id}</span>
                  {isConnected && isCustomerOnline ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span> Customer Online
                    </span>
                  ) : isConnected && !isCustomerOnline ? (
                    <span className="flex items-center gap-1 text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-gray-400"></span> Customer Offline
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span> Disconnected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col relative">
          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(messages) && messages.map((m) => {
                const isYou = m.senderType === "admin" || m.senderType === "sales";
                const isCustomer = m.senderType === "customer";
                const isBot = m.senderType === "ai";
                
                return (
                  <div
                    key={m._id}
                    className={`flex gap-2 ${
                      isYou ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isYou && (
                      <Avatar className="h-8 w-8 bg-gray-100 flex-shrink-0">
                        <AvatarFallback className="text-xs text-gray-600 uppercase">
                          {isBot ? "AI" : String(lead.name || "UN").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      <div
                        className={`p-3 rounded-lg text-sm ${
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
                        className={`text-xs text-gray-400 ${
                          isYou ? "text-right" : "text-left"
                        }`}
                      >
                        {isBot ? "Assistant • " : (isYou && m.senderName ? `${m.senderName} • ` : "")}
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isCustomerTyping && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-8 w-8 bg-gray-100 flex-shrink-0">
                    <AvatarFallback className="text-xs text-gray-600 uppercase">
                      {String(lead.name || "UN").slice(0, 2)}
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
          {!isCustomerOnline && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/50 backdrop-blur-[1px]">
              <span className="text-sm font-medium text-gray-500 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-gray-100">
                Customer is offline. Chat is closed.
              </span>
            </div>
          )}
          <div className={`flex items-center gap-2 transition-all ${!isCustomerOnline ? 'opacity-40 pointer-events-none blur-[1px]' : ''}`}>
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
              disabled={!input.trim() || !isConnected}
              size="icon"
              className="h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
