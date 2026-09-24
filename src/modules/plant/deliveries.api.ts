import { apiClient } from "@/modules/auth/auth.api";
import { useAuthStore } from "@/modules/auth/auth.store";

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
  const prefix = getDeliveriesApiPrefix();
  const response = await apiClient.get<GetDeliveriesResponse>(
    prefix,
    { params }
  );
  return response.data;
}

export async function getDeliveriesStats(): Promise<DeliveriesStatsResponse> {
  const prefix = getDeliveriesApiPrefix();
  const response = await apiClient.get<DeliveriesStatsResponse>(
    `${prefix}/stats`
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

export function getDeliveriesApiPrefix(): string {
  const role = useAuthStore.getState().role?.toLowerCase();
  return role === "plant" ? "/api/plant/deliveries" : "/api/admin/plant/deliveries";
}

export function extractFilename(
  contentDisposition?: string,
  fallbackFilename: string = "download.pdf"
): string {
  if (!contentDisposition) return fallbackFilename;
  const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
  if (match && match[1]) {
    return match[1].replace(/['"]/g, "").trim();
  }
  return fallbackFilename;
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function getApiErrorMessage(error: unknown): Promise<string> {
  const err = error as {
    response?: {
      status?: number;
      data?: { message?: string; error?: string } | Blob;
    };
    message?: string;
  };

  if (err?.response?.status === 403) {
    const data = err.response.data;
    if (data && !(data instanceof Blob) && data.message) {
      return data.message;
    }
    return "Access denied. Plant user must have an approved PO assigned to this project.";
  }
  if (err?.response?.status === 404) {
    const data = err.response.data;
    if (data && !(data instanceof Blob) && data.message) {
      return data.message;
    }
    return "Delivery or project not found.";
  }
  if (err?.response?.status === 400) {
    if (err.response.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        return json.message || "Cancelled delivery, already delivered, or no notification channel available.";
      } catch {
        return "Cancelled delivery, already delivered, or no notification channel available.";
      }
    }
    if (err.response?.data && typeof err.response.data === "object" && "message" in err.response.data) {
      return (err.response.data as { message?: string }).message || "Cancelled delivery, already delivered, or no notification channel available.";
    }
    return "Cancelled delivery, already delivered, or no notification channel available.";
  }
  if (err?.response?.data instanceof Blob) {
    try {
      const text = await err.response.data.text();
      const json = JSON.parse(text);
      return json.message || "An error occurred while processing the request.";
    } catch {
      return "An error occurred while processing the request.";
    }
  }
  if (err?.response?.data && typeof err.response.data === "object") {
    const dataObj = err.response.data as { message?: string; error?: string };
    if (dataObj.message) return dataObj.message;
    if (dataObj.error) return dataObj.error;
  }
  return err?.message || "An unexpected error occurred.";
}

export async function getCalendarDeliveries(
  params?: GetCalendarDeliveriesParams
): Promise<GetCalendarDeliveriesResponse> {
  const prefix = getDeliveriesApiPrefix();
  const response = await apiClient.get<GetCalendarDeliveriesResponse>(
    `${prefix}/calendar`,
    { params }
  );
  return response.data;
}

export type ExportDeliveriesParams = Omit<GetDeliveriesParams, "page" | "limit">;

export async function exportDeliveries(
  params?: ExportDeliveriesParams
): Promise<Blob> {
  const prefix = getDeliveriesApiPrefix();
  const response = await apiClient.get(
    `${prefix}/export`,
    {
      params,
      responseType: "blob",
    }
  );
  return response.data;
}

// Quick Action: 2. Send reminder now
export interface SendDeliveryReminderPayload {
  message?: string;
  note?: string;
}

export interface SendDeliveryReminderResponse {
  success: boolean;
  message: string;
  data: {
    deliveryId: string;
    channels: {
      email?: boolean;
      sms?: boolean;
      inApp?: boolean;
    };
  };
}

export async function sendDeliveryReminder(
  deliveryId: string,
  payload?: SendDeliveryReminderPayload
): Promise<SendDeliveryReminderResponse> {
  const prefix = getDeliveriesApiPrefix();
  const response = await apiClient.post<SendDeliveryReminderResponse>(
    `${prefix}/${encodeURIComponent(deliveryId)}/send-reminder`,
    payload || {}
  );
  return response.data;
}

// Quick Action: 3. Download details (PDF)
export async function downloadDeliveryDetails(
  deliveryId: string,
  fallbackFilename?: string
): Promise<{ blob: Blob; filename: string }> {
  const prefix = getDeliveriesApiPrefix();
  const response = await apiClient.get(
    `${prefix}/${encodeURIComponent(deliveryId)}/download`,
    { responseType: "blob" }
  );
  const contentDisposition = response.headers["content-disposition"];
  const filename = extractFilename(
    contentDisposition,
    fallbackFilename || `delivery-${deliveryId}-details.pdf`
  );
  return { blob: response.data, filename };
}

// Quick Action: 4. View documents (list + downloads)
export interface DeliveryDocumentItem {
  name: string;
  type: "pdf" | "file";
  url: string;
}

export interface GetDeliveryDocumentsResponse {
  success: boolean;
  message: string;
  data: {
    documents: DeliveryDocumentItem[];
  };
}

export async function getDeliveryDocuments(
  deliveryId: string
): Promise<GetDeliveryDocumentsResponse> {
  const prefix = getDeliveriesApiPrefix();
  const response = await apiClient.get<GetDeliveryDocumentsResponse>(
    `${prefix}/${encodeURIComponent(deliveryId)}/documents`
  );
  return response.data;
}

export async function downloadDeliveryDocumentPdf(
  urlOrPath: string,
  fallbackFilename: string
): Promise<{ blob: Blob; filename: string }> {
  // urlOrPath can be relative (e.g. /api/admin/plant/deliveries/...) or full URL
  const response = await apiClient.get(urlOrPath, { responseType: "blob" });
  const contentDisposition = response.headers["content-disposition"];
  const filename = extractFilename(contentDisposition, fallbackFilename);
  return { blob: response.data, filename };
}

