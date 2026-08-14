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

export interface ItemCostFilterValues {
  category: string;
  isFrameType: string; // "all" | "true" | "false"
  isActive: "true" | "false" | "all";
}

interface ItemCostFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  initialFilters: ItemCostFilterValues;
  onApply: (filters: ItemCostFilterValues) => void;
}

export default function ItemCostFilterModal({
  isOpen,
  onClose,
  categories = [],
  initialFilters,
  onApply,
}: ItemCostFilterModalProps) {
  const [category, setCategory] = useState(initialFilters.category || "all");
  const [isFrameType, setIsFrameType] = useState(initialFilters.isFrameType || "all");
  const [isActive, setIsActive] = useState(initialFilters.isActive || "true");

  React.useEffect(() => {
    if (isOpen) {
      setCategory(initialFilters.category || "all");
      setIsFrameType(initialFilters.isFrameType || "all");
      setIsActive(initialFilters.isActive || "true");
    }
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    onApply({
      category: category === "all" ? "" : category,
      isFrameType: isFrameType,
      isActive: isActive,
    });
  };

  const handleReset = () => {
    setCategory("all");
    setIsFrameType("all");
    setIsActive("true");
    onApply({
      category: "",
      isFrameType: "all",
      isActive: "true",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 bg-white border-0 rounded-2xl shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Filter Part Costs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frame Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Frame Type
            </label>
            <Select value={isFrameType} onValueChange={setIsFrameType}>
              <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Frame Type Only</SelectItem>
                <SelectItem value="false">Non-Frame Type Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Status
            </label>
            <Select value={isActive} onValueChange={(val) => setIsActive(val as any)}>
              <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200">
                <SelectValue placeholder="Active Only" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
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
