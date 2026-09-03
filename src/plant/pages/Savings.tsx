import React, { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  TrendingUp,
  FileText,
  Search,
  Download,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavingsQuery, useExportSavingsMutation } from "@/modules/plant/savings.hooks";
import { useBudgetVsActualProjectsQuery } from "@/modules/financials/financials.hooks";
import Pagination from "../components/Pagination";

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return "$0";
  const isNegative = amount < 0;
  const absFormatted = Math.abs(amount).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  return isNegative ? `-$${absFormatted}` : `$${absFormatted}`;
};

export default function Savings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectId, setProjectId] = useState("all-projects");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");

  // Fetch project options for filter dropdown
  const { data: projectsRes } = useBudgetVsActualProjectsQuery();
  const projectOptions = projectsRes?.data?.projects || [];

  const startDateStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDateStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const queryParams = {
    search: searchTerm.trim() || undefined,
    projectId: projectId === "all-projects" || !projectId ? undefined : projectId,
    status: statusFilter === "all" ? undefined : statusFilter,
    startDate: startDateStr,
    endDate: endDateStr,
    page: currentPage,
    limit: itemsPerPage,
  };

  const { data, isLoading, isError, error, refetch } = useSavingsQuery(queryParams);
  const exportMutation = useExportSavingsMutation();

  const handleExport = async () => {
    try {
      toast.info("Generating Savings export...");
      const exportParams = {
        search: searchTerm.trim() || undefined,
        projectId: projectId === "all-projects" || !projectId ? undefined : projectId,
        status: statusFilter === "all" ? undefined : statusFilter,
        startDate: startDateStr,
        endDate: endDateStr,
      };

      const blob = await exportMutation.mutateAsync(exportParams);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `savings-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Savings report exported successfully!");
    } catch (error: any) {
      console.error("Failed to export savings report:", error);
      let errorMsg = "Failed to export savings report";
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          errorMsg = parsed.message || errorMsg;
        } catch {
          // ignore
        }
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    }
  };

  const stats = data?.data?.stats ?? {
    totalSavingsThisMonth: 0,
    totalLossThisMonth: 0,
  };

  const savingsList = React.useMemo(() => data?.data?.savings ?? [], [data?.data?.savings]);
  const totalItems = data?.data?.total ?? savingsList.length;

  // Optional client-side sorting by Actual Cost when sortOrder is toggled
  const displayedSavings = React.useMemo(() => {
    if (sortOrder === "none") return savingsList;
    return [...savingsList].sort((a, b) => {
      if (sortOrder === "asc") return (a.actualCost ?? 0) - (b.actualCost ?? 0);
      return (b.actualCost ?? 0) - (a.actualCost ?? 0);
    });
  }, [savingsList, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder((prev) => {
      if (prev === "none") return "asc";
      if (prev === "asc") return "desc";
      return "none";
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleProjectChange = (val: string) => {
    setProjectId(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (val: string) => {
    setItemsPerPage(Number(val));
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 p-8 bg-[#eef2fd] min-h-screen text-slate-800 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Savings</h1>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2"
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
          ) : (
            <Download className="w-4 h-4 text-slate-500" />
          )}
          {exportMutation.isPending ? "Exporting..." : "Export"}
        </Button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Total Savings Card */}
        <div className="bg-[#00c853] text-white p-6 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-white/90">Total Savings This Month</p>
            {isLoading ? (
              <Skeleton className="h-9 w-32 bg-white/30 rounded mt-2" />
            ) : (
              <h2 className="text-3xl font-bold mt-2">
                {formatCurrency(stats.totalSavingsThisMonth)}
              </h2>
            )}
          </div>
          <div className="w-12 h-12 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Total Loss Card */}
        <div className="bg-[#ff5722] text-white p-6 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-white/90">Total Loss This Month</p>
            {isLoading ? (
              <Skeleton className="h-9 w-32 bg-white/30 rounded mt-2" />
            ) : (
              <h2 className="text-3xl font-bold mt-2">
                {formatCurrency(stats.totalLossThisMonth)}
              </h2>
            )}
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <InputGroup className="w-full sm:w-80 bg-white border-none shadow-sm rounded-xl h-10 px-1">
          <InputGroupAddon align="inline-start">
            <Search className="w-4 h-4 text-slate-400" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search project..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="text-sm font-medium text-slate-700 placeholder:text-slate-400"
          />
        </InputGroup>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {/* Project Filter Select */}
          <Select value={projectId} onValueChange={handleProjectChange}>
            <SelectTrigger className="bg-white rounded-xl shadow-sm px-4 py-2 text-sm font-medium text-slate-700 border-none hover:bg-slate-50 min-w-44 h-10">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-projects">All Projects</SelectItem>
              {projectOptions.map((proj) => (
                <SelectItem key={proj._id} value={proj._id}>
                  {proj.jobId ? `${proj.jobId} - ${proj.projectName}` : proj.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Selector */}
          <DateRangeFilter
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-64 bg-white border-none shadow-sm"
          />

          {/* Status Filter Select */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="bg-white rounded-xl shadow-sm px-4 py-2 text-sm font-medium text-slate-700 border-none hover:bg-slate-50 min-w-40 h-10">
              <SelectValue placeholder="Status : All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="Good">Status: Good</SelectItem>
              <SelectItem value="Over Budget">Status: Over Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Savings List Table Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Savings List</h3>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-800">
                  <th className="py-4 px-6">Project Name</th>
                  <th className="py-4 px-6">SMDT Cost</th>
                  <th className="py-4 px-6 cursor-pointer select-none" onClick={handleSortToggle}>
                    <div className="flex items-center gap-1 hover:text-slate-600">
                      Actual Cost
                      <ArrowUpDown className={`w-3 h-3 ${sortOrder !== "none" ? "text-slate-800" : "text-slate-400"}`} />
                    </div>
                  </th>
                  <th className="py-4 px-6">Savings</th>
                  <th className="py-4 px-6">Profit / Loss</th>
                  <th className="py-4 px-6">Savings %</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={`savings-skeleton-${idx}`} className="border-b border-slate-100">
                      <td className="py-4 px-6">
                        <Skeleton className="h-4 w-40 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-4 w-20 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-4 w-20 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-4 w-20 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-4 w-16 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-4 w-12 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-red-500">
                      <div className="space-y-2">
                        <p>{(error as Error)?.message || "Failed to load savings data"}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetch()}
                          className="text-xs"
                        >
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : displayedSavings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No savings records found.
                    </td>
                  </tr>
                ) : (
                  displayedSavings.map((row, idx) => {
                    const isProfit = row.profitLoss?.toLowerCase() === "profit" || row.savings >= 0;
                    const isGood =
                      row.status?.toLowerCase() === "good" ||
                      row.status?.toLowerCase() === "under budget";

                    const savingsPctFormatted =
                      typeof row.savingsPct === "number"
                        ? `${row.savingsPct > 0 ? "+" : ""}${row.savingsPct}%`
                        : `${row.savingsPct || "0%"}`;

                    return (
                      <tr
                        key={row.projectId || `${row.projectName}-${idx}`}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {row.projectName}
                        </td>
                        <td className="py-4 px-6">
                          {typeof row.smdtCost === "number"
                            ? formatCurrency(row.smdtCost)
                            : row.smdtCost}
                        </td>
                        <td className="py-4 px-6">
                          {typeof row.actualCost === "number"
                            ? formatCurrency(row.actualCost)
                            : row.actualCost}
                        </td>
                        <td className="py-4 px-6">
                          {typeof row.savings === "number"
                            ? formatCurrency(row.savings)
                            : row.savings}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={
                              isProfit
                                ? "text-[#00c853] font-semibold"
                                : "text-[#ff3d00] font-semibold"
                            }
                          >
                            {row.profitLoss || (isProfit ? "Profit" : "Loss")}
                          </span>
                        </td>
                        <td className="py-4 px-6">{savingsPctFormatted}</td>
                        <td className="py-4 px-6">
                          {isGood ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#00c853] text-white">
                              {row.status || "Good"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ff3d00] text-white">
                              {row.status || "Over Budget"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span>Row Per Page</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="bg-white border border-slate-200 rounded-lg px-3 py-1 h-8 text-slate-700 w-auto gap-2">
                <SelectValue placeholder={String(itemsPerPage)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>Entries</span>
          </div>

          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

