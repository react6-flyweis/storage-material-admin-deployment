import { useQuery } from "@tanstack/react-query";
import {
  getOrderProgressReview,
  getLoadPlanningStatus,
  getShipperQuotationSummary,
  getPackingListSummary,
  getQrLabelsSummary,
  getShippersSummary,
  getDeliveriesSummary,
  getUpcomingShipments,
  type DashboardFilterParams,
  type UpcomingShipmentsParams,
} from "./dashboard.api";

export function useOrderProgressReviewQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "order-progress-review", params],
    queryFn: () => getOrderProgressReview(params),
    staleTime: 60 * 1000,
  });
}

export function useLoadPlanningStatusQuery() {
  return useQuery({
    queryKey: ["plant", "dashboard", "load-planning-status"],
    queryFn: getLoadPlanningStatus,
    staleTime: 60 * 1000,
  });
}

export function useShipperQuotationSummaryQuery() {
  return useQuery({
    queryKey: ["plant", "dashboard", "shipper-quotation-summary"],
    queryFn: getShipperQuotationSummary,
    staleTime: 60 * 1000,
  });
}

export function usePackingListSummaryQuery() {
  return useQuery({
    queryKey: ["plant", "dashboard", "packing-list-summary"],
    queryFn: getPackingListSummary,
    staleTime: 60 * 1000,
  });
}

export function useQrLabelsSummaryQuery() {
  return useQuery({
    queryKey: ["plant", "dashboard", "qr-labels-summary"],
    queryFn: getQrLabelsSummary,
    staleTime: 60 * 1000,
  });
}

export function useShippersSummaryQuery() {
  return useQuery({
    queryKey: ["plant", "dashboard", "shippers-summary"],
    queryFn: getShippersSummary,
    staleTime: 60 * 1000,
  });
}

export function useDeliveriesSummaryQuery() {
  return useQuery({
    queryKey: ["plant", "dashboard", "deliveries-summary"],
    queryFn: getDeliveriesSummary,
    staleTime: 60 * 1000,
  });
}

export function useUpcomingShipmentsQuery(params?: UpcomingShipmentsParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "upcoming-shipments", params],
    queryFn: () => getUpcomingShipments(params),
    staleTime: 60 * 1000,
  });
}
