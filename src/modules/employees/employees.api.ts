import { apiClient } from "@/modules/auth/auth.api";

export type AdminEmployeeApiItem = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  assignedLeadCount?: number;
};

export type AdminEmployeesData = {
  employees: AdminEmployeeApiItem[];
  total: number;
};

export type AdminEmployeesResponse = {
  success: boolean;
  message: string;
  data: AdminEmployeesData;
};

export type AdminEmployeeProfileLead = {
  _id: string;
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  buildingType?: string;
  location?: string;
  source?: string;
  quoteValue?: number;
  lifecycleStatus?: string;
  isQuoteReady?: boolean;
  isHandedToSales?: boolean;
  isRaisedToPO?: boolean;
  poStatus?: string | null;
  updatedAt?: string;
  priority?: string;
  stage?: string;
  createdAt?: string;
  customerId?: {
    _id?: string;
    customerId?: string;
    firstName?: string;
    email?: string;
    phone?: {
      number?: string;
      countryCode?: string;
    };
  } | null;
};

export type AdminEmployeeProfileStats = {
  totalLeads: number;
  closedLeads: number;
  conversionRate: number;
  followUpsCompleted: number;
  revenueGenerated: number;
  totalProjects?: number;
  deliveriesHandled?: number;
  invoicesRaised?: number;
};

export type AdminEmployeeProfileResponse = {
  success: boolean;
  message: string;
  data: {
    employee: AdminEmployeeApiItem;
    leads: AdminEmployeeProfileLead[];
    stats: AdminEmployeeProfileStats;
  };
};

export type EmployeeByRole = {
  _id: string;
  count: number;
};

export type EmployeeTopPerformer = {
  name?: string;
  leadsCount?: number;
} | null;

export type EmployeeStatsData = {
  total: number;
  active: number;
  byRole: EmployeeByRole[];
  topPerformer: EmployeeTopPerformer;
};

export type EmployeeStatsResponse = {
  success: boolean;
  message: string;
  data: EmployeeStatsData;
};

export type EmployeePerformanceApiItem = {
  employee: {
    _id: string;
    name: string;
    email: string;
  };
  totalLeads: number;
  closedLeads: number;
  conversionRate: number;
};

export type EmployeePerformanceData = {
  performance: EmployeePerformanceApiItem[];
};

export type EmployeePerformanceResponse = {
  success: boolean;
  message: string;
  data: EmployeePerformanceData;
};

export type EmployeeAuditLogItem = {
  userId: string;
  name: string;
  email: string;
  role: string;
  panel: string;
  status: string;
  isActive: boolean;
  lastActivity: string | null;
  lastActivityAt: string | null;
};

export type EmployeeAuditLogData = {
  employees: EmployeeAuditLogItem[];
  total: number;
  page: number;
  limit: number;
};

export type EmployeeAuditLogResponse = {
  success: boolean;
  message: string;
  data: EmployeeAuditLogData;
};

export interface AdminEmployeesParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function getAdminEmployeesProvider(filters?: AdminEmployeesParams) {
  const params: Record<string, any> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.role && filters.role !== "all") params.role = filters.role;
  if (filters?.isActive !== undefined) params.isActive = filters.isActive;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;

  const response = await apiClient.get<AdminEmployeesResponse>(
    "/api/admin/employees",
    { params }
  );

  return response.data;
}

export async function getAdminEmployeeProfileProvider(employeeId: string) {
  const response = await apiClient.get<AdminEmployeeProfileResponse>(
    `/api/admin/employees/${encodeURIComponent(employeeId)}`,
  );

  return response.data;
}

export async function getEmployeeStatsProvider() {
  const response = await apiClient.get<EmployeeStatsResponse>(
    "/api/admin/employees/stats",
  );

  return response.data;
}

export async function getEmployeePerformanceProvider() {
  const response = await apiClient.get<EmployeePerformanceResponse>(
    "/api/admin/employees/performance",
  );

  return response.data;
}

export async function getEmployeeAuditLogProvider(page = 1, limit = 20) {
  const response = await apiClient.get<EmployeeAuditLogResponse>(
    "/api/admin/employees/audit-log",
    { params: { page, limit } }
  );

  return response.data;
}

export type CreateEmployeeData = {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
  team?: string;
  status?: string;
  permissions?: any;
};

export type UpdateEmployeeData = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  team?: string;
  password?: string;
  isActive?: boolean;
  status?: string;
};

export async function createAdminEmployeeProvider(data: CreateEmployeeData) {
  const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
    "/api/admin/employees",
    data
  );
  return response.data;
}

export async function updateAdminEmployeeProvider(employeeId: string, data: UpdateEmployeeData) {
  const response = await apiClient.put<{ success: boolean; message: string; data: any }>(
    `/api/admin/employees/${encodeURIComponent(employeeId)}`,
    data
  );
  return response.data;
}
