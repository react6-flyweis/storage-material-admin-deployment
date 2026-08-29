import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  Download,
  MoreVertical,
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
import type { CarrierInvoiceItem } from "@/modules/invoices/invoices.api";

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

export type CarrierInvoiceTableProps = {
  invoices: CarrierInvoiceItem[];
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  totalItems: number;
  rowsPerPage: number;
  onRowsPerPageChange: (limit: number) => void;
};

export function CarrierInvoiceTable({
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
}: CarrierInvoiceTableProps) {
  const navigate = useNavigate();

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

  const handleView = (invoice: CarrierInvoiceItem) => {
    navigate(`/invoice/carrier-preview/${invoice._id}`, {
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

  const handleDownloadInvoice = (invoice: CarrierInvoiceItem) => {
    const csv = [
      [
        "Carrier",
        "Invoice Number",
        "Total Amount",
        "Status",
        "Due Date",
      ],
      [
        invoice.carrierId?.carrierName || invoice.payeeName || "",
        invoice.invoiceNumber,
        invoice.totalAmount.toString(),
        invoice.status,
        invoice.dueDate || "",
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

  const isAllSelected =
    invoices.length > 0 && invoices.every((i) => selectedIds.includes(i._id));

  return (
    <Card>
      <CardHeader>
        {/* Search */}
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
          {/* Table */}
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
                    Carrier
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Invoice #
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Project / Job ID
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Due Date
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
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      Loading carrier invoices...
                    </TableCell>
                  </TableRow>
                ) : invoices.length > 0 ? (
                  invoices.map((invoice) => {
                    const carrierName =
                      invoice.carrierId?.carrierName || invoice.payeeName || "-";
                    const projectLabel = invoice.leadId
                      ? `${invoice.leadId.jobId} ${
                          invoice.leadId.projectName
                            ? `(${invoice.leadId.projectName})`
                            : ""
                        }`
                      : "-";

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
                          {carrierName}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {projectLabel}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </TableCell>
                        <TableCell className="text-gray-700 capitalize">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.status.toLowerCase() === "paid"
                                ? "bg-blue-100 text-blue-800"
                                : invoice.status.toLowerCase() === "sent"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {invoice.dueDate
                            ? new Date(invoice.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                }
                              )
                            : "-"}
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
                          <button
                            type="button"
                            aria-label="more actions"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
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
        <div className="flex items-center justify-between px-4 py-3 border-t">
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
            Results of {totalItems}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="h-8 w-8 text-gray-600 rounded-md border-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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

