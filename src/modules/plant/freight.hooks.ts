import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getFreightStats,
  getFreightLoads,
  getDeliveryFreightBids,
  getDeliveryDetail,
  selectFreightBid,
  requestFreightBidRevision,
  getAwardedStats,
  getAwardedLoads,
  type GetFreightLoadsParams,
  type RevisionBody,
  type GetAwardedLoadsParams,
} from "./freight.api";

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


