import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFollowUpAiScriptsProvider,
  getFollowUpStatsProvider,
  getUpcomingFollowUpsProvider,
  createFollowUpProvider,
  getFollowUpActivitySummaryProvider,
  getFollowUpActivityDetailProvider,
  getTemperatureTransitionSummaryProvider,
  getTemperatureTransitionsListProvider,
} from "./followups.api";
import type {
  FollowUpActivityDetailOptions,
  FollowUpActivityFilters,
  FollowUpKind,
  TemperatureTransitionsQueryParams,
} from "./followups.api";

export function useFollowUpStatsQuery() {
  return useQuery({
    queryKey: ["followups", "admin", "stats"],
    queryFn: getFollowUpStatsProvider,
    staleTime: 60 * 1000,
  });
}

export function useUpcomingFollowUpsQuery() {
  return useQuery({
    queryKey: ["followups", "admin", "upcoming"],
    queryFn: getUpcomingFollowUpsProvider,
    staleTime: 60 * 1000,
  });
}

export function useFollowUpAiScriptsQuery() {
  return useQuery({
    queryKey: ["followups", "admin", "ai-script"],
    queryFn: getFollowUpAiScriptsProvider,
    staleTime: 60 * 1000,
  });
}

export function useCreateFollowUpMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createFollowUpProvider,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["followups", "admin", "upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["followups", "admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["followups", "activity"] });
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ["leads", "detail", variables.leadId] });
        queryClient.invalidateQueries({ queryKey: ["lead", "detail", variables.leadId] });
      }
    },
  });
}

export function useFollowUpActivitySummaryQuery(
  filters: FollowUpActivityFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["followups", "activity", "summary", filters],
    queryFn: () => getFollowUpActivitySummaryProvider(filters),
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
    retry: 1,
  });
}

export function useFollowUpActivityDetailQuery(
  leadId: string,
  kind: FollowUpKind = "manual",
  page = 1,
  limit = 20,
  optionsOrEnabled?: FollowUpActivityDetailOptions | boolean,
  enabledParam?: boolean
) {
  const options =
    typeof optionsOrEnabled === "object" ? optionsOrEnabled : undefined;
  const enabled =
    typeof optionsOrEnabled === "boolean"
      ? optionsOrEnabled
      : (enabledParam ?? true);

  return useQuery({
    queryKey: [
      "followups",
      "activity",
      "detail",
      leadId,
      kind,
      page,
      limit,
      options?.startDate,
      options?.endDate,
      options?.transitionState,
    ],
    queryFn: () =>
      getFollowUpActivityDetailProvider(leadId, kind, page, limit, options),
    enabled: Boolean(leadId) && enabled,
    staleTime: 30 * 1000,
  });
}

export function useTemperatureTransitionSummaryQuery(
  startDate?: string,
  endDate?: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["followups", "temperature-summary", startDate, endDate],
    queryFn: () => getTemperatureTransitionSummaryProvider(startDate, endDate),
    enabled: enabled && Boolean(startDate || endDate),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useTemperatureTransitionsQuery(
  params: TemperatureTransitionsQueryParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: ["followups", "temperature-transitions", params],
    queryFn: () => getTemperatureTransitionsListProvider(params),
    enabled: enabled && Boolean(params.from && params.to),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

