import { apiClient } from "@/modules/auth/auth.api";

export type CreateInvoiceLineItemPayload = {
  images: string[];
  items: string[];
  rate: number;
  markup: number;
  markupType: "percentage" | "amount";
  quantity: number;
  tax: number;
  taxType: "percentage" | "amount";
  effectiveRate: number;
  markupAmount: number;
  taxAmount: number;
  total: number;
};

export type CreateInvoiceDraftPayload = {
  date?: string;
  daysToPay?: number;
  lineItems?: CreateInvoiceLineItemPayload[];
  subtotal?: number;
  markupTotal?: number;
  tax?: number;
  discount?: number;
  depositAmount?: number;
  totalAmount: number;
  paymentScheduleId?: string;
  paymentScheduleStageId?: string;
};

export type CreateInvoicePayload = {
  leadId: string;
  quotationId: string;
  date: string;
  daysToPay: number;
  lineItems: CreateInvoiceLineItemPayload[];
  subtotal: number;
  markupTotal: number;
  tax: number;
  discount: number;
  depositAmount: number;
  totalAmount: number;
};

export type CreateInvoiceResponse = {
  success: boolean;
  message: string;
  data: unknown;
};

export async function createInvoiceProvider(payload: CreateInvoicePayload) {
  const { leadId, ...bodyPayload } = payload;
  const response = await apiClient.post<CreateInvoiceResponse>(
    `/api/leads/${leadId}/invoices`,
    bodyPayload,
  );

  return response.data;
}

export type UpdateInvoicePayload = CreateInvoicePayload & { invoiceId: string };

export async function updateInvoiceProvider(payload: UpdateInvoicePayload) {
  const { invoiceId, leadId, ...bodyPayload } = payload;
  const response = await apiClient.put<CreateInvoiceResponse>(
    `/api/invoices/${invoiceId}`,
    bodyPayload,
  );

  return response.data;
}

export async function markInvoicePaidProvider(invoiceId: string) {
  const response = await apiClient.put(
    `/api/invoices/${invoiceId}/mark-paid`
  );
  return response.data;
}

export type SendInvoicePayload = {
  to?: string;
  toEmail?: string;
  cc?: string | string[];
  ccEmail?: string | string[];
  ccEmails?: string | string[];
  message?: string;
  note?: string;
  emailMessage?: string;
  coverNote?: string;
};

export type MarkInvoiceSentPayload = {
  note?: string;
  message?: string;
  sentAt?: string;
};

export type SendInvoiceResponse = {
  success: boolean;
  message: string;
  data: {
    invoice: any;
    sendMethod?: "platform" | "manual" | null;
    sentTo?: string;
    sentCc?: string[];
    sentMessage?: string;
    messageIncluded?: boolean;
    messageSourceKey?: string | null;
    pdfAttached?: boolean;
    pdfWarning?: string | null;
  };
};

export async function sendInvoiceProvider(invoiceId: string, payload?: SendInvoicePayload) {
  const response = await apiClient.post<SendInvoiceResponse>(
    `/api/invoices/${invoiceId}/send`,
    payload || {}
  );
  return response.data;
}

export async function markInvoiceSentProvider(invoiceId: string, payload?: MarkInvoiceSentPayload) {
  const response = await apiClient.post<SendInvoiceResponse>(
    `/api/invoices/${invoiceId}/mark-sent`,
    payload || {}
  );
  return response.data;
}

export type ApprovalStatus = "not_submitted" | "pending_approval" | "approved" | "rejected";
export type WorkflowStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";

export type ApprovalHistoryItem = {
  status: ApprovalStatus;
  note?: string;
  by?: { _id?: string; name?: string; email?: string } | string;
  at: string;
  revision?: number;
  version?: number;
};

export type InvoiceApprovalRequest = {
  status: ApprovalStatus | string;
  revision: number;
  submittedAt?: string;
  submittedBy?: { _id?: string; name?: string; email?: string } | string;
  note?: string;
  current?: boolean;
  closedAt?: string;
  closedNote?: string;
};

export type InvoiceApproval = {
  status: ApprovalStatus;
  submittedBy?: { _id?: string; name?: string; email?: string } | string;
  submittedAt?: string;
  reviewedBy?: { _id?: string; name?: string; email?: string } | string;
  reviewedAt?: string;
  rejectionReason?: string;
  approvedRevision?: number;
  history?: ApprovalHistoryItem[];
  approvalRequests?: InvoiceApprovalRequest[];
};

export async function approveInvoiceProvider(invoiceId: string, payload?: { note?: string }) {
  const response = await apiClient.put(`/api/invoices/${invoiceId}/approve`, payload || {});
  return response.data;
}

