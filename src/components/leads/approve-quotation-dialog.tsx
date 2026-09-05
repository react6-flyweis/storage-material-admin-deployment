import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApproveQuotationMutation } from "@/modules/quotations/quotations.hooks";
import { toast } from "sonner";

interface ApproveQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  quoteNumber?: string;
  versionNumber?: number;
  onSuccess?: () => void;
}

export default function ApproveQuotationDialog({
  open,
  onOpenChange,
  quotationId,
  quoteNumber,
  versionNumber,
  onSuccess,
}: ApproveQuotationDialogProps) {
  const [approveNote, setApproveNote] = useState("");
  const approveMutation = useApproveQuotationMutation();

  const handleClose = () => {
    setApproveNote("");
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setApproveNote("");
    }
    onOpenChange(isOpen);
  };

  const handleApprove = async () => {
    if (!quotationId) return;
    try {
      await approveMutation.mutateAsync({
        quotationId,
        note: approveNote,
      });
      toast.success("Quotation approved!");
      setApproveNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to approve quotation.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Approve Quotation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-600">
            Are you sure you want to approve Quote{" "}
            <strong>{quoteNumber || quotationId}</strong>
            {versionNumber !== undefined ? ` (v${versionNumber})` : ""}? This will
            enable sending the quotation to the customer.
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">
              Optional Approval Note
            </Label>
            <Input
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              placeholder="e.g. Approved for customer send"
              className="h-9 text-sm"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#16a34a] hover:bg-green-700 text-white"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? "Approving..." : "Confirm Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
