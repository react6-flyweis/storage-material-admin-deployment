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
  compareShipperRequestProvider,
  type PollCompareJobsStatusRequest,
  type GetProjectShipperRequestsParams,
} from "./shipper.api";

export function useShipperStatsQuery() {
  return useQuery({
    queryKey: ["plant", "shipper", "stats"],
    queryFn: getShipperStatsProvider,
    staleTime: 60 * 1000,
  });
}

export function useShipperProjectsQuery(page = 1, limit = 20, fileStatus?: string) {
  return useQuery({
    queryKey: ["plant", "shipper", "projects", page, limit, fileStatus],
    queryFn: () => getShipperProjectsProvider(page, limit, fileStatus),
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
  pageOrParamsOrOptions?: number | GetProjectShipperRequestsParams | { skip?: boolean; enabled?: boolean },
  limit: number | { enabled?: boolean; skip?: boolean } = 20,
  search?: string,
  statusOrOptions?: string | { enabled?: boolean; skip?: boolean },
  comparisonStatusOrOptions?: string | { enabled?: boolean; skip?: boolean },
  options?: { enabled?: boolean; skip?: boolean }
) {
  let params: GetProjectShipperRequestsParams = { page: 1, limit: 20 };
  let queryOptions: { enabled?: boolean; skip?: boolean } | undefined = options;

  if (typeof pageOrParamsOrOptions === "object" && pageOrParamsOrOptions !== null) {
    if ("skip" in pageOrParamsOrOptions || "enabled" in pageOrParamsOrOptions) {
      queryOptions = pageOrParamsOrOptions as { skip?: boolean; enabled?: boolean };
    } else {
      params = { ...(pageOrParamsOrOptions as GetProjectShipperRequestsParams) };
      if (typeof limit === "object" && limit !== null) {
        queryOptions = limit as { enabled?: boolean; skip?: boolean };
      }
    }
  } else if (typeof pageOrParamsOrOptions === "number") {
    params.page = pageOrParamsOrOptions;
    params.limit = typeof limit === "number" ? limit : 20;
    params.search = search;
    if (typeof statusOrOptions === "string") {
      params.status = statusOrOptions;
      if (typeof comparisonStatusOrOptions === "string") {
        params.comparisonStatus = comparisonStatusOrOptions;
      } else if (typeof comparisonStatusOrOptions === "object" && comparisonStatusOrOptions !== null) {
        queryOptions = comparisonStatusOrOptions;
      }
    } else if (typeof statusOrOptions === "object" && statusOrOptions !== null) {
      queryOptions = statusOrOptions;
    }
  }

  const isEnabled = Boolean(leadId) && !queryOptions?.skip && (queryOptions?.enabled ?? true);

  return useQuery({
    queryKey: [
      "plant",
      "shipper",
      "project-requests",
      leadId,
      params.page,
      params.limit,
      params.search,
      params.status,
      params.comparisonStatus,
    ],
    queryFn: async () => {
      const res = await getProjectShipperRequestsProvider(leadId, params);
      return {
        ...res,
        ...res.data,
      };
    },
    staleTime: 60 * 1000,
    ...queryOptions,
    enabled: isEnabled,
  });
}

export const useGetProjectShipperRequestsQuery = useProjectShipperRequestsQuery;

export function useShipperDocumentQuery(
  requestId: string,
  options?: { enabled?: boolean; skip?: boolean }
) {
  const isEnabled = Boolean(requestId) && !options?.skip && (options?.enabled ?? true);
  return useQuery({
    queryKey: ["plant", "shipper", "document", requestId],
    queryFn: () => getShipperDocumentProvider(requestId),
    staleTime: 10 * 1000,
    ...options,
    enabled: isEnabled,
    select: (data) => ({
      ...data,
      ...data.data,
    }),
  });
}

export const useGetShipperDocumentQuery = useShipperDocumentQuery;

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

export function useCompareShipperRequestMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (requestId: string) => compareShipperRequestProvider(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "shipper"] });
    },
  });

  const trigger = (requestId: string) => ({
    unwrap: () => mutation.mutateAsync(requestId),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}




