import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  Send,
  Search,
} from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/Pagination";
import BuildingTypeSelector from "@/components/leads/building-type-selector";
import {
  usePendingApprovalsQuery,
  useApproveQuotationMutation,
  useRejectQuotationMutation,
  useSendQuotationMutation,
} from "@/modules/quotations/quotations.hooks";
import type { Quotation } from "@/modules/quotations/quotations.api";
import { toast } from "sonner";

function getStatusBadge(quotation: Quotation) {
  const status =
    quotation.approvalStatus ||
    quotation.workflowStatus ||
    quotation.approval?.status ||
    quotation.status ||
    "draft";

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
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          Quote sent
        </span>
      );
    case "accepted":
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          Accepted
        </span>
      );
    case "draft":
    case "not_submitted":
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
  const { data: pendingData, isLoading, isError } = usePendingApprovalsQuery(queryParams);
  const approveMutation = useApproveQuotationMutation();
  const rejectMutation = useRejectQuotationMutation();
  const sendMutation = useSendQuotationMutation();

  const quotations: Quotation[] = useMemo(
    () => pendingData?.data?.quotations || [],
    [pendingData?.data?.quotations],
  );
  const pagination = pendingData?.data?.pagination;
  const totalItems = pagination?.total ?? quotations.length;

  const [approveQuote, setApproveQuote] = useState<Quotation | null>(null);
  const [approveNote, setApproveNote] = useState("");

  const [rejectQuote, setRejectQuote] = useState<Quotation | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setCurrentPage(1);
  };

  const handleApprove = async () => {
    if (!approveQuote) return;
    try {
      await approveMutation.mutateAsync({
        quotationId: approveQuote._id,
        note: approveNote,
      });
      toast.success(`Quotation ${approveQuote.quoteNumber} approved!`);
      setApproveQuote(null);
      setApproveNote("");
    } catch {
      toast.error("Failed to approve quotation.");
    }
  };

  const handleReject = async () => {
    if (!rejectQuote || !rejectionReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        quotationId: rejectQuote._id,
        reason: rejectionReason,
      });
      toast.success(`Quotation ${rejectQuote.quoteNumber} rejected.`);
      setRejectQuote(null);
      setRejectionReason("");
    } catch {
      toast.error("Failed to reject quotation.");
    }
  };

  const handleSend = async (q: Quotation) => {
    try {
      const res = await sendMutation.mutateAsync(q._id);
      const provider = res.data?.emailProvider
        ? ` via ${res.data.emailProvider}`
        : "";
      toast.success(`Quotation sent to customer successfully${provider}!`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg =
        errorObj?.response?.data?.message || "Failed to send quotation.";
      toast.error(msg);
    }
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
    quotations.length > 0 &&
    selectedIds.length === quotations.length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <TitleSubtitle
          title="All Quotations"
          subtitle="Manage your Quotations."
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
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
                    colSpan={8}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Loading quotations...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-6 py-8 text-center text-sm text-red-500"
                  >
                    Failed to load quotations.
                  </TableCell>
                </TableRow>
              ) : quotations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
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
                  const isApproved = effectiveStatus === "approved";
                  const price =
                    quotation.finalPrice || quotation.basePrice || 0;

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
                          onClick={() => navigate(`/leads/quotation-details/${quotation._id}`)}
                          className="hover:text-blue-600 hover:underline text-left cursor-pointer font-medium"
                        >
                          {quotation.quoteNumber}
                        </button>
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
                          {isApproved && (
                            <Button
                              size="sm"
                              className="bg-[#3b82f6] hover:bg-blue-600 text-white h-7 px-2.5 text-xs font-medium rounded flex items-center gap-1"
                              onClick={() => handleSend(quotation)}
                            >
                              <Send className="w-3 h-3" /> Send
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/leads/quotation-details/${quotation._id}`)}
                            className="text-purple-500 hover:text-purple-700 inline-block p-1 cursor-pointer"
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

      {/* Approve Modal */}
      <Dialog
        open={!!approveQuote}
        onOpenChange={(o) => !o && setApproveQuote(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Approve Quotation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Approve Quotation <strong>{approveQuote?.quoteNumber}</strong> (v
              {approveQuote?.versionNumber}) for customer dispatch?
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Approval Note (optional)
              </Label>
              <Input
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="e.g. Approved for customer send"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApproveQuote(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#16a34a] hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Confirm Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog
        open={!!rejectQuote}
        onOpenChange={(o) => !o && setRejectQuote(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Reject Quotation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Rejecting Quotation <strong>{rejectQuote?.quoteNumber}</strong> (v
              {rejectQuote?.versionNumber}).
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Reason for Rejection <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Update dimensions and resend"
                className="text-sm min-h-24 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectQuote(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#dc2626] hover:bg-red-700 text-white"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
