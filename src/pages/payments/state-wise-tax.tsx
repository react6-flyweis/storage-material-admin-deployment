import { useMemo, useState } from "react";
import { format, isValid, differenceInDays } from "date-fns";
import type { DateRange as RDateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  RefreshCcw,
  DollarSign,
  ShoppingBag,
  Handbag,
  Hourglass,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import TaxDetailsSheet from "@/components/payments/tax-details-sheet";
import StatCardV2 from "@/components/ui/stat-card-v2";
import DateRangeFilter from "@/components/ui/date-range-filter";
import UpcomingFilingDeadlines from "@/components/payments/upcoming-filing-deadlines";
import {
  useStateWiseTaxQuery,
  useStateWiseTaxStatsQuery,
  useExportStateWiseTaxMutation,
} from "@/modules/payments/payments.hooks";
import {
  useBudgetVsActualProjectsQuery,
  useExpensesFiltersQuery,
} from "@/modules/financials/financials.hooks";
import type { StateOverviewItem } from "@/modules/payments/payments.api";

const STATE_COLORS: Record<string, string> = {
  Texas: "bg-blue-900",
  California: "bg-orange-500",
  "New York": "bg-blue-700",
  Florida: "bg-emerald-700",
  Arizona: "bg-yellow-500",
  Nevada: "bg-blue-800",
};

const DEFAULT_COLOR_PALETTE = [
  "bg-blue-900",
  "bg-orange-500",
  "bg-blue-700",
  "bg-yellow-500",
  "bg-blue-800",
  "bg-purple-700",
  "bg-emerald-700",
  "bg-indigo-700",
];

function getStateColor(stateName: string, index: number) {
  if (STATE_COLORS[stateName]) return STATE_COLORS[stateName];
  return DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length];
}

