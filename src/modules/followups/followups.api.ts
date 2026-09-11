import { apiClient } from "@/modules/auth/auth.api";

export type FollowUpStatsData = {
  total: number;
  upcoming: number;
  completed: number;
  overdue: number;
};

export type FollowUpStatsResponse = {
  success: boolean;
  message: string;
  data: FollowUpStatsData;
};

export type UpcomingFollowUpApiItem = {
  _id: string;
  followUpDate: string;
  notes?: string;
  priority?: string;
  status?: string;
  modeOfContact?: "call" | "email" | "chat" | "sms" | "meeting" | string;
  reminderMinutes?: number;
  notifyCustomer?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
  reminderSentAt?: string | null;
  source?: "manual" | "cold_lead_auto" | "chat_dropoff_auto" | "invoice_auto" | string;
  relatedInvoiceId?: string;
  customerId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  } | null;
  leadId?: {
    _id?: string;
    buildingType?: string;
    location?: string;
    projectId?: string;
    projectName?: string;
    jobId?: string;
  } | null;
};

export type UpcomingFollowUpsResponse = {
  success: boolean;
  message: string;
  data: {
    followups: UpcomingFollowUpApiItem[];
  };
};

export type FollowUpAiScriptApiItem = {
  _id?: string;
  id?: string;
  script?: string;
  message?: string;
  content?: string;
  generatedScript?: string;
  followupType?: string;
  type?: string;
  channel?: string;
  tone?: string;
  customerName?: string;
  customerId?: {
    firstName?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FollowUpAiScriptsResponse = {
  success: boolean;
  message: string;
  data: {
    scripts: FollowUpAiScriptApiItem[];
    message?: string;
  };
};

export async function getFollowUpStatsProvider() {
  const response = await apiClient.get<FollowUpStatsResponse>(
    "/api/admin/followups/stats",
  );

  return response.data;
}

export async function getUpcomingFollowUpsProvider() {
  const response = await apiClient.get<UpcomingFollowUpsResponse>(
    "/api/admin/followups/upcoming",
  );

  return response.data;
}

export async function getFollowUpAiScriptsProvider() {
  const response = await apiClient.get<FollowUpAiScriptsResponse>(
    "/api/admin/followups/ai-script",
  );

  return response.data;
}

export type CreateFollowUpRequest = {
  leadId: string;
  assignedTo: string;
  followUpDate: string;
  notes: string;
  priority: string;
  modeOfContact?: "call" | "email" | "chat" | "sms" | "meeting" | string;
  reminderMinutes?: number;
  notifyCustomer?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
};

export type CreateFollowUpResponse = {
  success: boolean;
  message: string;
  data: UpcomingFollowUpApiItem;
};

export async function createFollowUpProvider(data: CreateFollowUpRequest) {
  const response = await apiClient.post<CreateFollowUpResponse>(
    "/api/admin/followups",
    data
  );

  return response.data;
}

// ---------------- Follow-Up Insights Contract (2026-09-02) ----------------

export type FollowUpKind = "manual" | "automatic";
export type FollowUpView = "summary" | "detail";
export type FollowUpStatus = "pending" | "completed" | "overdue";
export type FollowUpModeOfContact = "call" | "email" | "meeting" | "sms" | "chat";
export type LeadTemperature = "hot" | "warm" | "cold";
export type TransitionSource = "manual_override" | "ai_scoring" | "system";

export type LeadTransitionInfo = {
  transitionState: string;
  transitionFrom?: string;
  transitionTo?: string;
  transitionAt?: string;
  transitionSource?: string;
  scoreBefore?: number;
  scoreAfter?: number;
  scoreDelta?: number;
  transitionReason?: string;
};

export type FollowUpActivityFilters = {
  kind?: FollowUpKind | "all";
  view?: FollowUpView;
  leadId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  status?: FollowUpStatus | string;
  modeOfContact?: FollowUpModeOfContact | string;
  temperature?: LeadTemperature | string;
  search?: string;
  transitionState?: string;
};

export type FollowUpActivityLeadItem = {
  lead: {
    _id: string;
    jobId?: string;
    projectName?: string;
    customerName?: string;
    location?: string;
    quoteValue?: number;
    lifecycleStatus?: string;
    assignedSales?: {
      _id?: string;
      name?: string;
    } | null;
    leadScoring?: {
      temperature?: LeadTemperature | string;
      score?: number;
    };
    score?: number;
    temperature?: LeadTemperature | string;
    transition?: LeadTransitionInfo;
  };
  transition?: LeadTransitionInfo;
  followUpCount: number;
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
  lastFollowUpAt?: string | null;
  lastFollowUpStatus?: string | null;
};

export type FollowUpActivitySummaryResponse = {
  success: boolean;
  data: {
    kind: FollowUpKind;
    view: "summary";
    filters: {
      startDate?: string | null;
      endDate?: string | null;
      status?: string | null;
      modeOfContact?: string | null;
    };
    totals: {
      leadCount: number;
      followUpCount: number;
      pendingCount: number;
      completedCount: number;
      overdueCount: number;
    };
    leads: FollowUpActivityLeadItem[];
    pagination: {
      page: number;
      limit: number;
      totalLeads: number;
    };
  };
};

export type FollowUpDeliveryChannel = {
  enabled: boolean;
  status: "sent" | "failed" | "pending" | "disabled" | string;
  sentAt?: string | null;
  error?: string;
};

export type FollowUpDeliveryTarget = {
  sms?: FollowUpDeliveryChannel;
  email?: FollowUpDeliveryChannel;
};

export type FollowUpDeliveryStatus = {
  customer?: FollowUpDeliveryTarget;
  salesEmployee?: FollowUpDeliveryTarget;
};

export type FollowUpHistoryItem = {
  _id: string;
  followUpDate: string;
  status: "pending" | "completed";
  computedStatus: FollowUpStatus;
  modeOfContact?: FollowUpModeOfContact;
  source: string;
  assignedTo?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  createdBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  reminderMinutes?: number;
  notifyCustomer?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
  notes?: string;
  createdAt: string;
  completedAt?: string | null;
  deliveryStatus?: FollowUpDeliveryStatus;
};

export type FollowUpActivityDetailResponse = {
  success: boolean;
  data: {
    kind?: FollowUpKind;
    view: "detail";
    lead: {
      _id: string;
      jobId?: string;
      projectName?: string;
      customerName?: string;
      location?: string;
      quoteValue?: number;
      lifecycleStatus?: string;
      assignedSales?: {
        _id?: string;
        name?: string;
      } | null;
      leadScoring?: {
        temperature?: LeadTemperature | string;
        score?: number;
      };
      transition?: LeadTransitionInfo;
    };
    transition?: LeadTransitionInfo;
    totals: {
      followUpCount: number;
      pendingCount: number;
      completedCount: number;
      overdueCount: number;
    };
    history: FollowUpHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      totalHistory: number;
    };
  };
};

export async function getFollowUpActivitySummaryProvider(
  filters: FollowUpActivityFilters = {}
) {
  const params: Record<string, string | number> = {
    view: "summary",
    page: filters.page || 1,
    limit: filters.limit || 20,
  };

  if (filters.kind && filters.kind !== "all") {
    params.kind = filters.kind;
  }

  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.modeOfContact) params.modeOfContact = filters.modeOfContact;
  if (filters.temperature && filters.temperature !== "all") params.temperature = filters.temperature;
  if (filters.search) params.search = filters.search;
  if (filters.transitionState && filters.transitionState !== "all") {
    params.transitionState = filters.transitionState;
  }

  const response = await apiClient.get<FollowUpActivitySummaryResponse>(
    "/api/followups/activity",
    { params }
  );

  return response.data;
}

