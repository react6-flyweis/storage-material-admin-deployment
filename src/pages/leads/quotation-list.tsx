import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Eye,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
} from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import StatCard from "@/components/ui/stat-card";
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
import {
  usePendingApprovalsQuery,
  useApproveQuotationMutation,
  useRejectQuotationMutation,
  useSendQuotationMutation,
} from "@/modules/quotations/quotations.hooks";
import type { Quotation } from "@/modules/quotations/quotations.api";
import { toast } from "sonner";

function getStatusBadge(quotation: Quotation) {
  const status = quotation.workflowStatus || quotation.approval?.status || quotation.status || "draft";

  switch (status) {
    case "approved":
      return (
        <span className="px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-green-100 text-green-700">
          Approved
        </span>
      );
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
  const [selectedFilters, setSelectedFilters] = useState({
    buildingType: "all",
    projectValue: "all",
    status: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // API Hooks
  const { data: pendingData, isLoading, isError } = usePendingApprovalsQuery();
  const approveMutation = useApproveQuotationMutation();
  const rejectMutation = useRejectQuotationMutation();
  const sendMutation = useSendQuotationMutation();

  const quotations: Quotation[] = pendingData?.data?.quotations || [];

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
      await approveMutation.mutateAsync({ quotationId: approveQuote._id, note: approveNote });
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
      await rejectMutation.mutateAsync({ quotationId: rejectQuote._id, reason: rejectionReason });
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
      const provider = res.data?.emailProvider ? ` via ${res.data.emailProvider}` : "";
      toast.success(`Quotation sent to customer successfully${provider}!`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || "Failed to send quotation.";
      toast.error(msg);
    }
  };

  // Filter logic
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (selectedFilters.buildingType !== "all" && q.buildingType !== selectedFilters.buildingType) {
        return false;
      }
      const effectiveStatus = q.workflowStatus || q.approval?.status || q.status;
      if (selectedFilters.status !== "all" && effectiveStatus !== selectedFilters.status) {
        return false;
      }
      return true;
    });
  }, [quotations, selectedFilters]);

  // Stats computation
  const totalQuotations = quotations.length;
  const approvedCount = quotations.filter(
    (q) => (q.workflowStatus || q.approval?.status) === "approved"
  ).length;
  const pendingCount = quotations.filter(
    (q) => (q.workflowStatus || q.approval?.status) === "pending_approval"
  ).length;
  const rejectedCount = quotations.filter(
    (q) => (q.workflowStatus || q.approval?.status) === "rejected"
  ).length;

  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredQuotations.slice(start, start + rowsPerPage);
  }, [filteredQuotations, currentPage, rowsPerPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedQuotations.map((q) => q._id));
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

  const allSelected = paginatedQuotations.length > 0 && selectedIds.length === paginatedQuotations.length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <TitleSubtitle
          title="Quotation/New Inquiry List"
          subtitle="Manage your assigned leads and track their progress."
        />
      </div>

      {/* Stats Cards using the standard StatCard component */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Quotation"
          value={totalQuotations}
          color="bg-blue-600"
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Approved Quotation"
          value={approvedCount}
          color="bg-green-500"
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          color="bg-yellow-400"
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
        />
        <StatCard
          title="Rejected Quotation"
          value={rejectedCount}
          color="bg-orange-400"
          icon={<XCircle className="h-5 w-5 text-orange-600" />}
        />
      </div>

      {/* Action Buttons and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* <div className="flex gap-3 flex-wrap">
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            size="sm"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div> */}

        <div className="flex gap-3 flex-wrap ml-auto">
          {/* <Select
            value={selectedFilters.buildingType}
            onValueChange={(v) => handleFilterChange("buildingType", v)}
          >
            <SelectTrigger className="w-44 bg-white text-xs">
              <SelectValue placeholder="Building Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Building Types</SelectItem>
              <SelectItem value="warehouses">Warehouse</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="workshops">Workshops</SelectItem>
              <SelectItem value="agricultural">Agricultural</SelectItem>
            </SelectContent>
          </Select> */}

          <Select
            value={selectedFilters.status}
            onValueChange={(v) => handleFilterChange("status", v)}
          >
            <SelectTrigger className="w-44 bg-white text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="sent">Quote sent</SelectItem>
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
                <TableHead className="text-gray-600 text-xs font-semibold text-center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading quotations...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-8 text-center text-sm text-red-500">
                    Failed to load quotations.
                  </TableCell>
                </TableRow>
              ) : paginatedQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No quotations found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedQuotations.map((quotation) => {
                  const effectiveStatus = quotation.workflowStatus || quotation.approval?.status || quotation.status;
                  const isPending = effectiveStatus === "pending_approval";
                  const isApproved = effectiveStatus === "approved";
                  const price = quotation.finalPrice || quotation.basePrice || 0;

                  return (
                    <TableRow key={quotation._id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.includes(quotation._id)}
                          onChange={(e) => handleSelectOne(quotation._id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {quotation.quoteNumber}
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
                      <TableCell className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
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
                          <Link
                            to={`/leads/quotation-details/${quotation._id}`}
                            className="text-purple-500 hover:text-purple-700 inline-block p-1"
                            title="View Quotation"
                          >
                            <Eye className="size-4" />
                          </Link>
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
          totalItems={filteredQuotations.length}
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
      <Dialog open={!!approveQuote} onOpenChange={(o) => !o && setApproveQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Approve Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Approve Quotation <strong>{approveQuote?.quoteNumber}</strong> (v{approveQuote?.versionNumber}) for customer dispatch?
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Approval Note (optional)</Label>
              <Input
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="e.g. Approved for customer send"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setApproveQuote(null)}>
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
      <Dialog open={!!rejectQuote} onOpenChange={(o) => !o && setRejectQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Reject Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Rejecting Quotation <strong>{rejectQuote?.quoteNumber}</strong> (v{rejectQuote?.versionNumber}).
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
            <Button variant="outline" size="sm" onClick={() => setRejectQuote(null)}>
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
