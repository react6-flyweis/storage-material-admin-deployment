import { apiClient } from "@/modules/auth/auth.api";

export interface SavingsStats {
  totalSavingsThisMonth: number;
  totalLossThisMonth: number;
}

export interface SavingsItem {
  projectId?: string;
  projectName: string;
  smdtCost: number;
  actualCost: number;
  savings: number;
  savingsPct: number;
  profitLoss: "Profit" | "Loss" | string;
  status: "Good" | "Over Budget" | string;
}

export interface GetSavingsParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  projectId?: string;
}

export interface GetSavingsResponse {
  success: boolean;
  message: string;
  data: {
    stats: SavingsStats;
    savings: SavingsItem[];
    total: number;
    page?: number;
    limit?: number;
  };
}

export async function getSavingsProvider(
  params?: GetSavingsParams
): Promise<GetSavingsResponse> {
  const response = await apiClient.get<GetSavingsResponse>(
    "/api/admin/plant/savings",
    {
      params,
    }
  );
  return response.data;
}

export async function exportSavingsProvider(
  params?: Omit<GetSavingsParams, "page" | "limit">
): Promise<Blob> {
  const response = await apiClient.get(
    "/api/admin/plant/savings/export",
    {
      params,
      responseType: "blob",
    }
  );
  return response.data;
}
