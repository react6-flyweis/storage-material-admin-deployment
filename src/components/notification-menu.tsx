import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import notificationIcon from "@/assets/icons/notification.svg";
import { Link, useNavigate } from "react-router";
import {
  useNotificationsQuery,
  useNotificationUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/modules/notifications/notifications.hooks";
import { getNotificationRoute } from "@/modules/notifications/notifications.utils";
import type { AppNotification } from "@/modules/notifications/notifications.types";
import { formatDistanceToNow, isValid } from "date-fns";
import { CheckCheck, Clock } from "lucide-react";

function formatNotificationTime(dateString?: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (!isValid(d)) return "";
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}

const priorityColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

export function NotificationMenu() {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useNotificationUnreadCountQuery({
    refetchInterval: 30000,
  });
  const { data: notificationsData, isLoading } = useNotificationsQuery({
    page: 1,
    limit: 5,
  });

  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllMutation = useMarkAllNotificationsAsReadMutation();

  const notifications = notificationsData?.notifications ?? [];

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

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open notifications"
          className="relative flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900 focus:outline-none"
        >
          <img
            src={notificationIcon}
            alt="Notifications"
            className="max-h-5 max-w-5"
          />
          {unreadCount > 0 ? (
            <Badge className="absolute -right-1 -top-1 size-4.5 items-center justify-center rounded-full bg-red-600 p-0 text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-84 sm:w-96 rounded-2xl border border-gray-100 bg-white p-0 shadow-[0_20px_45px_rgba(15,23,42,0.15)] z-50"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <p className="text-xs text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllMutation.isPending}
              className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2 flex items-center gap-1 font-medium"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No notifications
            </div>
          ) : (
            notifications.map((item) => {
              const priorityClass = priorityColors[item.priority] || "bg-blue-500";
              const timeString = formatNotificationTime(item.createdAt);

              return (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-gray-50",
                    !item.isRead && "bg-blue-50/40"
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      priorityClass,
                      item.isRead && "opacity-40"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={cn(
                          "text-xs truncate font-medium",
                          item.isRead ? "text-gray-700" : "text-gray-900 font-semibold"
                        )}
                      >
                        {item.title}
                      </p>
                      {item.type && (
                        <span className="text-[10px] text-gray-400 capitalize shrink-0">
                          {item.type.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    {item.body && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                    )}
                    {timeString && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                        <Clock className="size-3" />
                        <span>{timeString}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-100">
          <Link
            to="/notifications"
            className="w-full block text-center rounded-b-2xl px-5 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
