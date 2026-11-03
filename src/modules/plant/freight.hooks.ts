import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFreightStats,
  getFreightFilters,
  getFreightLoads,
  getFreightLoadsBidRows,
  exportFreightLoads,
  getDeliveryFreightBids,
  getDeliveryDetail,
  getProjectDelivery,
  selectFreightBid,
  requestFreightBidRevision,
  getAwardedStats,
  getAwardedLoads,
  getAwardedLoadsBidRows,
  exportAwardedLoads,
  rescheduleDelivery,
  updateDeliveryDetails,
  createPlantDeliveryProvider,
  sendFreightBidsProvider,
  type GetFreightLoadsParams,
  type RevisionBody,
  type GetAwardedLoadsParams,
  type RescheduleDeliveryBody,
  type UpdateDeliveryDetailsBody,
  type CreatePlantDeliveryRequest,
} from "./freight.api";

export function useFreightStatsQuery() {
  return useQuery({
    queryKey: ["plant", "deliveries", "freight", "stats"],
    queryFn: getFreightStats,
    staleTime: 60 * 1000,
  });
}

export function useFreightFiltersQuery() {
  return useQuery({
    queryKey: ["plant", "deliveries", "freight-loads", "filters"],
    queryFn: getFreightFilters,
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

export function useFreightLoadsBidRowsQuery(
  params?: GetFreightLoadsParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "freight-loads", "bid-rows", params],
    queryFn: () => getFreightLoadsBidRows(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useExportFreightLoadsMutation() {
  return useMutation({
    mutationFn: (params?: Omit<GetFreightLoadsParams, "page" | "limit">) =>
      exportFreightLoads(params),
  });
}

export function useDeliveryFreightBidsQuery(
  deliveryId: string,
  sort: "low_to_high" | "high_to_low",
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "deliveries", deliveryId, "bids", sort],
    queryFn: () => getDeliveryFreightBids(deliveryId, sort),
    enabled: Boolean(deliveryId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
  });
}

export function useDeliveryDetailQuery(
  deliveryId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "deliveries", deliveryId, "detail"],
    queryFn: () => getDeliveryDetail(deliveryId),
    enabled: Boolean(deliveryId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
  });
}

export function useProjectDeliveryQuery(
  projectId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "deliveries", "project", projectId],
    queryFn: () => getProjectDelivery(projectId),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
  });
}

export function useSelectFreightBidMutation() {
  return useMutation({
    mutationFn: (bidId: string) => selectFreightBid(bidId),
  });
}

export function useRequestFreightBidRevisionMutation() {
  return useMutation({
    mutationFn: ({ bidId, body }: { bidId: string; body: RevisionBody }) =>
      requestFreightBidRevision(bidId, body),
  });
}

export function useAwardedStatsQuery() {
  return useQuery({
    queryKey: ["plant", "deliveries", "awarded", "stats"],
    queryFn: getAwardedStats,
    staleTime: 60 * 1000,
  });
}

export function useAwardedLoadsQuery(
  params?: GetAwardedLoadsParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "deliveries", "awarded", params],
    queryFn: () => getAwardedLoads(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAwardedLoadsBidRowsQuery(
  params?: GetAwardedLoadsParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "awarded-loads", "bid-rows", params],
    queryFn: () => getAwardedLoadsBidRows(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useExportAwardedLoadsMutation() {
  return useMutation({
    mutationFn: (params?: Omit<GetAwardedLoadsParams, "page" | "limit">) =>
      exportAwardedLoads(params),
  });
}

export function useRescheduleDeliveryMutation() {
  return useMutation({
    mutationFn: ({
      deliveryId,
      body,
    }: {
      deliveryId: string;
      body: RescheduleDeliveryBody;
    }) => rescheduleDelivery(deliveryId, body),
  });
}

export function useUpdateDeliveryDetailsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deliveryId,
      body,
    }: {
      deliveryId: string;
      body: UpdateDeliveryDetailsBody;
    }) => updateDeliveryDetails(deliveryId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plant", "deliveries", variables.deliveryId] });
      queryClient.invalidateQueries({ queryKey: ["plant", "deliveries"] });
    },
  });
}

export function useCreatePlantDeliveryMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: any) => createPlantDeliveryProvider(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "deliveries"] });
    },
  });

  const trigger = (payload: any) => ({
    unwrap: () => mutation.mutateAsync(payload),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}

export function useSendFreightBidsMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: { deliveryId: string; carrierIds?: string[]; bidDeadline?: string }) =>
      sendFreightBidsProvider(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "deliveries"] });
    },
  });

  const trigger = (payload: { deliveryId: string; carrierIds?: string[]; bidDeadline?: string }) => ({
    unwrap: () => mutation.mutateAsync(payload),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}



