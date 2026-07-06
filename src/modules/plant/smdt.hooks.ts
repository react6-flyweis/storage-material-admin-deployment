import { useQuery } from "@tanstack/react-query";
import { getSmdtStatsProvider, getSmdtItemsProvider, type GetSmdtParams } from "./smdt.api";

export function useSmdtStatsQuery() {
  return useQuery({
    queryKey: ["plant", "smdt", "stats"],
    queryFn: () => getSmdtStatsProvider(),
    staleTime: 60 * 1000,
  });
}

export function useSmdtItemsQuery(params?: GetSmdtParams) {
  return useQuery({
    queryKey: ["plant", "smdt", "items", params],
    queryFn: () => getSmdtItemsProvider(params),
    staleTime: 60 * 1000,
  });
}
