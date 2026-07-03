import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFollowUpAiScriptsProvider,
  getFollowUpStatsProvider,
  getUpcomingFollowUpsProvider,
  createFollowUpProvider,
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
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ["leads", "detail", variables.leadId] });
        queryClient.invalidateQueries({ queryKey: ["lead", "detail", variables.leadId] });
      }
    },
  });
}
