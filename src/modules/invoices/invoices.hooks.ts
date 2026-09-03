import { useMutation, useQuery } from "@tanstack/react-query";
import {
  updateInvoiceProvider,
  createInvoiceProvider,
  getInvoicesProvider,
  getProjectInvoicesProvider,
  getInvoiceDetailProvider,
  getInvoiceStatsProvider,
  getProjectInvoiceStatsProvider,
  markInvoicePaidProvider,
  getAdminProjectInvoicesProvider,
  sendInvoiceProvider,
  approveInvoiceProvider,
  rejectInvoiceProvider,
  submitInvoiceApprovalProvider,
  getPendingApprovalInvoicesProvider,
  getVendorInvoicesProvider,
  exportVendorInvoicesProvider,
  getAdminVendorInvoiceDetailProvider,
  getAdminInvoiceDetailProvider,
  getCarrierInvoicesProvider,
  exportCarrierInvoicesProvider,
  type CreateInvoicePayload,
  type UpdateInvoicePayload,
  type GetInvoicesParams,
  type GetVendorInvoicesParams,
  type GetCarrierInvoicesParams,
} from "./invoices.api";

import {
  createPaymentScheduleProvider,
  getPaymentScheduleProvider,
  type CreatePaymentSchedulePayload,
} from "./payment-schedules.api";

export function useGetInvoiceStatsQuery() {
  return useQuery({
    queryKey: ["invoiceStats"],
    queryFn: () => getInvoiceStatsProvider(),
  });
}

export function useGetProjectInvoiceStatsQuery(customerId: string, leadId: string) {
  return useQuery({
    queryKey: ["projectInvoiceStats", customerId, leadId],
    queryFn: () => getProjectInvoiceStatsProvider(customerId, leadId),
    enabled: Boolean(customerId && leadId),
  });
}

export function useCreatePaymentScheduleMutation() {
  return useMutation({
    mutationFn: (payload: CreatePaymentSchedulePayload) =>
      createPaymentScheduleProvider(payload),
  });
}

export function usePaymentScheduleQuery(leadId: string) {
  return useQuery({
    queryKey: ["paymentSchedule", leadId],
    queryFn: () => getPaymentScheduleProvider(leadId),
    enabled: !!leadId,
    retry: false, // Don't retry since 404 is expected if schedule doesn't exist
  });
}

export function useCreateInvoiceMutation() {
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) =>
      createInvoiceProvider(payload),
  });
}

export function useUpdateInvoiceMutation() {
  return useMutation({
    mutationFn: (payload: UpdateInvoicePayload) =>
      updateInvoiceProvider(payload),
  });
}

export function useMarkInvoicePaidMutation() {
  return useMutation({
    mutationFn: (invoiceId: string) => markInvoicePaidProvider(invoiceId),
  });
}

export function useSendInvoiceMutation() {
  return useMutation({
    mutationFn: (invoiceId: string) => sendInvoiceProvider(invoiceId),
  });
}

export function useApproveInvoiceMutation() {
  return useMutation({
    mutationFn: ({ invoiceId, note }: { invoiceId: string; note?: string }) =>
      approveInvoiceProvider(invoiceId, { note }),
  });
}

export function useRejectInvoiceMutation() {
  return useMutation({
    mutationFn: ({ invoiceId, reason }: { invoiceId: string; reason: string }) =>
      rejectInvoiceProvider(invoiceId, { reason }),
  });
}

export function useSubmitInvoiceApprovalMutation() {
  return useMutation({
    mutationFn: ({ invoiceId, note }: { invoiceId: string; note?: string }) =>
      submitInvoiceApprovalProvider(invoiceId, { note }),
  });
}

export function useGetPendingApprovalInvoicesQuery(params?: GetInvoicesParams) {
  return useQuery({
    queryKey: ["pendingApprovalInvoices", params],
    queryFn: () => getPendingApprovalInvoicesProvider(params),
  });
}

export function useGetInvoicesQuery(params?: GetInvoicesParams) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => getInvoicesProvider(params),
  });
}

export function useGetProjectInvoicesQuery(leadId: string, params?: Omit<GetInvoicesParams, "leadId">) {
  return useQuery({
    queryKey: ["projectInvoices", leadId, params],
    queryFn: () => getProjectInvoicesProvider(leadId, params),
    enabled: !!leadId,
  });
}

export function useGetInvoiceDetailQuery(invoiceId: string) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => getInvoiceDetailProvider(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useGetAdminProjectInvoicesQuery(customerId: string, leadId: string, params?: GetInvoicesParams) {
  return useQuery({
    queryKey: ["adminProjectInvoices", customerId, leadId, params],
    queryFn: () => getAdminProjectInvoicesProvider(customerId, leadId, params),
    enabled: Boolean(customerId && leadId),
  });
}

export function useGetVendorInvoicesQuery(params?: GetVendorInvoicesParams) {
  return useQuery({
    queryKey: ["vendorInvoices", params],
    queryFn: () => getVendorInvoicesProvider(params),
  });
}

export function useExportVendorInvoicesMutation() {
  return useMutation({
    mutationFn: (params?: GetVendorInvoicesParams) => exportVendorInvoicesProvider(params),
  });
}

export function useGetAdminVendorInvoiceDetailQuery(invoiceId: string) {
  return useQuery({
    queryKey: ["adminVendorInvoiceDetail", invoiceId],
    queryFn: () => getAdminVendorInvoiceDetailProvider(invoiceId),
    enabled: Boolean(invoiceId),
  });
}

export function useGetAdminInvoiceDetailQuery(invoiceId: string) {
  return useQuery({
    queryKey: ["adminInvoiceDetail", invoiceId],
    queryFn: () => getAdminInvoiceDetailProvider(invoiceId),
    enabled: Boolean(invoiceId),
  });
}

export function useGetCarrierInvoicesQuery(params?: GetCarrierInvoicesParams) {
  return useQuery({
    queryKey: ["carrierInvoices", params],
    queryFn: () => getCarrierInvoicesProvider(params),
  });
}

export function useExportCarrierInvoicesMutation() {
  return useMutation({
    mutationFn: (params?: GetCarrierInvoicesParams) => exportCarrierInvoicesProvider(params),
  });
}




