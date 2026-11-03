import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Mail,
  MessageSquare,
  User,
  Phone,
  Calendar,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  FileSpreadsheet,
  FileText,
  Send,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  useNotificationFilterLookupsQuery,
  useNotificationDetailsQuery,
  useExportNotificationDetailsMutation,
} from "@/modules/plant/notification-details.hooks";
import type {
  NotificationDetailItem,
  NotificationDetailsListParams,
} from "@/modules/plant/notification-details.api";
import NotificationFilterModal, {
  type NotificationFilterState,
  defaultNotificationFilters,
} from "./NotificationFilterModal";

function parseDateAny(val?: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Check if it's already a time string like "10:30 AM" or "14:30"
    if (/^\d{1,2}:\d{2}(:\d{2})?(\s*(AM|PM))?$/i.test(trimmed)) {
      return null;
    }

    // Try standard Date parsing
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    // Try parseISO from date-fns
    try {
      const iso = parseISO(trimmed);
      if (!isNaN(iso.getTime())) return iso;
    } catch {}
  }
  return null;
}

function formatDateSafe(dateStr?: string, formatPattern = "MMM dd, yyyy"): string {
  if (!dateStr) return "N/A";
  const trimmed = String(dateStr).trim();
  if (!trimmed) return "N/A";

  const d = parseDateAny(trimmed);
  if (d) {
    try {
      return format(d, formatPattern);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

function formatTimeSafe(dateStr?: string): string {
  if (!dateStr) return "";
  const trimmed = String(dateStr).trim();
  if (!trimmed) return "";

  // 1. If it's already a formatted time (e.g. "10:30 AM", "2:15 PM", "14:30", "08:00 AM – 10:00 AM")
  if (
    /^\d{1,2}:\d{2}(:\d{2})?(\s*(AM|PM))?$/i.test(trimmed) ||
    /^\d{1,2}:\d{2}\s*(AM|PM)?\s*[-–]\s*\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(trimmed)
  ) {
    return trimmed;
  }

  // 2. If it's date-only string without time (e.g. "2024-03-15"), don't show fake midnight time
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "";
  }

  // 3. Try parsing date and extracting time
  const d = parseDateAny(trimmed);
  if (d) {
    try {
      return format(d, "hh:mm a");
    } catch {
      return "";
    }
  }

  return "";
}

function getNotificationDate(item: NotificationDetailItem): string {
  const rawDate = item.sentAt || item.sentDate || item.createdAt;
  return formatDateSafe(rawDate);
}

function getNotificationTime(item: NotificationDetailItem): string {
  if (item.sentTime) {
    return formatTimeSafe(item.sentTime);
  }
  const rawDate = item.sentAt || item.createdAt;
  return formatTimeSafe(rawDate);
}

const getStatusBadgeStyles = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
    case "delivered":
    case "sent":
    case "success":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
    case "scheduled":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "rescheduled":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "failed":
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getStatusDotColor = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
    case "delivered":
    case "sent":
    case "success":
      return "bg-emerald-500";
    case "pending":
    case "scheduled":
      return "bg-amber-500";
    case "rescheduled":
      return "bg-indigo-500";
    case "failed":
    case "cancelled":
      return "bg-rose-500";
    default:
      return "bg-slate-400";
  }
};

