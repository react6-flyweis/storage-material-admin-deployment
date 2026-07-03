import { apiClient } from "@/modules/auth/auth.api";
import type {
  GetAdminCustomersResponse,
  GetAdminCustomerDetailResponse,
  GetCustomerProjectsResponse,
  CustomerStatsResponse,
  GetSalesEmployeesResponse,
  CreateCustomerRequest,
  CreateCustomerResponse,
  EditCustomerRequest,
  EditCustomerResponse,
  CreateCustomerLeadRequest,
  CreateCustomerLeadResponse,
  GetCustomerInvoicesResponse,
  GetCustomersProjectsListResponse,
  CreateBasicCustomerRequest,
  CreateBasicCustomerResponse,
} from "./customers.types";

export async function getAdminCustomersProvider(
  page = 1, 
  limit = 20, 
  filters?: {
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
  }
) {
  const params: Record<string, string | number> = { 
    page, 
    limit 
  };

  if (filters?.isActive !== undefined) {
    params.isActive = filters.isActive.toString();
  }

  if (filters?.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters?.endDate) {
    params.endDate = filters.endDate;
  }

  if (filters?.status && filters.status !== "all") {
    params.status = filters.status;
  }

  if (filters?.search) {
    params.search = filters.search;
  }

  const response = await apiClient.get<GetAdminCustomersResponse>(
    "/api/admin/customers",
    { params }
  );

  return response.data;
}

export async function getAdminCustomerDetailProvider(customerId: string) {
  const response = await apiClient.get<GetAdminCustomerDetailResponse>(
    `/api/admin/customers/${customerId}`,
  );

  return response.data;
}

export async function getCustomerProjectsProvider(customerId: string) {
  const response = await apiClient.get<GetCustomerProjectsResponse>(
    `/api/admin/customers/${customerId}/projects`,
  );

  return response.data;
}

export async function getCustomerInvoicesProvider(customerId: string, page = 1, limit = 10) {
  const response = await apiClient.get<GetCustomerInvoicesResponse>(
    `/api/admin/customers/${customerId}/invoices`,
    { params: { page, limit } }
  );

  return response.data;
}

export async function getCustomerProjectInvoicesProvider(customerId: string, projectId: string, page = 1, limit = 10) {
  const response = await apiClient.get<GetCustomerInvoicesResponse>(
    `/api/admin/customers/${customerId}/projects/${projectId}/invoices`,
    { params: { page, limit } }
  );

  return response.data;
}

export async function getCustomerStatsProvider(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<CustomerStatsResponse>(
    "/api/admin/customers/stats",
    { params },
  );

  return response.data;
}

export async function getSalesEmployeesProvider(filters?: {
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const params: Record<string, string> = {
    role: "sales"
  };

  if (filters?.isActive !== undefined) {
    params.isActive = filters.isActive.toString();
  }

  if (filters?.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters?.endDate) {
    params.endDate = filters.endDate;
  }

  if (filters?.search) {
    params.search = filters.search;
  }

  const response = await apiClient.get<GetSalesEmployeesResponse>(
    "/api/admin/employees",
    { params }
  );

  return response.data;
}

export async function createCustomerProvider(customerData: CreateCustomerRequest) {
  const response = await apiClient.post<CreateCustomerResponse>(
    "/api/admin/customers",
    customerData,
  );

  return response.data;
}

export async function createBasicCustomerProvider(customerData: CreateBasicCustomerRequest) {
  const response = await apiClient.post<CreateBasicCustomerResponse>(
    "/api/admin/customers/basic",
    customerData,
  );

  return response.data;
}

export async function updateCustomerProvider(customerId: string, customerData: EditCustomerRequest) {
  const response = await apiClient.put<EditCustomerResponse>(
    `/api/admin/customers/${customerId}`,
    customerData,
  );

  return response.data;
}

export async function createCustomerLeadProvider(customerId: string, leadData: CreateCustomerLeadRequest) {
  const response = await apiClient.post<CreateCustomerLeadResponse>(
    `/api/admin/customers/${customerId}/projects`,
    leadData,
  );

  return response.data;
}

export async function deactivateCustomerProvider(customerId: string) {
  const response = await apiClient.patch(
    `/api/admin/customers/${customerId}/deactivate`
  );
  return response.data;
}

export async function getCustomersProjectsListProvider(scope: string, page = 1, limit = 20, search?: string) {
  const params: Record<string, string | number> = { scope, page, limit };
  if (search) params.search = search;
  
  const response = await apiClient.get<GetCustomersProjectsListResponse>(
    "/api/admin/customers/projects",
    { params }
  );
  return response.data;
}
