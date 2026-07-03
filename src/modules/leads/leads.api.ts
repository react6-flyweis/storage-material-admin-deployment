import { apiClient } from "@/modules/auth/auth.api";

export type Lead = {
  _id: string;
  customerId?: string;
  projectName?: string;
  buildingType?: string;
  location?: string;
  assignedSales?: {
    _id: string;
    name: string;
    email?: string;
  };
  lifecycleStatus?: string;
  quoteValue?: number;
  isTerminated?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GetLeadsData = {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
};

export type GetLeadsResponse = {
  success: boolean;
  message: string;
  data: GetLeadsData;
};

export type GetCustomerLeadsResponse = {
  success: boolean;
  message: string;
  data: {
    leads: Lead[];
    total: number;
  };
};

export async function getLeadsProvider(
  page = 1,
  limit = 20,
  filters?: {
    customerId?: string;
    search?: string;
    lifecycleStatus?: string;
  }
) {
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  if (filters?.customerId) {
    params.customerId = filters.customerId;
  }

  if (filters?.search) {
    params.search = filters.search;
  }

  if (filters?.lifecycleStatus) {
    params.lifecycleStatus = filters.lifecycleStatus;
  }

  const response = await apiClient.get<GetLeadsResponse>(
    "/api/admin/leads",
    { params }
  );

  return response.data;
}

export async function getCustomerLeadsProvider(customerId: string) {
  const response = await apiClient.get<GetCustomerLeadsResponse>(
    `/api/admin/customers/${customerId}/leads`
  );

  return response.data;
}

export type ImportLeadsResponse = {
  success: boolean;
  message: string;
  data?: {
    imported: number;
    failed: number;
  };
};

export async function importLeadsProvider(csv: string) {
  const response = await apiClient.post<ImportLeadsResponse>(
    "/api/admin/leads/import",
    { csv }
  );

  return response.data;
}

export type GetTerminatedLeadsResponse = {
  success: boolean;
  message: string;
  data: {
    projects: Array<{
      _id: string;
      projectName: string;
      customerId?: { _id?: string; firstName: string; lastName?: string };
      assignedSales?: { _id?: string; name: string };
      terminatedAt: string | null;
      terminationReason: string;
      lifecycleStatus: string;
    }>;
    total: number;
  };
};

export async function getTerminatedLeadsProvider(
  page = 1,
  limit = 20,
  search?: string
) {
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  if (search) {
    params.search = search;
  }
  const response = await apiClient.get<GetTerminatedLeadsResponse>(
    "/api/admin/leads/terminated",
    { params }
  );
  return response.data;
}

export type AssignLeadSalesResponse = {
  success: boolean;
  message: string;
};

export async function assignLeadSalesProvider(leadId: string, employeeId: string) {
  const response = await apiClient.put<AssignLeadSalesResponse>(
    `/api/admin/leads/${encodeURIComponent(leadId)}/assign`,
    { employeeId }
  );

  return response.data;
}

export type GetLeadDetailResponse = {
  success: boolean;
  message: string;
  data: {
    lead: {
      _id: string;
      customerId?: string;
      buildingType?: string;
      location?: string;
      roofStyle?: string;
      sqft?: string;
      width?: string | null;
      length?: string | null;
      height?: string | null;
      source?: string;
      jobId?: string;
      projectName?: string;
      endDate?: string | null;
      numberOfBuildings?: number;
      isTerminated?: boolean;
      terminationReason?: string;
      terminatedAt?: string | null;
      assignedSales?: string;
      quoteValue?: number;
      lifecycleStatus?: string;
      lifecycleHistory?: any[];
      priority?: string;
      numDoors?: number | null;
      numWindows?: number | null;
      numInsulation?: number | null;
      isQuoteReady?: boolean;
      isHandedToSales?: boolean;
      isRaisedToPO?: boolean;
      poStatus?: string | null;
      notes?: string;
      aiQuoteData?: any;
      aiContextSummary?: string;
      aiContextSummaryUpdatedAt?: string;
      assigningHistory?: any[];
      leadScoring?: any;
      leadNotes?: any[];
      documents?: any[];
      createdAt?: string;
      updatedAt?: string;
    };
    customer: {
      _id: string;
      customerId?: string;
      firstName?: string;
      email?: string;
      phone?: {
        number?: string;
        countryCode?: string;
      };
      company?: string;
      location?: string;
    };
    rfq?: any;
    quotations?: any[];
    auditLog?: any[];
    activityLog?: any[];
    followUps?: any[];
    payments?: any;
    buildings?: any[];
    budget?: any;
    recentMessages?: any[];
    leadNotes?: any[];
    shipments?: any[];
  };
};

export async function getLeadDetailProvider(leadId: string) {
  const response = await apiClient.get<GetLeadDetailResponse>(
    `/api/admin/leads/${encodeURIComponent(leadId)}/detail`
  );
  return response.data;
}

export type ChatMessage = {
  _id: string;
  leadId: string;
  customerId?: string;
  senderType: "customer" | "ai" | "sales" | "admin";
  senderId?: string | null;
  senderName?: string;
  content: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type GetChatHistoryResponse = {
  success: boolean;
  data: ChatMessage[];
};

export async function getChatHistoryProvider(leadId: string) {
  const response = await apiClient.get<GetChatHistoryResponse>(
    `/api/public/chat/history/${encodeURIComponent(leadId)}`
  );
  return response.data;
}

export type LeadScoreItem = {
  leadId: string;
  projectId: string;
  customerName: string;
  projectName: string;
  location: string;
  lifecycleStatus: string;
  status: string;
  score: number;
  quoteValue: number;
  temperature: string;
  updatedAt: string;
  assignedSales?: {
    _id: string;
    name: string;
  } | null;
};

export type GetLeadScoringResponse = {
  success: boolean;
  message: string;
  data: {
    leads: LeadScoreItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function getLeadScoringProvider(
  page = 1,
  limit = 20,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    client?: string;
  }
) {
  const params: Record<string, string | number> = { page, limit };

  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  if (filters?.status && filters.status !== "all") params.status = filters.status;
  if (filters?.client) params.search = filters.client;

  const response = await apiClient.get<GetLeadScoringResponse>(
    "/api/admin/leads/by-score",
    { params }
  );
  return response.data;
}

export type UpdateLeadTemperatureResponse = {
  success: boolean;
  message: string;
};

export async function updateLeadTemperatureProvider(leadId: string, temperature: string) {
  const response = await apiClient.put<UpdateLeadTemperatureResponse>(
    `/api/admin/leads/${encodeURIComponent(leadId)}/temperature`,
    { temperature }
  );
  return response.data;
}

export type ExportLeadsResponse = {
  success: boolean;
  message: string;
  data: {
    fileUrl: string;
    key: string;
    exportedCount: number;
    generatedAt: string;
  };
};

export async function exportLeadsProvider() {
  const response = await apiClient.get<ExportLeadsResponse>("/api/admin/leads/export/excel");
  return response.data;
}

export type GetActivityLogParams = {
  employeeId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type FollowUpActivity = {
  _id: string;
  leadId: string;
  projectName: string;
  jobId: string;
  clientName: string;
  followUpDate: string;
  type: string;
  followedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  status: string;
  nextFollowUpdate: string | null;
  notes: string;
  priority: string;
  completedAt: string | null;
  createdAt: string;
};

export type GetActivityLogData = {
  activities: FollowUpActivity[];
  total: number;
  page: number;
  limit: number;
};

export type GetActivityLogResponse = {
  success: boolean;
  message: string;
  data: GetActivityLogData;
};

export async function getActivityLogProvider(params: GetActivityLogParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.employeeId) queryParams.append("employeeId", params.employeeId);
  if (params.type) queryParams.append("type", params.type);
  if (params.status) queryParams.append("status", params.status);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await apiClient.get<GetActivityLogResponse>(
    `/api/admin/followups/activity-log?${queryParams.toString()}`
  );
  return response.data;
}

export type TimelineActivity = {
  _id: string;
  type: string;
  action: string;
  leadId: string;
  customerId: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  metadata: Record<string, any>;
  createdAt: string;
};

export type GetLeadTimelineResponse = {
  success: boolean;
  message: string;
  data: {
    timeline: TimelineActivity[];
  };
};

export async function getLeadTimelineProvider(leadId: string, params?: { dateFrom?: string; dateTo?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);

  const response = await apiClient.get<GetLeadTimelineResponse>(
    `/api/admin/leads/${leadId}/timeline?${queryParams.toString()}`
  );
  return response.data;
}

export type LeadBudgetPayload = {
  materialBudget?: number;
  logisticBudget?: number;
  productionBudget?: number;
  shipperBudget?: number;
  otherCost?: number;
};

export type GetLeadBudgetResponse = {
  success: boolean;
  message: string;
  data: {
    budget?: {
      _id: string;
      leadId: string;
      materialBudget: number;
      logisticBudget: number;
      productionBudget: number;
      shipperBudget: number;
      otherCost: number;
      totalBudget: number;
      expectedProfit: number;
      createdAt: string;
      updatedAt: string;
    }
  };
};

export async function getLeadBudgetProvider(leadId: string) {
  const response = await apiClient.get<GetLeadBudgetResponse>(`/api/admin/leads/${leadId}/budget`);
  return response.data;
}

export type UpdateLeadPayload = {
  projectName?: string;
  buildingType?: string;
  location?: string;
  roofStyle?: string;
  width?: number;
  length?: number;
  height?: number;
  doors?: number;
  windows?: number;
  insulation?: number;
  source?: string;
  lifecycleStatus?: string;
  quoteValue?: number;
  notes?: string;
  priority?: string;
  // customer fields
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  company?: string;
  jobTitle?: string;
};

export async function updateLeadProvider(leadId: string, payload: UpdateLeadPayload) {
  const response = await apiClient.put<{ success: boolean; message: string; data: any }>(
    `/api/admin/leads/${leadId}`,
    payload
  );

  return response.data;
}

export type CreateLeadPayload = {
  customerId: string;
  projectName: string;
  buildingType: string;
  location: string;
  source: string;
  quoteValue: number;
  roofStyle: string;
  width: number;
  length: number;
  height: number;
  doors: number;
  windows: number;
  insulation: number;
  assignedSales: string;
};

export async function createLeadProvider(payload: CreateLeadPayload) {
  const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
    "/api/admin/leads",
    payload
  );
  return response.data;
}

export async function updateLeadBudgetProvider(leadId: string, payload: LeadBudgetPayload) {
  const response = await apiClient.post<GetLeadBudgetResponse>(`/api/admin/leads/${leadId}/budget`, payload);
  return response.data;
}

export type TerminateLeadPayload = {
  reason: string;
};

export async function terminateLeadProvider(leadId: string, payload: TerminateLeadPayload) {
  const response = await apiClient.put<{ success: boolean; message: string }>(`/api/admin/leads/${leadId}/terminate`, payload);
  return response.data;
}

export type LeadDocument = {
  _id: string;
  url: string;
  name: string;
  type: string;
  uploadedAt: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type GetLeadDocumentsResponse = {
  success: boolean;
  message: string;
  data: {
    project: {
      _id: string;
      projectName: string;
      jobId: string;
    };
    documents: LeadDocument[];
    total: number;
  };
};

export async function getLeadDocumentsProvider(leadId: string) {
  const response = await apiClient.get<GetLeadDocumentsResponse>(`/api/admin/leads/${leadId}/documents`);
  return response.data;
}

export async function updateLeadLifecycleProvider(leadId: string, payload: { lifecycleStatus: string }) {
  const response = await apiClient.put<{ success: boolean; message: string; data: any }>(
    `/api/admin/leads/${leadId}/lifecycle`,
    payload
  );
  return response.data;
}

export async function addLeadNoteProvider(leadId: string, payload: { note: string }) {
  const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
    `/api/admin/leads/${leadId}/notes`,
    payload
  );
  return response.data;
}

export async function getLeadNotesProvider(leadId: string) {
  const response = await apiClient.get<{ success: boolean; message: string; data: any }>(
    `/api/admin/leads/${leadId}/notes`
  );
  return response.data;
}