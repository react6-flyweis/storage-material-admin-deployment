import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";
import { useRescheduleDeliveryMutation } from "@/modules/plant/freight.hooks";
import { useQueryClient } from "@tanstack/react-query";

interface RescheduleDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryId?: string;
  initialDate?: string;
  initialTimeWindowStart?: string;
  initialTimeWindowEnd?: string;
  initialAdditionalNotes?: string;
  onSubmit?: (data: { date: string; timeWindowStart: string; timeWindowEnd: string }) => void;
}

interface RescheduleDeliveryFormProps {
  deliveryId: string;
  initialDate: string;
  initialTimeWindowStart: string;
  initialTimeWindowEnd: string;
  initialAdditionalNotes: string;
  onClose: () => void;
  onSubmit?: (data: { date: string; timeWindowStart: string; timeWindowEnd: string }) => void;
}

function RescheduleDeliveryForm({
  deliveryId,
  initialDate,
  initialTimeWindowStart,
  initialTimeWindowEnd,
  initialAdditionalNotes,
  onClose,
  onSubmit,
}: RescheduleDeliveryFormProps) {
  const [date, setDate] = useState(initialDate ? initialDate.split("T")[0] : "");
  const [timeWindowStart, setTimeWindowStart] = useState(initialTimeWindowStart);
  const [timeWindowEnd, setTimeWindowEnd] = useState(initialTimeWindowEnd);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState(initialAdditionalNotes);
  const [errorMsg, setErrorMsg] = useState("");

  const queryClient = useQueryClient();
  const rescheduleMutation = useRescheduleDeliveryMutation();
  const isLoading = rescheduleMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!date) {
      setErrorMsg("Please select a delivery date.");
      return;
    }
    if (!timeWindowStart || !timeWindowEnd) {
      setErrorMsg("Please specify the time window.");
      return;
    }
    if (!rescheduleReason) {
      setErrorMsg("Please select a reschedule reason.");
      return;
    }
    if (!deliveryId) {
      setErrorMsg("Delivery ID is missing.");
      return;
    }

    try {
      const formattedDate = new Date(`${date}T00:00:00Z`).toISOString();
      await rescheduleMutation.mutateAsync({
        deliveryId,
        body: {
          date: formattedDate,
          timeWindowStart,
          timeWindowEnd,
          rescheduleReason,
          ...(additionalNotes ? { additionalNotes } : {}),
        },
      });

      queryClient.invalidateQueries({
        queryKey: ["plant", "deliveries", deliveryId, "detail"],
      });
      queryClient.invalidateQueries({
        queryKey: ["plant", "deliveries"],
      });

      if (onSubmit) {
        onSubmit({ date, timeWindowStart, timeWindowEnd });
      } else {
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
      const apiError = (err as { response?: { data?: { message?: string } } })?.response?.data || (err as { message?: string });
      setErrorMsg(apiError?.message || "Failed to reschedule delivery. Please try again.");
    }
  };

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDateStr = `${yyyy}-${mm}-${dd}`;

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8">
      <DialogHeader className="mb-6 flex flex-row items-center gap-4 text-left">
        <div className="bg-orange-50 p-3 rounded-full text-orange-500 shrink-0">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Reschedule Delivery
          </DialogTitle>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Specify what's being delivered and when
          </p>
        </div>
      </DialogHeader>

      {errorMsg && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 py-2 text-left animate-none">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-sm font-semibold text-slate-700">New Delivery Date</Label>
          <Input
            type="date"
            value={date}
            min={minDateStr}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-lg h-11 border-slate-200"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Time Window Start <span className="text-red-500">*</span>
          </Label>
          <Input
            type="time"
            value={timeWindowStart}
            onChange={(e) => setTimeWindowStart(e.target.value)}
            required
            className="rounded-lg h-11 border-slate-200"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Time Window End <span className="text-red-500">*</span>
          </Label>
          <Input
            type="time"
            value={timeWindowEnd}
            onChange={(e) => setTimeWindowEnd(e.target.value)}
            required
            className="rounded-lg h-11 border-slate-200"
            disabled={isLoading}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Reschedule Reason <span className="text-red-500">*</span>
          </Label>
          <Select
            value={rescheduleReason}
            onValueChange={setRescheduleReason}
            disabled={isLoading}
          >
            <SelectTrigger className="h-11 rounded-lg border-slate-200">
              <SelectValue placeholder="Select Reschedule Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Equipment Failure">Equipment Failure</SelectItem>
              <SelectItem value="Weather Delay">Weather Delay</SelectItem>
              <SelectItem value="Site Access Issue">Site Access Issue</SelectItem>
              <SelectItem value="Vendor Delay">Vendor Delay</SelectItem>
              <SelectItem value="Customer Request">Customer Request</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Additional Notes
          </Label>
          <Textarea
            placeholder="Steel shipment delayed at Shipper warehouse."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="rounded-lg min-h-[80px] resize-none border-slate-200"
            disabled={isLoading}
          />
        </div>
      </div>

      <DialogFooter className="mt-8 flex flex-col md:flex-row gap-4 sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 rounded-xl text-base font-bold bg-[#c5c6cc] text-white border-0 hover:bg-[#b0b1b8] hover:text-white"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Rescheduling..." : "Reschedule Now"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function RescheduleDeliveryDialog({
  open,
  onOpenChange,
  deliveryId = "",
  initialDate = "",
  initialTimeWindowStart = "",
  initialTimeWindowEnd = "",
  initialAdditionalNotes = "",
  onSubmit,
}: RescheduleDeliveryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl overflow-y-scroll max-h-[85vh] border-0">
        {open && (
          <RescheduleDeliveryForm
            key={`${deliveryId}-${initialDate}-${initialTimeWindowStart}`}
            deliveryId={deliveryId}
            initialDate={initialDate}
            initialTimeWindowStart={initialTimeWindowStart}
            initialTimeWindowEnd={initialTimeWindowEnd}
            initialAdditionalNotes={initialAdditionalNotes}
            onClose={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
