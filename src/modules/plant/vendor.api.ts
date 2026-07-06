import { apiClient } from "@/modules/auth/auth.api";

export interface PlantVendor {
  _id: string;
  vendorCode: string;
  vendorName: string;
  contactName: string;
  email: string;
  phone: string;
  materialTypes: string[];
  vendorType: string;
  status: "active" | "inactive";
  pickupLocation: string;
  activeOrders: number;
  totalOrders: number;
}

export interface GetPlantVendorsParams {
  search?: string;
  materialType?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface GetPlantVendorsResponse {
  success: boolean;
  message: string;
  data: {
    vendors: PlantVendor[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreatePlantVendorRequest {
  vendorName: string;
  email: string;
  phone: string;
  contactName: string;
  vendorCode: string;
  yearsWithCompany?: string | number;
  serviceCategory?: string;
  vendorType?: string;
  materialTypes?: string[];
  address?: {
    placeNumber?: string;
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    gpsCoordinates?: string;
  };
  documents?: { name: string; url: string; size?: number }[];
  internalNotes?: string;
}

export interface CreatePlantVendorResponse {
  success: boolean;
  message: string;
  data: PlantVendor;
}

export interface PlantVendorDetail {
  _id: string;
  vendorCode: string;
  vendorName: string;
  contactName: string;
  email: string;
  phone: string;
  yearsWithCompany?: number;
  serviceCategory?: string;
  vendorType?: string;
  materialTypes: string[];
  address?: {
    placeNumber?: string;
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    gpsCoordinates?: {
      lat: number;
      lng: number;
    };
  };
  documents?: { name: string; url: string; size?: number }[];
  internalNotes?: string;
  status: "active" | "inactive";
  pickupLocation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlantVendorOrderHistoryItem {
  _id: string;
  projectName: string;
  jobId: string;
  quoteValue: number;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  sentAt?: string;
}

export interface GetPlantVendorResponse {
  success: boolean;
  message: string;
  data: {
    vendor: PlantVendorDetail;
    stats?: {
      totalOrders: number;
      completedDeliveries: number;
      activeOrders: number;
      bidsSubmitted: number;
      bidsSent: number;
    };
    orderHistory?: PlantVendorOrderHistoryItem[];
  };
}

export interface UpdatePlantVendorRequest {
  vendorName?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  vendorCode?: string;
  yearsWithCompany?: string | number;
  serviceCategory?: string;
  vendorType?: string;
  materialTypes?: string[];
  address?: {
    placeNumber?: string;
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    gpsCoordinates?: string;
  };
  documents?: { name: string; url: string; size?: number }[];
  internalNotes?: string;
  status?: "active" | "inactive";
}

export interface UpdatePlantVendorResponse {
  success: boolean;
  message: string;
  data: {
    vendor: PlantVendorDetail;
  };
}

export async function getPlantVendorsProvider(
  params?: GetPlantVendorsParams
): Promise<GetPlantVendorsResponse> {
  const response = await apiClient.get<GetPlantVendorsResponse>(
    "/api/admin/plant/vendors",
    {
      params,
    }
  );
  return response.data;
}

export async function createPlantVendorProvider(
  payload: CreatePlantVendorRequest
): Promise<CreatePlantVendorResponse> {
  const response = await apiClient.post<CreatePlantVendorResponse>(
    "/api/admin/plant/vendors",
    payload
  );
  return response.data;
}

export async function getPlantVendorProvider(
  vendorId: string
): Promise<GetPlantVendorResponse> {
  const response = await apiClient.get<GetPlantVendorResponse>(
    `/api/admin/plant/vendors/${encodeURIComponent(vendorId)}`
  );
  return response.data;
}

export async function updatePlantVendorProvider(
  vendorId: string,
  payload: UpdatePlantVendorRequest
): Promise<UpdatePlantVendorResponse> {
  const response = await apiClient.put<UpdatePlantVendorResponse>(
    `/api/admin/plant/vendors/${encodeURIComponent(vendorId)}`,
    payload
  );
  return response.data;
}
