import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Paperclip, Send } from "lucide-react";

export default function SingleLeadChats() {
  const navigate = useNavigate();
  // const { leadId } = useParams();

  // Mock data - replace with actual data from API
  const leadName = "Sarah Johnson";
  const leadCode = "Q-2025-1047 - Workshop";

  const [messages, setMessages] = useState<
    Array<{ id: number; from: string; text: string; time: string }>
  >([
    {
      id: 1,
      from: "lead",
      text: "Hi, I need a quote for a 40×60 workshop in Texas.",
      time: "2024-10-10 09:30 pm",
    },
    {
      id: 2,
      from: "you",
      text: "Hello John! I'd be happy to help you with that. Can you tell me more about the intended use and any specific requirements?",
      time: "2024-10-10 09:40 pm",
    },
    {
      id: 3,
      from: "lead",
      text: "It will be used for automotive repair. I need overhead doors and good ventilation.",
      time: "2024-10-10 09:45 pm",
    },
    {
      id: 4,
      from: "you",
      text: "Perfect! I've prepared a detailed proposal for you. Please review the attached document.",
      time: "2024-10-10 10:00 pm",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    setMessages((m) => [
      ...m,
      { id: Date.now(), from: "you", text: input.trim(), time },
    ]);
    setInput("");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-[#4ECDC4] text-white px-6 py-3 flex items-center gap-3">
        <Button onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Lead Communication Timeline</h2>
      </div>

      <div className="p-6">
        {/* Chat Card */}
        <Card className="rounded-md h-[calc(100vh-180px)] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-gray-100">
                <AvatarFallback className="text-sm text-gray-600 font-medium">
                  {leadName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-semibold">
                  Chat with {leadName}
                </CardTitle>
                <CardDescription className="text-xs">
                  {leadCode}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {/* Chat Messages Area */}
          <CardContent className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${
                    m.from === "you" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.from === "lead" && (
                    <Avatar className="h-8 w-8 bg-gray-100 flex-shrink-0">
                      <AvatarFallback className="text-xs text-gray-600">
                        {leadName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    {m.from === "lead" && (
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        John Doe
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        m.from === "you"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                    <div
                      className={`text-xs text-gray-400 ${
                        m.from === "you" ? "text-right" : "text-left"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                  {m.from === "you" && (
                    <Avatar className="h-8 w-8 bg-blue-100 flex-shrink-0">
                      <AvatarFallback className="text-xs text-blue-600">
                        SL
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-500 hover:text-gray-700"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-white"
              />
              <Button
                onClick={sendMessage}
                size="icon"
                className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
