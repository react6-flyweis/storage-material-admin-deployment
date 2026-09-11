import { apiClient } from "@/modules/auth/auth.api";

// 1. Order Progress Review
export interface OrderProgressReviewData {
  quotationsSent: number;
  uploadedBom: number;
  sentToShipper: number;
  loadsPlanned: number;
  shippedQuantity: number;
}

export interface OrderProgressReviewResponse {
  success: boolean;
  message: string;
  data: OrderProgressReviewData;
}

// 2. Load Planning Status
export interface LoadPlanningStatusData {
  loadsPlanning: number;
  plannedCount: number;
  readyToShip: number;
  dispatch: number;
}

export interface LoadPlanningStatusResponse {
  success: boolean;
  message: string;
  data: LoadPlanningStatusData;
}

// 3. Shipper Quotation Summary
export interface ShipperQuotationSummaryData {
  requested: number;
  quoted: number;
  pending: number;
}

export interface ShipperQuotationSummaryResponse {
  success: boolean;
  message: string;
  data: ShipperQuotationSummaryData;
}

// 4. Packing List Summary
export interface PackingListSummaryData {
  generated: number;
  inProgress: number;
  pending: number;
}

export interface PackingListSummaryResponse {
  success: boolean;
  message: string;
  data: PackingListSummaryData;
}

// 5. QR Labels Summary
export interface QrLabelsSummaryData {
  generated: number;
  inProgress: number;
  pending: number;
}

export interface QrLabelsSummaryResponse {
  success: boolean;
  message: string;
  data: QrLabelsSummaryData;
}

// 6. Shippers Summary
export interface ShippersSummaryData {
  activeShippers: number;
  ordersWithShippers: number;
  pendingAssignments: number;
}

export interface ShippersSummaryResponse {
  success: boolean;
  message: string;
  data: ShippersSummaryData;
}

// 7. Deliveries Summary
export interface DeliveriesSummaryData {
  scheduled: number;
  inTransit: number;
  delivered: number;
}

export interface DeliveriesSummaryResponse {
  success: boolean;
  message: string;
  data: DeliveriesSummaryData;
}

// 8. Upcoming Shipments
export interface ShipperVendorInfo {
  vendorId: string;
  vendorName: string;
  vendorCode: string;
}

export interface UpcomingShipment {
  deliveryId: string;
  orderId: string;
  leadId: string;
  projectName: string;
  shipper: ShipperVendorInfo | null;
  loadPlanId: string;
  loadPlanNumber: string;
  shipDate: string;
  estDeliveryDate: string;
  deliveryLocation: string;
  status: string;
  deliveryNumber: string;
}

export interface UpcomingShipmentsData {
  shipments: UpcomingShipment[];
  total: number;
  page: number;
  limit: number;
}

export interface UpcomingShipmentsResponse {
  success: boolean;
  message: string;
  data: UpcomingShipmentsData;
}

export interface DashboardFilterParams {
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
}

export interface UpcomingShipmentsParams extends DashboardFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

// API functions
export async function getOrderProgressReview(params?: DashboardFilterParams): Promise<OrderProgressReviewResponse> {
  const response = await apiClient.get<OrderProgressReviewResponse>(
    "/api/admin/plant/dashboard/order-progress-review",
    { params }
  );
  return response.data;
}

export async function getLoadPlanningStatus(): Promise<LoadPlanningStatusResponse> {
  const response = await apiClient.get<LoadPlanningStatusResponse>(
    "/api/admin/plant/dashboard/load-planning-status"
  );
  return response.data;
}

export async function getShipperQuotationSummary(): Promise<ShipperQuotationSummaryResponse> {
  const response = await apiClient.get<ShipperQuotationSummaryResponse>(
    "/api/admin/plant/dashboard/shipper-quotation-summary"
  );
  return response.data;
}

export async function getPackingListSummary(): Promise<PackingListSummaryResponse> {
  const response = await apiClient.get<PackingListSummaryResponse>(
    "/api/admin/plant/dashboard/packing-list-summary"
  );
  return response.data;
}

export async function getQrLabelsSummary(): Promise<QrLabelsSummaryResponse> {
  const response = await apiClient.get<QrLabelsSummaryResponse>(
    "/api/admin/plant/dashboard/qr-labels-summary"
  );
  return response.data;
}

export async function getShippersSummary(): Promise<ShippersSummaryResponse> {
  const response = await apiClient.get<ShippersSummaryResponse>(
    "/api/admin/plant/dashboard/shippers-summary"
  );
  return response.data;
}

export async function getDeliveriesSummary(): Promise<DeliveriesSummaryResponse> {
  const response = await apiClient.get<DeliveriesSummaryResponse>(
    "/api/admin/plant/dashboard/deliveries-summary"
  );
  return response.data;
}

export async function getUpcomingShipments(params?: UpcomingShipmentsParams): Promise<UpcomingShipmentsResponse> {
  const response = await apiClient.get<UpcomingShipmentsResponse>(
    "/api/admin/plant/dashboard/upcoming-shipments",
    { params }
  );
  return response.data;
}
