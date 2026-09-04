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

export type ApprovalHistoryItem = {
  status: "not_submitted" | "pending_approval" | "approved" | "rejected";
  note?: string;
  by?: unknown;
  at?: string;
};

export type QuotationApproval = {
  status: "not_submitted" | "pending_approval" | "approved" | "rejected";
  submittedBy?: unknown;
  submittedAt?: string;
  reviewedBy?: unknown;
  reviewedAt?: string;
  rejectionReason?: string;
  approvedVersionNumber?: number;
  history?: ApprovalHistoryItem[];
};

export type WorkflowStatus = "draft" | "pending_approval" | "approved" | "rejected" | "sent";

export type Quotation = {
  _id: string;
  leadId: string;
  customerId?: string;
  quoteNumber: string;
  status: "draft" | "pending" | "pending_approval" | "approved" | "rejected" | "sent" | "accepted";
  approvalStatus?: "not_submitted" | "pending_approval" | "approved" | "rejected" | string;
  workflowStatus?: WorkflowStatus;
  approval?: QuotationApproval;
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
  
  pdfLink?: string;
  createdBy?: unknown;
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
    emailProvider?: "sendgrid" | "smtp_fallback";
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

export type GetQuotationsParams = {
  status?: string;
  approvalStatus?: string;
  sort?: "latest" | "oldest" | string;
  leadId?: string;
  search?: string;
  buildingType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type ListQuotationsResponse = {
  success: boolean;
  data: {
    quotations: Quotation[];
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      pages?: number;
      totalPages?: number;
    };
    filters?: Record<string, unknown>;
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

export async function submitQuotationApprovalProvider(quotationId: string, note?: string) {
  const response = await apiClient.post<QuotationResponse>(`/api/quotations/${quotationId}/submit-approval`, { note });
  return response.data;
}

export async function approveQuotationProvider(quotationId: string, note?: string) {
  const response = await apiClient.put<QuotationResponse>(`/api/quotations/${quotationId}/approve`, { note });
  return response.data;
}

export async function rejectQuotationProvider(quotationId: string, reason: string) {
  const response = await apiClient.put<QuotationResponse>(`/api/quotations/${quotationId}/reject`, { reason });
  return response.data;
}

export async function getPendingApprovalsProvider(params?: GetQuotationsParams) {
  const response = await apiClient.get<ListQuotationsResponse>("/api/quotations/approval/pending", { params });
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

