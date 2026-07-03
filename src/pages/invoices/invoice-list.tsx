import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  DollarSign,
  CheckCircle,
  CreditCard,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangePicker from "@/components/ui/date-range-picker";
import type { DateRange as RDateRange } from "react-day-picker";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import { useGetInvoicesQuery, useGetInvoiceStatsQuery } from "@/modules/invoices/invoices.hooks";



function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

function cleanProjectName(name: string) {
  if (!name) return "";
  return name.replace(/\s+\d{4}-\d{2}-\d{2}T[\d-]+Z$/, "").trim();
}

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, statusFilter, dateRange]);

  const { data: responseData, isLoading } = useGetInvoicesQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedQuery || undefined,
    status: statusFilter === "All" ? undefined : statusFilter.toLowerCase(),
    startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
  });

  const invoices = responseData?.data?.invoices || [];
  const totalItems = responseData?.data?.total || 0;

  const { data: statsData } = useGetInvoiceStatsQuery();

  const totalAmount = statsData?.data?.totalAmount || 0;
  const totalPaid = statsData?.data?.totalPaid || 0;
  const totalUnpaid = statsData?.data?.totalUnpaid || 0;
  const overdue = statsData?.data?.overdue || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoice Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dashboard &gt; Invoice Report
          </p>
        </div>
        {/* action buttons moved into table header for compact layout */}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-md p-4 shadow flex items-center gap-4 border border-green-200">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-green-500 text-white">
            <DollarSign className="text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Amount</div>
            <div className="text-xl font-semibold">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4 shadow flex items-center gap-4 border border-blue-200">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-blue-600 text-white">
            <CheckCircle className="text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Paid</div>
            <div className="text-xl font-semibold">
              {formatCurrency(totalPaid)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4 shadow flex items-center gap-4 border border-orange-200">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-orange-500 text-white">
            <CreditCard className="text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Unpaid</div>
            <div className="text-xl font-semibold">
              {formatCurrency(totalUnpaid)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4 shadow flex items-center gap-4 border border-red-200">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-red-600 text-white">
            <AlertCircle className="text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Overdue</div>
            <div className="text-xl font-semibold">
              {formatCurrency(overdue)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full flex-1">
              <label className="text-xs text-gray-500">Search</label>
              <Input
                placeholder="Search name, email, project..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="w-full flex-1">
              <label className="text-xs text-gray-500">Choose Date</label>
              <div className="relative mt-1">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </div>

            <div className="flex-1">
              <label className="text-xs text-gray-500">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatusFilter("All");
                setDateRange(undefined);
              }}
              className="px-6 py-2"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="p-0">
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Invoice List</h3>
            <div className="bg-white rounded-md px-2 py-1 flex items-center gap-2 ">
              <button
                title="Export PDF"
                className="w-9 h-9 rounded bg-white flex items-center justify-center text-red-600 border"
              >
                <FileText className="size-4" />
              </button>
              <button
                title="Export Excel"
                className="w-9 h-9 rounded bg-white flex items-center justify-center text-green-600 border"
              >
                <Download className="size-4" />
              </button>
              <button
                title="Print"
                className="w-9 h-9 rounded bg-white flex items-center justify-center text-gray-600 border"
              >
                <Printer className="size-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto border-t bg-white">
            <Table className="bg-white">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Invoice Number
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Project
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Due Date
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Amount
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Paid
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Due
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => {
                    const isPaid = inv.status.toLowerCase() === "paid";
                    const paidAmount = isPaid ? inv.amount : 0;
                    return (
                      <TableRow key={inv.invoice?.id || inv.invoiceNumber}>
                        <TableCell className="text-left text-orange-500 font-medium px-6 py-4">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-left px-6 py-4">{cleanProjectName(inv.projectName)||'-'}</TableCell>
                        <TableCell className="text-left px-6 py-4">
                          {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-left px-6 py-4">{formatCurrency(inv.amount)}</TableCell>
                        <TableCell className="text-left px-6 py-4">{formatCurrency(paidAmount)}</TableCell>
                        <TableCell className="text-left px-6 py-4">
                          {formatCurrency(inv.amount - paidAmount)}
                        </TableCell>
                        <TableCell className="text-left px-6 py-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              {inv.status || "Unpaid"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-left px-6 py-4">
                          <button
                            onClick={() => navigate(`/invoice/preview`, { 
                              state: { 
                                invoiceId: inv.invoice?._id,
                                invoiceNumber: inv.invoiceNumber, 
                                date: inv.dueDate, 
                                total: inv.amount, 
                                subtotal: inv.amount, 
                                items: inv.invoice?.lineItems || [] 
                              } 
                            })}
                            className="text-black hover:text-gray-700"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
