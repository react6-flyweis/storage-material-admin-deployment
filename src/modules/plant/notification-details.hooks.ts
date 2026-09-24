import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getNotificationFilterLookups,
  getNotificationDetails,
  exportNotificationDetails,
  type NotificationDetailsListParams,
} from "./notification-details.api";

export function useNotificationFilterLookupsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["plant", "notification-details", "filters", "lookups"],
    queryFn: getNotificationFilterLookups,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useNotificationDetailsQuery(
  params?: NotificationDetailsListParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "notification-details", params],
    queryFn: () => getNotificationDetails(params),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useExportNotificationDetailsMutation() {
  return useMutation({
    mutationFn: ({
      format,
      params,
    }: {
      format: "excel" | "csv";
      params?: NotificationDetailsListParams;
    }) => exportNotificationDetails(format, params),
  });
}
