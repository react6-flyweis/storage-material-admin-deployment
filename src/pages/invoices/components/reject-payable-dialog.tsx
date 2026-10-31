import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";

interface RejectPayableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber?: string;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function RejectPayableDialog({
  open,
  onOpenChange,
  invoiceNumber,
  onConfirm,
  isLoading = false,
}: RejectPayableDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for rejecting this invoice.");
      return;
    }
    setError("");
    await onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setReason("");
      setError("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <DialogTitle>Reject Payable Invoice</DialogTitle>
            </div>
            <DialogDescription className="text-gray-500 pt-1">
              {invoiceNumber ? (
                <>
                  Are you sure you want to reject invoice{" "}
                  <strong className="text-gray-800">{invoiceNumber}</strong>?
                </>
              ) : (
                "Are you sure you want to reject this payable invoice?"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="e.g. Amount does not match PO / Missing required delivery documents"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              rows={3}
              className="w-full resize-none"
              disabled={isLoading}
              required
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Reject Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
