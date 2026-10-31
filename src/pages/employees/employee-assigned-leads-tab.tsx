import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, ChevronDown } from "lucide-react";
import type { DateRange as RDateRange } from "react-day-picker";
import type { SalesAssignedLeadItem } from "@/modules/employees/employees.api";
import { cn } from "@/lib/utils";

export type { SalesAssignedLeadItem as Lead };

type AssignedLeadsTabProps = {
  items: SalesAssignedLeadItem[];
  total: number;
  dateRange: RDateRange | undefined;
  onDateRangeChange: (range: RDateRange | undefined) => void;
  temperature?: "hot" | "warm" | "cold";
  onTemperatureChange: (temp: "hot" | "warm" | "cold" | undefined) => void;
  scoreState?: string;
  onScoreStateChange?: (state: string | undefined) => void;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (count: number) => void;
};

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

const formatDateRange = (range?: RDateRange): string => {
  if (!range?.from && !range?.to) return "Select date range";
  const from = range.from ? formatDateToDDMMYYYY(range.from) : "";
  const to = range.to ? formatDateToDDMMYYYY(range.to) : "";
  return from && to ? `${from} - ${to}` : from || to;
};

const getStatusStyle = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-700";
  const normalized = status.toLowerCase();
  if (normalized.includes("payment")) {
    return "bg-[#F4EEFB] text-[#9333EA]";
  }
  if (
    normalized.includes("quotation") ||
    normalized.includes("proposal") ||
    normalized.includes("quote")
  ) {
    return "bg-[#FFF4E5] text-[#D97706]";
  }
  if (normalized.includes("closed") || normalized.includes("won")) {
    return "bg-[#E8F8EE] text-[#16A34A]";
  }
  return "bg-gray-100 text-gray-700";
};

export function EmployeeAssignedLeadsTab({
  items,
  total,
  dateRange,
  onDateRangeChange,
  temperature,
  onTemperatureChange,
  // scoreState,
  // onScoreStateChange,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: AssignedLeadsTabProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dateOpen, setDateOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<RDateRange | undefined>(
    dateRange,
  );

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Score State Filter */}
          {/* <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">Score State</label>
            <div className="relative">
              <select
                value={scoreState || "all"}
                onChange={(e) =>
                  onScoreStateChange?.(
                    e.target.value === "all" ? undefined : e.target.value
                  )
                }
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2 pr-9 text-xs font-normal text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-35"
              >
                <option value="all">All State</option>
                <option value="Warm → Hot">Warm → Hot</option>
                <option value="Cold → Warm">Cold → Warm</option>
                <option value="Hot → Cold">Hot → Cold</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div> */}

          {/* Lead Score / Temperature Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Lead Score
            </label>
            <div className="relative">
              <select
                value={temperature || "all"}
                onChange={(e) =>
                  onTemperatureChange(
                    e.target.value === "all"
                      ? undefined
                      : (e.target.value as "hot" | "warm" | "cold"),
                  )
                }
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2 pr-9 text-xs font-normal text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-35"
              >
                <option value="all">All</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Date Range Filter Button */}
        <div>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-normal text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{formatDateRange(dateRange)}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-4 bg-white rounded-xl shadow-lg border border-gray-100"
              align="end"
            >
              <CalendarComponent
                mode="range"
                selected={draftRange}
                onSelect={setDraftRange}
                numberOfMonths={1}
              />
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraftRange(undefined);
                    onDateRangeChange(undefined);
                    setDateOpen(false);
                  }}
                  className="text-xs text-gray-600"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onDateRangeChange(draftRange);
                    setDateOpen(false);
                  }}
                  className="text-xs bg-blue-600 text-white hover:bg-blue-700"
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-100">
        <Table className="w-full text-left border-collapse">
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-white hover:bg-white">
              <TableHead className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                LEAD INFO
              </TableHead>
              <TableHead className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                STATUS
              </TableHead>
              <TableHead className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                QUOTE VALUE
              </TableHead>
              <TableHead className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                SCORE STATE
              </TableHead>
              <TableHead className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-right">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 bg-white">
            {items && items.length > 0 ? (
              items.map((item) => (
                <TableRow
                  key={item.leadId}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Lead Info */}
                  <TableCell className="py-4 px-6 align-middle">
                    <button
                      type="button"
                      onClick={() => navigate(`/leads/${item.leadId}`, { state: { from: location.pathname + location.search } })}
                      className="text-left text-sm font-semibold text-gray-900 leading-snug hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {item.customerName}
                    </button>
                    <div className="text-xs text-gray-400 font-normal mt-0.5">
                      {item.jobId || "Q-2025-1047"}
                    </div>
                    <div className="text-xs text-gray-400 font-normal mt-0.5">
                      {[item.projectName, item.location]
                        .filter(Boolean)
                        .join(" . ") || "Workshop . Texas"}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4 px-6 align-middle whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-normal",
                        getStatusStyle(item.statusLabel || item.status),
                      )}
                    >
                      {item.statusLabel || item.status}
                    </span>
                  </TableCell>

                  {/* Quote Value */}
                  <TableCell className="py-4 px-6 align-middle">
                    <span className="text-sm font-bold text-gray-900">
                      {item.quoteValue !== undefined
                        ? formatCurrency(item.quoteValue)
                        : "$12,500"}
                    </span>
                  </TableCell>

                  {/* Score State */}
                  <TableCell className="py-4 px-6 align-middle text-sm font-normal text-gray-700">
                    {item.scoreStateLabel || "Warm → Hot"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 px-6 align-middle text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/leads/${item.leadId}`, { state: { from: location.pathname + location.search } })}
                      aria-label="View lead details"
                      title="View Lead Details"
                      className="p-1 text-[#5551FF] hover:text-[#3B38D9] transition-colors inline-flex items-center justify-center focus:outline-none cursor-pointer"
                    >
                      <Eye className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-gray-500 font-medium"
                >
                  No assigned leads found for this employee.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="bg-white">
          <Pagination
            totalItems={total}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </div>
      )}
    </div>
  );
}
