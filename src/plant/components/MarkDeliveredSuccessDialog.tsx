import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MarkDeliveredSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryTime?: string;
  receiverName?: string;
  deliveryNotes?: string;
}

export default function MarkDeliveredSuccessDialog({
  open,
  onOpenChange,
  deliveryTime = "11:00 AM",
  receiverName = "Receiver Name",
  deliveryNotes = "NA"
}: MarkDeliveredSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-10 rounded-3xl overflow-hidden border-0 text-center">
        <div className="flex flex-col items-center justify-center">
          
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 mb-8 mt-2 relative">
            {/* Using a 3D-like checkmark SVG since the exact 3D asset is not available */}
            <svg 
              className="w-14 h-14 text-white drop-shadow-md" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
            </svg>
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-8 leading-tight">
            Your delivery is Marked<br />as Delivered
          </h2>

          <div className="space-y-4 mb-10 w-full text-center">
            <p className="text-lg font-bold text-slate-900">
              Delivered Time : {deliveryTime}
            </p>
            <p className="text-lg font-bold text-slate-900">
              Received By: {receiverName}
            </p>
            <p className="text-lg font-bold text-slate-900">
              Delivery Notes : {deliveryNotes}
            </p>
          </div>

          <Button 
            className="w-full max-w-[280px] h-14 rounded-2xl text-xl font-medium bg-[#4250ee] hover:bg-[#3440cc] text-white"
            onClick={() => onOpenChange(false)}
          >
            Ok
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
