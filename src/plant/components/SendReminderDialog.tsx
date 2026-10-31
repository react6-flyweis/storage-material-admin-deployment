import React, { useState } from "react";
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
import { Bell, Loader2, Info, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { useSendDeliveryReminderMutation } from "@/modules/plant/deliveries.hooks";
import { getApiErrorMessage } from "@/modules/plant/deliveries.api";

export interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryId: string;
  deliveryNumber?: string;
  projectName?: string;
  customerName?: string;
  onSuccess?: () => void;
}

export default function SendReminderDialog({
  open,
  onOpenChange,
  deliveryId,
  deliveryNumber,
  projectName,
  customerName,
  onSuccess,
}: SendReminderDialogProps) {
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reminderMutation = useSendDeliveryReminderMutation();

  const handleClose = () => {
    setMessage("");
    setErrorMsg(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryId) {
      toast.error("Delivery ID is missing");
      return;
    }

    setErrorMsg(null);
    try {
      const res = await reminderMutation.mutateAsync({
        deliveryId,
        payload: message.trim() ? { message: message.trim() } : {},
      });

      const channels = res.data?.channels;
      const activeChannels: string[] = [];
      if (channels?.email) activeChannels.push("Email");
      if (channels?.sms) activeChannels.push("SMS");
      if (channels?.inApp) activeChannels.push("In-App");

      const channelSummary =
        activeChannels.length > 0
          ? ` via ${activeChannels.join(", ")}`
          : "";

      toast.success(`Delivery reminder sent${channelSummary}`);
      handleClose();
      onSuccess?.();
    } catch (err: unknown) {
      const parsedError = await getApiErrorMessage(err);
      setErrorMsg(parsedError);
      toast.error(parsedError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : onOpenChange(v))}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl font-inter">
        <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-5">
          <DialogHeader className="flex flex-row items-center gap-3.5 text-left border-b border-gray-100 pb-4">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-full shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#212B36]">
                Send Delivery Reminder
              </DialogTitle>
              <p className="text-xs text-[#637381] mt-0.5">
                Send real-time delivery update notification to the customer
              </p>
            </div>
          </DialogHeader>

          {/* Delivery Context Card */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-medium">Delivery #:</span>
              <span className="font-semibold text-[#0F172A]">
                {deliveryNumber || deliveryId}
              </span>
            </div>
            {projectName && (
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> Project:
                </span>
                <span className="font-semibold text-[#0F172A] truncate max-w-[240px]">
                  {projectName}
                </span>
              </div>
            )}
            {customerName && (
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" /> Customer:
                </span>
                <span className="font-semibold text-[#0F172A] truncate max-w-[240px]">
                  {customerName}
                </span>
              </div>
            )}
          </div>

          {/* Channel Info Note */}
          <div className="flex items-start gap-2.5 bg-blue-50/60 border border-blue-100 text-blue-800 rounded-xl p-3 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Notifications are automatically dispatched across active channels (Email, SMS, and In-App notification) for this delivery.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Optional Message Field */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-message" className="text-xs font-semibold text-[#212B36]">
                Custom Message <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <span className="text-[11px] text-gray-400">
                {message.length} chars
              </span>
            </div>
            <Textarea
              id="reminder-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Your shipment is scheduled to arrive tomorrow morning. Please ensure the site is clear."
              rows={3}
              className="resize-none text-xs rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-[11px] text-[#637381]">
              Leave empty to send the standard system delivery reminder.
            </p>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={reminderMutation.isPending}
              className="h-9 px-4 rounded-lg text-xs font-medium border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reminderMutation.isPending}
              className="h-9 px-4 rounded-lg text-xs font-medium bg-[#155DFC] hover:bg-blue-700 text-white gap-2 shadow-sm"
            >
              {reminderMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  Send Reminder
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
