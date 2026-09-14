import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, User, Calendar, Building2, MapPin, DollarSign, CheckCircle2 } from "lucide-react";
import type { DateRange as RDateRange } from "react-day-picker";

export interface AssignedProjectItem {
  id: string;
  title: string;
  location: string;
  customer: string;
  buildings: number;
  status: {
    text: string;
    bgClass: string;
    textClass: string;
  };
  value: number;
  createdAt?: string;
}

export const DEFAULT_ASSIGNED_PROJECTS: AssignedProjectItem[] = [
  {
    id: "DEL-2001",
    title: "ABC Constructions",
    location: "Workshop . Texas",
    customer: "John Doe",
    buildings: 1,
    status: {
      text: "Approved",
      bgClass: "bg-[#E8F8EE]",
      textClass: "text-[#16A34A]",
    },
    value: 12500,
    createdAt: "2025-05-18",
  },
  {
    id: "DEL-2002",
    title: "PQR Warehouse",
    location: "Warehouse . Texas",
    customer: "Roshan Sharma",
    buildings: 4,
    status: {
      text: "BOM Ready",
      bgClass: "bg-[#FFF4E5]",
      textClass: "text-[#D97706]",
    },
    value: 12500,
    createdAt: "2025-05-24",
  },
  {
    id: "DEL-2003",
    title: "XYZ Mall Building",
    location: "Workshop . Texas",
    customer: "Riyaz Verma",
    buildings: 2,
    status: {
      text: "Shipper File Received",
      bgClass: "bg-[#F4EEFB]",
      textClass: "text-[#9333EA]",
    },
    value: 12500,
    createdAt: "2025-06-02",
  },
  {
    id: "DEL-2004",
    title: "MNP Warehouse",
    location: "Workshop . Texas",
    customer: "Riya Wellness",
    buildings: 1,
    status: {
      text: "Shipper File Received",
      bgClass: "bg-[#F4EEFB]",
      textClass: "text-[#9333EA]",
    },
    value: 12500,
    createdAt: "2025-06-15",
  },
];

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatAssignedProjectsDateRange = (range?: RDateRange): string => {
  if (!range?.from && !range?.to) return "16/05/2025 - 21/06/2025";
  const from = range.from ? formatDateToDDMMYYYY(range.from) : "";
  const to = range.to ? formatDateToDDMMYYYY(range.to) : "";
  return from && to ? `${from} - ${to}` : from || to;
};

interface DatePickerButtonProps {
  value?: RDateRange;
  onChange?: (range: RDateRange | undefined) => void;
}

export function AssignedProjectsDateFilter({ value, onChange }: DatePickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<RDateRange | undefined>(value);

  const displayValue = formatAssignedProjectsDateRange(value);

  const handleApply = () => {
    onChange?.(draftRange);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultRange = {
      from: new Date(2025, 4, 16),
      to: new Date(2025, 5, 21),
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

interface EmployeeAssignedProjectsTabProps {
  projects?: AssignedProjectItem[];
  dateRange?: RDateRange;
  onDateRangeChange?: (range: RDateRange | undefined) => void;
  hideDateFilter?: boolean;
}

export function EmployeeAssignedProjectsTab({
  projects = DEFAULT_ASSIGNED_PROJECTS,
  dateRange,
  onDateRangeChange,
  hideDateFilter = false,
}: EmployeeAssignedProjectsTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState<AssignedProjectItem | null>(null);

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

  const isAllSelected =
    filteredProjects.length > 0 && selectedIds.length === filteredProjects.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-4">
      {!hideDateFilter && (
        <div className="flex justify-end">
          <AssignedProjectsDateFilter
            value={dateRange}
            onChange={onDateRangeChange}
          />
        </div>
      )}

      {/* Main Table Card matching design */}
      <Card className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100/80 bg-white">
                <th className="w-12 py-4 pl-6 pr-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all projects"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 text-[11px] font-semibold tracking-wider text-[#8C95A6] uppercase">
                  PROJECT NAME
                </th>
                <th className="py-4 px-4 text-[11px] font-semibold tracking-wider text-[#8C95A6] uppercase">
                  CUSTOMER
                </th>
                <th className="py-4 px-4 text-[11px] font-semibold tracking-wider text-[#8C95A6] uppercase">
                  BUILDINGS
                </th>
                <th className="py-4 px-4 text-[11px] font-semibold tracking-wider text-[#8C95A6] uppercase">
                  STATUS
                </th>
                <th className="py-4 px-4 text-[11px] font-semibold tracking-wider text-[#8C95A6] uppercase">
                  PROJECT VALUE
                </th>
                <th className="py-4 pl-4 pr-6 text-[11px] font-semibold tracking-wider text-[#8C95A6] uppercase">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 bg-white">
              {filteredProjects.map((project) => {
                const isSelected = selectedIds.includes(project.id);
                return (
                  <tr
                    key={project.id}
                    className={`group transition-colors ${
                      isSelected ? "bg-blue-50/20" : "hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-5 pl-6 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(project.id)}
                        aria-label={`Select ${project.title}`}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>

                    {/* Project Name & Location */}
                    <td className="py-5 px-4">
                      <div className="font-bold text-gray-900 text-sm tracking-tight">
                        {project.title}
                      </div>
                      <div className="text-xs text-gray-400 font-normal mt-0.5">
                        {project.location}
                      </div>
                    </td>

                    {/* Customer with Avatar */}
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1D61E7] flex items-center justify-center shrink-0 shadow-sm">
                          <User className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {project.customer}
                        </span>
                      </div>
                    </td>

                    {/* Buildings */}
                    <td className="py-5 px-4 font-bold text-gray-900 text-sm">
                      {project.buildings}
                    </td>

                    {/* Status Badge */}
                    <td className="py-5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-semibold ${project.status.bgClass} ${project.status.textClass}`}
                      >
                        {project.status.text}
                      </span>
                    </td>

                    {/* Project Value */}
                    <td className="py-5 px-4 font-bold text-gray-900 text-sm">
                      {formatCurrency(project.value)}
                    </td>

                    {/* Actions */}
                    <td className="py-5 pl-4 pr-6">
                      <button
                        type="button"
                        onClick={() => setActiveProject(project)}
                        aria-label={`View details for ${project.title}`}
                        className="p-1 rounded-md text-[#5551FF] hover:text-[#3B38D9] hover:bg-[#F3F4FD] transition-colors focus:outline-none"
                      >
                        <Eye className="w-5 h-5 stroke-[1.8]" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-500 font-medium"
                  >
                    No assigned projects found for the selected date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Project Details Modal */}
      <Dialog
        open={!!activeProject}
        onOpenChange={(open) => !open && setActiveProject(null)}
      >
        <DialogContent className="sm:max-w-lg p-6 bg-white rounded-2xl shadow-xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {activeProject?.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {activeProject?.location}
            </DialogDescription>
          </DialogHeader>

          {activeProject && (
            <div className="space-y-5 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Customer
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {activeProject.customer}
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Buildings
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {activeProject.buildings} Building{activeProject.buildings > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Project Value
                  </div>
                  <div className="font-bold text-gray-900 text-sm">
                    {formatCurrency(activeProject.value)}
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    Status
                  </div>
                  <Badge
                    className={`${activeProject.status.bgClass} ${activeProject.status.textClass} border-none shadow-none font-semibold px-2.5 py-0.5 rounded-full`}
                  >
                    {activeProject.status.text}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveProject(null)}
                  className="rounded-lg text-sm"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
