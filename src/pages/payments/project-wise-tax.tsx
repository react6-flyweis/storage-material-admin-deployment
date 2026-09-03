import { useMemo, useState } from "react";
import { format, isValid } from "date-fns";
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
import {
  useProjectWiseTaxQuery,
  useProjectWiseTaxStatsQuery,
  useExportProjectWiseTaxMutation,
} from "@/modules/payments/payments.hooks";
import {
  useBudgetVsActualProjectsQuery,
  useExpensesFiltersQuery,
} from "@/modules/financials/financials.hooks";
import type { ProjectWiseTaxItem, TaxFilingItem } from "@/modules/payments/payments.api";

const AVATAR_COLORS = [
  "bg-blue-900",
  "bg-orange-500",
  "bg-blue-700",
  "bg-yellow-500",
  "bg-blue-800",
  "bg-purple-700",
  "bg-emerald-700",
  "bg-indigo-700",
];

function getAvatarColor(name: string, index: number) {
  if (!name) return AVATAR_COLORS[index % AVATAR_COLORS.length];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, "dd/MM/yyyy");
  } catch {
    return dateStr;
  }
}

const ChangeText = ({ value }: { value?: number }) => {
  if (value === undefined || value === null || isNaN(value)) {
    return (
      <span className="text-gray-400 font-normal text-xs">
        from last month
      </span>
    );
  }
  const isPositive = value >= 0;
  return (
    <span
      className={`flex items-center font-medium text-xs ${
        isPositive ? "text-emerald-500" : "text-rose-500"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3 mr-1" />
      ) : (
        <TrendingDown className="w-3 h-3 mr-1" />
      )}
      {isPositive ? `+${value}%` : `${value}%`}{" "}
      <span className="text-gray-400 font-normal ml-1">from last month</span>
    </span>
  );
};

export default function ProjectWiseTax() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    state: string;
    status: string;
    item?: TaxFilingItem;
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
    page,
    limit,
    projectId: activeProjectId,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  const statsParams = {
    projectId: activeProjectId,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  const { data, isLoading, isFetching, isError, refetch } =
    useProjectWiseTaxQuery(queryParams);

  const {
    data: statsRes,
    isFetching: isStatsFetching,
    refetch: refetchStats,
  } = useProjectWiseTaxStatsQuery(statsParams);

  const exportMutation = useExportProjectWiseTaxMutation();

  const projects: ProjectWiseTaxItem[] = data?.data?.projects || [];
  const totalItems: number = data?.data?.total || 0;
  const totalPages: number = Math.max(1, Math.ceil(totalItems / limit));

  const statsData = statsRes?.data;

  // Fallback calculations if stats endpoint doesn't return or is loading
  const fallbackTaxCollected = projects.reduce(
    (acc, curr) => acc + (Number(curr.taxCollected) || 0),
    0
  );
  const fallbackPaid = projects.reduce(
    (acc, curr) => acc + (Number(curr.paidFiled) || 0),
    0
  );
  const fallbackPayable = projects.reduce(
    (acc, curr) => acc + (Number(curr.payable) || 0),
    0
  );
  const fallbackPendingProjects = projects.filter(
    (p) =>
      Number(p.payable) > 0 ||
      p.status?.toLowerCase().includes("due") ||
      p.status?.toLowerCase().includes("pending")
  );

  const finalTaxCollected =
    statsData?.totalTaxCollected?.value !== undefined
      ? statsData.totalTaxCollected.value
      : fallbackTaxCollected;

  const finalPaid =
    statsData?.totalPaid?.value !== undefined
      ? statsData.totalPaid.value
      : fallbackPaid;

  const finalPayable =
    statsData?.totalPayable?.value !== undefined
      ? statsData.totalPayable.value
      : fallbackPayable;

  const finalPendingCount =
    statsData?.pendingFiling?.count !== undefined
      ? statsData.pendingFiling.count
      : fallbackPendingProjects.length;

  const pendingLabel =
    statsData?.pendingFiling?.label || "Requires Filing";

  const nextDueDateDisplay = statsData?.nextFilingDue?.date
    ? formatDateDisplay(statsData.nextFilingDue.date)
    : fallbackPendingProjects[0]?.dueDate
    ? formatDateDisplay(fallbackPendingProjects[0].dueDate)
    : "-";

  const nextDueLocationDisplay =
    statsData?.nextFilingDue?.location ||
    fallbackPendingProjects[0]?.location ||
    fallbackPendingProjects[0]?.projectName ||
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
      link.setAttribute("download", `project-wise-tax-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // CSV fallback
      if (projects.length > 0) {
        const headers = [
          "Project",
          "Job ID",
          "Customer",
          "Location",
          "Tax Collected",
          "Taxable Sales",
          "Paid/Filed",
          "Payable",
          "Due Date",
          "Status",
        ];
        const rows = projects.map((p) => [
          `"${p.projectName || ""}"`,
          `"${p.jobId || ""}"`,
          `"${p.customerName || ""}"`,
          `"${p.location || ""}"`,
          p.taxCollected ?? 0,
          p.taxableSales ?? 0,
          p.paidFiled ?? 0,
          p.payable ?? 0,
          `"${formatDateDisplay(p.dueDate)}"`,
          `"${p.status || ""}"`,
        ]);
        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
          "\n"
        );
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `project-wise-tax-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleOpenSheet = (state: string, status: string, item?: ProjectWiseTaxItem) => {
    const taxItem: TaxFilingItem | undefined = item
      ? {
          _id: item.leadId || "",
          state: item.location || state,
          filingFrequency: "monthly",
          dueDate: item.dueDate || "",
          amount: item.payable ?? item.taxCollected ?? 0,
          status: item.status || status,
          createdAt: "",
          updatedAt: "",
        }
      : undefined;
    setSelectedProject({ state, status, item: taxItem });
    setIsSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || "").trim().toLowerCase();
    switch (normalized) {
      case "payment due":
      case "due":
        return (
          <Badge className="bg-orange-400 hover:bg-orange-500 text-white font-normal rounded-sm">
            Payment Due
          </Badge>
        );
      case "filed":
        return (
          <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white font-normal rounded-sm px-3">
            Filed
          </Badge>
        );
      case "no due":
      case "paid":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm">
            {status || "No Due"}
          </Badge>
        );
      default:
        return <Badge className="font-normal rounded-sm">{status}</Badge>;
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page, "...", totalPages);
      }
    }
    return pages;
  };

  const startRecordIndex = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endRecordIndex = Math.min(page * limit, totalItems);
  const isSyncing = isFetching || isStatsFetching;

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">
            Project Wise Tax
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review file and pay sales tax by project, all payments are processed
            securely through our integrated tax provider.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-white text-gray-700 border-gray-200 cursor-pointer"
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

      <Card className="p-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-none shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5 w-64">
            <label className="text-sm font-medium text-gray-700">Project</label>
            <Select
              value={selectedProjectId}
              onValueChange={(val) => {
                setSelectedProjectId(val);
                setPage(1);
              }}
              disabled={isProjectsLoading}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectOptions.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 w-70">
            <label className="text-sm font-medium text-gray-700">
              Date Range
            </label>
            <DateRangeFilter
              value={dateRange}
              onChange={(range) => {
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
            className="bg-white border-gray-200 text-gray-700 cursor-pointer"
            onClick={handleSyncNow}
            disabled={isSyncing}
          >
            Sync Now
            <RefreshCcw
              className={`w-4 h-4 ml-2 ${isSyncing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCardV2
          title="Total Tax Collected"
          value={formatCurrency(finalTaxCollected)}
          subtitle={
            <ChangeText
              value={statsData?.totalTaxCollected?.pctChangeFromLastMonth}
            />
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
          value={formatCurrency(finalPaid)}
          subtitle={
            <ChangeText value={statsData?.totalPaid?.pctChangeFromLastMonth} />
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
          value={formatCurrency(finalPayable)}
          subtitle={
            <ChangeText
              value={statsData?.totalPayable?.pctChangeFromLastMonth}
            />
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
            <span className="text-xl font-bold">
              {finalPendingCount}{" "}
              {finalPendingCount === 1 ? "Project" : "Projects"}
            </span>
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
          value={<span className="text-xl font-bold">{nextDueDateDisplay}</span>}
          subtitle={
            <span className="text-emerald-500 text-sm flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {nextDueLocationDisplay}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 text-lg">
            Project wise tax overview
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="font-semibold text-gray-900 h-11">
                Project
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
                Due Date ▾
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span>Loading project tax data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-red-500 text-sm"
                >
                  Failed to load project tax data. Please try syncing again.
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-gray-500 text-sm"
                >
                  No project tax records found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((row, idx) => {
                const displayName =
                  row.projectName?.trim() ||
                  row.jobId ||
                  row.customerName ||
                  "Unnamed Project";
                const initialLetter = displayName.charAt(0).toUpperCase();

                const secondaryInfo = [
                  row.jobId,
                  row.location ||
                    (row.customerName ? `Customer: ${row.customerName}` : null),
                ]
                  .filter(Boolean)
                  .join(" • ");

                return (
                  <TableRow
                    key={row.leadId || idx}
                    className="border-b last:border-none hover:bg-gray-50/50"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                            displayName,
                            idx
                          )}`}
                        >
                          <span className="text-xs font-bold">
                            {initialLetter}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {secondaryInfo || "-"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatCurrency(row.taxCollected)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatCurrency(row.taxableSales)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatCurrency(row.paidFiled)}
                    </TableCell>
                    <TableCell
                      className={`py-4 font-medium ${
                        (row.payable || 0) > 0
                          ? "text-red-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {formatCurrency(row.payable)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatDateDisplay(row.dueDate)}
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(row.status)}
                    </TableCell>
                    <TableCell className="py-4">
                      {row.status?.toLowerCase().includes("due") ||
                      (row.payable || 0) > 0 ? (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium px-6 cursor-pointer"
                          onClick={() =>
                            handleOpenSheet(
                              row.location || displayName,
                              row.status,
                              row
                            )
                          }
                        >
                          Pay Tax
                        </Button>
                      ) : (
                        <button
                          type="button"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 px-2 cursor-pointer"
                          onClick={() =>
                            handleOpenSheet(
                              row.location || displayName,
                              row.status,
                              row
                            )
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

        {selectedProject && (
          <TaxDetailsSheet
            state={selectedProject.state}
            status={selectedProject.status}
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            item={selectedProject.item}
          />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3">
          <div className="flex items-center text-sm text-gray-500">
            Showing
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-18 mx-2 bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            Results ({startRecordIndex}-{endRecordIndex} of {totalItems})
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-400 rounded-md border-gray-200 cursor-pointer disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((pageNum, idx) =>
              pageNum === "..." ? (
                <div
                  key={`ellipsis-${idx}`}
                  className="px-2 text-gray-400 flex items-center justify-center h-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  key={`page-${pageNum}`}
                  variant="outline"
                  className={`h-8 w-8 p-0 rounded-md cursor-pointer ${
                    pageNum === page
                      ? "border-blue-600 text-blue-600 font-medium"
                      : "text-gray-600 border-none hover:bg-gray-50"
                  }`}
                  onClick={() => setPage(pageNum as number)}
                >
                  {pageNum}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-600 rounded-md border-gray-200 cursor-pointer disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
