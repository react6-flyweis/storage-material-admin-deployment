import { apiClient } from "@/modules/auth/auth.api";

/**
 * Meeting mode as stored by the API. Requests may still send `"in-person"`;
 * the backend normalises it to `"offline"`.
 */
export type MeetingMode = "online" | "offline";
export type MeetingModeInput = MeetingMode | "in-person";

export type MeetingStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "rescheduled";

/**
 * Create body. For the default Zoom flow on online meetings, leave
 * `meetingLink` out — the backend creates the Zoom meeting and returns the
 * join URL. Only send `meetingLink` when staff chose "Use my own link".
 */
export type CreateMeetingPayload = {
  customerId: string;
  leadId?: string;
  title: string;
  meetingTime: string;
  duration?: number;
  mode: MeetingModeInput;
  meetingLink?: string;
  notes?: string;
  assignedTo?: string;
  reminderMinutes?: number;
  reminderSms?: boolean;
  reminderEmail?: boolean;
};

/** Edit body — send only the fields that changed. */
export type UpdateMeetingPayload = {
  title?: string;
  meetingTime?: string;
  duration?: number;
  mode?: MeetingModeInput;
  /** Non-empty overrides the link; `""` does not clear a saved link. */
  meetingLink?: string;
  notes?: string;
  assignedTo?: string;
  status?: MeetingStatus;
  customerId?: string;
  leadId?: string;
  reminderMinutes?: number;
  reminderSms?: boolean;
  reminderEmail?: boolean;
};

export type CreateMeetingResponse = {
  success: boolean;
  message: string;
  data: {
    meeting: AdminMeeting;
  };
};

export type UpdateMeetingResponse = {
  success: boolean;
  message: string;
  data: {
    meeting: AdminMeeting;
  };
};

export type DeleteMeetingResponse = {
  success: boolean;
  message: string;
};

export type GetMeetingResponse = {
  success: boolean;
  message: string;
  data: {
    meeting: AdminMeeting;
  };
};

export type MeetingUserRef =
  | string
  | {
      _id: string;
      name?: string;
      firstName?: string;
      email?: string;
    };

export type AdminMeeting = {
  _id: string;
  customerId:
    | string
    | {
        _id: string;
        customerId?: string;
        firstName?: string;
        email?: string;
      };
  leadId: 
    | string
    | {
        _id: string;
        [key: string]: unknown;
      };
  title: string;
  createdBy: MeetingUserRef;
  assignedTo: MeetingUserRef;
  meetingTime: string;
  duration: number;
  mode: MeetingModeInput;
  /** Public join URL — safe to share with the customer. */
  meetingLink?: string;
  /** Host start URL — staff only. */
  zoomStartUrl?: string;
  zoomMeetingId?: string;
  notes?: string;
  status: MeetingStatus | string;
  reminderMinutes?: number;
  reminderSms?: boolean;
  reminderEmail?: boolean;
  reminderSentAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GetAdminMeetingsData = {
  meeting?: AdminMeeting;
  meetings?: AdminMeeting[];
};

export type GetAdminMeetingsResponse = {
  success: boolean;
  message: string;
  data: GetAdminMeetingsData;
};

export async function createMeetingProvider(payload: CreateMeetingPayload) {
  const response = await apiClient.post<CreateMeetingResponse>(
    "/api/admin/meetings",
    payload,
  );

  return response.data;
}

export async function getAdminMeetingsProvider(filters?: { search?: string; status?: string; leadId?: string }) {
  const params: Record<string, string> = {};
  
  if (filters?.search) {
    params.search = filters.search;
  }
  
  if (filters?.status && filters.status !== "all") {
    params.status = filters.status;
  }

  if (filters?.leadId) {
    params.leadId = filters.leadId;
  }

  const response = await apiClient.get<GetAdminMeetingsResponse>(
    "/api/admin/meetings",
    { params }
  );

  return response.data;
}

export async function completeMeetingProvider(meetingId: string) {
  const response = await apiClient.put(
    `/api/admin/meetings/${encodeURIComponent(meetingId)}/complete`
  );

  return response.data;
}

export async function getMeetingByIdProvider(meetingId: string) {
  const response = await apiClient.get<GetMeetingResponse>(
    `/api/admin/meetings/${encodeURIComponent(meetingId)}`
  );

  return response.data;
}

export async function updateMeetingProvider(meetingId: string, payload: UpdateMeetingPayload) {
  const response = await apiClient.put<UpdateMeetingResponse>(
    `/api/admin/meetings/${encodeURIComponent(meetingId)}`,
    payload
  );

  return response.data;
}

/** Cancelling also deletes the Zoom meeting server-side. */
export async function cancelMeetingProvider(meetingId: string) {
  return updateMeetingProvider(meetingId, { status: "cancelled" });
}
