import { apiClient } from "@/modules/auth/auth.api";

export interface FreightStatsData {
  totalLoads: number;
  requestedLoads: number;
  bidsPending: number;
  inTransit: number;
  delivered: number;
  totalSpent: number;
}

export interface FreightStatsResponse {
  success: boolean;
  message: string;
  data: FreightStatsData;
}

export async function getFreightStats(): Promise<FreightStatsResponse> {
  const response = await apiClient.get<FreightStatsResponse>(
    "/api/admin/plant/deliveries/freight/stats"
  );
  return response.data;
}
