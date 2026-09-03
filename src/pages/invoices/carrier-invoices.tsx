import { useState, useMemo } from "react";
import type { DateRange as RDateRange } from "react-day-picker";
import {
  useGetCarrierInvoicesQuery,
  useExportCarrierInvoicesMutation,
} from "@/modules/invoices/invoices.hooks";
import { CarrierInvoiceHeader } from "./components/carrier-invoice-header";
import { CarrierInvoiceFilters } from "./components/carrier-invoice-filters";
import { CarrierInvoiceTable } from "./components/carrier-invoice-table";

function formatDateISO(date?: Date) {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
}

export default function CarrierInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  // const [carrierFilter, setCarrierFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Query params
  const queryParams = useMemo(() => {
    return {
      status: statusFilter !== "All" ? statusFilter : undefined,
      projectId: projectFilter !== "All" ? projectFilter : undefined,
      // carrier: carrierFilter !== "All" ? carrierFilter : undefined,
      startDate: formatDateISO(dateRange?.from),
      endDate: formatDateISO(dateRange?.to),
      search: searchQuery || undefined,
      page: currentPage,
      limit: rowsPerPage,
    };
  }, [statusFilter, projectFilter, dateRange, searchQuery, currentPage, rowsPerPage]);

  const { data: apiResponse, isLoading } = useGetCarrierInvoicesQuery(queryParams);
  const exportMutation = useExportCarrierInvoicesMutation();

  const invoices = useMemo(() => apiResponse?.data?.invoices ?? [], [apiResponse]);
  const totalItems = apiResponse?.data?.total ?? invoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(queryParams);
      const url = window.URL.createObjectURL(new Blob([blob as BlobPart]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `carrier-invoices-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Fallback CSV generation if endpoint returns error
      const csv = [
        ["Carrier", "Invoice Number", "Total Amount", "Status", "Due Date"],
        ...invoices.map((inv) => [
          inv.carrierId?.carrierName || inv.payeeName || "",
          inv.invoiceNumber,
          inv.totalAmount,
          inv.status,
          inv.dueDate || "",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carrier-invoices-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls";
    input.click();
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <CarrierInvoiceHeader
          onExport={handleExport}
          onUpload={handleUpload}
          isExporting={exportMutation.isPending}
        />

        <CarrierInvoiceFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          // carrierFilter={carrierFilter}
          // setCarrierFilter={setCarrierFilter}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
        />

        <CarrierInvoiceTable
          invoices={invoices}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </div>
    </div>
  );
}

