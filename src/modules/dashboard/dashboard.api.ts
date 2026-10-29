import { apiClient } from "@/modules/auth/auth.api";
import type {
  DashboardOverviewResponse,
  DashboardQueryParams,
  DashboardSearchResponse,
} from "./dashboard.types";

export * from "./dashboard.types";

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

/**
 * Fetch complete dashboard overview matching Figma screens
 * Preferred method: one unified overview call
 */
export async function getDashboardOverview(params?: DashboardQueryParams) {
  const response = await apiClient.get<DashboardOverviewResponse>(
    "/api/admin/dashboard/overview",
    {
      params: {
        period: params?.period ?? "month",
        startDate: params?.startDate,
        endDate: params?.endDate,
        limit: params?.limit,
      },
    },
  );

  return response.data;
}

/**
 * Unified admin dashboard global search
 */
export async function getDashboardSearch(q: string, limit: number = 20) {
  const response = await apiClient.get<DashboardSearchResponse>(
    "/api/admin/dashboard/search",
    {
      params: { q, limit },
    },
  );

  return response.data;
}

/**
 * Legacy stats endpoint kept for backwards compatibility
 */
export async function getLeadStatsProvider(startDate?: string, endDate?: string) {
  const response = await apiClient.get<LeadStatsResponse>(
    "/api/admin/dashboard/lead-stats",
    {
      params: { startDate, endDate },
    },
  );

  return response.data;
}
