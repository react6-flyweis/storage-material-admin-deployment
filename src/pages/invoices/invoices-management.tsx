import { useState, useMemo } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DateRange as RDateRange } from "react-day-picker";
import {
  useGetVendorInvoicesQuery,
  useExportVendorInvoicesMutation,
} from "@/modules/invoices/invoices.hooks";

import { InvoiceStatCards } from "./components/invoice-stat-cards";
import { VendorInvoiceFilters } from "./components/vendor-invoice-filters";
import { VendorInvoiceTable } from "./components/vendor-invoice-table";

function formatDateISO(date?: Date) {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
}

export default function InvoicesManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Build API query parameters
  const queryParams = useMemo(() => {
    return {
      status: statusFilter !== "All" ? statusFilter : undefined,
      projectId: projectFilter !== "All" ? projectFilter : undefined,
      startDate: formatDateISO(dateRange?.from),
      endDate: formatDateISO(dateRange?.to),
      search: searchQuery || undefined,
      page: currentPage,
      limit: rowsPerPage,
    };
  }, [statusFilter, projectFilter, dateRange, searchQuery, currentPage, rowsPerPage]);

  const { data: apiResponse, isLoading, refetch } = useGetVendorInvoicesQuery(queryParams);
  const exportMutation = useExportVendorInvoicesMutation();

  const invoices = apiResponse?.data?.invoices ?? [];
  const stats = apiResponse?.data?.stats;
  const totalItems = apiResponse?.data?.total ?? invoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const handleExport = async () => {
    const exportParams = {
      status: statusFilter !== "All" ? statusFilter : "All",
      projectId: projectFilter !== "All" ? projectFilter : undefined,
      startDate: formatDateISO(dateRange?.from),
      endDate: formatDateISO(dateRange?.to),
    };
    const blob = await exportMutation.mutateAsync(exportParams);
    const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendor-invoices-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vendor Invoices
            </h1>
            <p className="text-gray-600 mt-1">
              Upload, approve, and track invoice payments
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4" />
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        </div>

        {/* Statistics Cards */}
        <InvoiceStatCards stats={stats} />

        {/* Header with Title and Upload Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Vendor Invoices</h2>
          <Button
            onClick={handleUpload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="w-4 h-4" />
            Upload Invoice
          </Button>
        </div>

        {/* Filters */}
        <VendorInvoiceFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
        />

        {/* Vendor Invoices Section */}
        <VendorInvoiceTable
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
          onRefetch={refetch}
        />
      </div>
    </div>
  );
}


