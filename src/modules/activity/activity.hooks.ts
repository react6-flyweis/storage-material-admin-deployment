import { useMutation } from "@tanstack/react-query";
import { logPageVisit, type PageVisitPayload } from "./activity.api";

export function useLogPageVisitMutation() {
  return useMutation({
    mutationFn: (payload: PageVisitPayload) => logPageVisit(payload),
  });
}
