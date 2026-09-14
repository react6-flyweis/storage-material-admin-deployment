import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Eye,
  Package,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Building2,
  AlertTriangle,
} from "lucide-react";
import type { DateRange as RDateRange } from "react-day-picker";
import { DeliveryDetailsDialog } from "@/components/delivery-details-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export interface ConstructionProjectBadge {
  text: string;
  className: string;
  icon?: any;
}

export interface ConstructionProjectItem {
  id: string;
  title: string;
  location: string;
  badges: ConstructionProjectBadge[];
  material: { quantity: string; stagingArea: string };
  schedule: { arrival: string; departure: string };
  route: {
    carrier: string;
    destination: string;
  };
  truckDetails: {
    truck: string;
    driver: string;
    phone: string;
    destination: string;
  };
  notes: string;
  createdAt?: string;
}

export const DEFAULT_CONSTRUCTION_PROJECTS: ConstructionProjectItem[] = [
  {
    id: "DEL-2001",
    title: "Primary Frame Steel",
    location: "ABC Logistics Warehouse",
    badges: [
      {
        text: "In Transit to Plant",
        className: "bg-[#2857C5] hover:bg-[#2857C5] text-white",
      },
      {
        text: "High Priority",
        className: "bg-[#EF4444] hover:bg-[#EF4444] text-white",
      },
      {
        text: "ETA 45 min",
        className:
          "bg-[#FFFBEB] hover:bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
        icon: Clock,
      },
    ],
    material: { quantity: "45,000 lbs", stagingArea: "Yard-A" },
    schedule: { arrival: "Mar 24, 10:00 AM", departure: "Mar 24, 02:00 PM" },
    route: {
      carrier: "FastFreight Logistics",
      destination: "Construction Site A",
    },
    truckDetails: {
      truck: "TX-4582",
      driver: "John Miller",
      phone: "+1 555-812-9921",
      destination: "Construction Site A",
    },
    notes: "Fragile – handle with care",
    createdAt: "2025-05-16",
  },
  {
    id: "DEL-2002",
    title: "Glass Panels",
    location: "Downtown Office Complex",
    badges: [
      {
        text: "Staged at Plant",
        className: "bg-[#16A34A] hover:bg-[#16A34A] text-white",
      },
      {
        text: "Delayed 30 minutes",
        className:
          "bg-[#FFFBEB] hover:bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
        icon: AlertTriangle,
      },
    ],
    material: { quantity: "8,500 lbs", stagingArea: "Warehouse-2" },
    schedule: { arrival: "Mar 24, 08:00 AM", departure: "Mar 24, 11:00 AM" },
    route: { carrier: "Regional Freight", destination: "Construction Site B" },
    truckDetails: {
      truck: "TX-4582",
      driver: "John Miller",
      phone: "+1 555-812-9921",
      destination: "Construction Site A",
    },
    notes: "Fragile – handle with care",
    createdAt: "2025-05-18",
  },
  {
    id: "DEL-2003",
    title: "Concrete Blocks",
    location: "Industrial Park Phase 2",
    badges: [
      {
        text: "Scheduled",
        className: "bg-[#9CA3AF] hover:bg-[#9CA3AF] text-white",
      },
    ],
    material: { quantity: "15,000 lbs", stagingArea: "Yard-B" },
    schedule: { arrival: "Mar 25, 09:00 AM", departure: "Mar 25, 01:00 PM" },
    route: {
      carrier: "Local Delivery Services",
      destination: "Construction Site C",
    },
    truckDetails: {
      truck: "TX-4582",
      driver: "John Miller",
      phone: "+1 555-812-9921",
      destination: "Construction Site A",
    },
    notes: "Standard handling",
    createdAt: "2025-05-20",
  },
  {
    id: "DEL-2004",
    title: "Roll-up Doors (3 units)",
    location: "ABC Logistics Warehouse",
    badges: [
      {
        text: "Ready for Departure",
        className: "bg-[#F97316] hover:bg-[#F97316] text-white",
      },
      {
        text: "High Priority",
        className: "bg-[#EF4444] hover:bg-[#EF4444] text-white",
      },
    ],
    material: { quantity: "2,500 lbs", stagingArea: "Warehouse-1" },
    schedule: { arrival: "Mar 23, 03:00 PM", departure: "Mar 24, 07:00 AM" },
    route: {
      carrier: "QuickTransport Co.",
      destination: "Construction Site A",
    },
    truckDetails: {
      truck: "TX-4582",
      driver: "John Miller",
      phone: "+1 555-812-9921",
      destination: "Construction Site A",
    },
    notes: "Pickup scheduled for tomorrow",
    createdAt: "2025-05-21",
  },
];

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatConstructionDateRange = (range?: RDateRange): string => {
  if (!range?.from && !range?.to) return "15/05/2025 - 21/05/2025";
  const from = range.from ? formatDateToDDMMYYYY(range.from) : "";
  const to = range.to ? formatDateToDDMMYYYY(range.to) : "";
  return from && to ? `${from} - ${to}` : from || to;
};

