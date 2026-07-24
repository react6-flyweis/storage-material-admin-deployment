import { apiClient } from "@/modules/auth/auth.api";

export interface PlantCarrier {
  _id: string;
  carrierCode: string;
  carrierName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  serviceArea: string;
  equipmentTypes: string[];
  status: "active" | "inactive";
  activeBids: number;
  totalBids: number;
  awardedBidCount: number;
  bidWinRate: number;
  avgBid: number;
}

export interface GetPlantCarriersParams {
  search?: string;
  serviceType?: string;
  serviceArea?: string;
  equipmentType?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface GetPlantCarriersResponse {
  success: boolean;
  message: string;
  data: {
    carriers: PlantCarrier[];
    total: number;
    page: number;
    limit: number;
  };
}

export async function getPlantCarriersProvider(
  params?: GetPlantCarriersParams
): Promise<GetPlantCarriersResponse> {
  const response = await apiClient.get<GetPlantCarriersResponse>(
    "/api/admin/plant/carriers",
    {
      params,
    }
  );
  return response.data;
}

export interface CreatePlantCarrierRequest {
  carrierName: string;
  email: string;
  phone: string;
  contactName: string;
  carrierCode?: string;
  serviceType: string;
  serviceArea: string;
  address: {
    placeNumber?: string;
    streetAddress: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    gpsCoordinates?: string;
  };
  fleetEquipment?: Array<{
    equipmentName: string;
    quantity: number;
  }>;
  fleetCapacity: {
    totalVehicleCount: number;
    maximumLoadCapacity: number;
    averageFleetAge: number;
  };
  documents?: Array<{
    name: string;
    url: string;
  }>;
  internalNotes?: string;
}

export interface PlantCarrierDetail {
  _id: string;
  carrierCode: string;
  carrierName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  serviceArea: string;
  address?: {
    placeNumber?: string;
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    gpsCoordinates?: {
      lat: number | null;
      lng: number | null;
    };
  };
  fleetEquipment?: Array<{
    equipmentName: string;
    quantity: number;
  }>;
  fleetCapacity?: {
    totalVehicleCount: number;
    maximumLoadCapacity: number;
    averageFleetAge: number;
  };
  documents?: Array<{
    name: string;
    url: string;
  }>;
  internalNotes?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlantCarrierResponse {
  success: boolean;
  message: string;
  data: {
    carrier: PlantCarrierDetail;
  };
}

export async function createPlantCarrierProvider(
  payload: CreatePlantCarrierRequest
): Promise<CreatePlantCarrierResponse> {
  const response = await apiClient.post<CreatePlantCarrierResponse>(
    "/api/admin/plant/carriers",
    payload
  );
  return response.data;
}

export interface PlantCarrierFreightHistoryItem {
  _id: string;
  deliveryNumber: string;
  projectName: string;
  jobId: string;
  status: string;
  quotedAmount: number;
  currency: string;
  sentAt?: string;
  submittedAt?: string;
  selectedAt?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
}

export interface GetPlantCarrierResponse {
  success: boolean;
  message: string;
  data: {
    carrier: PlantCarrierDetail;
    stats?: {
      totalBids: number;
      activeBids: number;
      awardedBidCount: number;
      bidWinRate: number;
      avgBid: number;
      lastAwardedDate?: string;
      avgResponseTimeHours?: number;
      assignedProjects?: number;
    };
    freightHistory?: PlantCarrierFreightHistoryItem[];
  };
}

export interface UpdatePlantCarrierRequest {
  carrierName?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  carrierCode?: string;
  serviceType?: string;
  serviceArea?: string;
  address?: {
    placeNumber?: string;
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    gpsCoordinates?: string;
  };
  fleetEquipment?: Array<{
    equipmentName: string;
    quantity: number;
  }>;
  fleetCapacity?: {
    totalVehicleCount?: number;
    maximumLoadCapacity?: number;
    averageFleetAge?: number;
  };
  documents?: Array<{
    name: string;
    url: string;
  }>;
  internalNotes?: string;
  status?: "active" | "inactive";
}

export interface UpdatePlantCarrierResponse {
  success: boolean;
  message: string;
  data: {
    carrier: PlantCarrierDetail;
  };
}

export async function getPlantCarrierProvider(
  carrierId: string
): Promise<GetPlantCarrierResponse> {
  const response = await apiClient.get<GetPlantCarrierResponse>(
    `/api/admin/plant/carriers/${encodeURIComponent(carrierId)}`
  );
  return response.data;
}

export async function updatePlantCarrierProvider(
  carrierId: string,
  payload: UpdatePlantCarrierRequest
): Promise<UpdatePlantCarrierResponse> {
  const response = await apiClient.put<UpdatePlantCarrierResponse>(
    `/api/admin/plant/carriers/${encodeURIComponent(carrierId)}`,
    payload
  );
  return response.data;
}


