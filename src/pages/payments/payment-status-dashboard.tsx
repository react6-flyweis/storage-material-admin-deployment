import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  Receipt,
  Truck,
  Loader2,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  usePaymentStatusQuery,
  useExportPaymentStatusMutation,
} from "@/modules/payments/payments.hooks";
import type { PaymentStatusItem } from "@/modules/payments/payments.api";

type SummaryCard = {
  title: string;
  amount: string;
  subtitle: string;
  borderClass: string;
  accentClass: string;
  iconBgColor: string;
  icon: ReactNode;
};

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return dateStr;
  }
}

function getEntityName(item: PaymentStatusItem) {
  if (typeof item.customerId === "object" && item.customerId) {
    const name = `${item.customerId.firstName || ""} ${item.customerId.lastName || ""}`.trim();
    if (name) return name;
  }
  if (typeof item.leadId === "object" && item.leadId?.projectName) {
    return item.leadId.projectName;
  }
  return item.invoiceNumber || item.poNumber || "N/A";
}

function getProjectName(item: PaymentStatusItem) {
  if (typeof item.leadId === "object" && item.leadId?.projectName) {
    return item.leadId.projectName;
  }
  if (typeof item.leadId === "string") {
    return item.leadId;
  }
  return "-";
}

export default function PaymentStatusDashboardPage() {
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const apiPaymentMethod = useMemo(() => {
    if (methodFilter === "All") return undefined;
    return methodFilter.toLowerCase().replace(" ", "_");
  }, [methodFilter]);

  const apiStatus = useMemo(() => {
    if (statusFilter === "All") return undefined;
    if (statusFilter === "Due Soon") return "sent";
    return statusFilter.toLowerCase();
  }, [statusFilter]);

  const { data: responseData, isLoading } = usePaymentStatusQuery({
    paymentMethod: apiPaymentMethod,
    status: apiStatus,
    search: query || undefined,
    page,
    limit,
  });

  const exportMutation = useExportPaymentStatusMutation();

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        paymentMethod: apiPaymentMethod,
        status: apiStatus,
        search: query || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payment-status-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const data = responseData?.data;
  const stats = data?.stats;

  const summaryCards: SummaryCard[] = useMemo(
    () => [
      {
        title: "Total Outstanding",
        amount: formatCurrency(stats?.totalOutstanding ?? 0),
        subtitle: `${stats?.dueSoonCount ?? 0} due soon, ${stats?.overdueCount ?? 0} overdue`,
        borderClass: "border-amber-400",
        accentClass: "text-amber-600",
        iconBgColor: "bg-amber-100",
        icon: <Clock3 className="h-5 w-5 text-amber-500" />,
      },
      {
        title: "Total Paid",
        amount: formatCurrency(stats?.totalPaid ?? 0),
        subtitle: "This period",
        borderClass: "border-emerald-500",
        accentClass: "text-emerald-600",
        iconBgColor: "bg-emerald-100",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      },
      {
        title: "Vendor Payments",
        amount: formatCurrency(stats?.vendorPayments ?? 0),
        subtitle: `${stats?.vendorCount ?? 0} vendors`,
        borderClass: "border-blue-500",
        accentClass: "text-slate-500",
        iconBgColor: "bg-blue-100",
        icon: <Building2 className="h-5 w-5 text-blue-500" />,
      },
      {
        title: "Carrier Payments",
        amount: formatCurrency(stats?.carrierPayments ?? 0),
        subtitle: `${stats?.carrierCount ?? 0} carriers`,
        borderClass: "border-orange-500",
        accentClass: "text-slate-500",
        iconBgColor: "bg-orange-100",
        icon: <Truck className="h-5 w-5 text-orange-500" />,
      },
    ],
    [stats]
  );

  const overdueList = data?.overduePayments || [];
  const dueSoonList = data?.dueSoon || [];
  const paymentHistoryList = data?.paymentHistory || [];

  return (
    <div className="min-h-full bg-[#e7ecfb] p-4 lg:p-5">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Payment Status Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track vendor and carrier payment history, due dates, and status
            </p>
          </div>

          <Button
            variant="outline"
            className="h-9 w-fit bg-white px-3 text-sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-xl border border-l-4 ${card.borderClass} bg-white px-5 py-4`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-semibold leading-none text-slate-900">
                    {card.amount}
                  </p>
                  <p className={`mt-2 text-xs font-medium ${card.accentClass}`}>
                    {card.subtitle}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    card.accentClass,
                    card.iconBgColor
                  )}
                >
                  {card.icon}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle>Overdue Payments</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueList.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No overdue payments</p>
              ) : (
                overdueList.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-red-500" />
                        <h3 className="font-semibold text-slate-900">
                          {getEntityName(item)}
                        </h3>
                      </div>
                      <p className="text-base font-semibold text-red-600">
                        {formatCurrency(item.totalAmount ?? 0)}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-slate-500">{item.invoiceNumber || item.poNumber || item._id}</p>
                      <p className="text-xs font-medium text-red-600">
                        Due: {formatDate(item.dueDate)}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-amber-500" />
                <CardTitle>Due Soon (Next 30 Days)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dueSoonList.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No payments due soon</p>
              ) : (
                dueSoonList.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-amber-500" />
                        <h3 className="font-semibold text-slate-900">
                          {getEntityName(item)}
                        </h3>
                      </div>
                      <p className="text-base font-semibold text-amber-700">
                        {formatCurrency(item.totalAmount ?? 0)}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-slate-500">{item.invoiceNumber || item.poNumber || item._id}</p>
                      <p className="text-xs font-medium text-amber-600">
                        Due: {formatDate(item.dueDate)}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters + Table */}
        <div>
          <Card>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex-1 flex items-center gap-3">
                  <Input
                    placeholder="Search by entity name or invoice number..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full max-w-lg bg-white"
                  />

                  <Select
                    value={methodFilter}
                    onValueChange={(val) => {
                      setMethodFilter(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-44 mt-0">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Methods</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="ACH">ACH</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={statusFilter}
                    onValueChange={(val) => {
                      setStatusFilter(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-36 mt-0">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Due Soon">Due Soon</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="h-9"
                    onClick={handleExport}
                    disabled={exportMutation.isPending}
                  >
                    {exportMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 pb-0 gap-0">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-medium">
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="bg-white">
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                        Entity
                      </TableHead>
                      <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                        Invoice #
                      </TableHead>
                      <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                        Amount
                      </TableHead>
                      <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                        Due Date
                      </TableHead>
                      <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                        Payment Date
                      </TableHead>
                      <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                        Status
                      </TableHead>
                      <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                        Project
                      </TableHead>
                      <TableHead className="text-left px-6 py-3 text-sm text-gray-600">
                        Method
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                        </TableCell>
                      </TableRow>
                    ) : paymentHistoryList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                          No payment records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentHistoryList.map((row) => {
                        const statusLower = (row.status || "").toLowerCase();
                        return (
                          <TableRow key={row._id}>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-900">
                                    {getEntityName(row)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-orange-500 font-medium">
                              {row.invoiceNumber || row.poNumber || "-"}
                            </TableCell>
                            <TableCell className="px-6 py-4 font-semibold">
                              {formatCurrency(row.totalAmount ?? 0)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              {formatDate(row.dueDate)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              {formatDate(row.paidAt)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              {statusLower === "paid" ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                  Paid
                                </span>
                              ) : statusLower === "scheduled" ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                  Scheduled
                                </span>
                              ) : statusLower === "overdue" ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                  Overdue
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                  {row.status || "Due Soon"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              {getProjectName(row)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              {row.paymentMethod
                                ? row.paymentMethod.replace("_", " ").toUpperCase()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.total > limit && (
                <div className="flex items-center justify-between border-t px-6 py-3 bg-white">
                  <span className="text-sm text-slate-500">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, data.total)} of {data.total} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => (p * limit < data.total ? p + 1 : p))
                      }
                      disabled={page * limit >= data.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
