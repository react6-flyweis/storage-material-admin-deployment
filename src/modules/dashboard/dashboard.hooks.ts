import { useQuery } from "@tanstack/react-query";
import { getLeadStatsProvider } from "./dashboard.api";

export function useLeadStatsQuery(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["dashboard", "lead-stats", startDate, endDate],
    queryFn: () => getLeadStatsProvider(startDate, endDate),
    staleTime: 60 * 1000,
  });
}
