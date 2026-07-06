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
