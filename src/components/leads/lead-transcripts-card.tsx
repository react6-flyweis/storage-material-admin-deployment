import { useState } from "react";
import { MessageSquare, PhoneCall, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useLeadTranscriptsQuery,
  useChatHistoryQuery,
} from "@/modules/leads/leads.hooks";
import type {
  PublicChatHistoryData,
  TranscriptSummary,
  CallSession,
} from "@/modules/leads/leads.api";
import LeadChatTab from "@/pages/leads/lead-chat-tab";
import CallSessionList from "./call-session-list";
import AiSummaryCard from "./ai-summary-card";

type Lead = {
  id: string;
  _id?: string;
  backendId?: string;
  name: string;
  chatCount?: number;
  assignedToName?: string;
};

interface LeadTranscriptsCardProps {
  lead: Lead;
}

type SubTab = "chat" | "call" | "summary";

export default function LeadTranscriptsCard({ lead }: LeadTranscriptsCardProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("chat");

  const actualLeadId = lead.backendId || lead._id || lead.id;
  const isValidMongoId = Boolean(actualLeadId && actualLeadId.length === 24);

  // 1. Public chat history: GET /api/public/chat/history/:leadId
  // (contains widget chat messages, call.sessions[].turns, summary.text)
  const { data: historyRes, isLoading: isChatLoading } = useChatHistoryQuery(
    actualLeadId,
    isValidMongoId
  );

  // 2. Admin transcripts endpoint (fallback / augment)
  const { data: transcriptsRes, isLoading: isTranscriptsLoading } =
    useLeadTranscriptsQuery(actualLeadId, "all");

  const rawHistory =
    historyRes && typeof historyRes === "object"
      ? "data" in historyRes && historyRes.data && !Array.isArray(historyRes.data)
        ? (historyRes.data as PublicChatHistoryData)
        : (historyRes as PublicChatHistoryData)
      : undefined;
  const transcriptData = transcriptsRes?.data;

  // Widget chat: messages and chat.messages are widget chat only
  const chatCount =
    rawHistory?.chat?.messageCount ??
    rawHistory?.messages?.length ??
    transcriptData?.chat?.messageCount ??
    lead.chatCount ??
    0;

  // Call sessions with turns: call.sessions[].turns
  const callSessions: CallSession[] =
    rawHistory?.call?.sessions && rawHistory.call.sessions.length > 0
      ? rawHistory.call.sessions
      : transcriptData?.call?.sessions ?? [];

  const callCount =
    rawHistory?.call?.sessionCount ??
    rawHistory?.call?.sessions?.length ??
    transcriptData?.call?.sessionCount ??
    transcriptData?.call?.sessions?.length ??
    callSessions.length;

  // AI Summary: summary.text
  const summary: TranscriptSummary | undefined = rawHistory?.summary?.text
    ? {
        text: rawHistory.summary.text,
        updatedAt: rawHistory.summary.updatedAt || "",
      }
    : transcriptData?.summary;

  const hasSummary = Boolean(
    summary?.text || transcriptData?.tabs?.hasSummary
  );
  const isLoading = isChatLoading && isTranscriptsLoading;

  return (
    <div className="space-y-4">
      {/* Sub-tabs header navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs">
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-100/80">
          {/* Chat Tab */}
          <button
            type="button"
            onClick={() => setActiveSubTab("chat")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all select-none cursor-pointer",
              activeSubTab === "chat"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
            <span>Chat</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                activeSubTab === "chat"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-200 text-slate-600"
              )}
            >
              {chatCount}
            </span>
          </button>

          {/* Voice Calls Tab */}
          <button
            type="button"
            onClick={() => setActiveSubTab("call")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all select-none cursor-pointer",
              activeSubTab === "call"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
            <span>Voice Calls</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                activeSubTab === "call"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              )}
            >
              {callCount}
            </span>
          </button>

          {/* AI Summary Tab */}
          <button
            type="button"
            onClick={() => setActiveSubTab("summary")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all select-none cursor-pointer",
              activeSubTab === "summary"
                ? "bg-white text-purple-900 shadow-xs"
                : "text-slate-600 hover:text-purple-900 hover:bg-white/50"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>AI Summary</span>
            {hasSummary && (
              <span className="rounded-full bg-purple-100 px-1.5 py-0.2 text-[10px] font-semibold text-purple-700">
                Ready
              </span>
            )}
          </button>
        </div>

        {/* Status / Quick Info */}
        <div className="px-3 text-xs text-slate-400 hidden sm:block">
          AI Voice & Multi-channel Transcripts
        </div>
      </div>

      {/* Sub-tab Content Panels */}
      {activeSubTab === "chat" && <LeadChatTab lead={lead} />}

      {activeSubTab === "call" && (
        <CallSessionList sessions={callSessions} isLoading={isLoading} />
      )}

      {activeSubTab === "summary" && (
        <AiSummaryCard
          summary={summary}
          projectName={transcriptData?.projectName}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
