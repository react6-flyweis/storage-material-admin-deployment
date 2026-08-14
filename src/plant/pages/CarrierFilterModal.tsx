import React, { useState } from "react";
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

export interface CarrierFilterValues {
  serviceType: string;
  serviceArea: string;
  equipmentType: string;
  status: string;
}

interface CarrierFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTypeOptions: { label: string; value: string }[];
  serviceAreaOptions: { label: string; value: string }[];
  equipmentTypeOptions: { label: string; value: string }[];
  onApply: (filters: CarrierFilterValues) => void;
}

export default function CarrierFilterModal({
  isOpen,
  onClose,
  serviceTypeOptions,
  serviceAreaOptions,
  equipmentTypeOptions,
  onApply,
}: CarrierFilterModalProps) {
  const [serviceType, setServiceType] = useState("all");
  const [serviceArea, setServiceArea] = useState("all");
  const [equipmentType, setEquipmentType] = useState("all");
  const [status, setStatus] = useState("all");

  const handleApply = () => {
    onApply({
      serviceType: serviceType === "all" ? "" : serviceType,
      serviceArea: serviceArea === "all" ? "" : serviceArea,
      equipmentType: equipmentType === "all" ? "" : equipmentType,
      status: status === "all" ? "" : status,
    });
  };

  const handleReset = () => {
    setServiceType("all");
    setServiceArea("all");
    setEquipmentType("all");
    setStatus("all");
    onApply({
      serviceType: "",
      serviceArea: "",
      equipmentType: "",
      status: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 bg-white border-0 rounded-2xl shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Filter Carriers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Service Type
            </label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200">
                <SelectValue placeholder="All Service Types" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypeOptions.map((opt) => (
                  <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Service Area
            </label>
            <Select value={serviceArea} onValueChange={setServiceArea}>
              <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200">
                <SelectValue placeholder="All Service Areas" />
              </SelectTrigger>
              <SelectContent>
                {serviceAreaOptions.map((opt) => (
                  <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Equipment Type
            </label>
            <Select value={equipmentType} onValueChange={setEquipmentType}>
              <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200">
                <SelectValue placeholder="All Equipment Types" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypeOptions.map((opt) => (
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
