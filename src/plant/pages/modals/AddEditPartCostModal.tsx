import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddEditPartCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function AddEditPartCostModal({ isOpen, onClose, initialData }: AddEditPartCostModalProps) {
  const isEditing = !!initialData;
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      color: "",
      unit: "",
      mbsCost: "",
      marketCost: "",
      desc: "",
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name || "",
          color: initialData.color || "",
          unit: initialData.unit || "",
          mbsCost: initialData.mbsCost || "",
          marketCost: initialData.marketCost || "",
          desc: initialData.desc || "",
        });
      } else {
        reset({
          name: "",
          color: "",
          unit: "",
          mbsCost: "",
          marketCost: "",
          desc: "",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: any) => {
    console.log("Saved Data:", data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 border-none bg-white rounded-2xl overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {isEditing ? "Edit Part Cost" : "Add New Part Cost"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Part Name</label>
            <Input 
              {...register("name")}
              placeholder="'30_VRR48'"
              className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">Part Color</label>
              <Input 
                {...register("color")}
                placeholder="'-_'"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">Cost Unit</label>
              <Input 
                {...register("unit")}
                placeholder="'FT'"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">MBS Cost</label>
              <Input 
                {...register("mbsCost")}
                placeholder="2.9"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">Current Market Cost</label>
              <Input 
                {...register("marketCost")}
                placeholder="-"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Description</label>
            <Input 
              {...register("desc")}
              placeholder="'VRR+ Insul R10'"
              className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-11 px-8 rounded-lg border-gray-200 text-gray-700 font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="h-11 px-10 rounded-lg bg-[#7C3AED] hover:bg-purple-700 text-white font-medium"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
