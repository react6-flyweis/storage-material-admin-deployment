import LeadChatPanel from "@/components/leads/lead-chat-panel";

type Lead = {
  id: string;
  _id?: string;
  backendId?: string;
  /** Customer name. */
  name: string;
  /** lead.source, e.g. "messenger" for Facebook leads. */
  source?: string | null;
  chatCount?: number;
  assignedToName?: string;
};

type Props = {
  lead: Lead;
};

export default function LeadChatTab({ lead }: Props) {
  const actualLeadId = lead.backendId || lead._id || lead.id;

  return (
    <LeadChatPanel
      leadId={actualLeadId}
      displayId={lead.id}
      customerName={lead.name}
      leadSource={lead.source}
      className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] max-h-[700px]"
      messagesClassName="bg-gray-50/50"
    />
  );
}
