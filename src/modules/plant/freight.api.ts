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

// --- New Bids & Details API Types & Functions ---

export interface FreightBidItem {
  bidId: string;
  carrierId: string;
  carrierName: string;
  submittedAt: string | null;
  carrierNote: string;
  bidAmount: number;
  status: string;
  isLowest: boolean;
  resubmitCount: number;
  resubmitRequestedAt: string | null;
  requestedBidAmount: number | null;
  resubmitNote: string;
  plantNote: string;
  canRequestResubmit: boolean;
}

export interface GetDeliveryFreightBidsResponse {
  success: boolean;
  message: string;
  data: {
    requestId: string;
    projectName: string;
    status: string;
    stats: {
      totalBids: number;
      submittedBids: number;
      awardedBid: number;
      averageBid: number;
      potentialSavings: number;
    };
    bidRange: {
      lowestBid: {
        bidId: string;
        amount: number;
        carrierId: string;
        carrierName: string;
      };
      highestBid: {
        bidId: string;
        amount: number;
        carrierId: string;
        carrierName: string;
      };
    };
    sort: string;
    bids: FreightBidItem[];
  };
}

export interface DeliveryDetails {
  deliveryId: string;
  deliveryNumber: string;
  status: string;
  statusHistory: Array<{
    status: string;
    changedAt: string;
  }>;
  project: {
    leadId: string;
    projectName: string;
    jobId: string;
  };
  customer: {
    customerId: string;
    customerName: string;
  };
  formDetails?: {
    description: string;
    loadDescription: string;
    loadWeight: number | null;
    dimensions?: {
      lengthFeet: number | null;
      widthFeet: number | null;
      heightFeet: number | null;
    };
    materialType?: string;
    packageCount?: number | null;
    loadingEquipment?: string[];
    bidDeadline?: string | null;
    documentUrl?: string;
    pickupLocation?: string;
    pickupLocationData?: {
      address: string;
      coordinates: {
        lat: number | null;
        lng: number | null;
      };
    };
    deliveryLocation?: string;
    deliveryLocationData?: {
      address: string;
      coordinates: {
        lat: number | null;
        lng: number | null;
      };
    };
    pickupDate?: string | null;
    pickupTime?: string;
    deliveryDate?: string | null;
    deliveryTime?: string;
    timeWindowStart?: string;
    timeWindowEnd?: string;
    timings?: string;
    receivingPoc?: string;
    pickupContactPhone?: string;
    specialRequirements?: string;
    additionalNotes?: string;
    rescheduleHistory?: unknown[];
  };
  deliverySchedule?: {
    deliveryDate?: string | null;
    timeWindow?: string;
    timeWindowStart?: string;
    timeWindowEnd?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
  };
  deliveryInformation?: {
    description?: string;
    materialCategory?: string;
    pickupDate?: string | null;
  };
  shipperDetails?: unknown;
  vendorDetails?: unknown;
  deliveryCompanyDetails?: {
    carrierId: string;
    carrierName: string;
    personName: string;
    number: string;
    email: string;
  } | null;
  selectedBid?: {
    bidId: string;
    carrierId: string;
    carrierName: string;
    quotedAmount: number;
    currency: string;
    carrierNotes: string;
    submittedAt: string | null;
    selectedAt: string | null;
    status: string;
    resubmitCount: number;
    resubmitRequestedAt: string | null;
    requestedBidAmount: number | null;
    resubmitNote: string;
    plantNote: string;
    canRequestResubmit: boolean;
  } | null;
  internalOwner?: unknown;
  siteCoordinationNotes?: string;
  equipmentRequirement?: string[];
  deliveryTypeAndSize?: {
    bundleCount?: number | null;
    packageCount?: number | null;
    totalWeight?: number;
  };
  bundlePlan?: unknown;
  packingListPlan?: unknown;
  bundles?: unknown[];
  packingLists?: unknown[];
  receivingPocDetails?: {
    receivingPoc: string;
    pickupContactPhone: string;
  };
}

