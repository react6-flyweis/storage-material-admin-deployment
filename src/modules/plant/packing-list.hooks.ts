import { useQuery } from "@tanstack/react-query";
import { getPackingListProjects, getPackingListPlan, getPackingListDetails } from "./packing-list.api";

export function usePackingListProjectsQuery(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ["plant", "packing-lists", "projects", page, limit, search],
    queryFn: () => getPackingListProjects(page, limit, search),
    staleTime: 60 * 1000,
  });
}

export function usePackingListPlanQuery(packingListPlanId: string) {
  return useQuery({
    queryKey: ["plant", "packing-list-plans", packingListPlanId],
    queryFn: () => getPackingListPlan(packingListPlanId),
    enabled: !!packingListPlanId,
    staleTime: 60 * 1000,
  });
}

export function usePackingListDetailsQuery(packingListId: string) {
  return useQuery({
    queryKey: ["plant", "packing-lists", "details", packingListId],
    queryFn: () => getPackingListDetails(packingListId),
    enabled: !!packingListId,
    staleTime: 60 * 1000,
  });
}


