import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getDeliveries,
  getDeliveriesStats,
  getCalendarDeliveries,
  exportDeliveries,
  sendDeliveryReminder,
  getDeliveryDocuments,
  type GetDeliveriesParams,
  type GetCalendarDeliveriesParams,
  type ExportDeliveriesParams,
  type SendDeliveryReminderPayload,
} from "./deliveries.api";

export function useDeliveriesQuery(
  params?: GetDeliveriesParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "deliveries", params],
    queryFn: () => getDeliveries(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useDeliveriesStatsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["plant", "deliveries", "stats"],
    queryFn: getDeliveriesStats,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCalendarDeliveriesQuery(
  params?: GetCalendarDeliveriesParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "deliveries", "calendar", params],
    queryFn: () => getCalendarDeliveries(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useExportDeliveriesMutation() {
  return useMutation({
    mutationFn: (params?: ExportDeliveriesParams) => exportDeliveries(params),
  });
}

export function useSendDeliveryReminderMutation() {
  return useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: string;
      payload?: SendDeliveryReminderPayload;
    }) => sendDeliveryReminder(deliveryId, payload),
  });
}

export function useDeliveryDocumentsQuery(
  deliveryId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "deliveries", deliveryId, "documents"],
    queryFn: () => getDeliveryDocuments(deliveryId),
    enabled: Boolean(deliveryId) && (options?.enabled ?? true),
  });
}

