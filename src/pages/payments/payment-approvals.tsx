import { useState } from "react";
import { format, isValid } from "date-fns";
import type { DateRange as RDateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DateRangeFilter from "@/components/ui/date-range-filter";
import StatCardV2 from "@/components/ui/stat-card-v2";
import PaymentApprovalDetail from "@/components/payment-approval-detail";
import {
  CircleCheckBig,
  CircleX,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  ReceiptText,
  Upload,
  Wallet,
} from "lucide-react";
import {
  usePaymentApprovalsFiltersQuery,
  usePaymentApprovalsQuery,
  usePaymentApprovalsStatsQuery,
  useExportPaymentApprovalsMutation,
} from "@/modules/payments/payments.hooks";
import type { PaymentApprovalItem } from "@/modules/payments/payments.api";

type ApprovalRow = {
  _id: string;
  approvalId?: string;
  paymentId: string;
  requestDate: string;
  payee: string;
  payerType: string;
  category: string;
  requestedBy: string;
  amount: string;
  rawAmount: number;
  status: string;
  invoiceNumber: string;
  dueDate: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
};

const categoryStyles: Record<string, string> = {
  vendor_payment: "bg-emerald-500",
  shipper_payment: "bg-blue-500",
  equipment: "bg-amber-500",
  other_expenses: "bg-violet-600",
  "Vendor Payment": "bg-emerald-500",
  "Shipper Payment": "bg-blue-500",
  "Other Expenses": "bg-violet-600",
  Equipment: "bg-amber-500",
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500",
  under_review: "bg-blue-500",
  approved: "bg-emerald-500",
  disputed: "bg-orange-500",
  rejected: "bg-rose-500",
  Pending: "bg-amber-500",
  Approved: "bg-emerald-500",
  Rejected: "bg-rose-500",
  "Under Review": "bg-blue-500",
  Disputed: "bg-orange-500",
};

const defaultCategories = [
  "vendor_payment",
  "shipper_payment",
  "equipment",
  "other_expenses",
];

const defaultStatuses = [
  "pending",
  "under_review",
  "approved",
  "disputed",
  "rejected",
];

const formatCategoryName = (cat: string) => {
  if (!cat) return "";
  return cat
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatStatusName = (st: string) => {
  if (!st) return "";
  return st
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val || 0);
};

export default function PaymentApprovalsPage() {
  const [dateRange, setDateRange] = useState<RDateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRequestedBy, setSelectedRequestedBy] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<ApprovalRow | null>(
    null,
  );

  // Filters API
  const { data: filtersRes } = usePaymentApprovalsFiltersQuery();
  const filtersData = filtersRes?.data;

  const categoriesList =
    filtersData?.categories && filtersData.categories.length > 0
      ? filtersData.categories
      : defaultCategories;

  const statusesList =
    filtersData?.statuses && filtersData.statuses.length > 0
      ? filtersData.statuses
      : defaultStatuses;

  // Date range formatted
  const startDateStr = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const endDateStr = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : undefined;

  // Approvals List API
  const queryParams = {
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    requestedBy:
      selectedRequestedBy !== "all" ? selectedRequestedBy : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    startDate: startDateStr,
    endDate: endDateStr,
    page,
    limit,
  };

  const {
    data: approvalsRes,
    isLoading,
    isFetching,
  } = usePaymentApprovalsQuery(queryParams);

  // Dedicated stats query for Account route
  const { data: statsRes } = usePaymentApprovalsStatsQuery({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    requestedBy:
      selectedRequestedBy !== "all" ? selectedRequestedBy : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    startDate: startDateStr,
    endDate: endDateStr,
  });

  const exportMutation = useExportPaymentApprovalsMutation();

  const approvalsList: PaymentApprovalItem[] =
    approvalsRes?.data?.approvals || [];
  const stats = approvalsRes?.data?.stats || statsRes?.data;
  const total = approvalsRes?.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const totalRequestsCount =
    stats?.totalRequests !== undefined
      ? stats.totalRequests
      : (stats?.pendingApproval ?? 0) +
        (stats?.approved ?? 0) +
        (stats?.rejected ?? 0) +
        (stats?.underReview ?? 0) || total;

  const approvalSummary = [
    {
      title: "Total Requests",
      value: String(totalRequestsCount),
      subtitle: "All payment requests",
      color: "purple" as const,
      icon: <Filter className="h-4 w-4" />,
    },
    {
      title: "Pending Approval",
      value:
        stats?.pendingApproval !== undefined
          ? String(stats.pendingApproval)
          : "0",
      subtitle: formatCurrency(stats?.pendingAmount || 0),
      color: "green" as const,
      icon: <Clock3 className="h-4 w-4" />,
    },
    {
      title: "Approved",
      value: stats?.approved !== undefined ? String(stats.approved) : "0",
      subtitle: formatCurrency(stats?.approvedAmount || 0),
      color: "yellow" as const,
      icon: <CircleCheckBig className="h-4 w-4" />,
    },
    {
      title: "Rejected",
      value: stats?.rejected !== undefined ? String(stats.rejected) : "0",
      subtitle: "Rejected requests",
      color: "red" as const,
      icon: <CircleX className="h-4 w-4" />,
    },
    {
      title: "Total Amount",
      value: formatCurrency(
        stats?.totalAmount !== undefined
          ? stats.totalAmount
          : approvalsList.reduce((acc, curr) => acc + (curr.amount || 0), 0),
      ),
      subtitle: "All requests",
      color: "purple" as const,
      icon: <Wallet className="h-4 w-4" />,
    },
  ];

  const handleReview = (item: PaymentApprovalItem) => {
    const rawId = item.approvalId || item._id || "";
    setSelectedApprovalId(rawId);

    const reqByName =
      typeof item.requestedBy === "object"
        ? item.requestedBy?.name
        : String(item.requestedBy || "N/A");

    const dateVal = item.createdAt || (item as unknown as { requestDate?: string }).requestDate;
    const formattedDate =
      dateVal && isValid(new Date(dateVal))
        ? format(new Date(dateVal), "MMM dd, yyyy\nhh:mm a")
        : "N/A";

    const formattedDueDate =
      item.dueDate && isValid(new Date(item.dueDate))
        ? format(new Date(item.dueDate), "MMM dd, yyyy")
        : "N/A";

    const payeeName = item.companyName || item.payee || "N/A";
    const statusVal = item.statusLabel || item.status || "Pending";

    setSelectedPayment({
      _id: rawId,
      approvalId: item.approvalId,
      paymentId: item.paymentId || rawId,
      requestDate: formattedDate,
      payee: payeeName,
      payerType: item.payeeType
        ? item.payeeType.charAt(0).toUpperCase() + item.payeeType.slice(1)
        : "Vendor",
      category: item.category || "vendor_payment",
      requestedBy: reqByName,
      amount: formatCurrency(item.amount),
      rawAmount: item.amount,
      status: statusVal,
      invoiceNumber: item.invoiceNumber || item.paymentId || rawId,
      dueDate: formattedDueDate,
      reviewedBy: item.reviewedBy,
      reviewedAt: item.reviewedAt,
    });
    setIsDetailOpen(true);
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        requestedBy:
          selectedRequestedBy !== "all" ? selectedRequestedBy : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        startDate: startDateStr,
        endDate: endDateStr,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Payment_Approvals_Export_${format(new Date(), "yyyyMMdd")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const renderStatusBadge = (status: string, statusLabel?: string) => {
    const label = statusLabel || formatStatusName(status);
    const style =
      statusStyles[status] ||
      statusStyles[status.toLowerCase()] ||
      statusStyles[label] ||
      "bg-slate-500";
    return (
      <Badge
        className={`${style} hover:${style} text-white rounded px-3 py-0.5 h-auto! text-sm font-normal`}
      >
        {label}
      </Badge>
    );
  };

  const renderCategoryBadge = (category: string) => {
    const style =
      categoryStyles[category] ||
      categoryStyles[category.toLowerCase()] ||
      "bg-slate-500";
    return (
      <Badge
        className={`${style} hover:${style} text-white rounded-md px-3 font-normal`}
      >
        {formatCategoryName(category)}
      </Badge>
    );
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payment Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve payment requests from plants and departments.
          </p>
        </div>

        <Button
          variant="outline"
          className="bg-white text-slate-700 border-slate-200"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </div>

      <Card className="p-4 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Request Date
            </label>
            <DateRangeFilter
              value={dateRange}
              onChange={(range) => {
                setDateRange(range);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Category
            </label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesList.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {formatCategoryName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Requested By
            </label>
            <Select
              value={selectedRequestedBy}
              onValueChange={(val) => {
                setSelectedRequestedBy(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {filtersData?.requestedBy?.map((user) => {
                  const id = user.userId || user._id || "";
                  return (
                    <SelectItem key={id} value={id}>
                      {user.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusesList.map((st) => (
                  <SelectItem key={st} value={st}>
                    {formatStatusName(st)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {approvalSummary.map((card) => (
          <StatCardV2
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Payment Requests
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ReceiptText className="h-4 w-4" />
            Requests awaiting review
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-100/80">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 h-11 whitespace-nowrap">
                  Payment ID
                </TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 whitespace-nowrap">
                  Request Date
                </TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 whitespace-nowrap">
                  Payee / Vendor
                </TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 whitespace-nowrap">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 whitespace-nowrap">
                  Requested By
                </TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 whitespace-nowrap">
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                    <span className="text-xs text-slate-400 mt-2 block">
                      Loading payment approvals...
                    </span>
                  </TableCell>
                </TableRow>
              ) : approvalsList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-slate-500"
                  >
                    No payment approval requests found.
                  </TableCell>
                </TableRow>
              ) : (
                approvalsList.map((item) => {
                  const rawId = item.approvalId || item._id || "";
                  const displayPaymentId = item.paymentId || rawId;
                  const payeeName = item.companyName || item.payee || "N/A";

                  const reqByName =
                    typeof item.requestedBy === "object"
                      ? item.requestedBy?.name
                      : String(item.requestedBy || "N/A");

                  const dateVal =
                    item.createdAt ||
                    (item as unknown as { requestDate?: string }).requestDate;
                  const formattedDate =
                    dateVal && isValid(new Date(dateVal))
                      ? format(new Date(dateVal), "MMM dd, yyyy\nhh:mm a")
                      : "N/A";

                  const payeeTypeStr =
                    typeof item.payeeType === "object"
                      ? (item.payeeType as any)?.label ||
                        (item.payeeType as any)?.code ||
                        "Vendor"
                      : item.payeeType || "Vendor";

                  const categoryVal =
                    typeof item.category === "object"
                      ? (item.category as any)?.label ||
                        (item.category as any)?.name ||
                        "vendor_payment"
                      : item.category || "vendor_payment";

                  const statusVal =
                    typeof item.status === "object"
                      ? (item.status as any)?.label ||
                        (item.status as any)?.code ||
                        "pending"
                      : item.status || "pending";

                  const statusLabelVal =
                    typeof item.statusLabel === "object"
                      ? (item.statusLabel as any)?.label ||
                        (item.statusLabel as any)?.name
                      : item.statusLabel;

                  return (
                    <TableRow
                      key={rawId}
                      className="border-b last:border-none"
                    >
                      <TableCell className="py-4 font-medium text-slate-900 whitespace-nowrap">
                        {displayPaymentId}
                      </TableCell>
                      <TableCell className="py-4 text-slate-600 whitespace-pre-line text-xs">
                        {formattedDate}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {payeeName}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">
                            {payeeTypeStr}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {renderCategoryBadge(categoryVal)}
                      </TableCell>
                      <TableCell className="py-4 text-slate-600">
                        {reqByName}
                      </TableCell>
                      <TableCell className="py-4 font-medium text-slate-900 whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="py-4">
                        {renderStatusBadge(statusVal, statusLabelVal)}
                      </TableCell>
                      <TableCell className="py-4">
                        <Button
                          variant="outline"
                          className="h-8 rounded-md border-slate-200 bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleReview(item)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center text-sm text-slate-500">
            Showing
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
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
            Results (Total: {total})
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-slate-200 text-slate-400 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-xs text-slate-600 px-2 font-medium">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-slate-200 text-slate-600 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Approval Detail Side Sheet */}
      <PaymentApprovalDetail
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        approvalId={selectedApprovalId}
        paymentData={
          selectedPayment
            ? {
                paymentId: selectedPayment.paymentId,
                payee: selectedPayment.payee,
                category: formatCategoryName(selectedPayment.category),
                requestedBy: selectedPayment.requestedBy,
                requestDate: selectedPayment.requestDate.replace("\n", " "),
                reference: selectedPayment.invoiceNumber || "N/A",
                dueDate: selectedPayment.dueDate || "N/A",
                amount: selectedPayment.amount,
                status: selectedPayment.status || "Pending",
              }
            : undefined
        }
      />
    </div>
  );
}
