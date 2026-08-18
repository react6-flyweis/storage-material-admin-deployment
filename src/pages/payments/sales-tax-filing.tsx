import { useState } from "react";
import { format } from "date-fns";
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
  RefreshCcw,
} from "lucide-react";
import StatCardV2 from "@/components/ui/stat-card-v2";
import DateRangeFilter from "@/components/ui/date-range-filter";
import SuccessDialog from "@/components/success-dialog";
import TaxDetailsSheet from "@/components/payments/tax-details-sheet";
import {
  FilingHistoryTab,
  PendingFilingTab,
} from "./sales-tax-filing-tabs";
import {
  useTaxFilingFiltersQuery,
  useTaxFilingQuery,
  useExportTaxFilingMutation,
} from "@/modules/payments/payments.hooks";
import type { TaxFilingItem } from "@/modules/payments/payments.api";

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
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

  // 1. Fetch Filters Data
  const { data: filtersRes, isLoading: isFiltersLoading } =
    useTaxFilingFiltersQuery();

  const states = filtersRes?.data?.states || [];
  const projects = filtersRes?.data?.projects || [];
  const clients = filtersRes?.data?.clients || [];

  // 2. Prepare Query Parameters
  const startDateStr = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const endDateStr = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : undefined;

  const effectiveSearch = searchQuery.trim()
    ? searchQuery.trim()
    : selectedState !== "all"
    ? selectedState
    : undefined;

  const queryParams = {
    projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
    clientId: selectedClientId !== "all" ? selectedClientId : undefined,
    search: effectiveSearch,
    startDate: startDateStr,
    endDate: endDateStr,
    page,
    limit,
  };

  // 3. Fetch Tax Filing Data & Stats
  const {
    data: taxFilingRes,
    isLoading: isTaxFilingLoading,
    isFetching,
    refetch,
  } = useTaxFilingQuery(queryParams);

  const exportMutation = useExportTaxFilingMutation();

  const stats = taxFilingRes?.data?.stats;
  const pendingFiling = taxFilingRes?.data?.pendingFiling || [];
  const filingHistory = taxFilingRes?.data?.filingHistory || [];
  const totalCount =
    taxFilingRes?.data?.total ||
    (activeTab === "Pending Filing" ? pendingFiling.length : filingHistory.length);

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

  const handlePrepareFiling = (item: TaxFilingItem) => {
    if (item.websiteLink) {
      window.open(item.websiteLink, "_blank", "noopener,noreferrer");
    } else {
      setSelectedTaxItem(item);
      setIsSheetOpen(true);
    }
  };

  const handleDownloadItem = (item?: TaxFilingItem) => {
    if (item) {
      const csvContent = `data:text/csv;charset=utf-8,State,Due Date,Amount,Status,Project ID,Customer\n"${
        item.state
      }","${item.dueDate}","${item.amount}","${item.status}","${
        item.leadId?.jobId || ""
      }","${item.customerId?.firstName || ""}"`;
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

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
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
          `"${row.status || ""}"`,
          `"${row.leadId?.jobId || ""}"`,
          `"${row.leadId?.projectName || ""}"`,
          `"${row.customerId?.firstName || ""}"`,
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-white text-gray-700"
          >
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
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
          value={formatCurrency(stats?.totalTaxable)}
          subtitle={
            <span className="text-gray-400 font-normal text-xs">
              Based on active invoices
            </span>
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
          value={formatCurrency(stats?.totalCollected)}
          subtitle={
            <span className="text-gray-400 font-normal text-xs">
              Collected to date
            </span>
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
            stats?.taxPayableByStates !== undefined && stats?.taxPayableByStates !== null
              ? typeof stats.taxPayableByStates === "number" && stats.taxPayableByStates < 100
                ? `${stats.taxPayableByStates} State${stats.taxPayableByStates === 1 ? "" : "s"}`
                : formatCurrency(stats.taxPayableByStates)
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
                Filed: {stats?.filed ?? "-"}
              </span>
              <span className="text-rose-500">
                Unfiled: {stats?.unfiled ?? "-"}
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

