import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCustomerDetailProvider,
  getAdminCustomersProvider,
  getCustomerProjectsProvider,
  getCustomerStatsProvider,
  getSalesEmployeesProvider,
  createCustomerProvider,
  updateCustomerProvider,
  createCustomerLeadProvider,
  deactivateCustomerProvider,
  getCustomerInvoicesProvider,
  getCustomerProjectInvoicesProvider,
  getCustomersProjectsListProvider,
  createBasicCustomerProvider,
  getAdminCustomerDocumentsProvider,
  createAdminCustomerDocumentProvider,
  deleteAdminCustomerDocumentProvider,
  type CreateCustomerDocumentPayload,
} from "./customers.api";
import type { CreateCustomerLeadRequest, EditCustomerRequest } from "./customers.types";

export function useCustomersQuery(
  page = 1, 
  limit = 20, 
  filters?: {
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["customers", "admin-list", page, limit, filters],
    queryFn: () => getAdminCustomersProvider(page, limit, filters),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useCustomerDetailQuery(customerId: string) {
  return useQuery({
    queryKey: ["customers", "admin-detail", customerId],
    queryFn: () => getAdminCustomerDetailProvider(customerId),
    staleTime: 60 * 1000,
    enabled: Boolean(customerId),
  });
}

export function useCustomerProjectsQuery(
  customerId: string,
  page = 1,
  limit = 20,
  businessUnit?: string
) {
  return useQuery({
    queryKey: ["customers", "admin-projects", customerId, page, limit, businessUnit],
    queryFn: () => getCustomerProjectsProvider(customerId, page, limit, businessUnit),
    staleTime: 60 * 1000,
    enabled: Boolean(customerId),
  });
}

export function useCustomerInvoicesQuery(customerId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["customers", "admin-invoices", customerId, page, limit],
    queryFn: () => getCustomerInvoicesProvider(customerId, page, limit),
    staleTime: 60 * 1000,
    enabled: Boolean(customerId),
  });
}

export function useCustomerProjectInvoicesQuery(customerId: string, projectId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["customers", "admin-project-invoices", customerId, projectId, page, limit],
    queryFn: () => getCustomerProjectInvoicesProvider(customerId, projectId, page, limit),
    staleTime: 60 * 1000,
    enabled: Boolean(customerId) && Boolean(projectId),
  });
}

export function useCustomerStatsQuery(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["customers", "admin-stats", startDate, endDate],
    queryFn: () => getCustomerStatsProvider(startDate, endDate),
    staleTime: 60 * 1000,
  });
}

export function useSalesEmployeesQuery(filters?: {
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["customers", "sales-employees", filters],
    queryFn: () => getSalesEmployeesProvider(filters),
    staleTime: 60 * 1000,
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCustomerProvider,
    onSuccess: () => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-stats"] });
    },
  });
}

export function useCreateBasicCustomerMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBasicCustomerProvider,
    onSuccess: () => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-stats"] });
    },
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, customerData }: { customerId: string; customerData: EditCustomerRequest }) => 
      updateCustomerProvider(customerId, customerData),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch customers list and detail
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-detail", variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-stats"] });
    },
  });
}

export function useCreateCustomerLeadMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, leadData }: { customerId: string; leadData: CreateCustomerLeadRequest }) => 
      createCustomerLeadProvider(customerId, leadData),
    onSuccess: (data, variables) => {
      // Invalidate projects or detail
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-projects", variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-detail", variables.customerId] });
    },
  });
}

export function useDeactivateCustomerMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deactivateCustomerProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "admin-stats"] });
    },
  });
}

export function useCustomersProjectsListQuery(scope: string, page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ["customers", "projects-list", scope, page, limit, search],
    queryFn: () => getCustomersProjectsListProvider(scope, page, limit, search),
    staleTime: 60 * 1000,
  });
}

export function useAdminCustomerDocumentsQuery(customerId: string) {
  return useQuery({
    queryKey: ["admin-customers", "documents", customerId],
    queryFn: () => getAdminCustomerDocumentsProvider(customerId),
    enabled: Boolean(customerId) && customerId !== "unknown",
  });
}

export function useCreateAdminCustomerDocumentMutation(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerDocumentPayload) =>
      createAdminCustomerDocumentProvider(customerId, payload),
    onSuccess: (response) => {
      if (response && response.success === false) return;
      void queryClient.invalidateQueries({
        queryKey: ["admin-customers", "documents", customerId],
      });
    },
  });
}

export function useDeleteAdminCustomerDocumentMutation(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: string) =>
      deleteAdminCustomerDocumentProvider(customerId, docId),
    onSuccess: (response) => {
      if (response && response.success === false) return;
      void queryClient.invalidateQueries({
        queryKey: ["admin-customers", "documents", customerId],
      });
    },
  });
}

