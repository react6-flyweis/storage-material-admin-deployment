import { apiClient } from "@/modules/auth/auth.api";

export type PlantProjectCustomer = {
  _id?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
};

export type PlantProjectSales = {
  _id?: string;
  name?: string;
  email?: string;
};

export type PlantProject = {
  _id: string;
  id?: string;
  projectId?: string;
  jobId?: string;
  projectName?: string;
  name?: string;
  customerId?: PlantProjectCustomer | string;
  customerName?: string;
  buildingType?: string;
  location?: string;
  assignedSales?: PlantProjectSales | null;
  assignedTo?: string | null;
  assignedToName?: string;
  quoteValue?: number;
  budget?: number;
  totalCost?: number;
  lifecycleStatus?: string;
  status?: string;
  leadScoring?: {
    score?: number;
  };
  score?: number;
  progress?: number;
  progressStep?: string;
  chatCount?: number;
  unreadMessages?: number;
  createdAt: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
};

export type GetPlantProjectsData = {
  projects?: PlantProject[];
  leads?: PlantProject[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type GetPlantProjectsResponse = {
  success: boolean;
  message: string;
  data: GetPlantProjectsData;
};

export type PlantProjectsStatsData = {
  totalProjects?: number;
  activeProjects?: number;
  pendingCustomerApproval?: number;
  cancelledProjects?: number;

};

export type PlantProjectsStatsResponse = {
  success: boolean;
  message: string;
  data: PlantProjectsStatsData;
};

export type GetPlantProjectsParams = {
  search?: string;
  projectId?: string;
  customerId?: string;
  buildingType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  lifecycleStatus?: string;
};

export async function getPlantProjectsProvider(
  params: GetPlantProjectsParams
): Promise<GetPlantProjectsResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params.page !== undefined) queryParams.page = params.page;
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.search) queryParams.search = params.search;
  if (params.projectId && params.projectId !== "all") queryParams.projectId = params.projectId;
  if (params.customerId && params.customerId !== "all") queryParams.customerId = params.customerId;
  if (params.buildingType && params.buildingType !== "all") queryParams.buildingType = params.buildingType;
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;
  if (params.lifecycleStatus && params.lifecycleStatus !== "all") queryParams.lifecycleStatus = params.lifecycleStatus;

  const response = await apiClient.get<GetPlantProjectsResponse>(
    "/api/admin/plant/projects",
    { params: queryParams }
  );

  return response.data;
}

export async function getPlantProjectsStatsProvider(
  startDate?: string,
  endDate?: string
): Promise<PlantProjectsStatsResponse> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<PlantProjectsStatsResponse>(
    "/api/admin/plant/projects/stats",
    { params }
  );

  return response.data;
}
