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
  getMismatchSummary,
  getMismatchReport,
  type DashboardFilterParams,
  type UpcomingShipmentsParams,
  type MismatchReportParams,
} from "./dashboard.api";

export function useOrderProgressReviewQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "order-progress-review", params],
    queryFn: () => getOrderProgressReview(params),
    staleTime: 60 * 1000,
  });
}

export function useLoadPlanningStatusQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "load-planning-status", params],
    queryFn: () => getLoadPlanningStatus(params),
    staleTime: 60 * 1000,
  });
}

export function useShipperQuotationSummaryQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "shipper-quotation-summary", params],
    queryFn: () => getShipperQuotationSummary(params),
    staleTime: 60 * 1000,
  });
}

export function usePackingListSummaryQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "packing-list-summary", params],
    queryFn: () => getPackingListSummary(params),
    staleTime: 60 * 1000,
  });
}

export function useQrLabelsSummaryQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "qr-labels-summary", params],
    queryFn: () => getQrLabelsSummary(params),
    staleTime: 60 * 1000,
  });
}

export function useShippersSummaryQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "shippers-summary", params],
    queryFn: () => getShippersSummary(params),
    staleTime: 60 * 1000,
  });
}

export function useDeliveriesSummaryQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "deliveries-summary", params],
    queryFn: () => getDeliveriesSummary(params),
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

export function useMismatchSummaryQuery(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "mismatch-summary", params],
    queryFn: () => getMismatchSummary(params),
    staleTime: 60 * 1000,
  });
}

export function useMismatchReportQuery(params?: MismatchReportParams) {
  return useQuery({
    queryKey: ["plant", "dashboard", "mismatch-report", params],
    queryFn: () => getMismatchReport(params),
    staleTime: 60 * 1000,
  });
}
