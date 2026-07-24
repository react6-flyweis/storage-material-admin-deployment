import { apiClient } from "@/modules/auth/auth.api";

export interface DeliveryProject {
  _id: string;
  jobId: string;
  projectName: string;
}

export interface DeliveryCustomer {
  _id: string;
  name: string;
  email: string;
}

export interface DeliveryShipperVendor {
  _id: string;
  vendorName: string;
  vendorCode: string;
}

export interface DeliveryCarrier {
  _id: string;
  carrierName: string;
}

export interface DeliveryDimensions {
  lengthFeet: number | null;
  widthFeet: number | null;
  heightFeet: number | null;
}

export interface DeliveryLoadSize {
  weight: number;
  dimensions?: DeliveryDimensions;
  packageCount?: number | null;
}

export interface DeliveryPoc {
  receivingPoc: string;
  pickupContactPhone: string;
}

export interface PlantDelivery {
  _id: string;
  requestId: string;
  deliveryNumber: string;
  status: string;
  deliveryTime?: string | null;
  project: DeliveryProject;
  customer?: DeliveryCustomer | null;
  shipperVendor?: DeliveryShipperVendor | null;
  carrier?: DeliveryCarrier | null;
  description: string;
  pickupLocation: string;
  deliveryLocation: string;
  awardedBidAmount?: number | null;
  loadSize?: DeliveryLoadSize;
  poc?: DeliveryPoc;
  equipment?: string[];
  pickupDate?: string | null;
  deliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetDeliveriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  projectId?: string;
  customerId?: string;
  carrierId?: string;
  vendorId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface GetDeliveriesResponse {
  success: boolean;
  message: string;
  data: {
    deliveries: PlantDelivery[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface DeliveriesStatsData {
  draft?: number;
  total?: number;
  scheduled?: number;
  confirmed?: number;
  inTransit?: number;
  delivered?: number;
  delayed?: number;
  cancelled?: number;
}

export interface DeliveriesStatsResponse {
  success: boolean;
  message: string;
  data: DeliveriesStatsData;
}

export async function getDeliveries(
  params?: GetDeliveriesParams
): Promise<GetDeliveriesResponse> {
  const response = await apiClient.get<GetDeliveriesResponse>(
    "/api/admin/plant/deliveries",
    { params }
  );
  return response.data;
}

export async function getDeliveriesStats(): Promise<DeliveriesStatsResponse> {
  const response = await apiClient.get<DeliveriesStatsResponse>(
    "/api/admin/plant/deliveries/stats"
  );
  return response.data;
}

export interface CalendarDeliveryItem {
  _id: string;
  requestId: string;
  deliveryNumber: string;
  status: string;
  deliveryTime?: string | null;
  project?: {
    _id: string;
    jobId: string;
    projectName: string;
  } | null;
  customer?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  shipperVendor?: {
    _id: string;
    vendorName: string;
    vendorCode: string;
  } | null;
  carrier?: {
    _id: string;
    carrierName: string;
  } | null;
  description?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  awardedBidAmount?: number | null;
  loadSize?: {
    weight?: number;
    dimensions?: {
      lengthFeet?: number | null;
      widthFeet?: number | null;
      heightFeet?: number | null;
    };
    packageCount?: number | null;
  };
  poc?: {
    receivingPoc?: string;
    pickupContactPhone?: string;
  };
  equipment?: string[];
  pickupDate?: string | null;
  deliveryDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  delivery?: {
    _id?: string;
    status?: string;
    description?: string;
    loadDescription?: string;
    timings?: string;
    deliveryTime?: string | null;
    receivingPoc?: string;
    loadingEquipment?: string[];
    deliveryNumber?: string;
    deliveryLocation?: string;
  } | null;
}

export interface GetCalendarDeliveriesParams {
  fromDate?: string;
  toDate?: string;
  projectId?: string;
  customerId?: string;
}

export interface CalendarDateGroup {
  date: string;
  totalDeliveries: number;
  deliveries: CalendarDeliveryItem[];
}

export interface GetCalendarDeliveriesResponse {
  success: boolean;
  message: string;
  data: {
    dates: CalendarDateGroup[];
  };
}

export async function getCalendarDeliveries(
  params?: GetCalendarDeliveriesParams
): Promise<GetCalendarDeliveriesResponse> {
  const response = await apiClient.get<GetCalendarDeliveriesResponse>(
    "/api/admin/plant/deliveries/calendar",
    { params }
  );
  return response.data;
}

