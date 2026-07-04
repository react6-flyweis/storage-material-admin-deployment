import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getShipperStatsProvider,
  getShipperProjectsProvider,
  getProjectShipperStatsProvider,
  getProjectShipperRequestsProvider,
  getShipperDocumentProvider,
  pollCompareJobsStatusProvider,
  type PollCompareJobsStatusRequest,
} from "./shipper.api";

export function useShipperStatsQuery() {
  return useQuery({
    queryKey: ["plant", "shipper", "stats"],
    queryFn: () => getShipperStatsProvider(),
    staleTime: 60 * 1000,
  });
}

export function useShipperProjectsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["plant", "shipper", "projects", page, limit],
    queryFn: () => getShipperProjectsProvider(page, limit),
    staleTime: 60 * 1000,
  });
}

export function useProjectShipperStatsQuery(leadId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["plant", "shipper", "project-stats", leadId],
    queryFn: () => getProjectShipperStatsProvider(leadId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useProjectShipperRequestsQuery(
  leadId: string,
  page = 1,
  limit = 20,
  search?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "shipper", "project-requests", leadId, page, limit, search],
    queryFn: () => getProjectShipperRequestsProvider(leadId, page, limit, search),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useShipperDocumentQuery(requestId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["plant", "shipper", "document", requestId],
    queryFn: () => getShipperDocumentProvider(requestId),
    staleTime: 10 * 1000,
    ...options,
  });
}

export function usePollCompareJobsStatusMutation() {
  return useMutation({
    mutationFn: (data: PollCompareJobsStatusRequest) => pollCompareJobsStatusProvider(data),
  });
}


