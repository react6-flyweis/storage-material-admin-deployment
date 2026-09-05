import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRejectQuotationMutation } from "@/modules/quotations/quotations.hooks";
import { toast } from "sonner";

interface RejectQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  quoteNumber?: string;
  versionNumber?: number;
  onSuccess?: () => void;
}

export default function RejectQuotationDialog({
  open,
  onOpenChange,
  quotationId,
  quoteNumber,
  versionNumber,
  onSuccess,
}: RejectQuotationDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const rejectMutation = useRejectQuotationMutation();

  const handleClose = () => {
    setRejectionReason("");
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setRejectionReason("");
    }
    onOpenChange(isOpen);
  };

  const handleReject = async () => {
    if (!quotationId || !rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        quotationId,
        reason: rejectionReason,
      });
      toast.success("Quotation rejected.");
      setRejectionReason("");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to reject quotation.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md w-full max-w-[calc(100vw-2rem)] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Reject Quotation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 w-full min-w-0">
          <p className="text-sm text-gray-600 wrap-break-word">
            Rejecting Quote <strong>{quoteNumber || quotationId}</strong>
            {versionNumber !== undefined ? ` (v${versionNumber})` : ""}. Sales
            will be requested to update and resubmit.
          </p>
          <div className="space-y-1.5 w-full min-w-0">
            <Label className="text-xs text-gray-600">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Update dimensions and resend"
              rows={4}
              className="h-28 max-h-40"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#dc2626] hover:bg-red-700 text-white"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