function formatCurrency(val?: number) {
  if (val === undefined || val === null || isNaN(val)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  if (!isValid(dateObj)) return dateStr;
  return format(dateObj, "MMM dd, yyyy");
}

function formatDeadlineDate(dateStr?: string) {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  if (!isValid(dateObj)) return dateStr;
  return format(dateObj, "dd MMM yyyy").toUpperCase();
}

function getDaysLeftText(dateStr?: string) {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  if (!isValid(dateObj)) return "";
  const diff = differenceInDays(dateObj, new Date());
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return `Due today`;
  return `${diff} days left`;
}

const TrendText = ({ value }: { value?: number }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  return (
    <span
      className={`flex items-center font-medium ${
        isPositive ? "text-emerald-500" : "text-rose-500"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3 mr-1" />
      ) : (
        <TrendingDown className="w-3 h-3 mr-1" />
      )}
      {Math.abs(value)}%{" "}
      <span className="text-gray-400 font-normal ml-1">from last month</span>
    </span>
  );
};

export default function StateWiseTax() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<{
    state: string;
    status: string;
  } | null>(null);

  // Fetch project options from budget vs actual and expenses filters
  const { data: bvaProjectsData, isLoading: isBvaLoading } =
    useBudgetVsActualProjectsQuery();
  const { data: filtersData, isLoading: isFiltersLoading } =
    useExpensesFiltersQuery();

  const isProjectsLoading = isBvaLoading || isFiltersLoading;

  // Build unified project options list
  const projectOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; jobId?: string }>();

    // From budget vs actual
    const bvaList = bvaProjectsData?.data?.projects || [];
    for (const p of bvaList) {
      if (p._id) {
        map.set(p._id, {
          id: p._id,
          name: p.projectName || "",
          jobId: p.jobId || "",
        });
      }
    }

    // From expense filters
    const filterProjects = filtersData?.data?.projects || [];
    for (const p of filterProjects) {
      if (p.leadId) {
        const existing = map.get(p.leadId);
        map.set(p.leadId, {
          id: p.leadId,
          name: p.projectName || existing?.name || "",
          jobId: p.jobId || existing?.jobId || "",
        });
      }
    }

    return Array.from(map.values()).map((p) => {
      const displayLabel = p.name
        ? p.jobId
          ? `${p.name} (${p.jobId})`
          : p.name
        : p.jobId || p.id;
      return {
        id: p.id,
        label: displayLabel,
      };
    });
  }, [bvaProjectsData, filtersData]);

  const startDateStr = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const endDateStr = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : undefined;
  const activeProjectId =
    selectedProjectId !== "all" ? selectedProjectId : undefined;

  const queryParams = {
    projectId: activeProjectId,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  const statsParams = {
    projectId: activeProjectId,
  };

  const { data, isLoading, isFetching, isError, refetch } =
    useStateWiseTaxQuery(queryParams);

  const {
    data: statsRes,
    isFetching: isStatsFetching,
    refetch: refetchStats,
  } = useStateWiseTaxStatsQuery(statsParams);

  const exportMutation = useExportStateWiseTaxMutation();

  const stateOverview: StateOverviewItem[] = data?.data?.stateOverview || [];
  const statsData = statsRes?.data;
  const apiMainStats = data?.data?.stats;

  // Pagination for state table
  const totalItems = stateOverview.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedStates = useMemo(() => {
    const start = (page - 1) * limit;
    return stateOverview.slice(start, start + limit);
  }, [stateOverview, page, limit]);

  // Fallback calculations if stats endpoint doesn't return or is loading
  const fallbackTaxCollected = stateOverview.reduce(
    (acc, curr) => acc + (Number(curr.taxCollected) || 0),
    0
  );
  const fallbackPaid = stateOverview.reduce(
    (acc, curr) => acc + (Number(curr.paidFiled) || 0),
    0
  );
  const fallbackPayable = stateOverview.reduce(
    (acc, curr) => acc + (Number(curr.payable) || 0),
    0
  );
  const fallbackPendingStates = stateOverview.filter(
    (s) =>
      Number(s.payable) > 0 ||
      s.status?.toLowerCase().includes("due") ||
      s.status?.toLowerCase().includes("pending")
  );

  const finalTaxCollected =
    statsData?.totalTaxCollected?.value !== undefined
      ? statsData.totalTaxCollected.value
      : apiMainStats?.totalTaxCollected !== undefined
      ? apiMainStats.totalTaxCollected
      : fallbackTaxCollected;

  const finalPaid =
    statsData?.totalPaid?.value !== undefined
      ? statsData.totalPaid.value
      : apiMainStats?.totalPaid !== undefined
      ? apiMainStats.totalPaid
      : fallbackPaid;

  const finalPayable =
    statsData?.totalPayable?.value !== undefined
      ? statsData.totalPayable.value
      : apiMainStats?.totalPayable !== undefined
      ? apiMainStats.totalPayable
      : fallbackPayable;

  const finalPendingCount =
    statsData?.pendingFilingStates?.count !== undefined
      ? statsData.pendingFilingStates.count
      : apiMainStats?.pendingFilingStates !== undefined
      ? apiMainStats.pendingFilingStates
      : fallbackPendingStates.length;

  const pendingLabel =
    statsData?.pendingFilingStates?.label || "Requires Filing";

  const nextDueDateDisplay = statsData?.nextFilingDue?.date
    ? formatDateDisplay(statsData.nextFilingDue.date)
    : apiMainStats?.nextFilingDue
    ? formatDateDisplay(apiMainStats.nextFilingDue)
    : fallbackPendingStates[0]?.nextDue
    ? formatDateDisplay(fallbackPendingStates[0].nextDue)
    : "-";

  const nextDueStateDisplay =
    statsData?.nextFilingDue?.state ||
    fallbackPendingStates[0]?._id ||
    "No Due";

  const handleSyncNow = async () => {
    await Promise.all([refetch(), refetchStats()]);
    setLastSyncedTime(new Date());
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        projectId: activeProjectId,
        startDate: startDateStr,
        endDate: endDateStr,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `State_Wise_Tax_Report_${format(new Date(), "yyyyMMdd")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleOpenSheet = (stateName: string, statusName: string) => {
    setSelectedState({ state: stateName, status: statusName });
    setIsSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("due") || s.includes("pending")) {
      return (
        <Badge className="bg-orange-400 hover:bg-orange-500 text-white font-normal rounded-sm">
          {status || "Payment Due"}
        </Badge>
      );
    }
    if (s.includes("filed") || s.includes("paid")) {
      return (
        <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white font-normal rounded-sm px-3">
          Filed
        </Badge>
      );
    }
    if (s.includes("no due") || s.includes("none")) {
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm">
          No Due
        </Badge>
      );
    }
    return <Badge>{status}</Badge>;
  };

  // Build upcoming filing deadlines list dynamically from state overview data
  const filingDeadlines = useMemo(() => {
    const pendingList = stateOverview.filter(
      (s) =>
        s.nextDue ||
        s.status?.toLowerCase().includes("pending") ||
        s.status?.toLowerCase().includes("due")
    );

    const cards = pendingList.map((s) => ({
      title: s._id,
      subtitle: "Monthly Return",
      detail: getDaysLeftText(s.nextDue) || "Pending Filing",
      date: formatDeadlineDate(s.nextDue),
    }));

    cards.push({
      title: "Never Miss A Deadline",
      subtitle: "Never miss notification",
      cta: "Manage Notifications",
      detail: undefined,
      date: undefined,
    });

    return cards;
  }, [stateOverview]);

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">State wise Tax</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review file and pay sales tax by state, all payments are processed
            securely through our integrated tax provider.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-white text-gray-700 border-gray-200"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </div>

      {/* Filters and Sync */}
      <Card className="p-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-none shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5 w-60">
            <label className="text-sm font-medium text-gray-700">Project</label>
            <Select
              value={selectedProjectId}
              onValueChange={(val) => {
                setSelectedProjectId(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {isProjectsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading projects...
                  </SelectItem>
                ) : (
                  projectOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 w-70">
            <label className="text-sm font-medium text-gray-700">
              Date Range
            </label>
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            Last Synced: {format(lastSyncedTime, "MMM dd, yyyy HH:mm")}{" "}
            <span className="text-emerald-500">Synced</span>
          </div>
          <Button
            variant="outline"
            className="bg-white border-gray-200 text-gray-700"
            onClick={handleSyncNow}
            disabled={isFetching || isStatsFetching}
          >
            Sync Now
            <RefreshCcw
              className={`w-4 h-4 ml-2 ${
                isFetching || isStatsFetching ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCardV2
          title="Total Tax Collected"
          value={
            isLoading ? "..." : formatCurrency(finalTaxCollected)
          }
          subtitle={
            statsData?.totalTaxCollected?.pctChangeFromLastMonth !==
            undefined ? (
              <TrendText
                value={statsData.totalTaxCollected.pctChangeFromLastMonth}
              />
            ) : undefined
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-purple-200 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          }
          color="purple"
        />
        <StatCardV2
          title="Total Paid"
          value={isLoading ? "..." : formatCurrency(finalPaid)}
          subtitle={
            statsData?.totalPaid?.pctChangeFromLastMonth !== undefined ? (
              <TrendText value={statsData.totalPaid.pctChangeFromLastMonth} />
            ) : undefined
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-emerald-200 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          }
          color="green"
        />
        <StatCardV2
          title="Total Payable"
          value={isLoading ? "..." : formatCurrency(finalPayable)}
          subtitle={
            statsData?.totalPayable?.pctChangeFromLastMonth !== undefined ? (
              <TrendText
                value={statsData.totalPayable.pctChangeFromLastMonth}
              />
            ) : undefined
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-amber-200 text-yellow-600">
              <Handbag className="w-4 h-4" />
            </div>
          }
          color="yellow"
        />
        <StatCardV2
          title="Pending Filing"
          value={
            isLoading ? (
              "..."
            ) : (
              <span className="text-xl font-bold">
                {finalPendingCount} States
              </span>
            )
          }
          subtitle={
            <span className="text-gray-500 text-sm">{pendingLabel}</span>
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-rose-200 text-red-500">
              <Hourglass className="w-4 h-4" />
            </div>
          }
          color="red"
        />
        <StatCardV2
          title="Next Filing Due"
          value={
            isLoading ? (
              "..."
            ) : (
              <span className="text-xl font-bold">{nextDueDateDisplay}</span>
            )
          }
          subtitle={
            <span className="text-emerald-500 text-sm flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {nextDueStateDisplay}
            </span>
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-purple-200 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          }
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">
            State wise tax overview
          </h3>
          {isFetching && !isLoading && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Updating...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading state tax overview...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-500 space-y-3">
            <p>Failed to load state-wise tax data.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f8fafc]">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-semibold text-gray-900 h-11">
                  State
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Tax Collected
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Taxable Sales
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Paid/Filed
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Payable
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Due Date
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No tax data available for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStates.map((row, idx) => {
                  const stateName = row._id || "Unknown";
                  const avatarColor = getStateColor(
                    stateName,
                    (page - 1) * limit + idx
                  );
                  const isPayablePositive = Number(row.payable) > 0;
                  const isPendingOrDue =
                    row.status?.toLowerCase().includes("due") ||
                    row.status?.toLowerCase().includes("pending");

                  return (
                    <TableRow
                      key={row._id || idx}
                      className="border-b last:border-none hover:bg-gray-50/50"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${avatarColor}`}
                          >
                            <span className="text-xs font-bold">
                              {stateName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {stateName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {row.rate || "8.25% Sales Tax"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-gray-500">
                        {formatCurrency(row.taxCollected)}
                      </TableCell>
                      <TableCell className="py-4 text-gray-500">
                        {formatCurrency(row.taxableSales)}
                      </TableCell>
                      <TableCell className="py-4 text-gray-500">
                        {formatCurrency(row.paidFiled)}
                      </TableCell>
                      <TableCell
                        className={`py-4 font-medium ${
                          isPayablePositive ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {formatCurrency(row.payable)}
                      </TableCell>
                      <TableCell className="py-4 text-gray-500">
                        {formatDateDisplay(row.nextDue)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(row.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        {isPendingOrDue ? (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium px-6"
                            onClick={() =>
                              handleOpenSheet(stateName, row.status)
                            }
                          >
                            Pay Tax
                          </Button>
                        ) : (
                          <button
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 px-2 cursor-pointer"
                            onClick={() =>
                              handleOpenSheet(stateName, row.status)
                            }
                          >
                            View Details
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center text-sm text-gray-500">
            Showing
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-16 mx-2 bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            Results
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-400 rounded-md border-gray-200"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <Button
                key={pNum}
                variant="outline"
                className={`h-8 w-8 p-0 rounded-md ${
                  pNum === page
                    ? "border-blue-600 text-blue-600 font-medium"
                    : "text-gray-600 border-none hover:bg-gray-50"
                }`}
                onClick={() => setPage(pNum)}
              >
                {pNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-600 rounded-md border-gray-200"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <UpcomingFilingDeadlines limit={5} />

      {/* Controlled Tax Details Sheet */}
      {selectedState && (
        <TaxDetailsSheet
          state={selectedState.state}
          status={selectedState.status}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </div>
  );
}

