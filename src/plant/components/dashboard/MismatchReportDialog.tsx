import { useState, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink, AlertTriangle, Filter, Calendar, User } from "lucide-react";
import { Link } from "react-router";
import { useMismatchReportQuery } from "@/modules/plant/dashboard.hooks";
import type { DashboardFilterParams, MismatchCategory } from "@/modules/plant/dashboard.api";
import Pagination from "../Pagination";

interface MismatchReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters?: DashboardFilterParams;
  initialCategory?: MismatchCategory | "";
  employeeName?: string;
}

const CATEGORIES: { label: string; value: MismatchCategory | "" }[] = [
  { label: "All Items", value: "" },
  { label: "Missing Items", value: "missing" },
  { label: "Qty Mismatches", value: "qty" },
  { label: "Spec Mismatches", value: "spec" },
  { label: "Extra Items", value: "extra" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status?: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("missing")) {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-medium">Missing</Badge>;
  }
  if (s.includes("qty")) {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-medium">Qty Mismatch</Badge>;
  }
  if (s.includes("spec") || s.includes("part")) {
    return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none font-medium">Spec Mismatch</Badge>;
  }
  if (s.includes("extra")) {
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none font-medium">Extra Item</Badge>;
  }
  return <Badge variant="outline" className="font-medium capitalize">{status || "Unknown"}</Badge>;
}

function getSeverityBadge(severity?: string) {
  const s = (severity || "").toLowerCase();
  if (s === "high") {
    return <Badge className="bg-rose-50 text-rose-700 border-rose-200">High</Badge>;
  }
  if (s === "medium" || s === "med") {
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>;
  }
  return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
}

export default function MismatchReportDialog({
  open,
  onOpenChange,
  filters,
  initialCategory = "",
  employeeName,
}: MismatchReportDialogProps) {
  const [category, setCategory] = useState<MismatchCategory | "">(initialCategory);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const searchInputId = useId();

  // Reset to initial category and page when opening or initialCategory changes
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setCategory(initialCategory);
      setPage(1);
    }
    onOpenChange(nextOpen);
  };

  const { data, isLoading, isError, refetch } = useMismatchReportQuery({
    ...filters,
    page,
    limit,
    category: category || undefined,
    search: search.trim() || undefined,
  });

  const reportData = data?.data;
  const items = reportData?.items || [];
  const total = reportData?.total ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Mismatch Report
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Detailed breakdown of discrepancies between approved purchase orders and shipper files.
              </DialogDescription>
            </div>

            {/* Scope badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {filters?.startDate && filters?.endDate && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{filters.startDate} to {filters.endDate}</span>
                </div>
              )}
              {employeeName && employeeName !== "all" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>{employeeName}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar: Category tabs and search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 pb-2">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 rounded-lg">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    setCategory(cat.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            <label htmlFor={searchInputId} className="sr-only">
              Search by reason, project, vendor...
            </label>
            <Input
              id={searchInputId}
              type="text"
              placeholder="Search reason, project..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>
        </div>

        {/* Report Content Table */}
        <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-lg bg-white">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b last:border-b-0">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Failed to load mismatch report</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                There was an issue fetching the mismatch data. Please check your connection and try again.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <Filter className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-800">No mismatch records found</p>
              <p className="text-xs text-gray-500 mt-1">
                {search || category
                  ? "Try adjusting your search terms or category filter."
                  : "All items match between quotes and shipper documents for this period."}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 border-b text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Project / Job</th>
                  <th className="py-2.5 px-4">Vendor</th>
                  <th className="py-2.5 px-4">File Name</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Discrepancy Reason</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const comparisonId = item.shipperRequestId || item.resultId;
                  return (
                    <tr key={item.resultId || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{item.projectName || "Unknown Project"}</div>
                        {item.jobId && <div className="text-[11px] text-gray-500 font-mono">{item.jobId}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-medium">{item.vendorName || "-"}</div>
                        {item.vendorCode && <div className="text-[11px] text-gray-500">{item.vendorCode}</div>}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-[140px] truncate" title={item.fileName}>
                        {item.fileName || "-"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getSeverityBadge(item.severity)}
                      </td>
                      <td className="py-3 px-4 text-gray-700 max-w-[220px]">
                        <span className="line-clamp-2" title={item.reason}>
                          {item.reason || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {comparisonId ? (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                            <Link
                              to={`/plant/load-planning/${comparisonId}/comparison-result`}
                              onClick={() => onOpenChange(false)}
                            >
                              View
                              <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with total count & pagination */}
        <div className="pt-2">
          {total > limit && (
            <Pagination
              currentPage={page}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={setPage}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
