import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSocket } from "@/utils/socketContextProvider";
import { useChatHistoryQuery } from "@/modules/leads/leads.hooks";
import { getLeadDetailProvider } from "@/modules/leads/leads.api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChatMessage } from "@/modules/leads/leads.api";

const formatTime = (isoString: string) => {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export default function LeadChats() {
  const navigate = useNavigate();
  const { leadId } = useParams();

  // Fetch lead details for header info
  const { data: leadResponse } = useQuery({
    queryKey: ["lead", "detail", leadId],
    queryFn: () => getLeadDetailProvider(leadId!),
    enabled: !!leadId,
  });

  const leadData = leadResponse?.data;
  const lead = leadData?.lead;
  const customer = leadData?.customer;

  const actualLeadId = leadId;
  const isValidMongoId = actualLeadId && actualLeadId.length === 24;

  const { data: historyRes, isLoading } = useChatHistoryQuery(
    actualLeadId!, 
    !!isValidMongoId
  );

  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (historyRes?.data) {
      const msgs = Array.isArray(historyRes.data) 
        ? historyRes.data 
        // @ts-ignore
        : (historyRes.data.messages || historyRes.data.data || []);
      setMessages(msgs);
    }
  }, [historyRes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  useEffect(() => {
    if (!socket || !isConnected || !isValidMongoId) return;

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

    socket.on("new_message", onNewMessage);
    socket.on("customer_typing", onCustomerTyping);
    socket.on("error", onError);

    return () => {
      socket.emit("leave_lead_chat", { leadId: actualLeadId });
      socket.off("new_message", onNewMessage);
      socket.off("customer_typing", onCustomerTyping);
      socket.off("error", onError);
    };
  }, [socket, isConnected, actualLeadId, isValidMongoId]);

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

  return (
    <div className="flex-1 bg-[#f8fafc] min-h-screen p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(`/leads/${leadId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
      </div>

      <div className="bg-white rounded-xl border shadow-sm max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Chat with {customer?.firstName || 'Unknown'}</h2>
            <p className="text-sm text-gray-500 mt-1">{lead?.jobId || leadId} . {lead?.buildingType || 'Workshop'}</p>
          </div>
          <div className="text-sm text-gray-500">
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500"></span> Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <span className="h-2 w-2 rounded-full bg-red-500"></span> Disconnected
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet.
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
                      <Avatar className="h-8 w-8 bg-gray-100 flex-shrink-0 mt-1">
                        <AvatarFallback className="text-xs text-gray-600 uppercase">
                          {isBot ? "AI" : (customer?.firstName?.slice(0, 2) || "U")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[70%] flex flex-col gap-1 ${isYou ? "items-end" : "items-start"}`}>
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          isYou
                            ? "bg-blue-600 text-white rounded-br-none"
                            : isBot 
                              ? "bg-purple-100 text-purple-900 rounded-bl-none border border-purple-200"
                              : "bg-gray-100 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        {m.content}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {isBot ? "Assistant • " : (isYou && m.senderName ? `${m.senderName} • ` : "")}
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isCustomerTyping && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-8 w-8 bg-gray-100 flex-shrink-0 mt-1">
                    <AvatarFallback className="text-xs text-gray-600 uppercase">
                      {customer?.firstName?.slice(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 text-gray-500 rounded-lg rounded-bl-none p-3 text-sm italic max-w-[70%]">
                    typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <Input 
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={isConnected ? "Type your message..." : "Reconnecting..."} 
              disabled={!isConnected}
              className="flex-1 bg-white"
            />
            <Button 
              onClick={sendMessage}
              disabled={!input.trim() || !isConnected}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
