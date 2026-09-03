import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getPaymentApprovalsFiltersProvider,
  getPaymentApprovalsProvider,
  exportPaymentApprovalsProvider,
  getPaymentStatusProvider,
  exportPaymentStatusProvider,
  getProjectWiseTaxProvider,
  exportProjectWiseTaxProvider,
  getProjectWiseTaxStatsProvider,
  getTaxFilingFiltersProvider,
  getTaxFilingProvider,
  exportTaxFilingProvider,
  getStateWiseTaxProvider,
  getStateWiseTaxStatsProvider,
  exportStateWiseTaxProvider,
  getStateWiseTaxUpcomingDeadlinesProvider,
  type GetPaymentApprovalsParams,
  type GetPaymentStatusParams,
  type GetProjectWiseTaxParams,
  type GetProjectWiseTaxStatsParams,
  type GetTaxFilingParams,
  type GetStateWiseTaxParams,
  type GetStateWiseTaxStatsParams,
  type GetStateWiseTaxUpcomingDeadlinesParams,
} from "./payments.api";

export function usePaymentApprovalsFiltersQuery() {
  return useQuery({
    queryKey: ["financials", "payment-approvals-filters"],
    queryFn: getPaymentApprovalsFiltersProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentApprovalsQuery(params?: GetPaymentApprovalsParams) {
  return useQuery({
    queryKey: ["financials", "payment-approvals", params],
    queryFn: () => getPaymentApprovalsProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useExportPaymentApprovalsMutation() {
  return useMutation({
    mutationFn: (params?: GetPaymentApprovalsParams) => exportPaymentApprovalsProvider(params),
  });
}

export function usePaymentStatusQuery(params?: GetPaymentStatusParams) {
  return useQuery({
    queryKey: ["financials", "payment-status", params],
    queryFn: () => getPaymentStatusProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useExportPaymentStatusMutation() {
  return useMutation({
    mutationFn: (params?: GetPaymentStatusParams) => exportPaymentStatusProvider(params),
  });
}

export function useProjectWiseTaxQuery(params?: GetProjectWiseTaxParams) {
  return useQuery({
    queryKey: ["financials", "project-wise-tax", params],
    queryFn: () => getProjectWiseTaxProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useExportProjectWiseTaxMutation() {
  return useMutation({
    mutationFn: (params?: GetProjectWiseTaxParams) => exportProjectWiseTaxProvider(params),
  });
}

export function useProjectWiseTaxStatsQuery(params?: GetProjectWiseTaxStatsParams) {
  return useQuery({
    queryKey: ["financials", "project-wise-tax-stats", params],
    queryFn: () => getProjectWiseTaxStatsProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useTaxFilingFiltersQuery() {
  return useQuery({
    queryKey: ["financials", "tax-filing-filters"],
    queryFn: getTaxFilingFiltersProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaxFilingQuery(params?: GetTaxFilingParams) {
  return useQuery({
    queryKey: ["financials", "tax-filing", params],
    queryFn: () => getTaxFilingProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useExportTaxFilingMutation() {
  return useMutation({
    mutationFn: (params?: GetTaxFilingParams) => exportTaxFilingProvider(params),
  });
}

export function useStateWiseTaxQuery(params?: GetStateWiseTaxParams) {
  return useQuery({
    queryKey: ["financials", "state-wise-tax", params],
    queryFn: () => getStateWiseTaxProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useStateWiseTaxStatsQuery(params?: GetStateWiseTaxStatsParams) {
  return useQuery({
    queryKey: ["financials", "state-wise-tax-stats", params],
    queryFn: () => getStateWiseTaxStatsProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useExportStateWiseTaxMutation() {
  return useMutation({
    mutationFn: (params?: GetStateWiseTaxParams) => exportStateWiseTaxProvider(params),
  });
}

export function useStateWiseTaxUpcomingDeadlinesQuery(
  params?: GetStateWiseTaxUpcomingDeadlinesParams
) {
  return useQuery({
    queryKey: ["financials", "state-wise-tax-upcoming-deadlines", params],
    queryFn: () => getStateWiseTaxUpcomingDeadlinesProvider(params),
    staleTime: 60 * 1000,
  });
}