export type FollowUpActivityDetailOptions = {
  startDate?: string;
  endDate?: string;
  transitionState?: string;
};

export async function getFollowUpActivityDetailProvider(
  leadId: string,
  kind?: FollowUpKind,
  page = 1,
  limit = 20,
  options?: FollowUpActivityDetailOptions
) {
  const params: Record<string, string | number> = {
    view: "detail",
    leadId,
    page,
    limit,
  };

  if (kind) {
    params.kind = kind;
  }

  if (options?.startDate) params.startDate = options.startDate;
  if (options?.endDate) params.endDate = options.endDate;
  if (options?.transitionState && options.transitionState !== "all") {
    params.transitionState = options.transitionState;
  }

  const response = await apiClient.get<FollowUpActivityDetailResponse>(
    "/api/followups/activity",
    { params }
  );

  return response.data;
}

export type TemperatureTransitionCounts = {
  hot_to_warm: number;
  hot_to_cold: number;
  warm_to_hot: number;
  warm_to_cold: number;
  cold_to_hot: number;
  cold_to_warm: number;
};

export type TemperatureTransitionSummaryResponse = {
  success: boolean;
  data: {
    filters: {
      startDate?: string;
      endDate?: string;
    };
    transitions: TemperatureTransitionCounts;
    totals: {
      totalTransitions: number;
      leadTouchedCount: number;
    };
    bySource: {
      manual_override: number;
      ai_scoring: number;
      system: number;
    };
  };
};

