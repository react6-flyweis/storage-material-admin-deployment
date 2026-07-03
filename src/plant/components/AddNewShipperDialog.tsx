import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddNewShipperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddNewShipperDialog({
  open,
  onOpenChange,
}: AddNewShipperDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-6 rounded-[20px] border-0 bg-white shadow-xl">
        
        <DialogHeader className="mb-6">
          <DialogTitle className="text-lg font-bold text-slate-900">Add new Shipper mail</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-900">Shipper Name</label>
            <Input 
              defaultValue="Steel Investment"
              className="h-10 bg-slate-50/50 border-slate-200 rounded-lg text-[14px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-900">Add Email</label>
            <Input 
              defaultValue="steelinvestment@gmail.com"
              className="h-10 bg-slate-50/50 border-slate-200 rounded-lg text-[14px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-900">Add Phone Number</label>
            <Input 
              defaultValue="0987654321"
              className="h-10 bg-slate-50/50 border-slate-200 rounded-lg text-[14px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <Button 
            variant="outline" 
            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 px-8 h-10 font-medium"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            className="rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 h-10 font-medium"
            onClick={() => onOpenChange(false)}
          >
            Select & Add
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
