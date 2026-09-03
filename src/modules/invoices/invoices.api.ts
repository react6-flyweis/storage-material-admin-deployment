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

export async function sendInvoiceProvider(invoiceId: string) {
  const response = await apiClient.post(
    `/api/invoices/${invoiceId}/send`
  );
  return response.data;
}

export type GetInvoicesParams = {
  startDate?: string;
  endDate?: string;
  status?: string;
  leadId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type InvoiceListItem = {
  invoiceNumber: string;
  projectName: string;
  dueDate: string;
  amount: number;
  status: string;
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



