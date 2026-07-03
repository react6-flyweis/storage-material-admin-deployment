import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMeetingProvider,
  getAdminMeetingsProvider,
  completeMeetingProvider,
  getMeetingByIdProvider,
  updateMeetingProvider,
  type CreateMeetingPayload,
  type UpdateMeetingPayload,
} from "./meetings.api";

export function useCreateMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) =>
      createMeetingProvider(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useMeetingsQuery(filters?: { search?: string; status?: string; leadId?: string }) {
  return useQuery({
    queryKey: ["meetings", "admin-list", filters],
    queryFn: () => getAdminMeetingsProvider(filters),
    staleTime: 60 * 1000,
  });
}

export function useCompleteMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => completeMeetingProvider(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useMeetingDetailQuery(meetingId: string) {
  return useQuery({
    queryKey: ["meetings", "detail", meetingId],
    queryFn: () => getMeetingByIdProvider(meetingId),
    staleTime: 60 * 1000,
    enabled: Boolean(meetingId),
  });
}

export function useUpdateMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, payload }: { meetingId: string; payload: UpdateMeetingPayload }) =>
      updateMeetingProvider(meetingId, payload),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings", "detail", meetingId] });
    },
  });
}
