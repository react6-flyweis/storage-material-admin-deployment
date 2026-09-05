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
import { useSendQuotationMutation } from "@/modules/quotations/quotations.hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { Send, AlertCircle } from "lucide-react";

interface SendQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  quoteNumber?: string;
  versionNumber?: number;
  recipientEmail?: string;
  onSuccess?: () => void;
}

export default function SendQuotationDialog({
  open,
  onOpenChange,
  quotationId,
  quoteNumber,
  versionNumber,
  recipientEmail,
  onSuccess,
}: SendQuotationDialogProps) {
  const [emailMessage, setEmailMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sendMutation = useSendQuotationMutation();

  const handleClose = () => {
    setEmailMessage("");
    setErrorMessage(null);
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmailMessage("");
      setErrorMessage(null);
    }
    onOpenChange(isOpen);
  };

  const handleSend = async () => {
    if (!quotationId) return;
    setErrorMessage(null);
    try {
      const res = await sendMutation.mutateAsync({
        quotationId,
        payload: emailMessage.trim()
          ? {
              emailMessage: emailMessage.trim(),
              message: emailMessage.trim(),
            }
          : undefined,
      });

      const provider = res.data?.emailProvider
        ? ` via ${res.data.emailProvider}`
        : "";
      toast.success(`Quotation sent to customer successfully${provider}!`);
      setEmailMessage("");
      setErrorMessage(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Failed to send quotation. Quotation must be approved first.",
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md w-full max-w-[calc(100vw-2rem)] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Send Quotation to Customer
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 w-full min-w-0">
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 flex items-start gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="break-words">{errorMessage}</span>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Are you sure you want to send Quote{" "}
            <strong>{quoteNumber || quotationId}</strong>
            {versionNumber !== undefined ? ` (v${versionNumber})` : ""} to the customer
            {recipientEmail ? ` at ${recipientEmail}` : ""}?
          </p>

          <div className="space-y-1.5 w-full min-w-0">
            <Label className="text-xs text-gray-600">
              Message to Customer (optional)
            </Label>
            <Textarea
              value={emailMessage}
              onChange={(e) => {
                setEmailMessage(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Please review the attached quote and let us know your feedback."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <p className="text-xs text-gray-500">
            An email containing the quotation PDF and message will be dispatched to the customer.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#7c3aed] hover:bg-purple-700 text-white flex items-center gap-1.5"
            onClick={handleSend}
            disabled={sendMutation.isPending}
          >
            <Send className="w-3.5 h-3.5" />
            {sendMutation.isPending ? "Sending..." : "Send Quotation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
