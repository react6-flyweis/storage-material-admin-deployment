import { useQuery } from "@tanstack/react-query";
import { getLoadPlanningProjectsProvider, getBundlePlanDetails } from "./load-planning.api";

export function useLoadPlanningProjectsQuery(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ["plant", "load-planning", "projects", page, limit, search],
    queryFn: () => getLoadPlanningProjectsProvider(page, limit, search),
    staleTime: 60 * 1000,
  });
}

export function useBundlePlanDetailsQuery(bundlePlanId: string) {
  return useQuery({
    queryKey: ["plant", "bundle-plans", bundlePlanId],
    queryFn: () => getBundlePlanDetails(bundlePlanId),
    enabled: !!bundlePlanId,
    staleTime: 60 * 1000,
  });
}

