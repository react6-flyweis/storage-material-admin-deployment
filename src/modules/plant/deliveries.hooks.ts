import { useQuery } from "@tanstack/react-query";
import {
  getDeliveries,
  getDeliveriesStats,
  getCalendarDeliveries,
  type GetDeliveriesParams,
  type GetCalendarDeliveriesParams,
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

