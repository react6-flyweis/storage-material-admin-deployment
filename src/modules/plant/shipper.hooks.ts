import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShipperStatsProvider,
  getShipperProjectsProvider,
  getProjectShipperStatsProvider,
  getProjectShipperRequestsProvider,
  getShipperDocumentProvider,
  pollCompareJobsStatusProvider,
  getComparisonSummaryProvider,
  approveShipperRequestProvider,
  requestResubmitShipperRequestProvider,
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
    select: data => data.data
  });
}

export function usePollCompareJobsStatusMutation() {
  return useMutation({
    mutationFn: (data: PollCompareJobsStatusRequest) => pollCompareJobsStatusProvider(data),
  });
}

export function useGetComparisonSummaryQuery(requestId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "shipper", "comparison-summary", requestId],
    queryFn: async () => {
      const res = await getComparisonSummaryProvider(requestId);
      return res.data;
    },
    enabled: Boolean(requestId) && !options?.skip,
  });
}

export function useApproveShipperRequestMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (requestId: string) => approveShipperRequestProvider(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "shipper"] });
    },
  });

  const trigger = (requestId: string) => ({
    unwrap: () => mutation.mutateAsync(requestId),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}

export function useRequestResubmitShipperRequestMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: { requestId: string; note: string }) =>
      requestResubmitShipperRequestProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "shipper"] });
    },
  });

  const trigger = (data: { requestId: string; note: string }) => ({
    unwrap: () => mutation.mutateAsync(data),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}



