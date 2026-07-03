import { apiClient } from "@/modules/auth/auth.api";

export type InsulationSpec = {
  insulationType: "roof" | "wall";
  thickness?: string;
  material?: string;
};

export type DoorSpec = {
  doorCategory: "rolling" | "personnel";
  doorType?: string;
  size?: string;
  qty?: number;
  notes?: string;
};

export type LineItem = {
  name: string;
  description?: string;
  quantity?: number;
};

export type OptionalAddOn = {
  name: string;
  description?: string;
  price?: number;
};

export type Quotation = {
  _id: string;
  leadId: string;
  customerId?: string;
  quoteNumber: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  versionNumber: number;
  
  proposalDate?: string;
  validity?: string;
  preparedBy?: string;
  assignedSalesperson?: string;
  margin?: number;
  
  buildingType?: string;
  basePrice?: number;
  maxPrice?: number;
  sqft?: string;
  width?: number | null;
  length?: number | null;
  height?: number | null;
  currency?: string;
  roofStyle?: string;
  validTill?: string;
  location?: string;
  windLoad?: string;
  snowLoad?: string;
  paymentTerms?: string;
  companyName?: string;
  estimatedDelivery?: string;
  
  leftEaveHeight?: number | null;
  rightEaveHeight?: number | null;
  roofSlope?: string;
  
  frameType?: string;
  endwallType?: string;
  girtType?: string;
  purlinType?: string;
  bracingType?: string;
  
  roofPanel?: string;
  wallPanelType?: string;
  roofColor?: string;
  wallColor?: string;
  trimColor?: string;
  baseAngle?: string;
  
  insulation?: InsulationSpec[];
  
  shippingCost?: number;
  deliveryType?: string;
  shippingIncluded?: boolean;
  
  materialCost?: number;
  freightCost?: number;
  markupPercent?: number;
  
  doors?: DoorSpec[];
  includedMaterials?: LineItem[];
  optionalAddOns?: OptionalAddOn[];
  includedComponents?: string[];
  exclusions?: string[];
  
  specialNote?: string;
  clientNotes?: string;
  internalNotes?: string;
  priorityLevel?: "low" | "medium" | "high" | "urgent";
  changeNote?: string;
  
  // Computed fields
  totalArea?: number;
  totalCOGS?: number;
  markupValue?: number;
  finalPrice?: number;
  psf?: number;
  
  createdBy?: any;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuotationPayload = Partial<Omit<Quotation, "_id" | "quoteNumber" | "customerId" | "totalArea" | "totalCOGS" | "markupValue" | "finalPrice" | "psf" | "createdBy" | "createdAt" | "updatedAt">> & { leadId: string };
export type UpdateQuotationPayload = Partial<Omit<Quotation, "_id" | "quoteNumber" | "customerId" | "totalArea" | "totalCOGS" | "markupValue" | "finalPrice" | "psf" | "createdBy" | "createdAt" | "updatedAt">>;

export type QuotationResponse = {
  success: boolean;
  message: string;
  data: {
    quotation: Quotation;
  };
};

export type QuotationSummaryResponse = {
  success: boolean;
  data: {
    summary: {
      _id: string;
      quotationId: string;
      summary: string;
      generatedAt: string;
    }
  }
};

export type ListQuotationsResponse = {
  success: boolean;
  data: {
    quotations: Quotation[];
  }
};

export async function createQuotationProvider(payload: CreateQuotationPayload) {
  const response = await apiClient.post<QuotationResponse>("/api/quotations", payload);
  return response.data;
}

export async function getQuotationProvider(quotationId: string) {
  const response = await apiClient.get<QuotationResponse>(`/api/quotations/${quotationId}`);
  return response.data;
}

export async function updateQuotationProvider(quotationId: string, payload: UpdateQuotationPayload) {
  const response = await apiClient.put<QuotationResponse>(`/api/quotations/${quotationId}`, payload);
  return response.data;
}

export async function sendQuotationProvider(quotationId: string) {
  const response = await apiClient.post<QuotationResponse>(`/api/quotations/${quotationId}/send`);
  return response.data;
}

export async function getQuotationSummaryProvider(quotationId: string) {
  const response = await apiClient.get<QuotationSummaryResponse>(`/api/quotations/${quotationId}/summary`);
  return response.data;
}

export async function getLeadQuotationsProvider(leadId: string, params?: { startDate?: string; endDate?: string }) {
  const response = await apiClient.get<ListQuotationsResponse>(`/api/leads/${leadId}/quotations`, { params });
  return response.data;
}
