import { useQuery } from "@tanstack/react-query";
import { getFreightStats, getFreightLoads, type GetFreightLoadsParams } from "./freight.api";

export function useFreightStatsQuery() {
  return useQuery({
    queryKey: ["plant", "deliveries", "freight", "stats"],
    queryFn: getFreightStats,
    staleTime: 60 * 1000,
  });
}

export function useFreightLoadsQuery(
  params?: GetFreightLoadsParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "deliveries", "freight", params],
    queryFn: () => getFreightLoads(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