export default function NotificationHistory() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<NotificationFilterState>(
    defaultNotificationFilters,
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDetailItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch filter lookups
  const { data: lookupsResponse } = useNotificationFilterLookupsQuery();
  const lookups = lookupsResponse?.data;

  // Build query params
  const queryParams = useMemo<NotificationDetailsListParams>(() => {
    const params: NotificationDetailsListParams = {
      page,
      limit,
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (appliedFilters.leadId) {
      params.leadId = appliedFilters.leadId;
    }
    if (appliedFilters.projectId) {
      params.projectId = appliedFilters.projectId;
    }
    if (appliedFilters.deliveryStatus) {
      params.status = appliedFilters.deliveryStatus;
    }
    if (appliedFilters.channel) {
      params.channel = appliedFilters.channel;
    }
    if (appliedFilters.recipientType) {
      params.recipientType = appliedFilters.recipientType;
    }
    if (appliedFilters.startDate) {
      params.startDate = appliedFilters.startDate;
    }
    if (appliedFilters.endDate) {
      params.endDate = appliedFilters.endDate;
    }

    return params;
  }, [page, limit, searchTerm, appliedFilters]);

  // Fetch notification list and stats
  const {
    data: listResponse,
    isLoading,
    isFetching,
  } = useNotificationDetailsQuery(queryParams);

  const notifications = listResponse?.data?.notifications || [];
  const total = listResponse?.data?.total || 0;
  const stats = listResponse?.data?.stats;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Export mutation
  const exportMutation = useExportNotificationDetailsMutation();

  const handleExport = async (formatType: "excel" | "csv") => {
    try {
      const blob = await exportMutation.mutateAsync({
        format: formatType,
        params: queryParams,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const today = new Date().toISOString().split("T")[0];
      const extension = formatType === "excel" ? "xlsx" : "csv";
      link.setAttribute(
        "download",
        `notifications-export-${today}.${extension}`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        `Notifications exported successfully as ${formatType.toUpperCase()}!`,
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export notifications. Please try again.");
    }
  };

  const handleRowClick = (item: NotificationDetailItem) => {
    setSelectedNotification(item);
    setIsDetailDialogOpen(true);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(notifications.map((n) => n.notificationId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.projectId || appliedFilters.leadId) count++;
    if (appliedFilters.deliveryStatus) count++;
    if (appliedFilters.channel) count++;
    if (appliedFilters.recipientType) count++;
    if (appliedFilters.startDate || appliedFilters.endDate) count++;
    return count;
  }, [appliedFilters]);

  // Selected project display name
  const selectedProjectName = useMemo(() => {
    if (!appliedFilters.leadId && !appliedFilters.projectId) return "";
    const p = lookups?.projects.find(
      (proj) =>
        proj.leadId === appliedFilters.leadId ||
        proj.projectId === appliedFilters.projectId,
    );
    return p?.projectName || appliedFilters.projectId || appliedFilters.leadId;
  }, [appliedFilters, lookups]);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Notification History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all delivery notifications and reminders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={exportMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 gap-2 shadow-sm"
              >
                {exportMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleExport("excel")}
                className="gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel (.xlsx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("csv")}
                className="gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Export CSV (.csv)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Notifications */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Total Notifications
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                  {stats?.total ?? total}
                </h2>
              )}
            </div>
            <div className="text-blue-500 bg-blue-50 p-2.5 rounded-xl">
              <Bell className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        {/* Sent */}
        <Card className="border-l-4 border-l-sky-500 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Sent
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                  {stats?.sent ?? 0}
                </h2>
              )}
            </div>
            <div className="text-sky-500 bg-sky-50 p-2.5 rounded-xl">
              <Send className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        {/* Delivered */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Delivered
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                  {stats?.delivered ?? 0}
                </h2>
              )}
            </div>
            <div className="text-emerald-500 bg-emerald-50 p-2.5 rounded-xl">
              <CheckCircle2 className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Pending
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                  {stats?.pending ?? 0}
                </h2>
              )}
            </div>
            <div className="text-amber-500 bg-amber-50 p-2.5 rounded-xl">
              <Clock className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        {/* Failed */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm rounded-xl overflow-hidden bg-white col-span-2 sm:col-span-1">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Failed
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                  {stats?.failed ?? 0}
                </h2>
              )}
            </div>
            <div className="text-rose-500 bg-rose-50 p-2.5 rounded-xl">
              <XCircle className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter & Active Tags */}
      <Card className="shadow-sm rounded-xl overflow-hidden border-0 bg-white">
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search recipient, project, delivery #, contact..."
                className="pl-9 pr-9 bg-slate-50 border-slate-200 rounded-lg text-sm focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                onClick={() => setIsFilterModalOpen(true)}
                className={`rounded-full px-5 gap-2 border-slate-200 ${
                  activeFiltersCount > 0
                    ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs text-muted-foreground">
                Active filters:
              </span>
              {selectedProjectName && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-full font-normal"
                >
                  Project:{" "}
                  <span className="font-semibold">{selectedProjectName}</span>
                  <button
                    onClick={() => {
                      setAppliedFilters((prev) => ({
                        ...prev,
                        projectId: "",
                        leadId: "",
                      }));
                      setPage(1);
                    }}
                    className="hover:bg-slate-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {appliedFilters.deliveryStatus && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-full font-normal"
                >
                  Status:{" "}
                  <span className="font-semibold">
                    {appliedFilters.deliveryStatus}
                  </span>
                  <button
                    onClick={() => {
                      setAppliedFilters((prev) => ({
                        ...prev,
                        deliveryStatus: "",
                      }));
                      setPage(1);
                    }}
                    className="hover:bg-slate-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {appliedFilters.channel && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-full font-normal"
                >
                  Channel:{" "}
                  <span className="font-semibold">
                    {appliedFilters.channel}
                  </span>
                  <button
                    onClick={() => {
                      setAppliedFilters((prev) => ({ ...prev, channel: "" }));
                      setPage(1);
                    }}
                    className="hover:bg-slate-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {appliedFilters.recipientType && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-full font-normal"
                >
                  Recipient:{" "}
                  <span className="font-semibold">
                    {appliedFilters.recipientType}
                  </span>
                  <button
                    onClick={() => {
                      setAppliedFilters((prev) => ({
                        ...prev,
                        recipientType: "",
                      }));
                      setPage(1);
                    }}
                    className="hover:bg-slate-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(appliedFilters.startDate || appliedFilters.endDate) && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-full font-normal"
                >
                  Date:{" "}
                  <span className="font-semibold">
                    {appliedFilters.startDate || "Any"} to{" "}
                    {appliedFilters.endDate || "Any"}
                  </span>
                  <button
                    onClick={() => {
                      setAppliedFilters((prev) => ({
                        ...prev,
                        startDate: "",
                        endDate: "",
                      }));
                      setPage(1);
                    }}
                    className="hover:bg-slate-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAppliedFilters(defaultNotificationFilters);
                  setPage(1);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm rounded-xl overflow-hidden border-0 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-slate-500 font-semibold text-xs uppercase border-b">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={
                      notifications.length > 0 &&
                      selectedIds.length === notifications.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4">Notification</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Delivery Status</th>
                <th className="px-6 py-4">Recipient Type</th>
                <th className="px-6 py-4">Sent Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <Skeleton className="w-4 h-4 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-36" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </td>
                  </tr>
                ))
              ) : notifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Bell className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-800 text-base">
                        No notifications found
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try modifying your search term or adjusting filters to
                        find what you are looking for.
                      </p>
                      {(searchTerm || activeFiltersCount > 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setAppliedFilters(defaultNotificationFilters);
                            setPage(1);
                          }}
                          className="mt-4 gap-1.5 text-xs rounded-full"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Clear Filters & Search
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((item) => {
                  const isSms = (item.channel || "")
                    .toLowerCase()
                    .includes("sms");
                  const ChannelIcon = isSms ? MessageSquare : Mail;
                  const isSelected = selectedIds.includes(item.notificationId);

                  return (
                    <tr
                      key={item.notificationId}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(item)}
                    >
                      <td
                        className="px-6 py-4"
                        onClick={(e) =>
                          handleSelectItem(item.notificationId, e)
                        }
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3 items-start">
                          <div className="mt-1">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(
                                item.deliveryStatus,
                              )}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-semibold text-slate-900 leading-tight">
                                {item.notificationType}
                              </p>
                              {item.hasReschedule && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-indigo-200 text-indigo-700 bg-indigo-50"
                                >
                                  Rescheduled
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.notificationId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-full ${
                              isSms
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            <ChannelIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-700 font-medium text-xs">
                            {item.channel}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={(e) => {
                          if (item.deliveryId) {
                            e.stopPropagation();
                            navigate(`/plant/delivery-details/${item.deliveryId}`);
                          }
                        }}
                      >
                        <p
                          className={`font-semibold text-slate-900 ${
                            item.deliveryId
                              ? "hover:text-blue-600 hover:underline cursor-pointer"
                              : ""
                          }`}
                        >
                          {item.deliveryNumber || "N/A"}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {item.project || "—"}
                        </p>
                        {item.materialType && (
                          <p className="text-[11px] text-muted-foreground">
                            {item.materialType}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="bg-purple-50 p-1 rounded-full text-purple-600">
                            <User className="w-3 h-3" />
                          </div>
                          <span className="font-medium text-slate-900 text-xs">
                            {item.recipient}
                          </span>
                        </div>
                        {item.recipientContact && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {item.recipientContact.includes("@") ? (
                              <Mail className="w-3 h-3 text-slate-400" />
                            ) : (
                              <Phone className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{item.recipientContact}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusBadgeStyles(
                            item.deliveryStatusLabel || item.deliveryStatus,
                          )}`}
                        >
                          {item.deliveryStatusLabel ||
                            item.deliveryStatus ||
                            "—"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                        {item.recipientType || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-3.5 h-3.5 mt-0.5 text-slate-400" />
                          <div>
                            <p className="text-slate-800 font-medium text-xs">
                              {getNotificationDate(item)}
                            </p>
                            {getNotificationTime(item) && (
                              <p className="text-muted-foreground text-[11px]">
                                {getNotificationTime(item)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {total === 0 ? 0 : (page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-semibold text-slate-900">{total}</span>{" "}
              notifications
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-muted-foreground">Per page:</span>
              <Select
                value={String(limit)}
                onValueChange={(val) => {
                  setLimit(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-18 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Modal */}
      <NotificationFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        lookups={lookups}
        initialFilters={appliedFilters}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setPage(1);
        }}
        onReset={() => {
          setAppliedFilters(defaultNotificationFilters);
          setPage(1);
        }}
      />

      {/* Dialog Modal */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-md text-center p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              {selectedNotification?.notificationType || "Delivery Scheduled"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <h3 className="text-2xl font-bold text-blue-600 mb-8 leading-tight">
              {selectedNotification?.materialType ? (
                <>
                  {selectedNotification.materialType} will
                  <br />
                  be delivered
                </>
              ) : (
                selectedNotification?.project || "Delivery Scheduled"
              )}
            </h3>

            <p className="text-lg font-bold text-slate-800 mb-2">
              Date:{" "}
              {selectedNotification?.deliveryDate
                ? formatDateSafe(selectedNotification.deliveryDate, "MMMM d")
                : selectedNotification?.sentDate
                ? formatDateSafe(selectedNotification.sentDate, "MMMM d")
                : selectedNotification?.sentAt
                ? formatDateSafe(selectedNotification.sentAt, "MMMM d")
                : "N/A"}
            </p>
            <p className="text-lg font-bold text-slate-800 mb-8">
              Time:{" "}
              {selectedNotification?.timeWindowStart &&
              selectedNotification?.timeWindowEnd
                ? `${selectedNotification.timeWindowStart} – ${selectedNotification.timeWindowEnd}`
                : selectedNotification?.timeWindowStart ||
                  selectedNotification?.timeWindowEnd ||
                  selectedNotification?.deliveryTime ||
                  selectedNotification?.timings ||
                  selectedNotification?.sentTime ||
                  formatTimeSafe(selectedNotification?.sentAt) ||
                  "N/A"}
            </p>

            <Button
              className="w-full sm:w-[80%] mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Ok
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
