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

export interface FreightLoadProject {
  _id: string;
  jobId: string;
  projectName: string;
}

export interface FreightLoadCustomer {
  _id: string;
  name: string;
  email: string;
}

export interface FreightLoadShipperVendor {
  _id: string;
  vendorName: string;
  vendorCode: string;
}

export interface FreightLoadCarrier {
  _id: string;
  carrierName: string;
}

export interface FreightLoadDimensions {
  lengthFeet: number;
  widthFeet: number;
  heightFeet: number;
}

export interface FreightLoadSize {
  weight: number;
  dimensions: FreightLoadDimensions;
  packageCount: number;
}

export interface FreightLoadPoc {
  receivingPoc: string;
  pickupContactPhone: string;
}

export interface FreightLoad {
  _id: string;
  requestId: string;
  deliveryNumber: string;
  status: string;
  deliveryTime?: string;
  project: FreightLoadProject;
  customer?: FreightLoadCustomer;
  shipperVendor?: FreightLoadShipperVendor;
  carrier?: FreightLoadCarrier;
  description: string;
  pickupLocation: string;
  deliveryLocation: string;
  awardedBidAmount?: number;
  loadSize?: FreightLoadSize;
  poc?: FreightLoadPoc;
  equipment?: string[];
  pickupDate: string;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetFreightLoadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  projectId?: string;
  customerId?: string;
  carrierId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface GetFreightLoadsResponse {
  success: boolean;
  message: string;
  data: {
    requests: FreightLoad[];
    total: number;
    page: number;
    limit: number;
  };
}

export async function getFreightLoads(
  params?: GetFreightLoadsParams
): Promise<GetFreightLoadsResponse> {
  const response = await apiClient.get<GetFreightLoadsResponse>(
    "/api/admin/plant/deliveries/freight",
    { params }
  );
  return response.data;
}

