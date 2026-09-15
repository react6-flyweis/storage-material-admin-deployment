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

export type AdminEmployeeProfileQueryParams = {
  startDate?: string;
  endDate?: string;
  assignedPage?: number;
  assignedLimit?: number;
  revenuePeriod?: "all" | "year" | "month";
  lifecycleBucket?: "all" | "active" | "closed";
  temperature?: "hot" | "warm" | "cold";
  scoreState?: string;
  status?: string;
};

export type EmployeeProfileHeader = {
  employeeId: string;
  name: string;
  avatar?: string;
  role: string;
  roleLabel: string;
  joinedAt?: string;
  isActive: boolean;
  workSummary?: {
    count: number;
    label: string;
    shortLabel: string;
  };
};

export type EmployeeProfilePersonalInfo = {
  email: string;
  phone?: string;
  joinDate?: string;
  role: string;
  roleDisplay?: string;
  department?: string;
  permissionTags?: string[];
  permissions?: Record<string, unknown>;
};

export type SalesAssignedLeadItem = {
  leadId: string;
  customerName: string;
  jobId?: string;
  projectName?: string;
  location?: string;
  status: string;
  statusLabel?: string;
  quoteValue?: number;
  score?: number;
  temperature?: "hot" | "warm" | "cold";
  scoreStateLabel?: string;
  lead?: Record<string, unknown>;
};

export type PlantAssignedProjectItem = {
  leadId?: string;
  projectName: string;
  customerName: string;
  buildingsCount?: number;
  status: string;
  statusLabel?: string;
  projectValue?: number;
};

export type ConstructionAssignedDeliveryItem = {
  deliveryId?: string;
  deliveryNumber?: string;
  projectName?: string;
  customerName?: string;
  material?: string;
  weight?: string;
  status: string;
  statusLabel?: string;
  deliveryDate?: string;
  transporter?: string;
  driver?: string;
  truckNo?: string;
  [key: string]: unknown;
};

export type AccountAssignedInvoiceItem = {
  invoiceId?: string;
  invoiceNumber?: string;
  projectName?: string;
  customerName?: string;
  amount?: number;
  status: string;
  statusLabel?: string;
  dueDate?: string;
  date?: string;
  [key: string]: unknown;
};

export type AssignedWorkData =
  | {
      kind: "sales_leads";
      total: number;
      page: number;
      limit: number;
      items: SalesAssignedLeadItem[];
    }
  | {
      kind: "plant_projects";
      total: number;
      page: number;
      limit: number;
      items: PlantAssignedProjectItem[];
    }
  | {
      kind: "construction_deliveries";
      total: number;
      page: number;
      limit: number;
      items: ConstructionAssignedDeliveryItem[];
    }
  | {
      kind: "account_invoices";
      total: number;
      page: number;
      limit: number;
      items: AccountAssignedInvoiceItem[];
    };

export type SalesPerformanceMetrics = {
  leadsClosed?: number;
  conversionRate?: number;
  followUpsCompletedPercent?: number;
  followUpsTotal?: number;
  revenueGenerated?: number;
  revenuePeriodLabel?: string;
  quotesCreated?: number;
  escalationsRaised?: number;
};

export type PlantPerformanceMetrics = {
  totalProjects?: number;
  drawingsUploaded?: number;
  drawingApprovalRate?: number;
  bomSubmissionPending?: number;
  bomSubmissionApproved?: number;
  bomSubmissionRejected?: number;
};

export type ConstructionPerformanceMetrics = {
  totalDeliveries?: number;
  onTimeRate?: number;
  inTransitDeliveries?: number;
  completedDeliveries?: number;
  delayedDeliveries?: number;
  [key: string]: unknown;
};

export type AccountPerformanceMetrics = {
  totalInvoices?: number;
  paidInvoices?: number;
  pendingInvoices?: number;
  totalRevenueProcessed?: number;
  [key: string]: unknown;
};

export type EmployeePerformanceDataUnion =
  | { kind: "sales"; metrics: SalesPerformanceMetrics }
  | { kind: "plant"; metrics: PlantPerformanceMetrics }
  | { kind: "construction"; metrics: ConstructionPerformanceMetrics }
  | { kind: "account"; metrics: AccountPerformanceMetrics };

export type EmployeeProfileData = {
  header: EmployeeProfileHeader;
  personalInfo: EmployeeProfilePersonalInfo;
  assignedWork: AssignedWorkData;
  performance: EmployeePerformanceDataUnion;
};

export type AdminEmployeeProfileResponse = {
  success: boolean;
  message?: string;
  data: EmployeeProfileData;
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

export async function getAdminEmployeeProfileProvider(
  userId: string,
  params?: AdminEmployeeProfileQueryParams,
) {
  const cleanParams: Record<string, string | number | undefined> = {};
  if (params?.startDate) cleanParams.startDate = params.startDate;
  if (params?.endDate) cleanParams.endDate = params.endDate;
  if (params?.assignedPage) cleanParams.assignedPage = params.assignedPage;
  if (params?.assignedLimit) cleanParams.assignedLimit = params.assignedLimit;
  if (params?.revenuePeriod && params.revenuePeriod !== "all") {
    cleanParams.revenuePeriod = params.revenuePeriod;
  }
  if (params?.lifecycleBucket && params.lifecycleBucket !== "all") {
    cleanParams.lifecycleBucket = params.lifecycleBucket;
  }
  if (params?.temperature) cleanParams.temperature = params.temperature;
  if (params?.scoreState) cleanParams.scoreState = params.scoreState;
  if (params?.status) cleanParams.status = params.status;

  const response = await apiClient.get<AdminEmployeeProfileResponse>(
    `/api/admin/employees/${encodeURIComponent(userId)}/profile`,
    { params: cleanParams },
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
  isActive?: boolean;
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
  const response = await apiClient.put<{ success: boolean; message: string; data: unknown }>(
    `/api/admin/employees/${encodeURIComponent(employeeId)}`,
    data
  );
  return response.data;
}

export async function deleteAdminEmployeeProvider(employeeId: string) {
  const response = await apiClient.delete<{ success: boolean; message: string; data?: unknown }>(
    `/api/admin/employees/${encodeURIComponent(employeeId)}`,
  );
  return response.data;
}

export type ResetEmployeePasswordResponse = {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    passwordEmailSent: boolean;
    passwordEmailWarning: string | null;
  };
};

export async function resetEmployeePasswordProvider(
  employeeId: string,
  newPassword: string
) {
  const response = await apiClient.put<ResetEmployeePasswordResponse>(
    `/api/admin/employees/${encodeURIComponent(employeeId)}/password`,
    { newPassword }
  );
  return response.data;
}



