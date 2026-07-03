import { apiClient } from "@/modules/auth/auth.api";

export type CreateMeetingPayload = {
  customerId: string;
  leadId: string;
  title: string;
  meetingTime: string;
  duration: number;
  mode: "online" | "in-person";
  meetingLink: string;
  notes?: string;
  assignedTo?: string;
};

export type UpdateMeetingPayload = {
  title?: string;
  meetingTime?: string;
  duration?: number;
  mode?: "online" | "in-person";
  meetingLink?: string;
  notes?: string;
  assignedTo?: string;
  status?: "scheduled" | "cancelled" | "completed";
  customerId?: string;
  leadId?: string;
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
        [key: string]: any;
      };
  title: string;
  createdBy: MeetingUserRef;
  assignedTo: MeetingUserRef;
  meetingTime: string;
  duration: number;
  mode: "online" | "in-person";
  meetingLink?: string;
  notes?: string;
  status: "scheduled" | "cancelled" | "completed" | string;
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
