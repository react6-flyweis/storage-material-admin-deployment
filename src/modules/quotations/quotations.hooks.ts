import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuotationProvider,
  getQuotationProvider,
  updateQuotationProvider,
  submitQuotationApprovalProvider,
  approveQuotationProvider,
  rejectQuotationProvider,
  getPendingApprovalsProvider,
  sendQuotationProvider,
  getQuotationSummaryProvider,
  getLeadQuotationsProvider,
  downloadQuotationPdfProvider,
  getQuotationHtmlPreviewProvider,
} from "./quotations.api";
import type {
  CreateQuotationPayload,
  UpdateQuotationPayload,
  GetQuotationsParams,
  SendQuotationPayload,
} from "./quotations.api";

export function useCreateQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuotationPayload) => createQuotationProvider(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations", "lead", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "pending"] });
    },
  });
}

export function useQuotationQuery(quotationId: string | undefined) {
  return useQuery({
    queryKey: ["quotation", quotationId],
    queryFn: () => getQuotationProvider(quotationId!),
    enabled: !!quotationId,
  });
}

export function useUpdateQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, payload }: { quotationId: string; payload: UpdateQuotationPayload }) =>
      updateQuotationProvider(quotationId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.quotationId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "lead", data.data.quotation.leadId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "pending"] });
    },
  });
}

export function useSubmitQuotationApprovalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, note }: { quotationId: string; note?: string }) =>
      submitQuotationApprovalProvider(quotationId, note),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.quotationId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "lead", data.data.quotation.leadId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "pending"] });
    },
  });
}

export function useApproveQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, note }: { quotationId: string; note?: string }) =>
      approveQuotationProvider(quotationId, note),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.quotationId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "lead", data.data.quotation.leadId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "pending"] });
    },
  });
}

export function useRejectQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, reason }: { quotationId: string; reason: string }) =>
      rejectQuotationProvider(quotationId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.quotationId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "lead", data.data.quotation.leadId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "pending"] });
    },
  });
}

export function usePendingApprovalsQuery(params?: GetQuotationsParams) {
  return useQuery({
    queryKey: ["quotations", "pending", params],
    queryFn: () => getPendingApprovalsProvider(params),
  });
}

export function useSendQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, payload }: { quotationId: string; payload?: SendQuotationPayload }) =>
      sendQuotationProvider(quotationId, payload),
    onSuccess: (data, { quotationId }) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "lead", data.data.quotation.leadId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "pending"] });
      // Also invalidate leads summary
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useQuotationSummaryQuery(quotationId: string | undefined, enabled = false) {
  return useQuery({
    queryKey: ["quotation", "summary", quotationId],
    queryFn: () => getQuotationSummaryProvider(quotationId!),
    enabled: !!quotationId && enabled,
    retry: 3, // AI summary might take a moment to generate
  });
}

export function useLeadQuotationsQuery(leadId: string | undefined, params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["quotations", "lead", leadId, params],
    queryFn: () => getLeadQuotationsProvider(leadId!, params),
    enabled: !!leadId,
  });
}

export function useDownloadQuotationPdfMutation() {
  return useMutation({
    mutationFn: (quotationId: string) => downloadQuotationPdfProvider(quotationId),
  });
}

export function useQuotationHtmlPreviewQuery(quotationId: string | undefined) {
  return useQuery({
    queryKey: ["quotation", "html-preview", quotationId],
    queryFn: () => getQuotationHtmlPreviewProvider(quotationId!),
    enabled: !!quotationId,
  });
}



