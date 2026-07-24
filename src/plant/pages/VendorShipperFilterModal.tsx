import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface VendorShipperFilterValues {
  materialType: string;
  status: string;
}

interface VendorShipperFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialTypeOptions: { label: string; value: string }[];
  onApply: (filters: VendorShipperFilterValues) => void;
}

export default function VendorShipperFilterModal({
  isOpen,
  onClose,
  materialTypeOptions,
  onApply,
}: VendorShipperFilterModalProps) {
  const [materialType, setMaterialType] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (isOpen) {
      // Set to all/defaults on open if desired, or persist.
    }
  }, [isOpen]);

  const handleApply = () => {
    onApply({
      materialType: materialType === "all" ? "" : materialType,
      status: status === "all" ? "" : status,
    });
  };

  const handleReset = () => {
    setMaterialType("all");
    setStatus("all");
    onApply({
      materialType: "",
      status: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 bg-white border-0 rounded-2xl shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Filter Shippers & Vendors
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Material Type
            </label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200">
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                {materialTypeOptions.map((opt) => (
                  <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="text-gray-700 font-medium"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium px-8"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
