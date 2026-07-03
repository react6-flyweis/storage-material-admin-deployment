import React from "react";
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

interface RescheduleDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RescheduleDeliveryDialog({
  open,
  onOpenChange,
}: RescheduleDeliveryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl overflow-hidden border-0">
        <div className="p-6 md:p-8">
          <DialogHeader className="mb-6 flex flex-row items-center gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 py-2">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-slate-700">New Delivery Date</Label>
              <Input type="date" defaultValue="2026-03-27" className="rounded-lg h-11 border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Time Window Start <span className="text-red-500">*</span>
              </Label>
              <Input type="time" className="rounded-lg h-11 border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Time Window End <span className="text-red-500">*</span>
              </Label>
              <Input type="time" className="rounded-lg h-11 border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Reschedule Reason <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="Select Reschedule Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weather">Weather Delay</SelectItem>
                  <SelectItem value="client">Client Request</SelectItem>
                  <SelectItem value="logistics">Logistics Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Notify Customer via <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="Select Notify Customer via" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="both">Email & SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Notify Internal Team <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="Select Notify Internal Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Update Reminder Schedule <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="Select Update Reminder Schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Additional Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea 
                placeholder="Steel shipment delayed at Shipper warehouse." 
                className="rounded-lg min-h-[80px] resize-none border-slate-200"
              />
            </div>
          </div>

          <DialogFooter className="mt-8 flex flex-col md:flex-row gap-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-xl text-base font-bold bg-[#c5c6cc] text-white border-0 hover:bg-[#b0b1b8] hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reschedule Now
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
