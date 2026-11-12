import {
  useLeadCallsQuery,
  useChatHistoryQuery,
} from "@/modules/leads/leads.hooks";
import type {
  PublicChatHistoryData,
  CallSession,
} from "@/modules/leads/leads.api";
import CallSessionList from "@/components/leads/call-session-list";

type Lead = {
  id: string;
  _id?: string;
  backendId?: string;
  name: string;
};

type Props = {
  lead: Lead;
};

export default function LeadCallHistoryTab({ lead }: Props) {
  const actualLeadId = lead.backendId || lead._id || lead.id;
  const isValidMongoId = Boolean(actualLeadId && actualLeadId.length === 24);

  const { data: chatHistoryRes, isLoading: isChatLoading } = useChatHistoryQuery(
    actualLeadId,
    isValidMongoId
  );
  const { data: callsRes, isLoading: isCallsLoading } =
    useLeadCallsQuery(actualLeadId);

  const rawHistory =
    chatHistoryRes && typeof chatHistoryRes === "object"
      ? "data" in chatHistoryRes &&
        chatHistoryRes.data &&
        !Array.isArray(chatHistoryRes.data)
        ? (chatHistoryRes.data as PublicChatHistoryData)
        : (chatHistoryRes as PublicChatHistoryData)
      : undefined;

  const historySessions: CallSession[] = rawHistory?.call?.sessions ?? [];
  const calls =
    historySessions.length > 0 ? historySessions : callsRes?.data?.calls ?? [];

  const totalCalls =
    rawHistory?.call?.sessionCount ?? callsRes?.data?.total ?? calls.length;

  const isLoading = isChatLoading && isCallsLoading;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">
            Call History
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {lead.name} • {actualLeadId} • {totalCalls}{" "}
            {totalCalls === 1 ? "total call" : "total calls"}
          </p>
        </div>
      </div>

      <CallSessionList
        sessions={calls}
        isLoading={isLoading}
        className="border-0 rounded-none shadow-none"
      />
    </div>
  );
}
