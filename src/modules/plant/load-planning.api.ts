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

export type GenerateBundlePlanResponse = {
  bundlePlan: BundlePlan;
  bundles: Bundle[];
  summary: BundlePlanSummary;
};

export async function generateBundlePlanProvider(requestId: string): Promise<GenerateBundlePlanResponse> {
  const response = await apiClient.post<{ success: boolean; data: GenerateBundlePlanResponse }>(
    `/api/admin/plant/shipper-requests/${requestId}/bundle-plan/generate`
  );
  return response.data.data;
}

export type GetBundlePlanResponse = {
  bundlePlan: BundlePlan;
  bundles: Bundle[];
  summary: BundlePlanSummary;
};

export async function getBundlePlanProvider(projectId: string): Promise<GetBundlePlanResponse> {
  const response = await apiClient.get<{ success: boolean; data: GetBundlePlanResponse }>(
    `/api/admin/plant/projects/${projectId}/bundle-plan`
  );
  return response.data.data;
}

export type BundleItemDetail = {
  _id: string;
  vendorQuoteLineId: string;
  partCode: string;
  description: string;
  qty: number;
  lengthFeet: number;
  weight: number;
};

export type GetBundleDetailsResponse = {
  bundle: Bundle & { handlingInstruction?: string; notes?: string };
  items: BundleItemDetail[];
};

export async function getBundleDetailsProvider(bundleId: string): Promise<GetBundleDetailsResponse> {
  const response = await apiClient.get<{ success: boolean; data: GetBundleDetailsResponse }>(
    `/api/admin/plant/bundles/${bundleId}`
  );
  return response.data.data;
}

export type ConfirmBundlePlanResponse = {
  bundlePlan: BundlePlan;
};

export async function confirmBundlePlanProvider(bundlePlanId: string): Promise<ConfirmBundlePlanResponse> {
  const response = await apiClient.post<{ success: boolean; data: ConfirmBundlePlanResponse }>(
    `/api/admin/plant/bundle-plans/${bundlePlanId}/confirm`
  );
  return response.data.data;
}

export type EditBundleBody = {
  items: Array<{ _id: string; vendorQuoteLineId: string; qty: number }>;
  handlingInstruction?: string;
  notes?: string;
};

export type EditBundleResponse = {
  bundle: Bundle;
};

export async function editBundleProvider(
  bundleId: string,
  body: EditBundleBody
): Promise<EditBundleResponse> {
  const response = await apiClient.put<{ success: boolean; data: EditBundleResponse }>(
    `/api/admin/plant/bundles/${bundleId}`,
    body
  );
  return response.data.data;
}

export type PackingListPlan = {
  _id: string;
  bundlePlanId: string;
  leadId: string;
  planNumber: string;
  status: string;
  totalPackingLists: number;
  totalBundles: number;
  totalWeight: number;
  maxLengthFeet: number;
  generatedBy: string;
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type GeneratePackingListPlanResponse = {
  packingListPlan: PackingListPlan;
};

export async function generatePackingListPlanProvider(
  bundlePlanId: string
): Promise<GeneratePackingListPlanResponse> {
  const response = await apiClient.post<{ success: boolean; data: GeneratePackingListPlanResponse }>(
    `/api/admin/plant/bundle-plans/${bundlePlanId}/packing-list-plan/generate`
  );
  return response.data.data;
}

export type LoadPlanningStateResponse = {
  leadId: string;
  projectId: string;
  projectName: string;
  bundlePlan: BundlePlan | null;
  packingListPlan: PackingListPlan | null;
  bundles: Bundle[];
  bundleSummary: BundlePlanSummary | null;
};

export async function getLoadPlanningStateProvider(projectId: string): Promise<LoadPlanningStateResponse> {
  const response = await apiClient.get<{ success: boolean; data: LoadPlanningStateResponse }>(
    `/api/admin/plant/projects/${projectId}/load-planning`
  );
  return response.data.data;
}

export type PackingListEntry = {
  _id: string;
  packingListNo: string;
  truckNo: number;
  truckType: string;
  truckLabel: string;
  maxTruckWeight: number;
  totalWeight: number;
  totalItems: number;
  maxLengthFeet: number;
  totalBundles: number;
  bundleIds: string[];
  status: string;
};

export type TruckPlanSummary = {
  totalPackingLists: number;
  totalBundles: number;
  totalWeight: number;
  maxLengthFeet: number;
  truckSummary: {
    semi53Count: number;
    hotshot40Count: number;
    totalTrucks: number;
  };
};

export type TruckPlanResponse = {
  project: {
    leadId: string;
    projectId: string;
    projectName: string;
  };
  packingListPlan: PackingListPlan;
  packingLists: PackingListEntry[];
  summary: TruckPlanSummary;
};

export async function getTruckPlanProvider(projectId: string): Promise<TruckPlanResponse> {
  const response = await apiClient.get<{ success: boolean; data: TruckPlanResponse }>(
    `/api/admin/plant/projects/${projectId}/load-planning/truck-plan`
  );
  return response.data.data;
}

export type ConfirmTruckPlanResponse = {
  packingListPlan: PackingListPlan;
};

export async function confirmTruckPlanProvider(projectId: string): Promise<ConfirmTruckPlanResponse> {
  const response = await apiClient.post<{ success: boolean; data: ConfirmTruckPlanResponse }>(
    `/api/admin/plant/projects/${projectId}/load-planning/truck-plan/confirm`
  );
  return response.data.data;
}

export type FreightAutofillResponse = {
  project: {
    projectId: string;
    projectName: string;
  };
  summary: {
    totalWeight: number;
    maxLengthFeet: number;
    packageCount: number;
    dimensionsText: string;
    materialType: string;
    suggestedPickupLocation: string;
    suggestedDeliveryLocation: string;
  };
};

export async function getFreightAutofillProvider(projectId: string): Promise<FreightAutofillResponse> {
  const response = await apiClient.get<{ success: boolean; data: FreightAutofillResponse }>(
    `/api/admin/plant/projects/${projectId}/freight-autofill`
  );
  return response.data.data;
}

export type GetPackingListPlanResponse = {
  packingListPlan: PackingListPlan;
  packingLists: PackingListEntry[];
};

export async function getPackingListPlanProvider(
  packingListPlanId: string
): Promise<GetPackingListPlanResponse> {
  const response = await apiClient.get<{ success: boolean; data: GetPackingListPlanResponse }>(
    `/api/admin/plant/packing-list-plans/${packingListPlanId}`
  );
  return response.data.data;
}