export async function getTemperatureTransitionSummaryProvider(
  startDate?: string,
  endDate?: string
) {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<TemperatureTransitionSummaryResponse>(
    "/api/followups/temperature-transition-summary",
    { params }
  );

  return response.data;
}

export type TemperatureTransitionRowItem = {
  _id: string;
  leadId: string;
  customerId?: string;
  fromTemperature: LeadTemperature;
  toTemperature: LeadTemperature;
  source: TransitionSource | string;
  changedBy?: {
    _id?: string;
    name?: string;
  } | null;
  changedAt: string;
  metadata?: {
    scoreBefore?: number;
    scoreAfter?: number;
    reason?: string;
  };
};

export type TemperatureTransitionsListResponse = {
  success: boolean;
  data: {
    rows: TemperatureTransitionRowItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
};

export type TemperatureTransitionsQueryParams = {
  from?: LeadTemperature;
  to?: LeadTemperature;
  source?: TransitionSource;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export async function getTemperatureTransitionsListProvider(
  params: TemperatureTransitionsQueryParams = {}
) {
  const response = await apiClient.get<TemperatureTransitionsListResponse>(
    "/api/followups/temperature-transitions",
    { params }
  );

  return response.data;
}

export type FollowUpTemplateItem = {
  _id: string;
  title: string;
  message: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FollowUpTemplatesResponse = {
  success: boolean;
  message: string;
  data: {
    templates: FollowUpTemplateItem[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};

export type GetFollowUpTemplatesParams = {
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
};

export async function getFollowUpTemplatesProvider(
  params: GetFollowUpTemplatesParams = { isActive: true, limit: 50 }
) {
  const response = await apiClient.get<FollowUpTemplatesResponse>(
    "/api/followups/templates",
    { params }
  );
  return response.data;
}

export type CreateFollowUpTemplatePayload = {
  title: string;
  message: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateFollowUpTemplatePayload = Partial<CreateFollowUpTemplatePayload>;

export async function createFollowUpTemplateProvider(
  payload: CreateFollowUpTemplatePayload
) {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: FollowUpTemplateItem;
  }>("/api/followups/templates", payload);
  return response.data;
}

export async function updateFollowUpTemplateProvider(
  templateId: string,
  payload: UpdateFollowUpTemplatePayload
) {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: FollowUpTemplateItem;
  }>(`/api/followups/templates/${templateId}`, payload);
  return response.data;
}

export async function deleteFollowUpTemplateProvider(templateId: string) {
  const response = await apiClient.delete<{
    success: boolean;
    message: string;
  }>(`/api/followups/templates/${templateId}`);
  return response.data;
}

