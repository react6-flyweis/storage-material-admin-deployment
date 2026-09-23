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
  employeeId?: string;
  plantEmployeeId?: string;
}

export interface UpcomingShipmentsParams extends DashboardFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

// 9. Mismatch Summary
export interface MismatchSummaryData {
  missingItems?: number;
  quantityMismatches?: number;
  specificationMismatches?: number;
  extraItems?: number;
  missingItemsFromQuote?: number;
  qtyMismatches?: number;
  specMismatches?: number;
  extraItemsInShipper?: number;
  totalComparedLines?: number;
  statusBreakdown?: {
    missing_in_vendor_quote?: number;
    qty_mismatch?: number;
    part_mismatch?: number;
    [key: string]: number | undefined;
  };
}

export interface MismatchSummaryResponse {
  success: boolean;
  message: string;
  data: MismatchSummaryData;
}

// 10. Mismatch Report
export type MismatchCategory = "missing" | "qty" | "spec" | "extra";

export interface MismatchReportParams extends DashboardFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: MismatchCategory | "";
}

export interface MismatchReportItem {
  resultId: string;
  shipperRequestId: string;
  leadId: string;
  projectName: string;
  jobId?: string;
  vendorName: string;
  vendorCode?: string;
  fileName?: string;
  status: string;
  severity?: "high" | "medium" | "low" | string;
  reason?: string;
  expected?: Record<string, unknown>;
  received?: Record<string, unknown>;
  createdAt?: string;
}

export interface MismatchReportData {
  items: MismatchReportItem[];
  total: number;
  page: number;
  limit: number;
}

export interface MismatchReportResponse {
  success: boolean;
  message: string;
  data: MismatchReportData;
}

// API functions
export async function getOrderProgressReview(params?: DashboardFilterParams): Promise<OrderProgressReviewResponse> {
  const response = await apiClient.get<OrderProgressReviewResponse>(
    "/api/admin/plant/dashboard/order-progress-review",
    { params }
  );
  return response.data;
}

export async function getLoadPlanningStatus(params?: DashboardFilterParams): Promise<LoadPlanningStatusResponse> {
  const response = await apiClient.get<LoadPlanningStatusResponse>(
    "/api/admin/plant/dashboard/load-planning-status",
    { params }
  );
  return response.data;
}

export async function getShipperQuotationSummary(params?: DashboardFilterParams): Promise<ShipperQuotationSummaryResponse> {
  const response = await apiClient.get<ShipperQuotationSummaryResponse>(
    "/api/admin/plant/dashboard/shipper-quotation-summary",
    { params }
  );
  return response.data;
}

export async function getPackingListSummary(params?: DashboardFilterParams): Promise<PackingListSummaryResponse> {
  const response = await apiClient.get<PackingListSummaryResponse>(
    "/api/admin/plant/dashboard/packing-list-summary",
    { params }
  );
  return response.data;
}

export async function getQrLabelsSummary(params?: DashboardFilterParams): Promise<QrLabelsSummaryResponse> {
  const response = await apiClient.get<QrLabelsSummaryResponse>(
    "/api/admin/plant/dashboard/qr-labels-summary",
    { params }
  );
  return response.data;
}

export async function getShippersSummary(params?: DashboardFilterParams): Promise<ShippersSummaryResponse> {
  const response = await apiClient.get<ShippersSummaryResponse>(
    "/api/admin/plant/dashboard/shippers-summary",
    { params }
  );
  return response.data;
}

export async function getDeliveriesSummary(params?: DashboardFilterParams): Promise<DeliveriesSummaryResponse> {
  const response = await apiClient.get<DeliveriesSummaryResponse>(
    "/api/admin/plant/dashboard/deliveries-summary",
    { params }
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

export async function getMismatchSummary(params?: DashboardFilterParams): Promise<MismatchSummaryResponse> {
  try {
    const response = await apiClient.get<MismatchSummaryResponse>(
      "/api/admin/plant/dashboard/mismatch-summary",
      { params }
    );
    return response.data;
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr?.response?.status === 404) {
      const fallbackResponse = await apiClient.get<MismatchSummaryResponse>(
        "/api/admin/plant/dashboard/missing-mismatch-summary",
        { params }
      );
      return fallbackResponse.data;
    }
    throw err;
  }
}

export async function getMismatchReport(params?: MismatchReportParams): Promise<MismatchReportResponse> {
  const response = await apiClient.get<MismatchReportResponse>(
    "/api/admin/plant/dashboard/mismatch-report",
    { params }
  );
  return response.data;
}

export async function exportPlantOverview(params?: DashboardFilterParams): Promise<Blob> {
  try {
    const response = await apiClient.get(
      "/api/admin/plant/dashboard/export",
      {
        params,
        responseType: "blob",
      }
    );
    return response.data;
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr?.response?.status === 404) {
      const fallbackResponse = await apiClient.get(
        "/api/admin/plant/dashboard/overview/export",
        {
          params,
          responseType: "blob",
        }
      );
      return fallbackResponse.data;
    }
    throw err;
  }
}

