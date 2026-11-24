import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLeadDetailProvider } from "@/modules/leads/leads.api";
import { useAppBack } from "@/modules/navigation";
import LeadChatPanel from "@/components/leads/lead-chat-panel";

export default function LeadChats() {
  const { leadId } = useParams();
  const { goBack } = useAppBack(leadId ? `/leads/${leadId}` : "/leads");

  // Lead details for the header (name, job id, source)
  const { data: leadResponse } = useQuery({
    queryKey: ["lead", "detail", leadId],
    queryFn: () => getLeadDetailProvider(leadId!),
    enabled: !!leadId,
  });

  const leadData = leadResponse?.data;
  const lead = leadData?.lead;
  const customer = leadData?.customer;

  const displayId = [lead?.jobId || leadId, lead?.buildingType]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex-1 bg-[#f8fafc] min-h-screen p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => goBack()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
      </div>

      {leadId ? (
        <LeadChatPanel
          leadId={leadId}
          displayId={displayId}
          customerName={customer?.firstName}
          leadSource={lead?.source}
          className="bg-white rounded-xl border shadow-sm max-w-4xl mx-auto h-[calc(100vh-140px)]"
        />
      ) : null}
    </div>
  );
}
