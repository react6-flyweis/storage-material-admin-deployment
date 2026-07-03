import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/modules/auth/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Menu, Sparkles, Mail, Phone, Copy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import FollowUpDialog from "@/components/follow-up/follow-up-dialog";
import { useFollowUpAiScriptsQuery } from "@/modules/followups/followups.hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocket } from "@/utils/socketContextProvider";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

type ScriptItem = {
  id: string;
  name: string;
  type: "mail" | "phone";
  text: string;
  time: string;
  tag: {
    label: string;
    color: string;
  };
  createdAt?: string;
};

const toneClassByLabel: Record<string, string> = {
  professional: "bg-blue-100 text-blue-700",
  friendly: "bg-green-100 text-green-700",
  urgent: "bg-red-100 text-red-700",
};

function getScriptText(item: {
  script?: string;
  message?: string;
  content?: string;
  generatedScript?: string;
}) {
  return (
    item.script?.trim() ||
    item.generatedScript?.trim() ||
    item.content?.trim() ||
    item.message?.trim() ||
    ""
  );
}

function getRelativeTime(value?: string) {
  if (!value) {
    return "Recently";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const deltaInMinutes = Math.round((timestamp - Date.now()) / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(deltaInMinutes) < 60) {
    return formatter.format(deltaInMinutes, "minute");
  }

  const deltaInHours = Math.round(deltaInMinutes / 60);
  if (Math.abs(deltaInHours) < 24) {
    return formatter.format(deltaInHours, "hour");
  }

  const deltaInDays = Math.round(deltaInHours / 24);
  return formatter.format(deltaInDays, "day");
}

export default function AiScriptGeneratorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { socket, isConnected } = useSocket();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  const {
    data: leadsResponse,
    isLoading: isLeadsLoading,
    isError: isLeadsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["leads", "admin", "list", "ai-generator-infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get("/api/admin/leads", {
        params: { page: pageParam, limit: 20 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil((lastPage?.data?.total || 0) / (lastPage?.data?.limit || 20));
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const onSession = (data: any) => {
      setActiveSessionId(data.sessionId);
      if (data.messages) {
        const msgs = data.messages.map((m: any, i: number) => ({
          id: `msg-${Date.now()}-${i}`,
          text: m.content,
          sender: m.role,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setMessages(msgs);
      }
    };

    const onTyping = () => {
      setIsTyping(true);
      setStreamingMessage("");
    };

    const onChunk = (data: any) => {
      setStreamingMessage((prev) => prev + data.delta);
    };

    const onDone = (data: any) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          text: data.reply,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      setStreamingMessage("");
    };

    const onError = (data: any) => {
      setIsTyping(false);
      setStreamingMessage("");
      console.error("AI Script Error:", data.message);
    };

    const onSessionsList = (data: any) => {
      setSessionsList(data.sessions || []);
      setIsSessionsLoading(false);
    };

    socket.emit("ai_script:list");

    socket.on("ai_script:sessions", onSessionsList);
    socket.on("ai_script:session", onSession);
    socket.on("ai_script:typing", onTyping);
    socket.on("ai_script:chunk", onChunk);
    socket.on("ai_script:done", onDone);
    socket.on("ai_script:error", onError);

    return () => {
      socket.off("ai_script:sessions", onSessionsList);
      socket.off("ai_script:session", onSession);
      socket.off("ai_script:typing", onTyping);
      socket.off("ai_script:chunk", onChunk);
      socket.off("ai_script:done", onDone);
      socket.off("ai_script:error", onError);
    };
  }, [socket, isConnected]);

  const leadsList = useMemo(() => {
    const items = leadsResponse?.pages.flatMap((page: any) => page.data?.leads || []) || [];
    return items.map((lead: any) => ({
      id: lead._id,
      name: lead.customerId?.firstName || lead.customerId?.customerId || "Unknown Customer",
      details: [lead.buildingType, lead.location].filter(Boolean).join(" - ") || "No details",
      status: lead.lifecycleStatus || "New",
      createdAt: lead.createdAt,
    }));
  }, [leadsResponse]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastLeadElementRef = useCallback((node: HTMLDivElement) => {
    if (isLeadsLoading || isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLeadsLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const toneClassByLabel: Record<string, string> = {
    professional: "bg-blue-100 text-blue-700",
    casual: "bg-green-100 text-green-700",
    urgent: "bg-red-100 text-red-700",
    "initial contact": "bg-blue-100 text-blue-700",
    "requirements gathered": "bg-blue-100 text-blue-700",
    friendly: "bg-yellow-100 text-yellow-700",
  };

  const getScriptText = (item: any) =>
    item.generatedScript || item.script || item.message || item.content || "";

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "Just now";
    
    const timestamp = new Date(dateString).getTime();
    if (isNaN(timestamp)) {
      return "Unknown time";
    }

    const deltaInMinutes = Math.round((timestamp - Date.now()) / (1000 * 60));
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(deltaInMinutes) < 60) {
      return formatter.format(deltaInMinutes, "minute");
    }

    const deltaInHours = Math.round(deltaInMinutes / 60);
    if (Math.abs(deltaInHours) < 24) {
      return formatter.format(deltaInHours, "hour");
    }

    const deltaInDays = Math.round(deltaInHours / 24);
    return formatter.format(deltaInDays, "day");
  };

  const scripts = useMemo<ScriptItem[]>(() => {
    return sessionsList.map((session, index) => {
      const lastAssistantMessage = session.messages?.slice().reverse().find((m: any) => m.role === 'assistant');
      const text = lastAssistantMessage?.content || "No messages yet";
      const name = session.leadId?.projectName || session.leadId?.name || "General Session";
      
      return {
        id: session._id,
        name,
        type: "mail",
        text,
        time: getRelativeTime(session.createdAt),
        tag: {
          label: "session",
          color: "bg-blue-100 text-blue-700",
        },
        createdAt: session.createdAt,
      };
    });
  }, [sessionsList]);

  const effectiveSelectedScriptId = selectedScriptId;

  const selectedScript = useMemo(
    () => leadsList.find((item: any) => item.id === effectiveSelectedScriptId) ?? null,
    [leadsList, effectiveSelectedScriptId],
  );

  const messagesToRender = messages;

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket || !isConnected) return;

    const newMsg = inputMessage;
    setInputMessage("");

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        text: newMsg,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    socket.emit("ai_script:message", {
      sessionId: activeSessionId,
      content: newMsg,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="bg-teal-400 text-white px-6 py-3 shadow-sm">
        <h1 className="text-lg font-medium">AI Follow-Up Script Generator</h1>
      </div>

      {/* Main Content */}
      <div className=" p-6">
        {/* Chat Header */}
        <Card className="bg-white shadow-sm mb-4 py-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-[350px] max-h-[400px] overflow-y-auto p-2 bg-white rounded-lg shadow-md">
                  <div className="space-y-2">
                    {isSessionsLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading AI sessions...</div>
                    ) : scripts.length === 0 ? (
                      <div className="border rounded-lg p-3 bg-white text-sm text-gray-500 text-center">
                        No AI sessions found
                      </div>
                    ) : (
                      scripts.map((item: any) => (
                        <div
                          key={item.id}
                          className={cn(
                            "border rounded-lg p-3 bg-white cursor-pointer hover:bg-gray-50",
                            effectiveSelectedScriptId === item.id &&
                              "border-blue-300 ring-1 ring-blue-200",
                          )}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setSelectedScriptId(item.id);
                            setMessages([]);
                            if (socket && isConnected) {
                              socket.emit("ai_script:start", { sessionId: item.id });
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="flex justify-center w-8 h-8 mt-1">
                                <Sparkles className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="overflow-hidden">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {item.name}
                                  </h4>
                                  <span className={cn("ml-2 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", item.tag.color)}>
                                    {item.tag.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {item.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <h2 className="font-medium text-gray-900">
                AI Follow-Up Script Generator
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {(effectiveSelectedScriptId || activeSessionId) ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedScriptId(null);
                    setActiveSessionId(null);
                    setMessages([]);
                  }}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              ) : null}
              <FollowUpDialog showClientSelector={true}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Sparkles className="h-4 w-4" />
                  Use Script
                </Button>
              </FollowUpDialog>
            </div>
          </div>

          {/* Messages Container */}
          <div className="p-6 space-y-4 min-h-125 max-h-125 overflow-y-auto">
            {isLeadsLoading ? (
              <div className="h-full min-h-105 flex items-center justify-center text-sm text-gray-500">
                Loading leads...
              </div>
            ) : isLeadsError ? (
              <div className="h-full min-h-105 flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-red-600">
                  Failed to load leads.
                </p>
              </div>
            ) : !effectiveSelectedScriptId && !activeSessionId ? (
              <div className="h-full min-h-105 flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Select a Lead to Start</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Choose a lead from the list below or the menu above to generate follow-up scripts.
                  </p>
                </div>
                <div className="text-center space-y-4 w-full max-w-sm">
                  <Select
                    onValueChange={(val) => {
                      setSelectedScriptId(val);
                      setMessages([]);
                      if (socket && isConnected) {
                        socket.emit("ai_script:start", { leadId: val });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Choose a lead from the list..." />
                    </SelectTrigger>
                    <SelectContent>
                      {leadsList.map((item: any, index: number) => {
                        const isLastItem = index === leadsList.length - 1;
                        return (
                          <div key={item.id} ref={isLastItem ? lastLeadElementRef : null}>
                            <SelectItem value={item.id}>
                              {item.name} {item.details ? `(${item.details})` : ""}
                            </SelectItem>
                          </div>
                        );
                      })}
                      {isFetchingNextPage && (
                        <div className="p-2 text-center text-xs text-gray-500">Loading more...</div>
                      )}
                      {leadsList.length === 0 && !isLeadsLoading && (
                        <SelectItem value="none" disabled>
                          No leads available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : messagesToRender.length === 0 ? (
              <div className="h-full min-h-105 flex items-center justify-center text-sm text-gray-500 text-center">
                Send a message to start generating a script...
              </div>
            ) : (
              messagesToRender.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border text-gray-900 shadow-sm",
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white border text-gray-900 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {streamingMessage || "Typing..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-white"
                disabled={!isConnected || isLeadsLoading || isLeadsError || (!activeSessionId && !effectiveSelectedScriptId)}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                disabled={!isConnected || isLeadsLoading || isLeadsError || (!activeSessionId && !effectiveSelectedScriptId)}
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