export async function rejectInvoiceProvider(invoiceId: string, payload: { reason: string }) {
  const response = await apiClient.put(`/api/invoices/${invoiceId}/reject`, payload);
  return response.data;
}

export async function submitInvoiceApprovalProvider(invoiceId: string, payload?: { note?: string }) {
  const response = await apiClient.post(`/api/invoices/${invoiceId}/submit-approval`, payload || {});
  return response.data;
}

export type GetInvoicesParams = {
  startDate?: string;
  endDate?: string;
  status?: string;
  approvalStatus?: string;
  pending?: boolean | string;
  leadId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getPendingApprovalInvoicesProvider(params?: GetInvoicesParams) {
  const response = await apiClient.get<GetInvoicesResponse>("/api/invoices/approval/pending", {
    params,
  });
  return response.data;
};

export type InvoiceListItem = {
  invoiceNumber: string;
  projectName: string;
  dueDate: string;
  amount: number;
  status: string;
  invoiceStatus?: string;
  invoice: any;
};

export type GetInvoicesResponse = {
  success: boolean;
  message: string;
  data: {
    invoices: InvoiceListItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function getInvoicesProvider(params?: GetInvoicesParams) {
  const response = await apiClient.get<GetInvoicesResponse>("/api/invoices", {
    params,
  });
  return response.data;
}

export async function getProjectInvoicesProvider(leadId: string, params?: Omit<GetInvoicesParams, "leadId">) {
  const response = await apiClient.get<GetInvoicesResponse>(`/api/leads/${leadId}/invoices`, {
    params,
  });
  return response.data;
}

export type InvoiceStage = {
  _id: string;
  stageName: string;
  amount: number;
  amountType: string;
  dueDate: string;
  status: string;
  invoiceId: string;
};

export type PaymentSchedule = {
  _id: string;
  leadId: string;
  customerId: string;
  totalAmount: number;
  stages: InvoiceStage[];
};

export type GetInvoiceDetailResponse = {
  success: boolean;
  message: string;
  data: {
    invoice: any;
    paymentSchedule: PaymentSchedule;
  };
};

export async function getInvoiceDetailProvider(invoiceId: string) {
  const response = await apiClient.get<GetInvoiceDetailResponse>(
    `/api/invoices/${invoiceId}`,
  );
  return response.data;
}

export type InvoiceStatsResponse = {
  success: boolean;
  message: string;
  data: {
    leadId?: string;
    customerId?: string;
    projectName?: string;
    jobId?: string;
    projectId?: string;
    totalAmount?: number;
    totalPaid?: number;
    totalUnpaid?: number;
    overdue?: number;
    totalPaymentsReceived?: number;
    paymentCompletion?: number;
    pendingAmount?: number;
    overdueAmount?: number;
  };
};

export async function getInvoiceStatsProvider(params?: { leadId?: string }) {
  const response = await apiClient.get<InvoiceStatsResponse>("/api/invoices/stats", { params });
  return response.data;
}

export async function getProjectInvoiceStatsProvider(customerId: string, leadId: string) {
  const response = await apiClient.get<InvoiceStatsResponse>(
    `/api/admin/customers/${customerId}/projects/${leadId}/invoices/stats`
  );
  return response.data;
}
export type AdminProjectInvoicesResponse = {
  success: boolean;
  message: string;
  data: {
    leadId: string;
    customerId: string;
    projectName: string;
    jobId: string;
    projectId: string;
    payments: Array<{
      invoiceId: string;
      invoiceNumber: string;
      date: string;
      amount: number;
      status: string;
      invoiceStatus: string;
      invoice?: any;
    }>;
    total: number;
    totalPaymentsReceived?: number;
    paymentCompletion?: number;
    pendingAmount?: number;
    overdueAmount?: number;
  };
};

export async function getAdminProjectInvoicesProvider(customerId: string, leadId: string, params?: GetInvoicesParams) {
  const response = await apiClient.get<AdminProjectInvoicesResponse>(
    `/api/admin/customers/${customerId}/projects/${leadId}/invoices`,
    { params }
  );
  return response.data;
}

export type PayableWorkflowStatus =
  | "pending_admin_approval"
  | "approved_for_payment"
  | "rejected"
  | "paid"
  | "unpaid";

export type PayableWorkflowSource = "acceptance_upload" | "admin_manual";

export type PayableComment = {
  _id?: string;
  text: string;
  authorRole?: "admin" | "account" | string;
  authorId?: { _id?: string; name?: string; email?: string } | string;
  createdAt: string;
};

export type PayableWorkflow = {
  status: PayableWorkflowStatus;
  source: PayableWorkflowSource;
  documentUrl?: string;
  documentFileName?: string;
  shipperRequestId?: string;
  freightBidId?: string;
  comments?: PayableComment[];
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: any;
  rejectedAt?: string;
  rejectedBy?: any;
};

export type VendorInvoiceItem = {
  _id: string;
  leadId: {
    _id: string;
    jobId: string;
    projectName: string;
  } | null;
  customerId: string | null;
  invoiceType: string;
  category: string;
  vendorId: {
    _id: string;
    vendorName: string;
  } | null;
  carrierId: string | null;
  payeeName: string;
  quotationId: string | null;
  createdBy: string;
  invoiceNumber: string;
  description: string;
  date: string;
  daysToPay: number;
  dueDate: string;
  poNumber: string;
  subtotal: number;
  markupTotal: number;
  tax: number;
  discount: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  payableStatus?: PayableWorkflowStatus;
  paymentLabel?: string;
  documentUrl?: string;
  documentFileName?: string;
  payableWorkflow?: PayableWorkflow;
  sentAt: string | null;
  paidBy: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  paymentProof?: {
    status: string;
    transactionId?: string;
    paymentDate?: string | null;
    amount?: number | null;
    notes?: string;
    files?: any[];
  };
  lineItems?: any[];
  createdAt: string;
  updatedAt: string;
};

export type VendorInvoiceStats = {
  totalIncome: number;
  productSales: number;
  serviceRevenue: number;
  otherIncome: number;
};

export type GetVendorInvoicesParams = {
  status?: string;
  payableStatus?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type GetVendorInvoicesResponse = {
  success: boolean;
  message: string;
  data: {
    stats: VendorInvoiceStats;
    invoices: VendorInvoiceItem[];
    total: number;
    page?: number;
    limit?: number;
  };
};

export async function getVendorInvoicesProvider(params?: GetVendorInvoicesParams) {
  const response = await apiClient.get<GetVendorInvoicesResponse>(
    "/api/admin/invoices/vendor",
    { params }
  );
  return response.data;
}

export async function exportVendorInvoicesProvider(params?: GetVendorInvoicesParams) {
  const response = await apiClient.get("/api/admin/invoices/vendor/export", {
    params,
    responseType: "blob",
  });
  return response.data;
}

export type AdminInvoiceDetailData = {
  _id: string;
  leadId: {
    _id: string;
    buildingType?: string;
    location?: string;
    jobId: string;
    projectName: string;
  } | null;
  customerId: string | null;
  invoiceType: string;
  category: string | null;
  vendorId: {
    _id: string;
    vendorName: string;
    email?: string;
    phone?: string;
  } | null;
  carrierId: {
    _id: string;
    carrierName: string;
    email?: string;
    phone?: string;
  } | null;
  payeeName: string;
  quotationId: string | null;
  createdBy: {
    _id: string;
    name: string;
  } | string | null;
  invoiceNumber: string;
  description: string;
  date: string;
  paymentScheduleId: string | null;
  paymentScheduleStageId: string | null;
  daysToPay: number;
  dueDate: string;
  poNumber: string;
  subtotal: number;
  markupTotal: number;
  tax: number;
  discount: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  payableStatus?: PayableWorkflowStatus;
  paymentLabel?: string;
  documentUrl?: string;
  documentFileName?: string;
  payableWorkflow?: PayableWorkflow;
  sentAt: string | null;
  paidBy: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  paymentProof?: {
    status: string;
    transactionId?: string;
    paymentDate?: string | null;
    amount?: number | null;
    notes?: string;
    submittedAt?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    reviewNotes?: string;
    files?: any[];
  };
  lineItems?: any[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type GetAdminInvoiceDetailResponse = {
  success: boolean;
  message: string;
  data: {
    invoice: AdminInvoiceDetailData;
  };
};

export async function getAdminInvoiceDetailProvider(invoiceId: string) {
  const response = await apiClient.get<GetAdminInvoiceDetailResponse>(
    `/api/admin/invoices/${invoiceId}`
  );
  return response.data;
}

export async function getAdminVendorInvoiceDetailProvider(invoiceId: string) {
  return getAdminInvoiceDetailProvider(invoiceId);
}



export type CarrierInvoiceItem = {
  _id: string;
  leadId: {
    _id: string;
    jobId: string;
    projectName: string;
  } | null;
  customerId: string | null;
  invoiceType: string;
  category: string | null;
  vendorId: string | null;
  carrierId: {
    _id: string;
    carrierName: string;
  } | null;
  payeeName: string;
  quotationId: string | null;
  createdBy: string;
  invoiceNumber: string;
  description: string;
  date: string;
  paymentScheduleId: string | null;
  paymentScheduleStageId: string | null;
  daysToPay: number;
  dueDate: string;
  poNumber: string;
  subtotal: number;
  markupTotal: number;
  tax: number;
  discount: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  payableStatus?: PayableWorkflowStatus;
  paymentLabel?: string;
  documentUrl?: string;
  documentFileName?: string;
  payableWorkflow?: PayableWorkflow;
  sentAt: string | null;
  paidBy: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  paymentProof?: {
    status: string;
    transactionId?: string;
    paymentDate?: string | null;
    amount?: number | null;
    notes?: string;
    submittedAt?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    reviewNotes?: string;
    files?: any[];
  };
  lineItems?: any[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type GetCarrierInvoicesParams = {
  status?: string;
  payableStatus?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type GetCarrierInvoicesResponse = {
  success: boolean;
  message: string;
  data: {
    invoices: CarrierInvoiceItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function getCarrierInvoicesProvider(params?: GetCarrierInvoicesParams) {
  const response = await apiClient.get<GetCarrierInvoicesResponse>(
    "/api/admin/invoices/freight-carrier",
    { params }
  );
  return response.data;
}

export async function exportCarrierInvoicesProvider(params?: GetCarrierInvoicesParams) {
  const response = await apiClient.get("/api/admin/invoices/freight-carrier/export", {
    params,
    responseType: "blob",
  });
  return response.data;
}

// ---------------- Admin Payables APIs (Vendor & Freight Carrier) ----------------

export type PayablesFiltersData = {
  statuses?: string[];
  payableStatuses?: string[];
  categories?: string[];
  projects?: Array<{ _id: string; projectName?: string; jobId?: string }>;
  vendors?: Array<{ _id: string; vendorName: string }>;
  carriers?: Array<{ _id: string; carrierName: string }>;
};

export type GetPayablesFiltersResponse = {
  success: boolean;
  message?: string;
  data: PayablesFiltersData;
};

export async function getPayablesFiltersProvider() {
  const response = await apiClient.get<GetPayablesFiltersResponse>(
    "/api/admin/invoices/payables/filters"
  );
  return response.data;
}

export type GetPayablesApprovalQueueParams = {
  invoiceType?: "vendor" | "freight_carrier";
  page?: number;
  limit?: number;
};

export type GetPayablesApprovalQueueResponse = {
  success: boolean;
  message?: string;
  data: {
    invoices: (VendorInvoiceItem | CarrierInvoiceItem)[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function getPayablesApprovalQueueProvider(params?: GetPayablesApprovalQueueParams) {
  const response = await apiClient.get<GetPayablesApprovalQueueResponse>(
    "/api/admin/invoices/payables/approval-queue",
    { params }
  );
  return response.data;
}

export type CreateManualVendorPayablePayload = {
  leadId: string;
  vendorId: string;
  totalAmount: number;
  category?: string;
  description?: string;
  date: string;
  daysToPay?: number;
  documentUrl?: string;
  documentFileName?: string;
};

export async function createManualVendorPayableProvider(payload: CreateManualVendorPayablePayload) {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: unknown;
  }>("/api/admin/invoices/payables/vendor", payload);
  return response.data;
}

export type CreateManualFreightPayablePayload = {
  leadId: string;
  carrierId: string;
  totalAmount: number;
  category?: string;
  description?: string;
  date: string;
  daysToPay?: number;
  documentUrl?: string;
  documentFileName?: string;
};

export async function createManualFreightPayableProvider(payload: CreateManualFreightPayablePayload) {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: unknown;
  }>("/api/admin/invoices/payables/freight-carrier", payload);
  return response.data;
}

export type GetPayableInvoiceDetailResponse = {
  success: boolean;
  message?: string;
  data: {
    invoice: AdminInvoiceDetailData;
  };
};

export async function getPayableInvoiceDetailProvider(invoiceId: string) {
  const response = await apiClient.get<GetPayableInvoiceDetailResponse>(
    `/api/admin/invoices/payables/${invoiceId}`
  );
  return response.data;
}

export async function approvePayableInvoiceProvider(invoiceId: string) {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: unknown;
  }>(`/api/admin/invoices/payables/${invoiceId}/approve`);
  return response.data;
}

export type RejectPayableInvoicePayload = {
  reason: string;
};

export async function rejectPayableInvoiceProvider(
  invoiceId: string,
  payload: RejectPayableInvoicePayload
) {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: unknown;
  }>(`/api/admin/invoices/payables/${invoiceId}/reject`, payload);
  return response.data;
}

export type AddPayableCommentPayload = {
  text: string;
};

export async function addPayableInvoiceCommentProvider(
  invoiceId: string,
  payload: AddPayableCommentPayload
) {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: unknown;
  }>(`/api/admin/invoices/payables/${invoiceId}/comments`, payload);
  return response.data;
}




