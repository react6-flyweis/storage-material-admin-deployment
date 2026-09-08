import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  Send,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  MailCheck,
  FileEdit,
} from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import BuildingTypeSelector from "@/components/leads/building-type-selector";
import {
  usePendingApprovalsQuery,
  useQuotationStatsQuery,
} from "@/modules/quotations/quotations.hooks";
import {
  BUILDING_TYPE,
  ADMIN_STATUS,
  type Quotation,
  type AdminStatus,
} from "@/modules/quotations/quotations.api";
import ApproveQuotationDialog from "@/components/leads/approve-quotation-dialog";
import RejectQuotationDialog from "@/components/leads/reject-quotation-dialog";
import SendQuotationDialog from "@/components/leads/send-quotation-dialog";

const STATUS_LABELS: Record<AdminStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  sent: "Sent",
  accepted: "Accepted",
};

const BUILDING_TYPE_OPTIONS = BUILDING_TYPE.map((type) => ({
  value: type,
  label: type,
}));

function getStatusBadge(quotation: Quotation) {
  const status = quotation.workflowStatus || quotation.status || "draft";

  switch (status) {
    case "approved":
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-green-100 text-green-700">
          Approved
        </span>
      );
    case "pending":
    case "pending_approval":
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Pending Approval
        </span>
      );
    case "rejected":
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          Rejected
        </span>
      );
    case "sent":
      if (quotation.sendMethod === "manual") {
        return (
          <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            Marked sent
          </span>
        );
      }
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          Sent via email
        </span>
      );
    case "accepted":
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          Accepted
        </span>
      );
    case "draft":
    default:
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Draft
        </span>
      );
  }
}

