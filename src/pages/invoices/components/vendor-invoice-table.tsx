import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  Download,
  Check,
  CircleDollarSign,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
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
import { useMarkInvoicePaidMutation } from "@/modules/invoices/invoices.hooks";

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "under_review":
    case "under review":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
    case "sent":
      return "bg-green-100 text-green-800";
    case "paid":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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
  const markPaidMutation = useMarkInvoicePaidMutation();

  // Internal selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = invoices.map((i) => i._id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedIds((prev) =>
        Array.from(new Set([...prev, ...currentPageIds]))
      );
    }
  };

  const handleView = (invoice: VendorInvoiceItem) => {
    navigate(`/invoice/vendor-preview/${invoice._id}`, {
      state: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        date: invoice.date ? new Date(invoice.date).toLocaleDateString("en-US") : "",
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
      ],
      [
        invoice.invoiceNumber,
        invoice.vendorId?.vendorName || invoice.payeeName || "",
        invoice.leadId?.projectName || "",
        invoice.leadId?.jobId || "",
        invoice.totalAmount.toString(),
        invoice.dueDate,
        invoice.status,
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

  const handleApprove = (_id: string) => {
    // Mock or hook call for approval
  };

  const isAllSelected =
    invoices.length > 0 && invoices.every((i) => selectedIds.includes(i._id));

  return (
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
                  invoices.map((invoice) => (
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
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {invoice.vendorId?.vendorName || invoice.payeeName || "-"}
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
                          ? new Date(invoice.dueDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            invoice.status,
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {invoice.status === "paid" ? "Completed" : "Pending"}
                      </TableCell>
                      <TableCell className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="view"
                          onClick={() => handleView(invoice)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="download"
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {invoice.status === "approved" || invoice.status === "sent" ? (
                          <Button
                            onClick={() => handleMarkPaid(invoice._id)}
                            disabled={markPaidMutation.isPending}
                            className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CircleDollarSign className="w-4 h-4 mr-2" />
                            Mark Paid
                          </Button>
                        ) : invoice.status === "paid" ? (
                          <span className="text-xs text-gray-500 font-medium ml-2">Paid</span>
                        ) : (
                          <Button
                            onClick={() => handleApprove(invoice._id)}
                            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
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
  );
}
