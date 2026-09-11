import { useState } from "react";
import StatCard from "@/components/ui/stat-card";
import {
  Bell,
  BellRing,
  BellOff,
  Clock,
  UserCheck,
  CheckSquare,
  Calendar,
  AlertTriangle,
  CreditCard,
  FileText,
  Truck,
  Package,
  FileSpreadsheet,
  Receipt,
  MessageSquare,
  CheckCheck,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { formatDistanceToNow, isValid, format } from "date-fns";
import {
  useNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} from "@/modules/notifications/notifications.hooks";
import { getNotificationRoute } from "@/modules/notifications/notifications.utils";
import type {
  AppNotification,
  NotificationType,
  NotificationPriority,
} from "@/modules/notifications/notifications.types";

function formatNotificationTime(dateString?: string): { relative: string; full: string } {
  if (!dateString) return { relative: "", full: "" };
  const d = new Date(dateString);
  if (!isValid(d)) return { relative: "", full: "" };
  try {
    return {
      relative: formatDistanceToNow(d, { addSuffix: true }),
      full: format(d, "MMM dd, yyyy · hh:mm a"),
    };
  } catch {
    return { relative: "", full: "" };
  }
}

const typeIconMap: Record<string, typeof Bell> = {
  lead: UserCheck,
  task: CheckSquare,
  meeting: Calendar,
  escalation: AlertTriangle,
  payment: CreditCard,
  system: Bell,
  drawing: FileText,
  delivery: Truck,
  followup: Clock,
  material_request: Package,
  quotation: FileSpreadsheet,
  invoice: Receipt,
  freight_bid: Truck,
  chat: MessageSquare,
};

const typeColorMap: Record<string, { bg: string; text: string }> = {
  lead: { bg: "bg-blue-100", text: "text-blue-600" },
  task: { bg: "bg-emerald-100", text: "text-emerald-600" },
  meeting: { bg: "bg-purple-100", text: "text-purple-600" },
  escalation: { bg: "bg-rose-100", text: "text-rose-600" },
  payment: { bg: "bg-green-100", text: "text-green-600" },
  system: { bg: "bg-slate-100", text: "text-slate-600" },
  drawing: { bg: "bg-indigo-100", text: "text-indigo-600" },
  delivery: { bg: "bg-amber-100", text: "text-amber-600" },
  followup: { bg: "bg-cyan-100", text: "text-cyan-600" },
  material_request: { bg: "bg-orange-100", text: "text-orange-600" },
  quotation: { bg: "bg-teal-100", text: "text-teal-600" },
  invoice: { bg: "bg-violet-100", text: "text-violet-600" },
  freight_bid: { bg: "bg-sky-100", text: "text-sky-600" },
  chat: { bg: "bg-blue-100", text: "text-blue-600" },
};

const filterTabs: { label: string; value: string; type?: NotificationType; isUnread?: boolean }[] = [
  { label: "Unread", value: "unread", isUnread: true },
  { label: "All", value: "all" },
  { label: "Leads", value: "lead", type: "lead" },
  { label: "Tasks", value: "task", type: "task" },
  { label: "Meetings", value: "meeting", type: "meeting" },
  { label: "Escalations", value: "escalation", type: "escalation" },
  { label: "Payments", value: "payment", type: "payment" },
  { label: "Deliveries", value: "delivery", type: "delivery" },
  { label: "Quotations", value: "quotation", type: "quotation" },
  { label: "Invoices", value: "invoice", type: "invoice" },
  { label: "Materials", value: "material_request", type: "material_request" },
  { label: "Chat", value: "chat", type: "chat" },
];

export default function Notifications() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("unread");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  const isUnreadTab = activeTab === "unread";
  const selectedType = isUnreadTab || activeTab === "all" ? undefined : (activeTab as NotificationType);
  const readParam: "true" | "false" | "" = isUnreadTab ? "false" : "";

  const { data, isLoading, isFetching, refetch } = useNotificationsQuery({
    page: currentPage,
    limit: rowsPerPage,
    type: selectedType,
    read: readParam,
  });

  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllMutation = useMarkAllNotificationsAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const notifications = data?.notifications ?? [];
  const totalItems = data?.total ?? 0;
  const stats = data?.stats ?? { total: 0, unread: 0, highPriority: 0, today: 0 };

  const statCardsData = [
    {
      title: "Total Notifications",
      value: stats.total.toString(),
      icon: <Bell className="w-5 h-5 text-[#1D51A4]" />,
      color: "bg-[#1D51A4]",
    },
    {
      title: "Unread",
      value: stats.unread.toString(),
      icon: <BellRing className="w-5 h-5 text-[#3AB449]" />,
      color: "bg-[#3AB449]",
    },
    {
      title: "High Priority",
      value: stats.highPriority.toString(),
      icon: <BellOff className="w-5 h-5 text-[#F59E0B]" />,
      color: "bg-[#F59E0B]",
    },
    {
      title: "Today",
      value: stats.today.toString(),
      icon: <Clock className="w-5 h-5 text-[#FD8D5B]" />,
      color: "bg-[#FD8D5B]",
    },
  ];

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    const targetRoute = getNotificationRoute(
      notification.refModel,
      notification.refId,
      notification.type
    );
    navigate(targetRoute);
  };

  const handleMarkAllRead = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("All notifications marked as read");
      },
      onError: () => {
        toast.error("Failed to mark all as read");
      },
    });
  };

  const handleMarkSingleRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Notification marked as read");
      },
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Notification deleted");
      },
      onError: () => {
        toast.error("Failed to delete notification");
      },
    });
  };

  const renderIcon = (type: string) => {
    const color = typeColorMap[type] || { bg: "bg-gray-100", text: "text-gray-600" };
    const IconComponent = typeIconMap[type] || Bell;

    return (
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
          color.bg,
          color.text
        )}
      >
        <IconComponent className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="xl:px-8 px-4 md:pt-6 pb-12 space-y-6">
      {/* Header Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Stay updated with project updates, approvals, drawings, deliveries, and communication.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-gray-700 bg-white"
          >
            <RotateCcw className={cn("size-3.5", isFetching && "animate-spin")} />
            Refresh
          </Button>

          {stats.unread > 0 && (
            <Button
              onClick={handleMarkAllRead}
              disabled={markAllMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="size-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Filter Tabs Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4">
        <div className="flex items-center gap-2 overflow-x-auto text-sm scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5",
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                <span>{tab.label}</span>
                {tab.isUnread && stats.unread > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      isActive
                        ? "bg-white text-blue-600"
                        : "bg-blue-600 text-white"
                    )}
                  >
                    {stats.unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-sm text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const { relative, full } = formatNotificationTime(notification.createdAt);
              const priority = notification.priority;

              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-5 md:p-6 flex flex-col md:flex-row md:items-start gap-4 transition cursor-pointer group hover:bg-gray-50/80",
                    !notification.isRead && "bg-blue-50/30"
                  )}
                >
                  {/* Left Icon */}
                  {renderIcon(notification.type)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3
                        className={cn(
                          "text-sm md:text-base font-semibold group-hover:text-blue-600 transition",
                          notification.isRead ? "text-gray-800" : "text-gray-900"
                        )}
                      >
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          New
                        </span>
                      )}

                      {priority && (
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                            priority === "high"
                              ? "bg-red-100 text-red-700"
                              : priority === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          )}
                        >
                          {priority} priority
                        </span>
                      )}

                      {notification.type && (
                        <span className="text-[11px] text-gray-400 capitalize">
                          • {notification.type.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-2">
                      {notification.body}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <Clock className="size-3" />
                      <span>{relative}</span>
                      {full && <span className="text-gray-300">({full})</span>}
                    </div>
                  </div>

                  {/* Row Actions */}
                  <div className="flex items-center gap-2 md:self-center shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Mark as read"
                        onClick={(e) => handleMarkSingleRead(e, notification._id)}
                        className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                      >
                        <Check className="size-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete notification"
                      onClick={(e) => handleDelete(e, notification._id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <Bell className="w-10 h-10 text-gray-300 mb-1" />
            <p className="text-base font-semibold text-gray-700">No notifications found</p>
            <p className="text-xs text-gray-400">
              There are no notifications matching your current filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