export function ConstructionProjectsDateFilter({
  value,
  onChange,
}: {
  value?: RDateRange;
  onChange?: (range: RDateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<RDateRange | undefined>(value);

  const displayValue = formatConstructionDateRange(value);

  const handleApply = () => {
    onChange?.(draftRange);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultRange = {
      from: new Date(2025, 4, 15),
      to: new Date(2025, 4, 21),
    };
    setDraftRange(defaultRange);
    onChange?.(defaultRange);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200/90 text-xs font-medium text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50/50 transition-colors focus:outline-none"
        >
          <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span>{displayValue}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-white rounded-xl shadow-xl border border-gray-100" align="end">
        <div className="space-y-3">
          <CalendarComponent
            mode="range"
            selected={draftRange}
            onSelect={setDraftRange}
            numberOfMonths={2}
            initialFocus
          />
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Reset to Default
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface EmployeeAssignedConstructionProjectsTabProps {
  projects?: ConstructionProjectItem[];
  dateRange?: RDateRange;
  onDateRangeChange?: (range: RDateRange | undefined) => void;
  hideDateFilter?: boolean;
}

export function EmployeeAssignedConstructionProjectsTab({
  projects = DEFAULT_CONSTRUCTION_PROJECTS,
  dateRange,
  onDateRangeChange,
  hideDateFilter = false,
}: EmployeeAssignedConstructionProjectsTabProps) {
  const [selectedProject, setSelectedProject] = useState<ConstructionProjectItem | null>(null);

  const filteredProjects = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) {
      return projects;
    }
    const fromTime = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : undefined;
    const toTime = dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : fromTime;

    return projects.filter((project) => {
      if (!project.createdAt || fromTime === undefined || toTime === undefined) {
        return true;
      }
      const itemTime = new Date(project.createdAt).getTime();
      if (Number.isNaN(itemTime)) return true;
      return itemTime >= fromTime && itemTime <= toTime;
    });
  }, [projects, dateRange]);

  return (
    <div className="space-y-5">
      {!hideDateFilter && (
        <div className="flex justify-end">
          <ConstructionProjectsDateFilter
            value={dateRange}
            onChange={onDateRangeChange}
          />
        </div>
      )}

      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="p-6 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100/90"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2857C5] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                      {project.title}
                    </h3>
                    {project.badges.map((badge, idx) => (
                      <Badge
                        key={idx}
                        className={`${badge.className} rounded-full text-xs font-semibold px-2.5 py-0.5 shadow-none flex items-center gap-1`}
                      >
                        {badge.icon && <badge.icon className="w-3 h-3" />}
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{project.location}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="font-bold text-gray-900">
                      Delivery ID: {project.id}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProject(project)}
                className="shrink-0 flex items-center gap-1.5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium h-8 px-3"
              >
                <Eye className="w-3.5 h-3.5 text-gray-600" />
                View Details
              </Button>
            </div>

            {/* 4 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-1">
              {/* Material Details */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-3">
                  Material Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 font-medium leading-none mb-1">
                        Quantity
                      </div>
                      <div className="text-xs font-bold text-gray-900 leading-none">
                        {project.material.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 font-medium leading-none mb-1">
                        Staging Area
                      </div>
                      <div className="text-xs font-bold text-gray-900 leading-none">
                        {project.material.stagingArea}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-3">
                  Schedule
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 font-medium leading-none mb-1">
                        Arrival at Plant
                      </div>
                      <div className="text-xs font-bold text-gray-900 leading-none">
                        {project.schedule.arrival}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 font-medium leading-none mb-1">
                        Departure from Plant
                      </div>
                      <div className="text-xs font-bold text-gray-900 leading-none">
                        {project.schedule.departure}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrier & Route */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-3">
                  Carrier & Route
                </h4>
                <div className="flex flex-col xl:flex-row gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-400 font-medium leading-none mb-1">
                          Carrier
                        </div>
                        <div className="text-xs font-bold text-gray-900 leading-none">
                          {project.route.carrier}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-400 font-medium leading-none mb-1">
                          Final Destination
                        </div>
                        <div className="text-xs font-bold text-gray-900 leading-none">
                          {project.route.destination}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 mt-1 xl:ml-2">
                    <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] space-y-0.5 leading-tight">
                      <div className="text-gray-500 font-normal">
                        Truck:{" "}
                        <span className="font-bold text-gray-900">
                          {project.truckDetails.truck}
                        </span>
                      </div>
                      <div className="text-gray-500 font-normal">
                        Driver:{" "}
                        <span className="font-bold text-gray-900">
                          {project.truckDetails.driver}
                        </span>
                      </div>
                      <div className="text-gray-500 font-normal">
                        Phone:{" "}
                        <span className="font-bold text-gray-900">
                          {project.truckDetails.phone}
                        </span>
                      </div>
                      <div className="text-gray-500 font-normal pt-0.5">
                        Destination:{" "}
                        <span className="font-bold text-gray-900 block">
                          {project.truckDetails.destination}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-3">Notes</h4>
                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-3.5 text-xs text-gray-700 font-medium min-h-[64px] flex items-center">
                  {project.notes}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredProjects.length === 0 && (
          <Card className="p-12 text-center text-sm text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">
            No assigned construction projects found for the selected date range.
          </Card>
        )}
      </div>

      <DeliveryDetailsDialog
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
        project={selectedProject}
      />
    </div>
  );
}
