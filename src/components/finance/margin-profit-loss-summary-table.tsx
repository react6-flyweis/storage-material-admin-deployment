import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectProfitLossQuery } from "@/modules/financials/financials.hooks";
import type { ProjectProfitLossItem } from "@/modules/financials/financials.api";

export type ProfitLossData = ProjectProfitLossItem;

interface MarginProfitLossSummaryTableProps {
  data?: ProjectProfitLossItem[];
  itemsPerPage?: number;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  businessUnit?: string;
}

export default function MarginProfitLossSummaryTable({
  data: externalData,
  itemsPerPage = 10,
  projectId,
  startDate,
  endDate,
  businessUnit,
}: MarginProfitLossSummaryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filterKey = `${projectId || ""}_${startDate || ""}_${endDate || ""}_${businessUnit || ""}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: response, isLoading } = useProjectProfitLossQuery(
    externalData
      ? undefined
      : {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch.trim() || undefined,
          startDate,
          endDate,
          projectId,
          businessUnit,
        }
  );

  const projectsList = externalData
    ? externalData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : response?.data?.projects || response?.data?.rows || [];

  const total = externalData
    ? externalData.length
    : response?.data?.total ?? projectsList.length;

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const formatCurrency = (val?: number) =>
    val !== undefined && val !== null && !isNaN(val)
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(val)
      : "-";

  const formatPct = (val?: number) =>
    val !== undefined && val !== null && !isNaN(val) ? `${val.toFixed(2)}%` : "-";

  const formatCategory = (category?: string) => {
    if (!category) return "-";
    return category
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
          Profit &amp; Loss Summary
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 pl-8 text-xs bg-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-48">Project Name</TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-36 text-right">Sales (USD)</TableHead>
              <TableHead className="w-36 text-right">COGS (USD)</TableHead>
              <TableHead className="w-40 text-right">Gross Profit (USD)</TableHead>
              <TableHead className="w-32 text-right">Gross Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                >
                  <TableCell>
                    <Skeleton className="h-4 w-36 mb-1.5" />
                    <Skeleton className="h-3 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-14" />
                  </TableCell>
                </TableRow>
              ))
            ) : projectsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-slate-400">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projectsList.map((row, index) => {
                const rowKey = row.leadId || row.quotationId || row.projectId || index;
                const projectName = row.projectName || row.jobId || "-";
                const sales = row.salesUSD ?? row.revenue;
                const cogs = row.cogsUSD ?? row.totalExpenses;
                const grossProfit = row.grossProfitUSD ?? row.netProfit;
                const margin = row.grossMarginPct ?? row.netProfitMargin;

                return (
                  <TableRow
                    key={rowKey}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                  >
                    <TableCell className="font-medium text-slate-900">
                      <div>
                        <span>{projectName}</span>
                        {row.jobId && row.projectName && (
                          <span className="block text-xs font-normal text-slate-500">
                            {row.jobId}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {formatCategory(row.category)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-600">
                      {formatCurrency(sales)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-600">
                      {formatCurrency(cogs)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-600">
                      {formatCurrency(grossProfit)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-emerald-600">
                      {formatPct(margin)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          Showing <span className="font-medium">{projectsList.length}</span> of{" "}
          <span className="font-medium">{total}</span> Results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={isLoading}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
