import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuotationProvider,
  getQuotationProvider,
  updateQuotationProvider,
  sendQuotationProvider,
  getQuotationSummaryProvider,
  getLeadQuotationsProvider,
} from "./quotations.api";
import type {
  CreateQuotationPayload,
  UpdateQuotationPayload,
} from "./quotations.api";

export function useCreateQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuotationPayload) => createQuotationProvider(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations", "lead", variables.leadId] });
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
    },
  });
}

export function useSendQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quotationId: string) => sendQuotationProvider(quotationId),
    onSuccess: (data, quotationId) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] });
      queryClient.invalidateQueries({ queryKey: ["quotations", "lead", data.data.quotation.leadId] });
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
