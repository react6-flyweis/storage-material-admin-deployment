import { apiClient } from "@/modules/auth/auth.api";
import type {
  GetNotificationsParams,
  GetNotificationsResponse,
  GetNotificationsResponseData,
  UnreadCountResponse,
} from "./notifications.types";

export async function getNotificationsProvider(
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResponseData> {
  const queryParams: Record<string, string | number> = {};

  if (params.page !== undefined) queryParams.page = params.page;
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.type) queryParams.type = params.type;
  if (params.priority) queryParams.priority = params.priority;
  if (params.read !== undefined && params.read !== "") queryParams.read = params.read;

  const response = await apiClient.get<GetNotificationsResponse>(
    "/api/notifications",
    { params: queryParams }
  );

  const payload = response.data?.data;
  if (payload && Array.isArray(payload.notifications)) {
    return payload;
  }

  // Fallback structure if response format varies slightly
  const fallbackData = response.data as unknown as Partial<GetNotificationsResponseData>;
  return {
    notifications: fallbackData?.notifications ?? [],
    total: fallbackData?.total ?? 0,
    stats: fallbackData?.stats ?? {
      total: 0,
      unread: 0,
      highPriority: 0,
      today: 0,
    },
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
}

export async function getNotificationUnreadCountProvider(): Promise<number> {
  try {
    const response = await apiClient.get<UnreadCountResponse>(
      "/api/notifications/unread-count"
    );
    const data = response.data;
    if (data?.data?.unread !== undefined) return data.data.unread;
    if (data?.data?.count !== undefined) return data.data.count;
    if (typeof data?.unread === "number") return data.unread;
    if (typeof data?.count === "number") return data.count;
  } catch {
    // If dedicated unread-count endpoint fails or is not present, fetch stats from getNotifications
  }

  try {
    const listRes = await getNotificationsProvider({ limit: 1 });
    return listRes.stats?.unread ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationAsReadProvider(id: string): Promise<void> {
  await apiClient.put(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsAsReadProvider(): Promise<void> {
  await apiClient.put("/api/notifications/read-all");
}

export async function deleteNotificationProvider(id: string): Promise<void> {
  await apiClient.delete(`/api/notifications/${id}`);
}
