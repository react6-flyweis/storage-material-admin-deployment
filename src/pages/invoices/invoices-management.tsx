import { useState, useMemo } from "react";
import {
  Download,
  TrendingUp,
  Upload,
  CircleDollarSign,
  ShoppingBag,
  Wallet,
  Headset,
  Eye,
  Check,
  type LucideIcon,
  SearchIcon,
  ChevronRight,
  MoreHorizontal,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  color: string;
  iconClass: string;
  icon: LucideIcon;
}

function StatCard({
  title,
  value,
  trend,
  color,
  iconClass,
  icon,
}: StatCardProps) {
  const Icon = icon; // Assign the icon component to a variable for rendering
  return (
    <div className="relative overflow-hidden border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
      {/* Boomerang corner accent uses the same color as the icon chip */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-16 w-16"
        aria-hidden="true"
      >
        <div
          className={cn(
            "absolute bottom-0 left-0 size-13 [clip-path:polygon(0_14%,0_100%,100%_100%,44%_64%,16%_22%)]",
            color,
          )}
        />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${iconClass} p-3 rounded-full`}>
          <Icon className="" />
        </div>
      </div>

      <div className="flex items-center gap-1 text-teal-600 text-sm">
        <TrendingUp className="w-4 h-4" />
        <span className="font-semibold">{trend.toFixed(2)}%</span>
        <span className="text-gray-600">from last month</span>
      </div>
    </div>
  );
}

type VendorInvoice = {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  project: string;
  officeComplex: string;
  amount: number;
  dueDate: string; // ISO
  status: "Under Review" | "Approved" | "Paid";
};

const initialInvoices: VendorInvoice[] = [
  {
    id: "1",
    invoiceNumber: "INV00025",
    vendorName: "Steel Shippers Ltd",
    project: "ABC Warehouse",
    officeComplex: "DEL00025",
    amount: 930000,
    dueDate: "2025-01-22",
    status: "Under Review",
  },
  {
    id: "2",
    invoiceNumber: "INV00024",
    vendorName: "Concrete Solutions",
    project: "Industrial Park",
    officeComplex: "DEL00024",
    amount: 839750,
    dueDate: "2025-01-07",
    status: "Approved",
  },
  {
    id: "3",
    invoiceNumber: "INV00023",
    vendorName: "Electrical Systems",
    project: "Office Complex",
    officeComplex: "DEL00023",
    amount: 580125,
    dueDate: "2025-01-30",
    status: "Paid",
  },
  {
    id: "4",
    invoiceNumber: "INV00022",
    vendorName: "Steel Shippers Ltd",
    project: "ABC Warehouse",
    officeComplex: "DEL00022",
    amount: 878900,
    dueDate: "2025-01-17",
    status: "Under Review",
  },
  {
    id: "5",
    invoiceNumber: "INV00021",
    vendorName: "Concrete Solutions",
    project: "Industrial Park",
    officeComplex: "DEL00021",
    amount: 898989,
    dueDate: "2025-01-04",
    status: "Approved",
  },
  {
    id: "6",
    invoiceNumber: "INV00020",
    vendorName: "Electrical Systems",
    project: "Office Complex",
    officeComplex: "DEL00020",
    amount: 5120000,
    dueDate: "2025-01-09",
    status: "Paid",
  },
  {
    id: "7",
    invoiceNumber: "INV00019",
    vendorName: "Steel Shippers Ltd",
    project: "ABC Warehouse",
    officeComplex: "DEL00019",
    amount: 3250000,
    dueDate: "2025-01-07",
    status: "Under Review",
  },
  {
    id: "8",
    invoiceNumber: "INV00018",
    vendorName: "Concrete Solutions",
    project: "Industrial Park",
    officeComplex: "DEL00018",
    amount: 5100750,
    dueDate: "2025-01-15",
    status: "Approved",
  },
  {
    id: "9",
    invoiceNumber: "INV00017",
    vendorName: "Electrical Systems",
    project: "Office Complex",
    officeComplex: "DEL00017",
    amount: 5750300,
    dueDate: "2025-01-30",
    status: "Paid",
  },
  {
    id: "10",
    invoiceNumber: "INV00016",
    vendorName: "Steel Shippers Ltd",
    project: "ABC Warehouse",
    officeComplex: "DEL00016",
    amount: 5893899,
    dueDate: "2025-01-12",
    status: "Under Review",
  },
];

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

function getStatusColor(status: "Under Review" | "Approved" | "Paid"): string {
  switch (status) {
    case "Under Review":
      return "bg-yellow-100 text-yellow-800";
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Paid":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function InvoicesManagementPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Get unique projects from invoices
  const projects = useMemo(() => {
    const uniqueProjects = new Set(invoices.map((inv) => inv.project));
    return ["All", ...Array.from(uniqueProjects).sort()];
  }, [invoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search filter
      if (
        searchQuery &&
        !`${inv.invoiceNumber} ${inv.vendorName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== "All" && inv.status !== statusFilter) {
        return false;
      }

      // Project filter
      if (projectFilter !== "All" && inv.project !== projectFilter) {
        return false;
      }

      // Date range filter
      if (dateRange) {
        const dueDate = new Date(inv.dueDate);
        if (dateRange.from && dateRange.to) {
          if (dueDate < dateRange.from || dueDate > dateRange.to) {
            return false;
          }
        } else if (dateRange.from) {
          if (dueDate < dateRange.from) {
            return false;
          }
        } else if (dateRange.to) {
          if (dueDate > dateRange.to) {
            return false;
          }
        }
      }

      return true;
    });
  }, [invoices, searchQuery, statusFilter, projectFilter, dateRange]);

  // Card values are intentionally fixed to match the design spec.
  const stats = {
    totalIncome: 250000,
    productSales: 100000,
    serviceRevenue: 400000,
    otherIncome: 300000,
    trends: {
      totalIncome: 5.62,
      productSales: 11.4,
      serviceRevenue: 8.12,
      otherIncome: 7.45,
    },
  };

  // Pagination
  const totalItems = filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const startIndex = (currentPageClamped - 1) * rowsPerPage;
  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  // Selection state for checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = paginatedInvoices.map((i) => i.id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      // deselect all on page
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedIds((prev) =>
        Array.from(new Set([...prev, ...currentPageIds])),
      );
    }
  };

  const handleView = (invoice: VendorInvoice) => {
    // stub: view details
    // replace with modal/open route later
    // eslint-disable-next-line no-console
    console.log("View invoice", invoice);
  };

  const handleDownloadInvoice = (invoice: VendorInvoice) => {
    const csv = [
      [
        "Invoice Number",
        "Vendor Name",
        "Project",
        "Office Complex",
        "Amount",
        "Due Date",
        "Status",
      ],
      [
        invoice.invoiceNumber,
        invoice.vendorName,
        invoice.project,
        invoice.officeComplex,
        invoice.amount.toString(),
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

  const handleApprove = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Approved" } : inv)),
    );
  };

  const handleMarkPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Paid" } : inv)),
    );
  };

  const handleExport = () => {
    // Export logic
    const csv = [
      [
        "Invoice Number",
        "Vendor Name",
        "Project",
        "Office Complex",
        "Amount",
        "Due Date",
        "Status",
      ],
      ...filteredInvoices.map((inv) => [
        inv.invoiceNumber,
        inv.vendorName,
        inv.project,
        inv.officeComplex,
        inv.amount,
        inv.dueDate,
        inv.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendor-invoices-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleUpload = () => {
    // Upload logic
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
              Invoice Management
            </h1>
            <p className="text-gray-600 mt-1">
              Upload, approve, and track invoice payments
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={formatCurrency(stats.totalIncome)}
            color="bg-purple-500"
            iconClass="text-purple-500 border border-purple-500 bg-purple-100"
            trend={stats.trends.totalIncome}
            icon={CircleDollarSign}
          />
          <StatCard
            title="Product Sales"
            value={formatCurrency(stats.productSales)}
            color="bg-green-500"
            iconClass="text-green-500 border border-green-500 bg-green-100"
            trend={stats.trends.productSales}
            icon={ShoppingBag}
          />
          <StatCard
            title="Service Revenue"
            value={formatCurrency(stats.serviceRevenue)}
            color="bg-yellow-500"
            iconClass="text-yellow-500 border border-yellow-500  bg-yellow-100"
            trend={stats.trends.serviceRevenue}
            icon={Wallet}
          />
          <StatCard
            title="Other Income"
            value={formatCurrency(stats.otherIncome)}
            color="bg-red-500"
            iconClass="text-red-500 border border-red-500 bg-red-100"
            trend={stats.trends.otherIncome}
            icon={Headset}
          />
        </div>

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
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range Picker */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Date
              </label>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Invoices Section */}
        <Card className="">
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
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </InputGroup>
          </CardHeader>
          <CardContent className="">
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
                          checked={
                            paginatedInvoices.length > 0 &&
                            paginatedInvoices.every((i) =>
                              selectedIds.includes(i.id),
                            )
                          }
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
                        Office Complex
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
                    {paginatedInvoices.length > 0 ? (
                      paginatedInvoices.map((invoice) => (
                        <TableRow
                          key={invoice.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <TableCell className="w-8">
                            <input
                              type="checkbox"
                              aria-label={`select-${invoice.invoiceNumber}`}
                              checked={selectedIds.includes(invoice.id)}
                              onChange={() => toggleSelect(invoice.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {invoice.vendorName}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {invoice.project}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {invoice.officeComplex}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {new Date(invoice.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              },
                            )}
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
                            {invoice.status === "Paid"
                              ? "Completed"
                              : "Pending"}
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

                            {invoice.status === "Approved" ? (
                              <Button
                                onClick={() => handleMarkPaid(invoice.id)}
                                className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CircleDollarSign className="w-4 h-4 mr-2" />
                                Mark Paid
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleApprove(invoice.id)}
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
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="flex items-center text-sm text-gray-500">
                Showing
                <Select defaultValue="10">
                  <SelectTrigger className="h-8 w-15 mx-2 bg-white">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                Results
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-gray-400 rounded-md border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 border-blue-600 text-blue-600 font-medium p-0 rounded-md"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 text-gray-600 border-none p-0 rounded-md hover:bg-gray-50"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 text-gray-600 border-none p-0 rounded-md hover:bg-gray-50"
                >
                  3
                </Button>
                <div className="px-2 text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
                <Button
                  variant="outline"
                  className="h-8 w-8 text-gray-600 border-none p-0 rounded-md hover:bg-gray-50"
                >
                  15
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-gray-600 rounded-md border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
