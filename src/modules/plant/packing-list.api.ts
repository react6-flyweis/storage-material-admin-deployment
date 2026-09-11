import { apiClient } from "@/modules/auth/auth.api";

export type PackingListProject = {
  leadId: string;
  projectId: string;
  jobId: string;
  projectName: string;
  customerName: string;
  buildingType: string;
  location: string;
  packingListPlanId: string;
  listGeneratedAt: string;
  totalPackingList: number;
  status: string;
  updatedAt: string;
};

export type GetPackingListProjectsData = {
  projects: PackingListProject[];
  total: number;
};

export type GetPackingListProjectsResponse = {
  success: boolean;
  message: string;
  data: GetPackingListProjectsData;
};

export async function getPackingListProjects(
  page = 1,
  limit = 20,
  search?: string
): Promise<GetPackingListProjectsResponse> {
  const response = await apiClient.get<GetPackingListProjectsResponse>(
    "/api/admin/plant/packing-lists/projects",
    {
      params: { page, limit, search },
    }
  );
  return response.data;
}

export type PackingListCustomer = {
  _id: string;
  customerId: string;
  name: string;
  email: string;
};

export type PackingListProjectDetails = {
  _id: string;
  leadId: string;
  projectId: string;
  jobId: string;
  projectName: string;
  buildingType: string;
  location: string;
  lifecycleStatus: string;
  customer: PackingListCustomer;
};

export type PackingListPlan = {
  _id: string;
  leadId: string;
  bundlePlanId: string;
  planNumber: string;
  status: string;
  totalPackingLists: number;
  totalBundles: number;
  totalWeight: number;
  maxLengthFeet: number;
  truckSummary: {
    semi53Count: number;
    hotshot40Count: number;
    totalTrucks: number;
  };
  warnings: string[];
};

export type PackingListItem = {
  _id: string;
  packingListNo: string;
  truckNo: string;
  truckType: string;
  truckLabel: string;
  totalWeight: number;
  totalBundles: number;
  status: string;
  bundleIds: string[];
};

export type PackingListBundle = {
  _id: string;
  bundleNo: string;
  bundleType: string;
  title: string;
  status: string;
  packingListId: string;
  totalQty: number;
  totalWeight: number;
  maxLengthFeet: number;
  loadSequence: number;
  warnings: string[];
};

export type PackingListPlanSummary = {
  totalWeight: number;
  totalBundles: number;
  totalPackingLists: number;
  truckSummary: {
    semi53Count: number;
    hotshot40Count: number;
    totalTrucks: number;
  };
  warnings: string[];
};

export type GetPackingListPlanResponse = {
  success: boolean;
  message: string;
  data: {
    project: PackingListProjectDetails;
    packingListPlan: PackingListPlan;
    packingLists: PackingListItem[];
    bundles: PackingListBundle[];
    summary: PackingListPlanSummary;
  };
};

export async function getPackingListPlan(
  packingListPlanId: string
): Promise<GetPackingListPlanResponse> {
  const response = await apiClient.get<GetPackingListPlanResponse>(
    `/api/admin/plant/packing-list-plans/${encodeURIComponent(packingListPlanId)}`
  );
  return response.data;
}

export type PackingListDetailBundle = {
  _id: string;
  bundleNo: string;
  bundleType: string;
  title: string;
  totalQty: number;
  totalWeight: number;
  maxLengthFeet: number;
  loadSequence: number;
  warnings: string[];
};

export type PackingListDetailData = {
  packingList: {
    _id: string;
    packingListPlanId: string;
    bundlePlanId: string;
    leadId: string;
    packingListNo: string;
    truckNo: string;
    truckType: string;
    truckLabel: string;
    totalBundles: number;
    totalItems: number;
    totalWeight: number;
    maxLengthFeet: number;
    bundleIds: string[];
    loadLayout: {
      bottomLayerBundleIds: string[];
      middleLayerBundleIds: string[];
      topLayerBundleIds: string[];
      loadingNotes: string;
    };
    warnings: string[];
    status: string;
    notes: string;
  };
  truckInfo: {
    truckType: string;
    truckLabel: string;
    totalWeight: number;
    maxTruckWeight: number;
    hardMaxTruckWeight: number;
    maxTruckLengthFeet: number;
  };
  bundles: PackingListDetailBundle[];
  loadLayout: {
    bottomLayerBundleIds: string[];
    middleLayerBundleIds: string[];
    topLayerBundleIds: string[];
    loadingNotes: string;
  };
  planStatus: string;
};

export type GetPackingListDetailsResponse = {
  success: boolean;
  message: string;
  data: PackingListDetailData;
};

export async function getPackingListDetails(
  packingListId: string
): Promise<GetPackingListDetailsResponse> {
  const response = await apiClient.get<GetPackingListDetailsResponse>(
    `/api/admin/plant/packing-lists/${encodeURIComponent(packingListId)}`
  );
  return response.data;
}