export default function QuotationListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    buildingType: "all",
    status: "all",
    sort: "latest",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query Params
  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      sort: string;
      search?: string;
      buildingType?: string;
      status?: string;
    } = {
      page: currentPage,
      limit: rowsPerPage,
      sort: selectedFilters.sort || "latest",
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (selectedFilters.buildingType !== "all") {
      params.buildingType = selectedFilters.buildingType;
    }
    if (selectedFilters.status !== "all") {
      params.status = selectedFilters.status;
    }

    return params;
  }, [currentPage, rowsPerPage, debouncedSearch, selectedFilters]);

  // API Hooks
  const { data: statsResponse, isLoading: isStatsLoading } =
    useQuotationStatsQuery();
  const stats = statsResponse?.data;

  const {
    data: pendingData,
    isLoading,
    isError,
  } = usePendingApprovalsQuery(queryParams);
  const quotations: Quotation[] = useMemo(
    () => pendingData?.data?.quotations || [],
    [pendingData?.data?.quotations],
  );
  const pagination = pendingData?.data?.pagination;
  const totalItems = pagination?.total ?? quotations.length;

  const [approveQuote, setApproveQuote] = useState<Quotation | null>(null);
  const [rejectQuote, setRejectQuote] = useState<Quotation | null>(null);
  const [sendQuote, setSendQuote] = useState<Quotation | null>(null);

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(quotations.map((q) => q._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const allSelected =
    quotations.length > 0 && selectedIds.length === quotations.length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <TitleSubtitle
          title="All Quotations"
          subtitle="Manage your Quotations."
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total"
          value={String(stats?.total ?? 0)}
          color="bg-[#1D51A4]"
          loading={isStatsLoading}
          icon={<FileText className="h-5 w-5 text-[#1D51A4]" />}
          className={cn(
            "transition-all cursor-pointer hover:shadow-md",
            selectedFilters.status === "all" ? "ring-2 ring-blue-500 ring-offset-2" : "",
          )}
          onClick={() => handleFilterChange("status", "all")}
        />
        <StatCard
          title="Pending"
          value={String(stats?.pendingApproval ?? stats?.pending_approval ?? 0)}
          color="bg-amber-500"
          loading={isStatsLoading}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          className={cn(
            "transition-all cursor-pointer hover:shadow-md",
            selectedFilters.status === "pending_approval" || selectedFilters.status === "pending"
              ? "ring-2 ring-amber-500 ring-offset-2"
              : "",
          )}
          onClick={() => handleFilterChange("status", "pending_approval")}
        />
        <StatCard
          title="Approved"
          value={String(stats?.approved ?? 0)}
          color="bg-green-600"
          loading={isStatsLoading}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          className={cn(
            "transition-all cursor-pointer hover:shadow-md",
            selectedFilters.status === "approved" ? "ring-2 ring-green-500 ring-offset-2" : "",
          )}
          onClick={() => handleFilterChange("status", "approved")}
        />
        <StatCard
          title="Sent"
          value={String(stats?.sent ?? 0)}
          color="bg-purple-600"
          loading={isStatsLoading}
          icon={<MailCheck className="h-5 w-5 text-purple-600" />}
          className={cn(
            "transition-all cursor-pointer hover:shadow-md",
            selectedFilters.status === "sent" ? "ring-2 ring-purple-500 ring-offset-2" : "",
          )}
          onClick={() => handleFilterChange("status", "sent")}
        />
        <StatCard
          title="Rejected"
          value={String(stats?.rejected ?? 0)}
          color="bg-red-500"
          loading={isStatsLoading}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          className={cn(
            "transition-all cursor-pointer hover:shadow-md",
            selectedFilters.status === "rejected" ? "ring-2 ring-red-500 ring-offset-2" : "",
          )}
          onClick={() => handleFilterChange("status", "rejected")}
        />
        <StatCard
          title="Draft"
          value={String(stats?.draft ?? 0)}
          color="bg-gray-600"
          loading={isStatsLoading}
          icon={<FileEdit className="h-5 w-5 text-gray-600" />}
          className={cn(
            "transition-all cursor-pointer hover:shadow-md",
            selectedFilters.status === "draft" ? "ring-2 ring-gray-500 ring-offset-2" : "",
          )}
          onClick={() => handleFilterChange("status", "draft")}
        />
      </div>

      {/* Action Buttons and Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search quotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full bg-white text-xs h-9"
          />
        </div>

        <div className="flex gap-2.5 flex-wrap items-center w-full lg:w-auto lg:ml-auto">
          {/* Building Type Selector */}
          <BuildingTypeSelector
            value={selectedFilters.buildingType}
            onChange={(val) => handleFilterChange("buildingType", val)}
            options={BUILDING_TYPE_OPTIONS}
            includeAll
            allLabel="All Building Types"
            triggerClassName="w-full sm:w-44 bg-white text-xs h-9"
            placeholder="Building Types"
          />

          {/* Status Filter */}
          <Select
            value={selectedFilters.status}
            onValueChange={(v) => handleFilterChange("status", v)}
          >
            <SelectTrigger className="w-full sm:w-40 bg-white text-xs h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {ADMIN_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={selectedFilters.sort}
            onValueChange={(v) => handleFilterChange("sort", v)}
          >
            <SelectTrigger className="w-full sm:w-32 bg-white text-xs h-9">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  QUOTE ID
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  LEAD DETAILS
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  BUILDING TYPE
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  STATUS
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  QUOTATION VALUE
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  VERSION
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold">
                  DATE
                </TableHead>
                <TableHead className="text-gray-600 text-xs font-semibold text-right pr-6">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Loading quotations...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-6 py-8 text-center text-sm text-red-500"
                  >
                    Failed to load quotations.
                  </TableCell>
                </TableRow>
              ) : quotations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No quotations found.
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((quotation) => {
                  const effectiveStatus =
                    quotation.approvalStatus ||
                    quotation.workflowStatus ||
                    quotation.approval?.status ||
                    quotation.status;
                  const isPending =
                    effectiveStatus === "pending_approval" ||
                    effectiveStatus === "pending";
                  const isAlreadySent =
                    quotation.workflowStatus === "sent" ||
                    quotation.status === "sent" ||
                    Boolean(quotation.sentAt);
                  const isApproved =
                    effectiveStatus === "approved" ||
                    quotation.approvalStatus === "approved" ||
                    quotation.approval?.status === "approved";
                  const canSend = isApproved || isAlreadySent;
                  const price =
                    quotation.finalPrice || quotation.basePrice || 0;

                  // Lead & Customer information extraction
                  const customerObj =
                    typeof quotation.customerId === "object" && quotation.customerId !== null
                      ? quotation.customerId
                      : null;
                  const leadObj =
                    typeof quotation.leadId === "object" && quotation.leadId !== null
                      ? quotation.leadId
                      : null;
                  const projectName =
                    quotation.projectName ||
                    leadObj?.projectName ||
                    quotation.companyName ||
                    customerObj?.company ||
                    "";
                  const jobId =
                    quotation.jobId ||
                    quotation.projectId ||
                    leadObj?.jobId ||
                    "";
                  const customerName =
                    quotation.customerName ||
                    [customerObj?.firstName, customerObj?.lastName].filter(Boolean).join(" ").trim() ||
                    "";
                  const customerEmail =
                    quotation.customerEmail ||
                    quotation.defaultToEmail ||
                    customerObj?.email ||
                    quotation.sentTo ||
                    "";

                  return (
                    <TableRow key={quotation._id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.includes(quotation._id)}
                          onChange={(e) =>
                            handleSelectOne(quotation._id, e.target.checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/leads/quotation-details/${quotation._id}`,
                            )
                          }
                          className="hover:text-blue-600 hover:underline text-left cursor-pointer font-medium"
                        >
                          {quotation.quoteNumber}
                        </button>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {projectName || customerName || "—"}
                          </span>
                          {jobId && (
                            <span className="text-xs text-gray-500">
                              {jobId}
                            </span>
                          )}
                          {customerName && customerName !== projectName && (
                            <span className="text-xs text-gray-600">
                              {customerName}
                            </span>
                          )}
                          {customerEmail && (
                            <span className="text-xs text-gray-400">
                              {customerEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {quotation.buildingType || "—"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm">
                        {getStatusBadge(quotation)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900 font-semibold">
                        ${price.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">
                        v{quotation.versionNumber}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">
                        {new Date(quotation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                className="bg-[#16a34a] hover:bg-green-700 text-white h-7 px-2.5 text-xs font-medium rounded"
                                onClick={() => setApproveQuote(quotation)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 h-7 px-2.5 text-xs font-medium rounded"
                                onClick={() => setRejectQuote(quotation)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {canSend && (
                            <Button
                              size="sm"
                              className="bg-[#1D51A4] hover:bg-[#174287] text-white h-7 px-2.5 text-xs font-medium rounded flex items-center gap-1"
                              onClick={() => setSendQuote(quotation)}
                            >
                              <Send className="w-3 h-3" /> {isAlreadySent ? "Resend" : "Send"}
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/leads/quotation-details/${quotation._id}`,
                              )
                            }
                            className="text-gray-500 hover:text-[#1D51A4] inline-block p-1 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white">
        <Pagination
          totalItems={totalItems}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Extracted Approve Modal */}
      <ApproveQuotationDialog
        open={!!approveQuote}
        onOpenChange={(o) => !o && setApproveQuote(null)}
        quotationId={approveQuote?._id || ""}
        quoteNumber={approveQuote?.quoteNumber}
        versionNumber={approveQuote?.versionNumber}
      />

      {/* Extracted Reject Modal */}
      <RejectQuotationDialog
        open={!!rejectQuote}
        onOpenChange={(o) => !o && setRejectQuote(null)}
        quotationId={rejectQuote?._id || ""}
        quoteNumber={rejectQuote?.quoteNumber}
        versionNumber={rejectQuote?.versionNumber}
      />

      {/* Extracted Send Modal */}
      <SendQuotationDialog
        open={!!sendQuote}
        onOpenChange={(o) => !o && setSendQuote(null)}
        quotationId={sendQuote?._id || ""}
        quoteNumber={sendQuote?.quoteNumber}
        versionNumber={sendQuote?.versionNumber}
        recipientEmail={
          sendQuote?.sentTo ||
          sendQuote?.defaultToEmail ||
          sendQuote?.customerEmail ||
          (typeof sendQuote?.customerId === "object" ? sendQuote?.customerId?.email : undefined)
        }
        status={sendQuote?.workflowStatus || sendQuote?.status}
        sendMethod={sendQuote?.sendMethod}
        sentAt={sendQuote?.sentAt}
      />
    </div>
  );
}
