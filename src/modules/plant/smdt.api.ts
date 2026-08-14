import { apiClient } from "@/modules/auth/auth.api";

export interface CostVersion {
  _id: string;
  name: string;
  effectiveDate: string;
  uploadedAt: string;
  isActive: boolean;
}

export interface SmdtStats {
  activeVersion: CostVersion | null;
  totalItems: number;
  totalItemCost: number;
  newlyAdded: number;
  lastImportInserted: number;
  lastImportUpdated: number;
}

export interface SmdtStatsResponse {
  success: boolean;
  message: string;
  data: SmdtStats;
}

export interface SmdtItem {
  _id: string;
  costVersionId: string;
  category: string;
  partName: string;
  partNameNormalized: string;
  partColor: string;
  partColorNormalized: string;
  costUnit: string;
  mbsCost: number;
  currentMarketCost: number | null;
  laborCost: number;
  additionalCost: number;
  materialCost: number;
  isFrameType: boolean;
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetSmdtParams {
  category?: string;
  isFrameType?: boolean | string;
  isActive?: "true" | "false" | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetSmdtResponse {
  success: boolean;
  message: string;
  data: {
    activeVersion: CostVersion | null;
    items: SmdtItem[];
    total: number;
    page: number;
    limit: number;
    categories: string[];
  };
}

export async function getSmdtStatsProvider(): Promise<SmdtStatsResponse> {
  const response = await apiClient.get<SmdtStatsResponse>("/api/admin/plant/smdt/stats");
  return response.data;
}

export async function getSmdtItemsProvider(
  params?: GetSmdtParams
): Promise<GetSmdtResponse> {
  const response = await apiClient.get<GetSmdtResponse>(
    "/api/admin/plant/smdt",
    {
      params,
    }
  );
  return response.data;
}

export interface CreateSmdtItemRequest {
  category: string;
  partName: string;
  partColor?: string;
  costUnit: string;
  mbsCost: number;
  currentMarketCost: number;
  laborCost?: number;
  additionalCost?: number;
  materialCost?: number;
  description: string;
}

export interface CreateSmdtItemResponse {
  success: boolean;
  message: string;
  data: {
    item: SmdtItem;
  };
}

export interface UpdateSmdtItemRequest {
  category?: string;
  partName?: string;
  partColor?: string;
  costUnit?: string;
  mbsCost?: number;
  currentMarketCost?: number | null;
  laborCost?: number;
  additionalCost?: number;
  materialCost?: number;
  extraMinCost?: number | null;
  extraMaxCost?: number | null;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSmdtItemResponse {
  success: boolean;
  message: string;
  data: {
    item: SmdtItem;
  };
}

export async function createSmdtItemProvider(
  payload: CreateSmdtItemRequest
): Promise<CreateSmdtItemResponse> {
  const response = await apiClient.post<CreateSmdtItemResponse>(
    "/api/admin/plant/smdt",
    payload
  );
  return response.data;
}

export async function updateSmdtItemProvider(
  itemId: string,
  payload: UpdateSmdtItemRequest
): Promise<UpdateSmdtItemResponse> {
  const response = await apiClient.put<UpdateSmdtItemResponse>(
    `/api/admin/plant/smdt/${encodeURIComponent(itemId)}`,
    payload
  );
  return response.data;
}

export async function exportSmdtExcelProvider(
  params?: Omit<GetSmdtParams, "page" | "limit">
): Promise<Blob> {
  const response = await apiClient.get(
    "/api/admin/plant/smdt/export/excel",
    {
      params,
      responseType: "blob",
    }
  );
  return response.data;
}


