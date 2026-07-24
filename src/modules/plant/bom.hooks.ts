import { useQuery } from "@tanstack/react-query";
import { getBomStatsProvider, getBomProjectsProvider, getBomDetailsProvider } from "./bom.api";

export function useBomStatsQuery() {
  return useQuery({
    queryKey: ["plant", "bom", "stats"],
    queryFn: () => getBomStatsProvider(),
    staleTime: 60 * 1000,
  });
}

export function useBomProjectsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["plant", "bom", "projects", page, limit],
    queryFn: () => getBomProjectsProvider(page, limit),
    staleTime: 60 * 1000,
  });
}

export function useBomDetailsQuery(
  jobId: string,
  filter: "all" | "unpriced" | "frames" | "matched" | "bom_priced" = "all",
  page = 1,
  limit = 50,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "bom", "detail", jobId, filter, page, limit],
    queryFn: () => getBomDetailsProvider(jobId, filter, page, limit),
    enabled: Boolean(jobId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
  });
}

