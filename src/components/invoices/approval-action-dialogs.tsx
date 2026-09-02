import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useApproveInvoiceMutation,
  useRejectInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ApproveInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber?: string;
  onSuccess?: () => void;
}

export function ApproveInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  onSuccess,
}: ApproveInvoiceDialogProps) {
  const [note, setNote] = useState("");
  const approveMutation = useApproveInvoiceMutation();

  const handleApprove = async () => {
    if (!invoiceId) return;

    try {
      await approveMutation.mutateAsync({
        invoiceId,
        note: note.trim() || undefined,
      });
      toast.success(`Invoice #${invoiceNumber || invoiceId} approved successfully`);
      setNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to approve invoice";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <DialogTitle>Approve Invoice</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to approve invoice{" "}
            <span className="font-semibold text-slate-800">
              #{invoiceNumber || invoiceId}
            </span>
            ? Once approved, the invoice can be sent to the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="approve-note" className="text-xs text-slate-600">
            Approval Note (Optional)
          </Label>
          <Textarea
            id="approve-note"
            placeholder="e.g. Approved. Good to send."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RejectInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber?: string;
  onSuccess?: () => void;
}

export function RejectInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  onSuccess,
}: RejectInvoiceDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rejectMutation = useRejectInvoiceMutation();

  const handleReject = async () => {
    if (!invoiceId) return;

    if (!reason.trim()) {
      setError("Please provide a reason for rejecting the invoice.");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        invoiceId,
        reason: reason.trim(),
      });
      toast.success(`Invoice #${invoiceNumber || invoiceId} rejected.`);
      setReason("");
      setError(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to reject invoice";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle>Reject Invoice</DialogTitle>
          </div>
          <DialogDescription>
            Please specify why invoice{" "}
            <span className="font-semibold text-slate-800">
              #{invoiceNumber || invoiceId}
            </span>{" "}
            is being rejected. The reason will be visible on the invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="reject-reason" className="text-xs text-slate-600">
            Rejection Reason <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            id="reject-reason"
            placeholder="e.g. Line items need correction, discount calculation is inaccurate..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            className="resize-none"
          />
          {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setError(null);
              onOpenChange(false);
            }}
            disabled={rejectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
