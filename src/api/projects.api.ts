import { apiClient } from "@/modules/auth/auth.api";
import { getLeadsProvider } from "@/modules/leads/leads.api";
import type { Project } from "@/types/projects.types";
import {
  getDeliveries,
  type CalendarQueryParams,
  type ProjectsCalendarResponse,
  type GetDeliveriesParams,
} from "@/modules/construction/construction.api";

export type { CalendarQueryParams, GetDeliveriesParams };

export const getCalendarApi = (params: CalendarQueryParams) => {
  return apiClient.get<ProjectsCalendarResponse>(
    "/api/admin/construction/projects-calendar",
    { params }
  );
};

export const getDeliveriesApi = getDeliveries;

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  hasDelivery?: boolean;
}

export async function getProjectsApi(params?: GetProjectsParams) {
  const res = await getLeadsProvider(params?.page || 1, params?.limit || 100);
  const leads = res?.data?.leads || [];
  const projects: Project[] = leads.map((l) => ({
    ...l,
    _id: l._id,
    leadId: l._id,
    projectName: l.projectName,
    buildingType: l.buildingType,
    location: l.location,
    jobId: (l as unknown as { jobId?: string }).jobId,
    lifecycleStatus: l.lifecycleStatus,
  }));

  return {
    data: {
      data: {
        projects,
        total: res?.data?.total || projects.length,
      },
    },
  };
}
