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
