export type NotificationType =
  | "lead"
  | "task"
  | "meeting"
  | "escalation"
  | "payment"
  | "system"
  | "drawing"
  | "delivery"
  | "followup"
  | "material_request"
  | "quotation"
  | "invoice"
  | "freight_bid"
  | "chat";

export type NotificationPriority = "high" | "medium" | "low";

export interface AppNotification {
  _id: string;
  userId: string | null;
  customerId: string | null;
  leadId: string | null;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  refId: string | null;
  refModel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  today: number;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: NotificationType | "";
  priority?: NotificationPriority | "";
  read?: "true" | "false" | "";
}

export interface GetNotificationsResponseData {
  notifications: AppNotification[];
  total: number;
  stats: NotificationStats;
  page: number;
  limit: number;
}

export interface GetNotificationsResponse {
  success: boolean;
  message: string;
  data: GetNotificationsResponseData;
}

export interface UnreadCountResponse {
  success: boolean;
  message?: string;
  data?: {
    unread: number;
    count?: number;
    stats?: NotificationStats;
  };
  unread?: number;
  count?: number;
}
