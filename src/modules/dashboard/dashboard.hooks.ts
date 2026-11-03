import { useQuery } from "@tanstack/react-query";
import {
  getDashboardOverview,
  getDashboardSearch,
  getLeadStatsProvider,
} from "./dashboard.api";
import type { DashboardQueryParams } from "./dashboard.types";

export function useDashboardOverviewQuery(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: [
      "admin-dashboard",
      "overview",
      params?.period ?? "month",
      params?.startDate,
      params?.endDate,
      params?.limit,
    ],
    queryFn: () => getDashboardOverview(params),
    staleTime: 60 * 1000,
  });
}

export function useDashboardSearchQuery(
  q: string,
  limit: number = 20,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["admin-dashboard", "search", q, limit],
    queryFn: () => getDashboardSearch(q, limit),
    enabled: options?.enabled !== undefined ? options.enabled : Boolean(q.trim()),
    staleTime: 30 * 1000,
  });
}

/**
 * Legacy lead stats query
 */
export function useLeadStatsQuery(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["dashboard", "lead-stats", startDate, endDate],
    queryFn: () => getLeadStatsProvider(startDate, endDate),
    staleTime: 60 * 1000,
  });
}
