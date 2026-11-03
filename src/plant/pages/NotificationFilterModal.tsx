import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NotificationFilterLookups } from "@/modules/plant/notification-details.api";
import { Filter, RotateCcw } from "lucide-react";

export interface NotificationFilterState {
  projectId: string;
  leadId: string;
  deliveryStatus: string;
  channel: string;
  recipientType: string;
  startDate: string;
  endDate: string;
}

interface NotificationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lookups?: NotificationFilterLookups;
  initialFilters: NotificationFilterState;
  onApply: (filters: NotificationFilterState) => void;
  onReset: () => void;
}

export const defaultNotificationFilters: NotificationFilterState = {
  projectId: "",
  leadId: "",
  deliveryStatus: "",
  channel: "",
  recipientType: "",
  startDate: "",
  endDate: "",
};

export default function NotificationFilterModal({
  isOpen,
  onClose,
  lookups,
  initialFilters,
  onApply,
  onReset,
}: NotificationFilterModalProps) {
  const [filters, setFilters] = useState<NotificationFilterState>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleProjectChange = (val: string) => {
    if (!val || val === "ALL") {
      setFilters((prev) => ({ ...prev, projectId: "", leadId: "" }));
      return;
    }
    const found = lookups?.projects.find(
      (p) => p.leadId === val || p.projectId === val
    );
    setFilters((prev) => ({
      ...prev,
      leadId: found?.leadId || val,
      projectId: found?.projectId || val,
    }));
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters(defaultNotificationFilters);
    onReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-6 rounded-2xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Filter Notifications
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Refine notification history records
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleApply} className="space-y-4 py-3">
          {/* Project */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Project
            </label>
            <Select
              value={filters.leadId || filters.projectId || "ALL"}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Projects</SelectItem>
                {lookups?.projects?.map((p) => (
                  <SelectItem key={p.leadId || p.projectId} value={p.leadId || p.projectId}>
                    {p.projectName || p.projectId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Delivery Status
            </label>
            <Select
              value={filters.deliveryStatus || "ALL"}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  deliveryStatus: val === "ALL" ? "" : val,
                }))
              }
            >
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {lookups?.deliveryStatuses?.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Channel */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Channel
              </label>
              <Select
                value={filters.channel || "ALL"}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    channel: val === "ALL" ? "" : val,
                  }))
                }
              >
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Channels</SelectItem>
                  {lookups?.channels?.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Recipient Type
              </label>
              <Select
                value={filters.recipientType || "ALL"}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    recipientType: val === "ALL" ? "" : val,
                  }))
                }
              >
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg">
                  <SelectValue placeholder="All Recipient Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Recipient Types</SelectItem>
                  {lookups?.recipientTypes?.map((rt) => (
                    <SelectItem key={rt} value={rt}>
                      {rt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range (Filter by sent time) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Sent Date Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className="bg-slate-50 border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="bg-slate-50 border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t flex flex-row items-center justify-between sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="text-slate-600 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
