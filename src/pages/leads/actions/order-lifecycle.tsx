import React from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getLeadDetailProvider } from "@/modules/leads/leads.api";

const LIFECYCLE_STEPS = [
  { id: 'initial_contact', label: 'Initial Contact' },
  { id: 'requirements_gathered', label: 'Requirements Gathered' },
  { id: 'proposal_sent', label: 'Proposal Sent' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'deal_closed', label: 'Deal Closed' },
  { id: 'payment_done', label: 'Payment Done' },
  { id: 'converted_to_po', label: 'Converted to PO' },
  { id: 'sent_to_admin', label: 'Sent to Admin' },
];

export default function OrderLifecycle() {
  const navigate = useNavigate();
  const { leadId } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ["lead", "detail", leadId],
    queryFn: () => getLeadDetailProvider(leadId!),
    enabled: !!leadId,
  });

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#f8fafc] min-h-screen p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const leadData = response?.data;
  const lead = leadData?.lead;
  const customer = leadData?.customer;

  const currentStepId = leadData?.lifecycle?.status || lead?.lifecycleStatus || 'initial_contact';
  let currentStepIndex = LIFECYCLE_STEPS.findIndex(s => s.id === currentStepId);
  if (currentStepIndex === -1) currentStepIndex = 0;

  return (
    <div className="flex-1 bg-[#f8fafc] min-h-screen p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl border shadow-sm mt-10 overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Track Leads lifecycle - {customer?.firstName || lead?.name || 'Unknown'}</h2>
          <p className="text-sm text-gray-500 mt-1">{lead?.jobId || leadId}</p>
        </div>
        
        <div className="p-8">
          <h3 className="text-base font-semibold text-gray-900 mb-8">Progress Steps</h3>
          
          <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-6 space-y-8">
            {LIFECYCLE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              if (isCompleted) {
                return (
                  <div key={step.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-green-700">{step.label}</span>
                    </div>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                );
              }

              if (isCurrent) {
                return (
                  <div key={step.id} className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-blue-500">{step.label}</span>
                        <p className="text-xs text-blue-400 mt-0.5">Current Step</p>
                      </div>
                    </div>
                  </div>
                );
              }

              // Pending step
              return (
                <div key={step.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-600">{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 border-t pt-6">
            <p className="text-sm text-gray-600">Progress: Step {currentStepIndex + 1} of {LIFECYCLE_STEPS.length}</p>
          </div>
        </div>

        <div className="p-6 pt-0 flex justify-end">
          <Button 
            className="w-24 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate(`/leads/${leadId}`)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
