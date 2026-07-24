import { apiClient } from "@/modules/auth/auth.api";

export type LoadPlanningProject = {
  leadId: string;
  projectId: string;
  jobId: string;
  projectName: string;
  customerName: string;
  buildingType: string;
  location: string;
  bundlePlanId: string | null;
  fileReceivedAt: string;
  totalBundles: number;
  totalLoads: number;
  status: string;
  updatedAt: string;
};

export type GetLoadPlanningProjectsData = {
  projects: LoadPlanningProject[];
  total: number;
};

export type GetLoadPlanningProjectsResponse = {
  success: boolean;
  message: string;
  data: GetLoadPlanningProjectsData;
};

export async function getLoadPlanningProjectsProvider(
  page = 1,
  limit = 20,
  search?: string
): Promise<GetLoadPlanningProjectsResponse> {
  const response = await apiClient.get<GetLoadPlanningProjectsResponse>(
    "/api/admin/plant/load-planning/projects",
    {
      params: { page, limit, search },
    }
  );
  return response.data;
}

export type BundlePlan = {
  _id: string;
  leadId: string;
  shipperRequestId: string;
  vendorId: string;
  planNumber: string;
  status: string;
  totalSourceItems: number;
  totalBundles: number;
  totalWeight: number;
  maxLengthFeet: number;
  warnings: string[];
  notes: string;
  generatedBy: string;
  confirmedBy: string;
  confirmedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Bundle = {
  _id: string;
  bundleNo: string;
  bundleType: string;
  title: string;
  totalQty: number;
  totalWeight: number;
  maxLengthFeet: number;
  itemCount: number;
  status: string;
  packingListId: string;
  warnings: string[];
  loadSequence: number;
};

export type BundlePlanSummary = {
  totalBundles: number;
  totalWeight: number;
  maxLengthFeet: number;
  warnings: string[];
};

export type GetBundlePlanDetailsResponse = {
  success: boolean;
  message: string;
  data: {
    bundlePlan: BundlePlan;
    bundles: Bundle[];
    summary: BundlePlanSummary;
  };
};

export async function getBundlePlanDetails(
  bundlePlanId: string
): Promise<GetBundlePlanDetailsResponse> {
  const response = await apiClient.get<GetBundlePlanDetailsResponse>(
    `/api/admin/plant/bundle-plans/${encodeURIComponent(bundlePlanId)}`
  );
  return response.data;
}

