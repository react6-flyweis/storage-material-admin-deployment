import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Eye,
  Download,
  Check,
  CircleDollarSign,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
import type { VendorInvoiceItem } from "@/modules/invoices/invoices.api";
import {
  useMarkInvoicePaidMutation,
  useApprovePayableInvoiceMutation,
  useRejectPayableInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";
import { PayableStatusBadge } from "./payable-status-badge";
import { RejectPayableDialog } from "./reject-payable-dialog";
import { toast } from "sonner";

function formatCurrency(n?: number | null) {
  if (n === undefined || n === null || isNaN(Number(n))) return "$0";
  return `$${Number(n).toLocaleString()}`;
}

export type VendorInvoiceTableProps = {
  invoices: VendorInvoiceItem[];
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  totalItems: number;
  rowsPerPage: number;
  onRowsPerPageChange: (limit: number) => void;
  onRefetch?: () => void;
};

export function VendorInvoiceTable({
  invoices,
  isLoading,
  searchQuery,
  onSearchChange,
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
  rowsPerPage,
  onRowsPerPageChange,
  onRefetch,
}: VendorInvoiceTableProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const markPaidMutation = useMarkInvoicePaidMutation();
  const approveMutation = useApprovePayableInvoiceMutation();
  const rejectMutation = useRejectPayableInvoiceMutation();

  const [rejectTarget, setRejectTarget] = useState<{
    invoiceId: string;
    invoiceNumber: string;
  } | null>(null);

  // Internal selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = invoices.map((i) => i._id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedIds((prev) =>
        Array.from(new Set([...prev, ...currentPageIds])),
      );
    }
  };

  const handleView = (invoice: VendorInvoiceItem) => {
    navigate(`/invoice/vendor-preview/${invoice._id}`, {
      state: {
        from: location.pathname + location.search,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        payableStatus: invoice.payableStatus,
        date: invoice.date
          ? new Date(invoice.date).toLocaleDateString("en-US")
          : "",
        daysToPay: invoice.daysToPay,
        total: invoice.totalAmount,
      },
    });
  };

  const handleDownloadInvoice = (invoice: VendorInvoiceItem) => {
    const csv = [
      [
        "Invoice Number",
        "Vendor Name",
        "Project",
        "Job ID",
        "Amount",
        "Due Date",
        "Status",
        "Payable Status",
      ],
      [
        invoice.invoiceNumber,
        invoice.vendorId?.vendorName || invoice.payeeName || "",
        invoice.leadId?.projectName || "",
        invoice.leadId?.jobId || "",
        invoice.totalAmount.toString(),
        invoice.dueDate,
        invoice.status,
        invoice.payableStatus || "",
      ],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoiceNumber}.csv`;
    a.click();
  };

  const handleMarkPaid = (id: string) => {
    markPaidMutation.mutate(id, {
      onSuccess: () => {
        onRefetch?.();
      },
    });
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Payable invoice approved successfully.");
      onRefetch?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve invoice.");
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await rejectMutation.mutateAsync({
        invoiceId: rejectTarget.invoiceId,
        payload: { reason },
      });
      toast.success("Payable invoice rejected.");
      setRejectTarget(null);
      onRefetch?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject invoice.");
    }
  };

  const isAllSelected =
    invoices.length > 0 && invoices.every((i) => selectedIds.includes(i._id));

  return (
    <>
      <Card>
        <CardHeader>
          <InputGroup className="max-w-2xs rounded">
            <InputGroupAddon>
              <SearchIcon className="w-4 h-4 text-gray-500" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(1);
              }}
            />
          </InputGroup>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="w-8">
                      <input
                        type="checkbox"
                        aria-label="select all"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Invoice Number
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Vendor Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Project
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Job ID
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-900">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Due Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Payment
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-gray-500"
                      >
                        Loading vendor invoices...
                      </TableCell>
                    </TableRow>
                  ) : invoices.length > 0 ? (
                    invoices.map((invoice) => {
                      const docUrl =
                        invoice.documentUrl ||
                        invoice.payableWorkflow?.documentUrl;
                      const isPendingApproval =
                        invoice.payableStatus === "pending_admin_approval";

                      return (
                        <TableRow
                          key={invoice._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <TableCell className="w-8">
                            <input
                              type="checkbox"
                              aria-label={`select-${invoice.invoiceNumber}`}
                              checked={selectedIds.includes(invoice._id)}
                              onChange={() => toggleSelect(invoice._id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            <div className="flex items-center gap-1.5">
                              <span>{invoice.invoiceNumber}</span>
                              {docUrl && (
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View Invoice PDF"
                                  className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {invoice.vendorId?.vendorName ||
                              invoice.payeeName ||
                              "-"}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {invoice.leadId?.projectName || "-"}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {invoice.leadId?.jobId || "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900">
                            {formatCurrency(invoice.totalAmount)}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {invoice.dueDate
                              ? new Date(invoice.dueDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  },
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <PayableStatusBadge
                              status={invoice.payableStatus || invoice.status}
                              paymentLabel={invoice.paymentLabel}
                            />
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {invoice.status === "paid" ||
                            invoice.payableStatus === "paid"
                              ? "Completed"
                              : "Pending"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="view"
                                onClick={() => handleView(invoice)}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                aria-label="download"
                                onClick={() => handleDownloadInvoice(invoice)}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                                title="Download CSV"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {isPendingApproval ? (
                                <div className="flex items-center gap-1.5 ml-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(invoice._id)}
                                    disabled={approveMutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-xs flex items-center gap-1"
                                    title="Approve Invoice"
                                  >
                                    {approveMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setRejectTarget({
                                        invoiceId: invoice._id,
                                        invoiceNumber: invoice.invoiceNumber,
                                      })
                                    }
                                    disabled={rejectMutation.isPending}
                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 h-7 px-2.5 text-xs flex items-center gap-1"
                                    title="Reject Invoice"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Reject
                                  </Button>
                                </div>
                              ) : invoice.status === "approved" ||
                                invoice.status === "sent" ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkPaid(invoice._id)}
                                  disabled={markPaidMutation.isPending}
                                  className="ml-1 bg-green-600 hover:bg-green-700 text-white h-7 px-2.5 text-xs flex items-center gap-1"
                                >
                                  <CircleDollarSign className="w-3 h-3 mr-1" />
                                  Mark Paid
                                </Button>
                              ) : invoice.status === "paid" ||
                                invoice.payableStatus === "paid" ? (
                                <span className="text-xs text-emerald-600 font-medium ml-1">
                                  Paid
                                </span>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-gray-500"
                      >
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t mt-4">
            <div className="flex items-center text-sm text-gray-500">
              Showing
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(val) => {
                  onRowsPerPageChange(Number(val));
                  onPageChange(1);
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
              Results (Total: {totalItems})
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="h-8 w-8 text-gray-600 rounded-md border-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="h-8 w-8 text-gray-600 rounded-md border-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RejectPayableDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        invoiceNumber={rejectTarget?.invoiceNumber}
        onConfirm={handleConfirmReject}
        isLoading={rejectMutation.isPending}
      />
    </>
  );
}
