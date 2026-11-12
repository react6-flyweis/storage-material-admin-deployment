import { useState } from "react";
import {
  PhoneIncoming,
  Clock,
  ChevronDown,
  Loader2,
  PhoneCall,
  UserCheck,
  Bot,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration, formatCallTime } from "@/lib/call-format";
import {
  getCallDetailProvider,
  type CallSession,
  type CallTurn,
  type LeadCallItem,
} from "@/modules/leads/leads.api";

type CallItemInput = (CallSession | LeadCallItem) & {
  turns?: CallTurn[];
  turnCount?: number;
};

interface CallSessionListProps {
  sessions?: CallItemInput[];
  isLoading?: boolean;
  className?: string;
}

export default function CallSessionList({
  sessions = [],
  isLoading = false,
  className,
}: CallSessionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fetchedTurns, setFetchedTurns] = useState<Record<string, CallTurn[]>>({});
  const [loadingTurns, setLoadingTurns] = useState<Record<string, boolean>>({});

  const toggleAccordion = async (session: CallItemInput) => {
    const isCurrentlyExpanded = expandedId === session.callSessionId;
    if (isCurrentlyExpanded) {
      setExpandedId(null);
      return;
    }

    setExpandedId(session.callSessionId);

    // If turns are already available on the session or previously fetched, no fetch needed
    if (
      (session.turns && session.turns.length > 0) ||
      fetchedTurns[session.callSessionId]
    ) {
      return;
    }

    // Otherwise fetch details on demand
    try {
      setLoadingTurns((prev) => ({ ...prev, [session.callSessionId]: true }));
      const res = await getCallDetailProvider(session.callSessionId);
      if (res?.data?.turns) {
        setFetchedTurns((prev) => ({
          ...prev,
          [session.callSessionId]: res.data.turns,
        }));
      }
    } catch {
      // Fallback: keep turns empty if fetch fails
      setFetchedTurns((prev) => ({ ...prev, [session.callSessionId]: [] }));
    } finally {
      setLoadingTurns((prev) => ({ ...prev, [session.callSessionId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-12 text-slate-500 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600 mb-2" />
        <span className="text-sm">Loading voice call history...</span>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <PhoneCall className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No voice calls recorded</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Incoming and outgoing AI calls for this lead will appear here with live transcripts and turn-by-turn dialogue.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "divide-y divide-slate-100 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm",
        className
      )}
    >
      {sessions.map((session) => {
        const isExpanded = expandedId === session.callSessionId;
        const turns = session.turns ?? fetchedTurns[session.callSessionId] ?? [];
        const isFetchingTurns = loadingTurns[session.callSessionId] ?? false;
        const turnCount = session.turnCount ?? (session.turns?.length || turns.length);

        const isCompleted = session.status === "completed";
        const isInProgress = session.status === "in-progress" || session.status === "ringing";

        return (
          <div key={session.callSessionId} className="transition-colors">
            {/* Header / Clickable Accordion Row */}
            <div
              onClick={() => toggleAccordion(session)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void toggleAccordion(session);
                }
              }}
              className={cn(
                "flex flex-col gap-2.5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none",
                isExpanded && "bg-slate-50/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
                    isCompleted
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : isInProgress
                        ? "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}
                >
                  <PhoneIncoming className="h-4 w-4" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">
                      {session.fromNumber || "Unknown Caller"}
                    </span>
                    {session.toNumber && (
                      <span className="text-xs text-slate-400">
                        → {session.toNumber}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : isInProgress
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {session.status || "completed"}
                    </span>
                    {session.isHandedToSales && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200/60">
                        <UserCheck className="h-2.5 w-2.5" />
                        Sales Hand-off
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatCallTime(session.startedAt)}
                  </span>
                </div>
              </div>

              {/* Right Side Stats & Chevron */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {formatDuration(session.durationSeconds)}
                  </span>
                  <span>•</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {turnCount} {turnCount === 1 ? "turn" : "turns"}
                  </span>
                </div>

                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-slate-400 transition-transform duration-200",
                    isExpanded && "rotate-180 text-slate-700"
                  )}
                />
              </div>
            </div>

            {/* In-line Dialogue Accordion Body */}
            {isExpanded && (
              <div className="bg-slate-50/70 p-4 sm:p-5 border-t border-slate-100">
                {isFetchingTurns ? (
                  <div className="flex items-center justify-center py-6 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                    <span className="text-xs">Loading dialogue turns...</span>
                  </div>
                ) : turns.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500 italic">
                    No transcript dialogue recorded for this session.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turns.map((turn) => {
                      const isAi = turn.role === "ai";
                      return (
                        <div
                          key={turn.turnId || `${turn.role}-${turn.createdAt}`}
                          className={cn(
                            "flex gap-2.5",
                            isAi ? "justify-start" : "justify-end"
                          )}
                        >
                          {isAi && (
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold">
                              <Bot className="h-3.5 w-3.5" />
                            </div>
                          )}

                          <div
                            className={cn(
                              "flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]",
                              !isAi && "items-end"
                            )}
                          >
                            <div
                              className={cn(
                                "p-3 text-xs sm:text-sm rounded-2xl shadow-2xs whitespace-pre-wrap leading-relaxed",
                                isAi
                                  ? "bg-purple-50/90 text-purple-950 border border-purple-200/70 rounded-tl-sm"
                                  : "bg-blue-600 text-white rounded-tr-sm"
                              )}
                            >
                              {turn.transcript}
                            </div>
                            <span className="text-[10px] text-slate-400 px-1">
                              {isAi ? "AI Voice Assistant" : "Customer"} •{" "}
                              {formatCallTime(turn.createdAt)}
                            </span>
                          </div>

                          {!isAi && (
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold">
                              <User className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

