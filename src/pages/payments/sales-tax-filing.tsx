import { useState } from "react";
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
  Upload,
  DollarSign,
  ShoppingBag,
  Handbag,
  Hourglass,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import StatCardV2 from "@/components/ui/stat-card-v2";
import DateRangeFilter from "@/components/ui/date-range-filter";
import SuccessDialog from "@/components/success-dialog";
import TaxDetailsSheet from "@/components/payments/tax-details-sheet";
import TaxComplianceBanner from "@/components/payments/tax-compliance-banner";
import {
  FilingHistoryTab,
  PendingFilingTab,
} from "./sales-tax-filing-tabs";
import {
  useTaxFilingFiltersQuery,
  useTaxFilingQuery,
  useTaxFilingStatsQuery,
  useExportTaxFilingMutation,
  useTaxComplianceStatusQuery,
  useSyncTaxMutation,
} from "@/modules/payments/payments.hooks";
import {
  downloadTaxFilingReceiptPdfProvider,
  prepareTaxFilingProvider,
  type TaxFilingItem,
} from "@/modules/payments/payments.api";

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
}

function formatDate(dateStr?: string | null, pattern: string = "MMM dd, yyyy HH:mm") {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, pattern);
  } catch {
    return dateStr;
  }
}

export default function SalesTaxFiling() {
  const [activeTab, setActiveTab] = useState<"Pending Filing" | "Filing History">(
    "Pending Filing"
  );
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [downloadSuccessOpen, setDownloadSuccessOpen] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("Downloaded successfully");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTaxItem, setSelectedTaxItem] = useState<TaxFilingItem | null>(null);

  // 1. Fetch Compliance Status
  const { data: complianceRes, isLoading: isComplianceLoading, refetch: refetchCompliance } =
    useTaxComplianceStatusQuery();
  const complianceData = complianceRes?.data;

  // 2. Fetch Filters Data
  const { data: filtersRes, isLoading: isFiltersLoading } =
    useTaxFilingFiltersQuery();

  const states = filtersRes?.data?.states || [];
  const projects = filtersRes?.data?.projects || [];
  const clients = filtersRes?.data?.clients || [];

  // 3. Prepare Query Parameters
  const startDateStr = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const endDateStr = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : undefined;

  const effectiveSearch = searchQuery.trim() || undefined;

  const queryParams = {
    state: selectedState !== "all" ? selectedState : undefined,
    projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
    clientId: selectedClientId !== "all" ? selectedClientId : undefined,
    search: effectiveSearch,
    startDate: startDateStr,
    endDate: endDateStr,
    page,
    limit,
  };

  // 4. Fetch Tax Filing Data & Stats
  const {
    data: taxFilingRes,
    isLoading: isTaxFilingLoading,
    isFetching,
    refetch,
  } = useTaxFilingQuery(queryParams);

  const {
    data: kpiStatsRes,
    refetch: refetchStats,
  } = useTaxFilingStatsQuery({
    state: selectedState !== "all" ? selectedState : undefined,
    projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
    clientId: selectedClientId !== "all" ? selectedClientId : undefined,
    search: effectiveSearch,
  });

  const exportMutation = useExportTaxFilingMutation();
  const syncMutation = useSyncTaxMutation();

  const kpiStats = kpiStatsRes?.data;
  const fallbackStats = taxFilingRes?.data?.stats;
  const pendingFiling = taxFilingRes?.data?.pendingFiling || [];
  const filingHistory = taxFilingRes?.data?.filingHistory || [];
  const meta = taxFilingRes?.data?.meta || complianceData;
  const totalCount =
    taxFilingRes?.data?.total ||
    (activeTab === "Pending Filing" ? pendingFiling.length : filingHistory.length);

  const lastSyncedDate = meta?.lastSyncedAt || complianceData?.lastSyncedAt;

  const handleStateChange = (val: string) => {
    setSelectedState(val);
    setPage(1);
  };

  const handleProjectChange = (val: string) => {
    setSelectedProjectId(val);
    setPage(1);
  };

  const handleClientChange = (val: string) => {
    setSelectedClientId(val);
    setPage(1);
  };

  const handleDateRangeChange = (range: RDateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleReviewDetails = (item: TaxFilingItem) => {
    setSelectedTaxItem(item);
    setIsSheetOpen(true);
  };

  const handlePrepareFiling = async (item: TaxFilingItem) => {
    try {
      if (item._id) {
        await prepareTaxFilingProvider(item._id);
      }
    } catch {
      // Continue to open review sheet
    }
    setSelectedTaxItem(item);
    setIsSheetOpen(true);
  };

  const handleDownloadItem = async (item?: TaxFilingItem) => {
    if (item?._id) {
      try {
        const blob = await downloadTaxFilingReceiptPdfProvider(item._id);
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        const filename = item.receipt?.confirmationNumber
          ? `receipt-${item.receipt.confirmationNumber}.pdf`
          : `filing-receipt-${item._id.slice(-6)}.pdf`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setDownloadMessage("Receipt downloaded successfully");
        setDownloadSuccessOpen(true);
        return;
      } catch {
        // Fallback to client CSV if PDF not available
      }
    }

    if (item) {
      const csvContent = `data:text/csv;charset=utf-8,State,Due Date,Amount,Status,Project ID,Customer\n"${
        item.state
      }","${item.dueDate || ""}","${item.amount ?? 0}","${
        typeof item.status === "object" ? item.status.label : item.status || ""
      }","${
        typeof item.leadId === "object" ? item.leadId?.jobId || "" : ""
      }","${
        typeof item.customerId === "object" ? item.customerId?.firstName || "" : ""
      }"`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `filing-receipt-${item._id.slice(-6)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    setDownloadMessage("Receipt downloaded successfully");
    setDownloadSuccessOpen(true);
  };

  const handleSyncNow = async () => {
    try {
      const res = await syncMutation.mutateAsync();
      await Promise.all([refetch(), refetchStats(), refetchCompliance()]);
      const regionCount = res.data?.regions ?? 0;
      const projectCount = res.data?.projects ?? 0;
      setDownloadMessage(
        `Tax data synced successfully: ${regionCount} regions, ${projectCount} projects`
      );
      setDownloadSuccessOpen(true);
    } catch {
      setDownloadMessage("Failed to sync tax data. Please try again.");
      setDownloadSuccessOpen(true);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        state: selectedState !== "all" ? selectedState : undefined,
        projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
        clientId: selectedClientId !== "all" ? selectedClientId : undefined,
        search: effectiveSearch,
        startDate: startDateStr,
        endDate: endDateStr,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-tax-filing-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadMessage("Exported successfully");
      setDownloadSuccessOpen(true);
    } catch {
      // Fallback client CSV export
      const rowsToExport =
        activeTab === "Pending Filing" ? pendingFiling : filingHistory;
      if (rowsToExport.length > 0) {
        const headers = [
          "State",
          "Due Date",
          "Amount",
          "Frequency",
          "Status",
          "Job ID",
          "Project Name",
          "Customer",
        ];
        const csvRows = rowsToExport.map((row) => [
          `"${row.state || ""}"`,
          `"${row.dueDate || ""}"`,
          `"${row.amount ?? 0}"`,
          `"${row.filingFrequency || ""}"`,
          `"${typeof row.status === "object" ? row.status.label : row.status || ""}"`,
          `"${typeof row.leadId === "object" ? row.leadId?.jobId || "" : ""}"`,
          `"${typeof row.leadId === "object" ? row.leadId?.projectName || "" : ""}"`,
          `"${typeof row.customerId === "object" ? row.customerId?.firstName || "" : ""}"`,
        ]);
        const csvContent =
          "data:text/csv;charset=utf-8," +
          [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales-tax-filing-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      setDownloadMessage("Exported successfully");
      setDownloadSuccessOpen(true);
    }
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sales Tax & Filing
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track sales tax collected on invoices and manage filing by state
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lastSyncedDate && (
            <span className="text-xs text-gray-500 hidden sm:inline mr-1">
              Last Synced: {formatDate(lastSyncedDate)}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={syncMutation.isPending || isFetching || complianceData?.canSync === false}
            className="bg-white text-gray-700"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${syncMutation.isPending || isFetching ? "animate-spin" : ""}`}
            />
            {syncMutation.isPending || isFetching ? "Syncing..." : "Sync Now"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="bg-white text-gray-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Compliance / Empty State Banner */}
      <TaxComplianceBanner
        compliance={complianceData}
        isLoading={isComplianceLoading}
        onSync={handleSyncNow}
        isSyncing={syncMutation.isPending}
      />

      {/* Filters */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white shadow-xs">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            State
          </label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Project
          </label>
          <Select
            value={selectedProjectId}
            onValueChange={handleProjectChange}
            disabled={isFiltersLoading}
          >
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((proj) => (
                <SelectItem key={proj.leadId} value={proj.leadId}>
                  {proj.jobId}
                  {proj.projectName ? ` - ${proj.projectName}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Date Range
          </label>
          <DateRangeFilter
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Client
          </label>
          <Select
            value={selectedClientId}
            onValueChange={handleClientChange}
            disabled={isFiltersLoading}
          >
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.customerId} value={client.customerId}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardV2
          title="Total Sales (Taxable)"
          value={formatCurrency(
            kpiStats?.totalSalesTaxable?.value ?? fallbackStats?.totalTaxable
          )}
          subtitle={
            kpiStats?.totalSalesTaxable?.pctChangeFromLastMonth !== undefined ? (
              <span
                className={`flex items-center font-medium text-xs ${
                  kpiStats.totalSalesTaxable.pctChangeFromLastMonth >= 0
                    ? "text-emerald-500"
                    : "text-rose-500"
                }`}
              >
                {kpiStats.totalSalesTaxable.pctChangeFromLastMonth >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {kpiStats.totalSalesTaxable.pctChangeFromLastMonth >= 0 ? "+" : ""}
                {kpiStats.totalSalesTaxable.pctChangeFromLastMonth}%{" "}
                <span className="text-gray-400 font-normal ml-1">from last month</span>
              </span>
            ) : (
              <span className="text-gray-400 font-normal text-xs">
                Based on active invoices
              </span>
            )
          }
          icon={
            <div className="flex items-center justify-center p-1 rounded bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          }
          color="purple"
        />
        <StatCardV2
          title="Total Sales Tax Collected"
          value={formatCurrency(
            kpiStats?.totalSalesTaxCollected?.value ?? fallbackStats?.totalCollected
          )}
          subtitle={
            kpiStats?.totalSalesTaxCollected?.pctChangeFromLastMonth !== undefined ? (
              <span
                className={`flex items-center font-medium text-xs ${
                  kpiStats.totalSalesTaxCollected.pctChangeFromLastMonth >= 0
                    ? "text-emerald-500"
                    : "text-rose-500"
                }`}
              >
                {kpiStats.totalSalesTaxCollected.pctChangeFromLastMonth >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {kpiStats.totalSalesTaxCollected.pctChangeFromLastMonth >= 0 ? "+" : ""}
                {kpiStats.totalSalesTaxCollected.pctChangeFromLastMonth}%{" "}
                <span className="text-gray-400 font-normal ml-1">from last month</span>
              </span>
            ) : (
              <span className="text-gray-400 font-normal text-xs">
                Collected to date
              </span>
            )
          }
          icon={
            <div className="flex items-center justify-center p-1 rounded bg-emerald-50 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          }
          color="green"
        />
        <StatCardV2
          title="Tax Payable by States"
          value={
            kpiStats?.taxPayableByStates?.value !== undefined
              ? formatCurrency(kpiStats.taxPayableByStates.value)
              : fallbackStats?.taxPayableByStates !== undefined &&
                fallbackStats?.taxPayableByStates !== null
              ? typeof fallbackStats.taxPayableByStates === "number" &&
                fallbackStats.taxPayableByStates < 100
                ? `${fallbackStats.taxPayableByStates} State${
                    fallbackStats.taxPayableByStates === 1 ? "" : "s"
                  }`
                : formatCurrency(fallbackStats.taxPayableByStates)
              : "-"
          }
          subtitle={
            <span className="text-gray-400 font-normal text-xs">
              Requires filing action
            </span>
          }
          icon={
            <div className="flex items-center justify-center p-1 rounded bg-amber-50 text-yellow-600">
              <Handbag className="w-4 h-4" />
            </div>
          }
          color="yellow"
        />
        <StatCardV2
          title="Filed VS Unfiled Tax"
          value={
            <div className="flex flex-col text-sm font-semibold space-y-1 mt-1">
              <span className="text-emerald-600">
                Filed:{" "}
                {kpiStats?.fileVsUnfiledTax?.filed !== undefined
                  ? formatCurrency(kpiStats.fileVsUnfiledTax.filed)
                  : (fallbackStats?.filed ?? "-")}
              </span>
              <span className="text-rose-500">
                Unfiled:{" "}
                {kpiStats?.fileVsUnfiledTax?.unfiled !== undefined
                  ? formatCurrency(kpiStats.fileVsUnfiledTax.unfiled)
                  : (fallbackStats?.unfiled ?? "-")}
              </span>
            </div>
          }
          subtitle=""
          icon={
            <div className="flex items-center justify-center p-1 rounded bg-rose-50 text-red-500">
              <Hourglass className="w-4 h-4" />
            </div>
          }
          color="red"
        />
      </div>

      {/* Tabs and Content */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-0 gap-4">
          <div className="flex space-x-8">
            {(["Pending Filing", "Filing History"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`pb-3 text-sm font-semibold relative transition-colors ${
                  activeTab === tab
                    ? "text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {tab === "Pending Filing" && pendingFiling.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                    {pendingFiling.length}
                  </span>
                )}
                {tab === "Filing History" && filingHistory.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                    {filingHistory.length}
                  </span>
                )}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700" />
                )}
              </button>
            ))}
          </div>
          <div className="pb-2 sm:pb-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search state, project or client..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-9 w-full sm:w-72 rounded-md border border-input bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {activeTab === "Pending Filing" ? (
          <PendingFilingTab
            rows={pendingFiling}
            isLoading={isTaxFilingLoading}
            page={page}
            limit={limit}
            total={totalCount}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onReviewDetails={handleReviewDetails}
            onPrepareFiling={handlePrepareFiling}
          />
        ) : (
          <FilingHistoryTab
            rows={filingHistory}
            isLoading={isTaxFilingLoading}
            page={page}
            limit={limit}
            total={totalCount}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onDownload={handleDownloadItem}
            onViewDetails={handleReviewDetails}
          />
        )}
      </div>

      {selectedTaxItem && (
        <TaxDetailsSheet
          state={selectedTaxItem.state}
          status={selectedTaxItem.status || "Pending"}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          item={selectedTaxItem}
        />
      )}

      <SuccessDialog
        open={downloadSuccessOpen}
        onClose={() => setDownloadSuccessOpen(false)}
        title={downloadMessage}
        okLabel="Close"
      />
    </div>
  );
}

