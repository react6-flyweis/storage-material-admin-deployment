import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import type { TaxFilingItem } from "@/modules/payments/payments.api";

const AVATAR_COLORS = [
  "bg-blue-900",
  "bg-orange-500",
  "bg-blue-700",
  "bg-yellow-500",
  "bg-blue-800",
  "bg-purple-700",
  "bg-emerald-700",
  "bg-indigo-700",
];

function getAvatarColor(name?: string) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
}

function formatDate(dateStr?: string | null, pattern: string = "dd/MM/yyyy") {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return "-";
    return format(d, pattern);
  } catch {
    return "-";
  }
}

function formatPeriod(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return "-";
    return format(d, "MMM yyyy");
  } catch {
    return "-";
  }
}

function getDueInText(dueDateStr?: string | null) {
  if (!dueDateStr) return "-";
  try {
    const due = new Date(dueDateStr);
    if (!isValid(due)) return "-";
    const now = new Date();
    // Normalize to start of day for comparison
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return `In ${diffDays} Days`;
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === 0) return "Due Today";
    return `Overdue by ${Math.abs(diffDays)} Days`;
  } catch {
    return "-";
  }
}

const getStatusBadge = (status?: string) => {
  if (!status) return <span className="text-gray-400 text-sm">-</span>;
  const s = status.toLowerCase().trim();
  switch (s) {
    case "due soon":
      return (
        <Badge className="bg-orange-400 hover:bg-orange-500 text-white font-normal rounded-sm">
          Due Soon
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white font-normal rounded-sm">
          Pending
        </Badge>
      );
    case "no tax due":
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm">
          No tax due
        </Badge>
      );
    case "filed":
    case "paid":
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm capitalize">
          {s === "paid" ? "Paid" : "Filed"}
        </Badge>
      );
    case "overdue":
      return (
        <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-normal rounded-sm">
          Overdue
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 text-white font-normal rounded-sm capitalize">
          {status}
        </Badge>
      );
  }
};

type PaginationFooterProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function PaginationFooter({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3 bg-white">
      <div className="flex items-center text-sm text-gray-500">
        <span>Showing</span>
        <Select
          value={limit.toString()}
          onValueChange={(val) => {
            onLimitChange(Number(val));
            onPageChange(1);
          }}
        >
          <SelectTrigger className="h-8 mx-2 bg-white w-18">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span>
          Results ({total > 0 ? (page - 1) * limit + 1 : 0} -{" "}
          {Math.min(page * limit, total)} of {total})
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 text-gray-600 disabled:text-gray-300 rounded-md border-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPageNumbers().map((p, idx) =>
          typeof p === "number" ? (
            <Button
              key={idx}
              variant="outline"
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 p-0 rounded-md text-xs font-medium ${page === p
                ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                : "text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
            >
              {p}
            </Button>
          ) : (
            <span key={idx} className="px-1 text-gray-400 text-xs">
              ...
            </span>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 text-gray-600 disabled:text-gray-300 rounded-md border-gray-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function PendingFilingTab({
  rows,
  isLoading = false,
  page = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
  onReviewDetails,
  onPrepareFiling,
}: {
  rows: TaxFilingItem[];
  isLoading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onReviewDetails?: (item: TaxFilingItem) => void;
  onPrepareFiling?: (item: TaxFilingItem) => void;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-xs">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Pending Filings</h3>
        <span className="text-xs text-gray-500 font-medium">
          {rows.length} pending record{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow className="border-none">
              <TableHead className="font-semibold text-gray-600 h-11">State</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Filing Period</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Due Date ▾</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Tax Due</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Status</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span>Loading pending filings...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  No pending filings found for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row._id}
                  className="border-b last:border-none hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                          row.state
                        )}`}
                      >
                        <span className="text-xs font-bold">
                          {row.state?.charAt(0) || "T"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.state || "-"}</span>
                        <span className="text-xs text-gray-500">
                          {row.leadId?.jobId
                            ? `${row.leadId.jobId}${row.leadId.projectName ? ` • ${row.leadId.projectName}` : ""}`
                            : row.threshold || "-"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {formatPeriod(row.dueDate)}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {row.filingFrequency || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">
                        {formatDate(row.dueDate)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getDueInText(row.dueDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-gray-900 font-semibold text-sm">
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell className="py-4">{getStatusBadge(row.status)}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      {row.status?.toLowerCase() === "no tax due" ? (
                        <button
                          type="button"
                          onClick={() => onReviewDetails?.(row)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Details
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onReviewDetails?.(row)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Review Details
                          </button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onPrepareFiling?.(row)}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs px-3"
                          >
                            Prepare Filing
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {onPageChange && onLimitChange && (
        <PaginationFooter
          page={page}
          limit={limit}
          total={total || rows.length}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}

export function FilingHistoryTab({
  rows,
  isLoading = false,
  page = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
  onDownload,
  onViewDetails,
}: {
  rows: TaxFilingItem[];
  isLoading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onDownload?: (item: TaxFilingItem) => void;
  onViewDetails?: (item: TaxFilingItem) => void;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-xs">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Filing History</h3>
        <span className="text-xs text-gray-500 font-medium">
          {rows.length} filed record{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow className="border-none">
              <TableHead className="font-semibold text-gray-600 h-11">State</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Filing Period</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Filed Date</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Tax Paid</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Method</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Status</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Receipt</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span>Loading filing history...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                  No filing history records found for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const filedDateValue = row.paidAt || row.updatedAt || row.createdAt;
                const receiptId = "-";

                return (
                  <TableRow
                    key={row._id}
                    className="border-b last:border-none hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                            row.state
                          )}`}
                        >
                          <span className="text-xs font-bold">
                            {row.state?.charAt(0) || "-"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{row.state || "-"}</span>
                          <span className="text-xs text-gray-500">
                            {row.leadId?.jobId
                              ? `${row.leadId.jobId}${row.leadId.projectName ? ` • ${row.leadId.projectName}` : ""}`
                              : (row.customerId?.firstName
                                ? `${row.customerId.firstName}${row.customerId.lastName ? ` ${row.customerId.lastName}` : ""}`
                                : "-")}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {formatPeriod(row.dueDate || filedDateValue)}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {row.filingFrequency || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {formatDate(filedDateValue)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(filedDateValue, "hh:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-gray-900 font-semibold text-sm">
                      {formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600 text-sm">
                      {row.filingFrequency || "-"}
                    </TableCell>
                    <TableCell className="py-4">{getStatusBadge(row.status || "-")}</TableCell>
                    <TableCell className="py-4">
                      {receiptId !== "-" ? (
                        <button
                          type="button"
                          onClick={() => onViewDetails?.(row)}
                          className="text-blue-600 font-medium hover:underline text-left block text-sm"
                        >
                          {receiptId}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                      <div className="text-xs text-gray-400">
                        {formatDate(filedDateValue, "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onViewDetails?.(row)}
                          className="rounded font-medium text-blue-600 hover:text-blue-800 h-8 text-xs"
                        >
                          View Filing
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"
                          onClick={() => onDownload?.(row)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {onPageChange && onLimitChange && (
        <PaginationFooter
          page={page}
          limit={limit}
          total={total || rows.length}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}