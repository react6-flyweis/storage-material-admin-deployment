import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCalendarEventsProvider,
  updateCalendarEventReminderProvider,
  type CalendarEventsFilter,
  type UpdateCalendarEventReminderPayload,
} from "./calendar.api";

export function useCalendarEventsQuery(filters?: CalendarEventsFilter) {
  return useQuery({
    queryKey: ["calendar", "events", filters],
    queryFn: () => getCalendarEventsProvider(filters),
    staleTime: 60 * 1000,
  });
}

export function useUpdateCalendarEventReminderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload: UpdateCalendarEventReminderPayload;
    }) => updateCalendarEventReminderProvider(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar", "events"] });
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}
