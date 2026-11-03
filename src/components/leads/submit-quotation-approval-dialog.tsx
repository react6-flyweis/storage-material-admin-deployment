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
import { Input } from "@/components/ui/input";
import { useSubmitQuotationApprovalMutation } from "@/modules/quotations/quotations.hooks";
import { toast } from "sonner";
import { SendHorizonal } from "lucide-react";

export interface SubmitQuotationApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  quoteNumber?: string;
  versionNumber?: number;
  onSuccess?: () => void;
}

export default function SubmitQuotationApprovalDialog({
  open,
  onOpenChange,
  quotationId,
  quoteNumber,
  versionNumber,
  onSuccess,
}: SubmitQuotationApprovalDialogProps) {
  const [submitNote, setSubmitNote] = useState("");
  const submitMutation = useSubmitQuotationApprovalMutation();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSubmitNote("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!quotationId) return;
    try {
      await submitMutation.mutateAsync({
        quotationId,
        note: submitNote.trim() || undefined,
      });
      toast.success("Quotation submitted for admin approval!");
      setSubmitNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to submit quotation for approval.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <SendHorizonal className="h-4 w-4 text-[#1D51A4]" />
            Send for Approval
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-600">
            Submit Quote{" "}
            <strong>{quoteNumber || quotationId}</strong>
            {versionNumber !== undefined ? ` (v${versionNumber})` : ""} for admin review?
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">Optional Note for Admin</Label>
            <Input
              value={submitNote}
              onChange={(e) => setSubmitNote(e.target.value)}
              placeholder="e.g. Updated milestones 40/30 or custom margin"
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#1D51A4] hover:bg-[#174287] text-white"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? "Submitting..." : "Send for Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