export interface GetDeliveryDetailResponse {
  success: boolean;
  message: string;
  data: {
    delivery: DeliveryDetails;
  };
}

export interface SelectFreightBidResponse {
  success: boolean;
  message: string;
  data: {
    deliveryId: string;
  };
}

export interface RequestFreightBidRevisionResponse {
  success: boolean;
  message: string;
  data: unknown;
}

export async function getDeliveryFreightBids(
  deliveryId: string,
  sort: "low_to_high" | "high_to_low"
): Promise<GetDeliveryFreightBidsResponse> {
  const response = await apiClient.get<GetDeliveryFreightBidsResponse>(
    `/api/admin/plant/deliveries/${encodeURIComponent(deliveryId)}/bids`,
    { params: { sort } }
  );
  return response.data;
}

export async function getDeliveryDetail(
  deliveryId: string
): Promise<GetDeliveryDetailResponse> {
  const response = await apiClient.get<GetDeliveryDetailResponse>(
    `/api/admin/plant/deliveries/${encodeURIComponent(deliveryId)}/detail`
  );
  return response.data;
}

export async function selectFreightBid(
  bidId: string
): Promise<SelectFreightBidResponse["data"]> {
  const response = await apiClient.post<SelectFreightBidResponse>(
    `/api/admin/plant/deliveries/bids/${encodeURIComponent(bidId)}/select`
  );
  return response.data.data;
}

export interface RevisionBody {
  note: string;
  bidAmount?: number;
}

export async function requestFreightBidRevision(
  bidId: string,
  body: RevisionBody
): Promise<RequestFreightBidRevisionResponse> {
  const response = await apiClient.post<RequestFreightBidRevisionResponse>(
    `/api/admin/plant/deliveries/bids/${encodeURIComponent(bidId)}/revision`,
    body
  );
  return response.data;
}

// --- Awarded Loads API Types & Functions ---

export interface AwardedStatsData {
  totalAwarded: number;
  inTransit: number;
  delivered: number;
  totalSpent: number;
}

export interface AwardedStatsResponse {
  success: boolean;
  message: string;
  data: AwardedStatsData;
}

export async function getAwardedStats(): Promise<AwardedStatsResponse> {
  const response = await apiClient.get<AwardedStatsResponse>(
    "/api/admin/plant/deliveries/awarded/stats"
  );
  return response.data;
}

export interface AwardedLoadProject {
  _id: string;
  jobId: string;
  projectName: string;
}

export interface AwardedLoadCarrier {
  _id: string;
  carrierName: string;
}

export interface AwardedLoadDimensions {
  lengthFeet: number | null;
  widthFeet: number | null;
  heightFeet: number | null;
}

export interface AwardedLoadSize {
  weight: number;
  dimensions?: AwardedLoadDimensions;
  packageCount?: number | null;
}

export interface AwardedLoadPoc {
  receivingPoc: string;
  pickupContactPhone: string;
}

export interface AwardedLoad {
  _id: string;
  requestId: string;
  deliveryNumber: string;
  status: string;
  deliveryTime?: string | null;
  project: AwardedLoadProject;
  customer?: unknown;
  shipperVendor?: unknown;
  carrier?: AwardedLoadCarrier | null;
  description: string;
  pickupLocation: string;
  deliveryLocation: string;
  awardedBidAmount: number;
  loadSize?: AwardedLoadSize;
  poc?: AwardedLoadPoc;
  equipment?: string[];
  pickupDate: string | null;
  deliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  awardedCarrierId: string;
}

export interface GetAwardedLoadsParams {
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

export interface GetAwardedLoadsResponse {
  success: boolean;
  message: string;
  data: {
    requests: AwardedLoad[];
    total: number;
    page: number;
    limit: number;
  };
}

export async function getAwardedLoads(
  params?: GetAwardedLoadsParams
): Promise<GetAwardedLoadsResponse> {
  const response = await apiClient.get<GetAwardedLoadsResponse>(
    "/api/admin/plant/deliveries/awarded",
    { params }
  );
  return response.data;
}



