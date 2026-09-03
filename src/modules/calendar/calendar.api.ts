import { apiClient } from "@/modules/auth/auth.api";

export type CalendarEventItem = {
  _id: string;
  kind?: "meeting" | "followup" | string;
  title?: string;
  status: "scheduled" | "completed" | "cancelled" | string;
  startTime?: string;
  endTime?: string;
  followUpDate?: string;
  meetingTime?: string;
  duration?: number;
  mode?: "online" | "in-person" | string;
  modeOfContact?: "call" | "email" | "chat" | "sms" | "meeting" | string;
  notes?: string;
  priority?: "low" | "medium" | "high" | string;
  reminderMinutes?: number;
  reminderSms?: boolean;
  reminderEmail?: boolean;
  reminderSentAt?: string | null;
  notifyCustomer?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
  source?: "manual" | "cold_lead_auto" | "chat_dropoff_auto" | "invoice_auto" | string;
  relatedInvoiceId?: string;
  leadId?: {
    _id?: string;
    projectName?: string;
    projectId?: string;
    jobId?: string;
    buildingType?: string;
    location?: string;
  } | null;
  customerId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  assignedTo?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string | null;
  createdBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string | null;
  meetingLink?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CalendarEventsFilter = {
  startDate?: string;
  endDate?: string;
  status?: "scheduled" | "completed" | "cancelled" | "all" | string;
  kind?: "meeting" | "followup" | "all" | string;
  userId?: string;
};

export type CalendarEventsResponse = {
  success: boolean;
  message?: string;
  data: {
    events?: CalendarEventItem[];
    [key: string]: unknown;
  } | CalendarEventItem[];
};

export type UpdateCalendarEventReminderPayload = {
  reminderMinutes?: number;
  reminderSms?: boolean;
  reminderEmail?: boolean;
};

export type UpdateCalendarEventReminderResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

export async function getCalendarEventsProvider(filters?: CalendarEventsFilter) {
  const params: Record<string, string> = {};

  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  if (filters?.status && filters.status !== "all") params.status = filters.status;
  if (filters?.kind && filters.kind !== "all") params.kind = filters.kind;
  if (filters?.userId) params.userId = filters.userId;

  const response = await apiClient.get<CalendarEventsResponse>(
    "/api/calendar/events",
    { params }
  );

  return response.data;
}

export async function updateCalendarEventReminderProvider(
  eventId: string,
  payload: UpdateCalendarEventReminderPayload
) {
  const response = await apiClient.put<UpdateCalendarEventReminderResponse>(
    `/api/calendar/events/${encodeURIComponent(eventId)}/reminder`,
    payload
  );

  return response.data;
}
