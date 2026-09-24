import { apiClient } from "@/modules/auth/auth.api";

export interface NotificationFilterProject {
  leadId: string;
  projectId: string;
  projectName: string;
}

export interface NotificationFilterLookups {
  deliveryStatuses: string[];
  channels: string[];
  recipientTypes: string[];
  projects: NotificationFilterProject[];
}

export interface NotificationFilterLookupsResponse {
  success: boolean;
  message: string;
  data: NotificationFilterLookups;
}

export interface NotificationDetailItem {
  notificationId: string;
  deliveryId: string;
  deliveryNumber: string;
  notificationType: string;
  channel: string;
  recipient: string;
  recipientContact: string;
  recipientType: string;
  deliveryStatus: string;
  deliveryStatusLabel?: string;
  rawDeliveryStatus?: string;
  hasReschedule?: boolean;
  sentAt: string;
  project: string;
  leadId?: string;
  materialType?: string;
  deliveryDate?: string;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  sentDate?: string;
  sentTime?: string;
  createdAt?: string;
  deliveryTime?: string;
  timings?: string;
}

export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  pending: number;
  failed: number;
}

export interface NotificationDetailsListParams {
  page?: number;
  limit?: number;
  search?: string;
  leadId?: string;
  projectId?: string;
  deliveryId?: string;
  status?: string;
  deliveryStatus?: string;
  channel?: string;
  channelType?: string;
  recipientType?: string;
  startDate?: string;
  endDate?: string;
}

export interface NotificationDetailsListResponse {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationDetailItem[];
    total: number;
    page: number;
    limit: number;
    stats?: NotificationStats;
  };
}

// Clean and map params to support both aliases mentioned in the doc
function buildQueryParams(params?: NotificationDetailsListParams) {
  if (!params) return {};
  const query: Record<string, unknown> = {};

  if (params.page !== undefined) query.page = params.page;
  if (params.limit !== undefined) query.limit = params.limit;
  if (params.search) query.search = params.search;

  if (params.leadId) {
    query.leadId = params.leadId;
  }
  if (params.projectId) {
    query.projectId = params.projectId;
  }
  if (params.deliveryId) query.deliveryId = params.deliveryId;

  if (params.status) {
    query.status = params.status;
    query.deliveryStatus = params.status;
  } else if (params.deliveryStatus) {
    query.status = params.deliveryStatus;
    query.deliveryStatus = params.deliveryStatus;
  }

  if (params.channel) {
    query.channel = params.channel;
    query.channelType = params.channel;
  } else if (params.channelType) {
    query.channel = params.channelType;
    query.channelType = params.channelType;
  }

  if (params.recipientType) query.recipientType = params.recipientType;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;

  return query;
}

export async function getNotificationFilterLookups(): Promise<NotificationFilterLookupsResponse> {
  const response = await apiClient.get<NotificationFilterLookupsResponse>(
    "/api/admin/plant/notification-details/filters/lookups"
  );
  return response.data;
}

export async function getNotificationDetails(
  params?: NotificationDetailsListParams
): Promise<NotificationDetailsListResponse> {
  const query = buildQueryParams(params);
  const response = await apiClient.get<NotificationDetailsListResponse>(
    "/api/admin/plant/notification-details",
    { params: query }
  );
  return response.data;
}

export async function exportNotificationDetails(
  format: "excel" | "csv",
  params?: NotificationDetailsListParams
): Promise<Blob> {
  const query = buildQueryParams(params);
  // Omit page and limit for export as mentioned in the doc
  delete query.page;
  delete query.limit;

  const path =
    format === "csv"
      ? "/api/admin/plant/notification-details/export/csv"
      : "/api/admin/plant/notification-details/export";

  const response = await apiClient.get(path, {
    params: query,
    responseType: "blob",
  });
  return response.data;
}
