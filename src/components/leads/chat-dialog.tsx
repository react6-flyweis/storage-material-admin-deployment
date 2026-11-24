import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import LeadChatPanel from "@/components/leads/lead-chat-panel";

type Lead = {
  id: string;
  _id?: string;
  backendId?: string;
  /** Project name (lead list) or customer name (detail dialog). */
  name: string;
  customerName?: string;
  /** lead.source, e.g. "messenger" for Facebook leads. */
  source?: string | null;
  chatCount?: number;
  assignedToName?: string;
};

type Props = {
  lead: Lead;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] h-[90vh] flex flex-col p-0 overflow-hidden">
        <LeadChatPanel
          leadId={actualLeadId}
          displayId={lead.id}
          customerName={lead.customerName || lead.name}
          leadSource={lead.source}
          enabled={isDialogOpen}
          titleAs={DialogTitle}
          className="flex-1 min-h-0"
          headerClassName="pt-6 pr-16"
        />
      </DialogContent>
    </Dialog>
  );
}
