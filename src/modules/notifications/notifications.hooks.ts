import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import {
  getNotificationsProvider,
  getNotificationUnreadCountProvider,
  markNotificationAsReadProvider,
  markAllNotificationsAsReadProvider,
  deleteNotificationProvider,
} from "./notifications.api";
import type {
  GetNotificationsParams,
  GetNotificationsResponseData,
} from "./notifications.types";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (params: GetNotificationsParams) =>
    [...notificationQueryKeys.lists(), params] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
};

export function useNotificationsQuery(
  params: GetNotificationsParams = {},
  options?: Omit<UseQueryOptions<GetNotificationsResponseData, Error>, "queryKey" | "queryFn">
) {
  return useQuery<GetNotificationsResponseData, Error>({
    queryKey: notificationQueryKeys.list(params),
    queryFn: () => getNotificationsProvider(params),
    ...options,
  });
}

export function useNotificationUnreadCountQuery(
  options?: { refetchInterval?: number | false; enabled?: boolean }
) {
  return useQuery<number>({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: () => getNotificationUnreadCountProvider(),
    refetchInterval: options?.refetchInterval ?? 30000,
    enabled: options?.enabled ?? true,
  });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsReadProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsReadProvider(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotificationProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
