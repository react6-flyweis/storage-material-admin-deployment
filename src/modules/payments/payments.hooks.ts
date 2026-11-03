import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPaymentApprovalsFiltersProvider,
  getPaymentApprovalsStatsProvider,
  getPaymentApprovalsProvider,
  exportPaymentApprovalsProvider,
  getPaymentApprovalDetailProvider,
  addPaymentApprovalRemarkProvider,
  addPaymentApprovalAttachmentProvider,
  reviewPaymentApprovalProvider,
  getPaymentStatusProvider,
  exportPaymentStatusProvider,
  getProjectWiseTaxProvider,
  exportProjectWiseTaxProvider,
  getProjectWiseTaxStatsProvider,
  getTaxFilingFiltersProvider,
  getTaxFilingProvider,
  getTaxFilingStatsProvider,
  exportTaxFilingProvider,
  getTaxComplianceStatusProvider,
  syncTaxDataProvider,
  getTaxFilingDetailProvider,
  prepareTaxFilingProvider,
  submitTaxPaymentProvider,
  downloadTaxFilingReceiptPdfProvider,
  getStateWiseTaxProvider,
  getStateWiseTaxStatsProvider,
  exportStateWiseTaxProvider,
  getStateWiseTaxUpcomingDeadlinesProvider,
  type GetPaymentApprovalsParams,
  type AddPaymentApprovalRemarkPayload,
  type AddPaymentApprovalAttachmentPayload,
  type ReviewPaymentApprovalPayload,
  type GetPaymentStatusParams,
  type GetProjectWiseTaxParams,
  type GetProjectWiseTaxStatsParams,
  type GetTaxFilingParams,
  type GetTaxFilingStatsParams,
  type GetStateWiseTaxParams,
  type GetStateWiseTaxStatsParams,
  type GetStateWiseTaxUpcomingDeadlinesParams,
  type TaxPaymentPayload,
} from "./payments.api";

// ---------------- Compliance & Sync Hooks ----------------

export function useTaxComplianceStatusQuery() {
  return useQuery({
    queryKey: ["financials", "tax-compliance-status"],
    queryFn: getTaxComplianceStatusProvider,
    staleTime: 60 * 1000,
  });
}

export function useSyncTaxMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncTaxDataProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financials", "tax-compliance-status"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "tax-filing"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "tax-filing-stats"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "state-wise-tax"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "state-wise-tax-stats"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "project-wise-tax"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "project-wise-tax-stats"] });
    },
  });
}

// ---------------- Payment Approvals Hooks ----------------

export function usePaymentApprovalsFiltersQuery() {
  return useQuery({
    queryKey: ["financials", "payment-approvals-filters"],
    queryFn: getPaymentApprovalsFiltersProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentApprovalsStatsQuery(params?: GetPaymentApprovalsParams) {
  return useQuery({
    queryKey: ["financials", "payment-approvals-stats", params],
    queryFn: () => getPaymentApprovalsStatsProvider(params),
    staleTime: 60 * 1000,
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

export function usePaymentApprovalDetailQuery(approvalId?: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["financials", "payment-approval-detail", approvalId],
    queryFn: () => {
      if (!approvalId) throw new Error("Approval ID is required");
      return getPaymentApprovalDetailProvider(approvalId);
    },
    enabled: Boolean(approvalId) && enabled,
    staleTime: 30 * 1000,
  });
}

export function useAddPaymentApprovalRemarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      approvalId,
      payload,
    }: {
      approvalId: string;
      payload: AddPaymentApprovalRemarkPayload;
    }) => addPaymentApprovalRemarkProvider(approvalId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["financials", "payment-approval-detail", variables.approvalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["financials", "payment-approvals"],
      });
    },
  });
}

export function useAddPaymentApprovalAttachmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      approvalId,
      payload,
    }: {
      approvalId: string;
      payload: AddPaymentApprovalAttachmentPayload;
    }) => addPaymentApprovalAttachmentProvider(approvalId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["financials", "payment-approval-detail", variables.approvalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["financials", "payment-approvals"],
      });
    },
  });
}

export function useReviewPaymentApprovalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      approvalId,
      payload,
    }: {
      approvalId: string;
      payload: ReviewPaymentApprovalPayload;
    }) => reviewPaymentApprovalProvider(approvalId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["financials", "payment-approval-detail", variables.approvalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["financials", "payment-approvals"],
      });
      queryClient.invalidateQueries({
        queryKey: ["financials", "payment-approvals-stats"],
      });
    },
  });
}

// ---------------- Payment Status Hooks ----------------

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

// ---------------- Project-Wise Tax Hooks ----------------

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

// ---------------- Tax Filing Hooks ----------------

export function useTaxFilingFiltersQuery() {
  return useQuery({
    queryKey: ["financials", "tax-filing-filters"],
    queryFn: getTaxFilingFiltersProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaxFilingStatsQuery(params?: GetTaxFilingStatsParams) {
  return useQuery({
    queryKey: ["financials", "tax-filing-stats", params],
    queryFn: () => getTaxFilingStatsProvider(params),
    staleTime: 60 * 1000,
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

// ---------------- Modals — Detail, Prepare, Pay, Receipt Hooks ----------------

export function useTaxFilingDetailQuery(id: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["financials", "tax-filing-detail", id],
    queryFn: () => getTaxFilingDetailProvider(id!),
    enabled: Boolean(id) && enabled,
    staleTime: 60 * 1000,
  });
}

export function usePrepareTaxFilingQuery(id: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["financials", "tax-filing-prepare", id],
    queryFn: () => prepareTaxFilingProvider(id!),
    enabled: Boolean(id) && enabled,
    staleTime: 60 * 1000,
  });
}

export function useSubmitTaxPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaxPaymentPayload }) =>
      submitTaxPaymentProvider(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financials", "tax-filing"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "tax-filing-stats"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "tax-filing-detail"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "state-wise-tax"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "state-wise-tax-stats"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "project-wise-tax"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "project-wise-tax-stats"] });
    },
  });
}

export function useDownloadTaxReceiptPdfMutation() {
  return useMutation({
    mutationFn: (id: string) => downloadTaxFilingReceiptPdfProvider(id),
  });
}

// ---------------- State-Wise Tax Hooks ----------------

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

