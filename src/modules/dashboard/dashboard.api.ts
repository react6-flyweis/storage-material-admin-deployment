import { apiClient } from "@/modules/auth/auth.api";

export type LeadStatsData = {
  totalLeads: number;
  confirmedLeads: number;
  pipelineValue: number;
  monthlyRevenue: number;
  unreadMessages: number;
};

export type LeadStatsResponse = {
  success: boolean;
  message: string;
  data: LeadStatsData;
};

export async function getLeadStatsProvider(startDate?: string, endDate?: string) {
  const response = await apiClient.get<LeadStatsResponse>(
    "/api/admin/dashboard/lead-stats",
    {
      params: { startDate, endDate },
    },
  );

  return response.data;
}
