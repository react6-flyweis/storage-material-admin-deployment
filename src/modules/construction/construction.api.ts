import { apiClient } from "@/modules/auth/auth.api";

export interface ProjectCalendarItem {
  _id: string;
  location?: string;
  jobId?: string;
  projectName?: string;
  lifecycleStatus?: string;
}

export interface ProjectCalendarDelivery {
  _id?: string;
  deliveryId?: string;
  description?: string;
  deliveryNumber?: string;
  status?: string;
  deliveryDate?: string;
  project?: {
    projectName?: string;
    jobId?: string;
    location?: string;
  };
}

export interface ProjectsCalendarStats {
  total: number;
  active: number;
  upcoming: number;
  completed: number;
}

export interface ProjectsCalendarResponse {
  success: boolean;
  message: string;
  data: {
    stats: ProjectsCalendarStats;
    projects: ProjectCalendarItem[];
    deliveries: ProjectCalendarDelivery[];
  };
}

export async function getProjectsCalendar(month: number, year: number) {
  const response = await apiClient.get<ProjectsCalendarResponse>(
    `/admin/construction/projects-calendar`,
    {
      params: { month, year },
    }
  );
  return response.data;
}
