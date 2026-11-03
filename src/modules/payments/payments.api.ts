import { apiClient } from "@/modules/auth/auth.api";

// ---------------- Payment Approvals Types & API ----------------

export type PaymentApprovalRequestedByUser = {
  _id?: string;
  userId?: string;
  name: string;
};

export type PaymentApprovalFilterProject = {
  leadId: string;
  projectName: string;
  jobId?: string;
  businessUnit?: string;
};

export type PaymentApprovalFilterPayeeType = {
  code: string;
  label: string;
};

export type PaymentApprovalsFiltersData = {
  categories?: string[];
  statuses?: string[];
  workflowStages?: string[];
  requestedBy?: PaymentApprovalRequestedByUser[];
  projects?: PaymentApprovalFilterProject[];
  payeeTypes?: PaymentApprovalFilterPayeeType[];
};

export type GetPaymentApprovalsFiltersResponse = {
  success: boolean;
  message?: string;
  data: PaymentApprovalsFiltersData;
};

export type PaymentApprovalProjectInfo = {
  leadId?: string;
  projectName?: string;
  jobId?: string;
  businessUnit?: string;
};

export type PaymentApprovalItem = {
  _id?: string;
  approvalId?: string;
  paymentId?: string;
  payee?: string;
  companyName?: string;
  payeeType?: string;
  category?: string;
  amount: number;
  requestedBy?: PaymentApprovalRequestedByUser | string;
  department?: string;
  notes?: string;
  status: string;
  statusLabel?: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string;
  leadId?: string | null;
  project?: PaymentApprovalProjectInfo | null;
  invoiceNumber?: string;
  dueDate?: string | null;
  linkedType?: string | null;
  linkedId?: string | null;
  linkedTo?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  requestDate?: string;
  updatedAt?: string;
  __v?: number;
};

export type PaymentApprovalsStats = {
  totalRequests?: number;
  pendingApproval?: number;
  pendingAmount?: number;
  approved?: number;
  approvedAmount?: number;
  rejected?: number;
  totalAmount?: number;
  underReview?: number;
  disputed?: number;
};

export type GetPaymentApprovalsParams = {
  requestedBy?: string;
  category?: string;
  status?: string;
  payeeType?: string;
  project?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type GetPaymentApprovalsResponse = {
  success: boolean;
  message?: string;
  data: {
    approvals?: PaymentApprovalItem[];
    total?: number;
    page?: number;
    limit?: number;
    stats?: PaymentApprovalsStats;
  };
};

export type GetPaymentApprovalsStatsResponse = {
  success: boolean;
  message?: string;
  data: PaymentApprovalsStats;
};

export type PaymentApprovalRemark = {
  id?: string;
  _id?: string;
  authorName?: string;
  authorInitials?: string;
  text: string;
  createdAt?: string;
  isLatest?: boolean;
};

export type PaymentApprovalAttachment = {
  name: string;
  url: string;
  fileSize?: number;
  uploadedAt?: string;
};

export type PaymentApprovalHistory = {
  at: string;
  type?: string;
  label: string;
  userName?: string;
};

export type PaymentApprovalDetailData = {
  _id?: string;
  approvalId?: string;
  paymentId: string;
  status: string;
  statusLabel: string;
  canReview: boolean;
  header: {
    payee: string;
    category: string;
    categoryLabel?: string;
    requestedBy: PaymentApprovalRequestedByUser | string;
    requestedAt?: string | null;
    invoiceNumber?: string | null;
    dueDate?: string | null;
    amount: number;
  };
  details?: {
    additionalNotes?: string | null;
    invoiceDetails?: string | null;
    costBreakdown?: Record<string, unknown> | null;
    linkedTransaction?: string | null;
    project?: PaymentApprovalProjectInfo | null;
    hasAdditionalDetails?: boolean;
  };
  reviews?: {
    remarks: PaymentApprovalRemark[];
  };
  attachments?: PaymentApprovalAttachment[];
  history?: PaymentApprovalHistory[];
};

export type GetPaymentApprovalDetailResponse = {
  success: boolean;
  message?: string;
  data: PaymentApprovalDetailData;
};

export type ReviewPaymentApprovalPayload = {
  action: "approved" | "rejected" | "under_review" | "disputed";
  reviewNotes?: string;
};

export type ReviewPaymentApprovalResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

export type AddPaymentApprovalRemarkPayload = {
  text: string;
};

export type AddPaymentApprovalAttachmentPayload = {
  name: string;
  url: string;
  fileSize?: number;
};

const ACCOUNT_PAYMENT_APPROVALS_BASE = "/api/account/financial/payment-approvals";
const ADMIN_EXTRA_PAYMENT_APPROVALS_BASE = "/api/admin/financial-extra/payment-approvals";
const LEGACY_ADMIN_PAYMENT_APPROVALS_BASE = "/api/admin/financials/payment-approvals";

async function requestWithPaymentApprovalsFallback<T>(
  buildUrl: (base: string) => string,
  options?: { method?: "get" | "post" | "put"; data?: unknown; responseType?: "blob" | "json" }
): Promise<T> {
  const bases = [
    ACCOUNT_PAYMENT_APPROVALS_BASE,
    ADMIN_EXTRA_PAYMENT_APPROVALS_BASE,
    LEGACY_ADMIN_PAYMENT_APPROVALS_BASE,
  ];

  let lastError: unknown;
  for (const base of bases) {
    try {
      const url = buildUrl(base);
      if (options?.method === "post") {
        const res = await apiClient.post<T>(url, options.data);
        return res.data;
      }
      if (options?.method === "put") {
        const res = await apiClient.put<T>(url, options.data);
        return res.data;
      }
      const res = await apiClient.get<T>(url, { responseType: options?.responseType });
      return res.data;
    } catch (err: unknown) {
      lastError = err;
      continue;
    }
  }
  throw lastError;
}

export async function getPaymentApprovalsFiltersProvider() {
  return requestWithPaymentApprovalsFallback<GetPaymentApprovalsFiltersResponse>(
    (base) => `${base}/filters`
  );
}

export async function getPaymentApprovalsStatsProvider(params?: GetPaymentApprovalsParams) {
  const queryParams = new URLSearchParams();
  if (params?.requestedBy && params.requestedBy !== "all") {
    queryParams.append("requestedBy", params.requestedBy);
  }
  if (params?.category && params.category !== "all") {
    queryParams.append("category", params.category);
  }
  if (params?.status && params.status !== "all") {
    queryParams.append("status", params.status);
  }
  if (params?.project && params.project !== "all") {
    queryParams.append("project", params.project);
  }
  if (params?.payeeType && params.payeeType !== "all") {
    queryParams.append("payeeType", params.payeeType);
  }
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  const queryString = queryParams.toString();
  return requestWithPaymentApprovalsFallback<GetPaymentApprovalsStatsResponse>(
    (base) => `${base}/stats${queryString ? `?${queryString}` : ""}`
  );
}

export async function getPaymentApprovalsProvider(params?: GetPaymentApprovalsParams) {
  const queryParams = new URLSearchParams();
  if (params?.requestedBy && params.requestedBy !== "all") {
    queryParams.append("requestedBy", params.requestedBy);
  }
  if (params?.category && params.category !== "all") {
    queryParams.append("category", params.category);
  }
  if (params?.status && params.status !== "all") {
    queryParams.append("status", params.status);
  }
  if (params?.payeeType && params.payeeType !== "all") {
    queryParams.append("payeeType", params.payeeType);
  }
  if (params?.project && params.project !== "all") {
    queryParams.append("project", params.project);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  return requestWithPaymentApprovalsFallback<GetPaymentApprovalsResponse>(
    (base) => `${base}${queryString ? `?${queryString}` : ""}`
  );
}

export async function exportPaymentApprovalsProvider(params?: GetPaymentApprovalsParams) {
  const queryParams = new URLSearchParams();
  if (params?.requestedBy && params.requestedBy !== "all") {
    queryParams.append("requestedBy", params.requestedBy);
  }
  if (params?.category && params.category !== "all") {
    queryParams.append("category", params.category);
  }
  if (params?.status && params.status !== "all") {
    queryParams.append("status", params.status);
  }
  if (params?.payeeType && params.payeeType !== "all") {
    queryParams.append("payeeType", params.payeeType);
  }
  if (params?.project && params.project !== "all") {
    queryParams.append("project", params.project);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  const queryString = queryParams.toString();
  return requestWithPaymentApprovalsFallback<Blob>(
    (base) => `${base}/export${queryString ? `?${queryString}` : ""}`,
    { responseType: "blob" }
  );
}

export async function getPaymentApprovalDetailProvider(approvalId: string) {
  return requestWithPaymentApprovalsFallback<GetPaymentApprovalDetailResponse>(
    (base) => `${base}/${approvalId}`
  );
}

export async function addPaymentApprovalRemarkProvider(
  approvalId: string,
  payload: AddPaymentApprovalRemarkPayload
) {
  return requestWithPaymentApprovalsFallback<GetPaymentApprovalDetailResponse>(
    (base) => `${base}/${approvalId}/remarks`,
    { method: "post", data: payload }
  );
}

export async function addPaymentApprovalAttachmentProvider(
  approvalId: string,
  payload: AddPaymentApprovalAttachmentPayload
) {
  return requestWithPaymentApprovalsFallback<unknown>(
    (base) => `${base}/${approvalId}/attachments`,
    { method: "post", data: payload }
  );
}

export async function reviewPaymentApprovalProvider(
  approvalId: string,
  payload: ReviewPaymentApprovalPayload
) {
  return requestWithPaymentApprovalsFallback<ReviewPaymentApprovalResponse>(
    (base) => `${base}/${approvalId}/review`,
    { method: "put", data: payload }
  );
}

// ---------------- Payment Status Types & API ----------------

export type PaymentStatusStats = {
  totalOutstanding?: number;
  dueSoonCount?: number;
  overdueCount?: number;
  totalPaid?: number;
  vendorPayments?: number;
  vendorCount?: number;
  carrierPayments?: number;
  carrierCount?: number;
};

export type PaymentStatusItem = {
  _id: string;
  leadId?: {
    _id: string;
    projectName?: string;
  } | string | null;
  customerId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
  } | string | null;
  quotationId?: string | null;
  createdBy?: string;
  invoiceNumber?: string;
  description?: string;
  date?: string;
  paymentScheduleId?: string | null;
  paymentScheduleStageId?: string | null;
  daysToPay?: number;
  dueDate?: string | null;
  poNumber?: string;
  subtotal?: number;
  markupTotal?: number;
  tax?: number;
  discount?: number;
  depositAmount?: number;
  totalAmount?: number;
  status?: string;
  sentAt?: string | null;
  paidBy?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  paymentMethod?: string;
  [key: string]: unknown;
};

export type PaymentStatusData = {
  stats: PaymentStatusStats;
  overduePayments?: PaymentStatusItem[];
  dueSoon?: PaymentStatusItem[];
  paymentHistory: PaymentStatusItem[];
  total: number;
  page: number;
  limit: number;
};

export type GetPaymentStatusParams = {
  paymentMethod?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type GetPaymentStatusResponse = {
  success: boolean;
  message: string;
  data: PaymentStatusData;
};

export async function getPaymentStatusProvider(params?: GetPaymentStatusParams) {
  const queryParams = new URLSearchParams();
  if (params?.paymentMethod && params.paymentMethod !== "all" && params.paymentMethod !== "All") {
    queryParams.append("paymentMethod", params.paymentMethod);
  }
  if (params?.status && params.status !== "all" && params.status !== "All") {
    queryParams.append("status", params.status);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/payment-status${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetPaymentStatusResponse>(url);
  return response.data;
}

export async function exportPaymentStatusProvider(params?: GetPaymentStatusParams) {
  const queryParams = new URLSearchParams();
  if (params?.paymentMethod && params.paymentMethod !== "all" && params.paymentMethod !== "All") {
    queryParams.append("paymentMethod", params.paymentMethod);
  }
  if (params?.status && params.status !== "all" && params.status !== "All") {
    queryParams.append("status", params.status);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/payment-status/export${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
}

// ---------------- Tax Status & Conventions ----------------

export type TaxStatusTone = "warning" | "neutral" | "success" | "info" | string;

export type TaxStatusObject = {
  code?: string;
  label: string;
  tone?: TaxStatusTone;
};

export type TaxMeta = {
  provider?: string;
  complianceStatus?: string;
  lastSyncedAt?: string | null;
  syncState?: "not_configured" | "empty" | "synced" | "error" | string;
  canSync?: boolean;
  message?: string;
};

// ---------------- Compliance & Sync API ----------------

export type TaxComplianceStatusData = {
  provider: string;
  complianceStatus: string;
  lastSyncedAt: string | null;
  syncState: "not_configured" | "empty" | "synced" | "error" | string;
  canSync: boolean;
  message?: string;
};

export type GetTaxComplianceStatusResponse = {
  success: boolean;
  message: string;
  data: TaxComplianceStatusData;
};

export async function getTaxComplianceStatusProvider() {
  const response = await apiClient.get<GetTaxComplianceStatusResponse>(
    "/api/admin/financial-extra/tax-compliance/status"
  );
  return response.data;
}

export type TaxSyncData = {
  syncedAt: string;
  regions?: number;
  projects?: number;
  provider: string;
  mode?: string;
};

export type SyncTaxResponse = {
  success: boolean;
  message: string;
  data: TaxSyncData;
};

export async function syncTaxDataProvider() {
  const response = await apiClient.post<SyncTaxResponse>(
    "/api/admin/financial-extra/state-wise-tax/sync",
    {}
  );
  return response.data;
}

// ---------------- Project-Wise Tax Types & API ----------------

export type ProjectWiseTaxItem = {
  leadId: string;
  projectName?: string;
  jobId?: string;
  location?: string;
  customerName?: string;
  taxCollected: number;
  taxableSales: number;
  paidFiled: number;
  payable: number;
  dueDate: string;
  status: TaxStatusObject | string;
  taxRecordId?: string;
  salesTaxRateLabel?: string;
  showPayTax?: boolean;
};

export type GetProjectWiseTaxParams = {
  page?: number;
  limit?: number;
  projectId?: string;
  startDate?: string;
  endDate?: string;
};

export type GetProjectWiseTaxResponse = {
  success: boolean;
  message: string;
  data: {
    projects: ProjectWiseTaxItem[];
    total: number;
    page: number;
    limit: number;
    meta?: TaxMeta;
    lastSynced?: string;
  };
};

export async function getProjectWiseTaxProvider(params?: GetProjectWiseTaxParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  try {
    const url = `/api/admin/financial-extra/project-wise-tax${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<GetProjectWiseTaxResponse>(url);
    return response.data;
  } catch {
    const fallbackUrl = `/api/admin/financials/project-wise-tax${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<GetProjectWiseTaxResponse>(fallbackUrl);
    return response.data;
  }
}

export async function exportProjectWiseTaxProvider(params?: GetProjectWiseTaxParams) {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  try {
    const url = `/api/admin/financial-extra/project-wise-tax/export${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get(url, { responseType: "blob" });
    return response.data;
  } catch {
    const fallbackUrl = `/api/admin/financials/project-wise-tax/export${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get(fallbackUrl, { responseType: "blob" });
    return response.data;
  }
}

export type ProjectWiseTaxMetricWithPct = {
  value: number;
  pctChangeFromLastMonth?: number;
};

export type ProjectWiseTaxPendingFiling = {
  count: number;
  label?: string;
};

export type ProjectWiseTaxNextFilingDue = {
  date?: string;
  location?: string;
};

export type ProjectWiseTaxStatsData = {
  totalTaxCollected?: ProjectWiseTaxMetricWithPct;
  totalPaid?: ProjectWiseTaxMetricWithPct;
  totalPayable?: ProjectWiseTaxMetricWithPct;
  pendingFiling?: ProjectWiseTaxPendingFiling;
  nextFilingDue?: ProjectWiseTaxNextFilingDue;
};

export type GetProjectWiseTaxStatsParams = {
  projectId?: string;
  startDate?: string;
  endDate?: string;
};

export type GetProjectWiseTaxStatsResponse = {
  success: boolean;
  message: string;
  data: ProjectWiseTaxStatsData;
};

export async function getProjectWiseTaxStatsProvider(
  params?: GetProjectWiseTaxStatsParams
) {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") {
    queryParams.append("projectId", params.projectId);
  }
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  try {
    const url = `/api/admin/financial-extra/project-wise-tax/stats${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<GetProjectWiseTaxStatsResponse>(url);
    return response.data;
  } catch {
    const fallbackUrl = `/api/admin/financials/project-wise-tax/stats${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<GetProjectWiseTaxStatsResponse>(fallbackUrl);
    return response.data;
  }
}

// ---------------- Tax Filing Types & API ----------------

export type TaxFilingKPIStats = {
  totalSalesTaxable?: {
    value: number;
    pctChangeFromLastMonth?: number;
  };
  totalSalesTaxCollected?: {
    value: number;
    pctChangeFromLastMonth?: number;
  };
  taxPayableByStates?: {
    value: number;
  };
  fileVsUnfiledTax?: {
    filed: number;
    unfiled: number;
  };
};

export type GetTaxFilingStatsParams = {
  state?: string;
  projectId?: string;
  clientId?: string;
  search?: string;
};

export type GetTaxFilingStatsResponse = {
  success: boolean;
  message: string;
  data: TaxFilingKPIStats;
};

export async function getTaxFilingStatsProvider(params?: GetTaxFilingStatsParams) {
  const queryParams = new URLSearchParams();
  if (params?.state && params.state !== "all") queryParams.append("state", params.state);
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.clientId && params.clientId !== "all") queryParams.append("clientId", params.clientId);
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const url = `/api/admin/financial-extra/tax-filing/stats${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get<GetTaxFilingStatsResponse>(url);
  return response.data;
}

export type TaxFilingFilterProject = {
  leadId: string;
  projectName: string;
  jobId: string;
};

export type TaxFilingFilterClient = {
  customerId: string;
  name: string;
};

export type TaxFilingFiltersData = {
  states: string[];
  projects: TaxFilingFilterProject[];
  clients: TaxFilingFilterClient[];
};

export type GetTaxFilingFiltersResponse = {
  success: boolean;
  message: string;
  data: TaxFilingFiltersData;
};

export async function getTaxFilingFiltersProvider() {
  const response = await apiClient.get<GetTaxFilingFiltersResponse>(
    "/api/admin/financial-extra/tax-filing/filters"
  );
  return response.data;
}

export type TaxFilingLeadInfo = {
  _id?: string;
  jobId?: string;
  projectName?: string;
};

export type TaxFilingCustomerInfo = {
  _id?: string;
  firstName?: string;
  lastName?: string;
};

export type TaxFilingItem = {
  _id: string;
  state: string;
  stateLabel?: string;
  salesTaxRateLabel?: string;
  filingPeriod?: string;
  filingFrequency?: string;
  dueDate?: string;
  daysUntilDue?: number;
  daysUntilDueLabel?: string;
  taxDue?: number;
  payable?: number;
  amount?: number;
  status: TaxStatusObject | string;
  leadId?: TaxFilingLeadInfo | string | null;
  projectName?: string;
  jobId?: string;
  customerName?: string;
  customerId?: TaxFilingCustomerInfo | string | null;
  createdBy?: string;
  paidBy?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  threshold?: string;
  websiteLink?: string | null;
  __v?: number;
  // History fields
  filedDate?: string;
  taxPaid?: number;
  method?: string;
  receipt?: {
    confirmationNumber?: string;
    receiptDate?: string;
  };
};

export type TaxFilingStats = {
  totalTaxable: number;
  totalCollected: number;
  taxPayableByStates: number;
  filed: number;
  unfiled: number;
};

export type TaxFilingData = {
  stats?: TaxFilingStats;
  pendingFiling: TaxFilingItem[];
  filingHistory: TaxFilingItem[];
  page: number;
  limit: number;
  total?: number;
  meta?: TaxMeta;
};

export type GetTaxFilingParams = {
  state?: string;
  projectId?: string;
  clientId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type GetTaxFilingResponse = {
  success: boolean;
  message: string;
  data: TaxFilingData;
};

export async function getTaxFilingProvider(params?: GetTaxFilingParams) {
  const queryParams = new URLSearchParams();
  if (params?.state && params.state !== "all") {
    queryParams.append("state", params.state);
  }
  if (params?.projectId && params.projectId !== "all") {
    queryParams.append("projectId", params.projectId);
  }
  if (params?.clientId && params.clientId !== "all") {
    queryParams.append("clientId", params.clientId);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/financial-extra/tax-filing${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetTaxFilingResponse>(url);
  return response.data;
}

export async function exportTaxFilingProvider(params?: GetTaxFilingParams) {
  const queryParams = new URLSearchParams();
  if (params?.state && params.state !== "all") {
    queryParams.append("state", params.state);
  }
  if (params?.projectId && params.projectId !== "all") {
    queryParams.append("projectId", params.projectId);
  }
  if (params?.clientId && params.clientId !== "all") {
    queryParams.append("clientId", params.clientId);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/financial-extra/tax-filing/export${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
}

// ---------------- Modals — Detail, Prepare, Pay, Receipt API ----------------

export type TaxDetailActivity = {
  at: string;
  type?: string;
  amount?: number;
  label: string;
};

export type TaxDetailInfo = {
  _id: string;
  state: string;
  stateLabel?: string;
  uiStatus: TaxStatusObject;
  filingPeriod: string;
  filingPeriodRange?: {
    start: string;
    end: string;
  };
  filingFrequency: string;
  filingDueDate: string;
  daysUntilDue?: number;
  breakdown: {
    taxCollected: number;
    taxPaid: number;
    penalty: number;
    interest: number;
    totalPayable: number;
  };
  payNow: {
    enabled: boolean;
    amount: number;
    currency: string;
    provider: string;
    providerLabel?: string;
  };
  recentActivity: TaxDetailActivity[];
};

export type GetTaxFilingDetailResponse = {
  success: boolean;
  message: string;
  data: {
    detail: TaxDetailInfo;
    avalara?: {
      filingId?: string;
      returnsConfigured?: boolean;
      source?: string;
    };
  };
};

export async function getTaxFilingDetailProvider(id: string) {
  const response = await apiClient.get<GetTaxFilingDetailResponse>(
    `/api/admin/financial-extra/tax-filing/${id}/detail`
  );
  return response.data;
}

export type PrepareTaxFilingData = {
  tax: {
    _id: string;
    state: string;
    status: string;
    taxDue: number;
    payable: number;
    taxCollected: number;
    taxableSales: number;
    source?: string;
  };
  detail: Partial<TaxDetailInfo>;
  message: string;
};

export type PrepareTaxFilingResponse = {
  success: boolean;
  message: string;
  data: PrepareTaxFilingData;
};

export async function prepareTaxFilingProvider(id: string) {
  const response = await apiClient.get<PrepareTaxFilingResponse>(
    `/api/admin/financial-extra/tax-filing/${id}/prepare`
  );
  return response.data;
}

export type TaxPaymentPayload = {
  paymentMethod: string;
  notificationEmail: string;
};

export type TaxPaymentResult = {
  amountPaid: number;
  filingPeriod: {
    start: string;
    end: string;
  } | string | null;
  paymentMethod: string;
  confirmationNumber: string;
  status: string;
  estimatedSettlement: string;
  notificationEmail: string;
};

export type ApproveTaxFilingResponse = {
  success: boolean;
  message: string;
  data: {
    payment: TaxPaymentResult;
    tax?: {
      _id: string;
      status: string;
      paymentStatus: string;
      confirmationNumber: string;
      providerMethod: string;
      amount?: number;
      taxDue?: number;
      payable?: number;
      filingFrequency?: string;
    };
    avalara?: {
      ok?: boolean;
      skipped?: boolean;
      reason?: string;
      regionRow?: {
        filingId: number | string;
        status: string;
        region: string;
        taxAmount: number;
      };
    };
  };
};

export async function approveTaxFilingProvider(id: string, payload: TaxPaymentPayload) {
  const response = await apiClient.post<ApproveTaxFilingResponse>(
    `/api/admin/financial-extra/tax-filing/${id}/approve`,
    payload
  );
  return response.data;
}

export async function payTaxFilingProvider(id: string, payload: TaxPaymentPayload) {
  const response = await apiClient.post<ApproveTaxFilingResponse>(
    `/api/admin/financial-extra/tax-filing/${id}/pay`,
    payload
  );
  return response.data;
}

export async function submitTaxPaymentProvider(id: string, payload: TaxPaymentPayload) {
  try {
    return await approveTaxFilingProvider(id, payload);
  } catch (err: unknown) {
    const errorObj = err as {
      response?: { status?: number; data?: { message?: string } };
    };
    // If Returns env is missing, approve may return 400 with Avalara error; use /pay in staging.
    if (
      errorObj?.response?.status === 400 ||
      errorObj?.response?.data?.message?.toLowerCase?.()?.includes("avalara")
    ) {
      return await payTaxFilingProvider(id, payload);
    }
    throw err;
  }
}

export type TaxReceiptData = {
  confirmationNumber: string;
  amountPaid: number;
  paidAt: string;
  state: string;
  method: string;
  paymentMethod: string;
  receipt?: {
    confirmationNumber: string;
    receiptDate: string;
  };
  download?: {
    format: string;
    urlHint: string;
  };
};

export type GetTaxReceiptResponse = {
  success: boolean;
  message: string;
  data: TaxReceiptData;
};

export async function getTaxFilingReceiptProvider(id: string) {
  const response = await apiClient.get<GetTaxReceiptResponse>(
    `/api/admin/financial-extra/tax-filing/${id}/receipt`
  );
  return response.data;
}

export async function downloadTaxFilingReceiptPdfProvider(id: string) {
  const response = await apiClient.get(
    `/api/admin/financial-extra/tax-filing/${id}/receipt?format=pdf`,
    {
      responseType: "blob",
    }
  );
  return response.data;
}

// ---------------- State-Wise Tax Types & API ----------------

export type StateOverviewItem = {
  _id?: string;
  state?: string;
  stateLabel?: string;
  salesTaxRateLabel?: string;
  taxCollected: number;
  taxableSales: number;
  paidFiled: number;
  payable: number;
  dueDate?: string;
  nextDue?: string;
  status: TaxStatusObject | string;
  rate?: string;
  taxRecordId?: string;
};

export type StateWiseTaxData = {
  stats: {
    totalTaxCollected: number;
    totalPaid: number;
    totalPayable: number;
    pendingFilingStates: number;
    nextFilingDue?: string;
  };
  stateOverview: StateOverviewItem[];
  meta?: TaxMeta;
  lastSynced?: string;
};

export type GetStateWiseTaxParams = {
  projectId?: string;
  startDate?: string;
  endDate?: string;
};

export type GetStateWiseTaxResponse = {
  success: boolean;
  message: string;
  data: StateWiseTaxData;
};

export async function getStateWiseTaxProvider(params?: GetStateWiseTaxParams) {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") {
    queryParams.append("projectId", params.projectId);
  }
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  const queryString = queryParams.toString();
  try {
    const url = `/api/admin/financial-extra/state-wise-tax${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<GetStateWiseTaxResponse>(url);
    return response.data;
  } catch {
    const fallbackUrl = `/api/admin/financials/state-wise-tax${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<GetStateWiseTaxResponse>(fallbackUrl);
    return response.data;
  }
}

export type StateWiseTaxStatsMetric = {
  value: number;
  pctChangeFromLastMonth?: number;
};

export type StateWiseTaxStatsPendingFiling = {
  count: number;
  label?: string;
};

export type StateWiseTaxStatsNextFilingDue = {
  date?: string;
  state?: string;
};

export type StateWiseTaxStatsData = {
  totalTaxCollected?: StateWiseTaxStatsMetric;
  totalPaid?: StateWiseTaxStatsMetric;
  totalPayable?: StateWiseTaxStatsMetric;
  pendingFilingStates?: StateWiseTaxStatsPendingFiling;
  nextFilingDue?: StateWiseTaxStatsNextFilingDue;
};

export type GetStateWiseTaxStatsParams = {
  projectId?: string;
  startDate?: string;
  endDate?: string;
};

export type GetStateWiseTaxStatsResponse = {
  success: boolean;
  message: string;
  data: StateWiseTaxStatsData;
};

export async function getStateWiseTaxStatsProvider(params?: GetStateWiseTaxStatsParams) {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") {
    queryParams.append("projectId", params.projectId);
  }
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  const queryString = queryParams.toString();
  try {
    const url = `/api/admin/financial-extra/state-wise-tax/stats${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<GetStateWiseTaxStatsResponse>(url);
    return response.data;
  } catch {
    const fallbackUrl = `/api/admin/financials/state-wise-tax/stats${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<GetStateWiseTaxStatsResponse>(fallbackUrl);
    return response.data;
  }
}

export async function exportStateWiseTaxProvider(params?: GetStateWiseTaxParams) {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") {
    queryParams.append("projectId", params.projectId);
  }
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  const queryString = queryParams.toString();
  try {
    const url = `/api/admin/financial-extra/state-wise-tax/export${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get(url, { responseType: "blob" });
    return response.data;
  } catch {
    const fallbackUrl = `/api/admin/financials/state-wise-tax/export${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get(fallbackUrl, { responseType: "blob" });
    return response.data;
  }
}

export type StateWiseTaxDeadlineItem = {
  _id: string;
  taxRecordId?: string;
  state: string;
  filingType?: string;
  dueDate: string;
  daysLeft?: number;
  daysUntilDue?: number;
  daysUntilDueLabel?: string;
  status?: TaxStatusObject | string;
  projectName?: string;
  leadId?: string;
  jobId?: string;
  location?: string;
  payable?: number;
  [key: string]: unknown;
};

export type GetStateWiseTaxUpcomingDeadlinesParams = {
  limit?: number;
  projectId?: string;
  scope?: "state" | "project";
};

export type GetStateWiseTaxUpcomingDeadlinesResponse = {
  success: boolean;
  message: string;
  data: {
    deadlines: StateWiseTaxDeadlineItem[];
    total?: number;
    meta?: TaxMeta;
  };
};

export async function getStateWiseTaxUpcomingDeadlinesProvider(
  params?: GetStateWiseTaxUpcomingDeadlinesParams
) {
  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }
  if (params?.projectId && params.projectId !== "all") {
    queryParams.append("projectId", params.projectId);
  }
  if (params?.scope) {
    queryParams.append("scope", params.scope);
  }

  const queryString = queryParams.toString();
  try {
    const url = `/api/admin/financial-extra/state-wise-tax/upcoming-deadlines${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await apiClient.get<GetStateWiseTaxUpcomingDeadlinesResponse>(url);
    return response.data;
  } catch {
    const fallbackUrl = `/api/admin/financials/state-wise-tax/upcoming-deadlines${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await apiClient.get<GetStateWiseTaxUpcomingDeadlinesResponse>(fallbackUrl);
    return response.data;
  }
}

// ---------------- Payments Dashboard Types & API ----------------

export type PaymentsDashboardStats = {
  totalPayments?: number;
  totalInvoicedToClients?: number;
  totalReceived?: number;
  totalOutstanding?: number;
  totalOverdue?: number;
  totalOverdueYTD?: number;
  totalOverdueYTDPct?: number;
  totalToReceiveFromClients?: number;
  totalScheduledToReceiveFromClients?: number;
  scheduledStageCount?: number;
  balanceDueOnInvoices?: number;
  [key: string]: unknown;
};

export type StatusDistributionItem = {
  _id?: string;
  status?: string;
  statusLabel?: string;
  clientCount?: number;
  paymentCount?: number;
  count?: number;
  amount: number;
  percent?: number;
  countSharePct?: number;
  [key: string]: unknown;
};

export type RevenueTrendItem = {
  _id: {
    year: number;
    month: number;
    status: string;
  };
  amount: number;
};

export type RevenueTrendChartItem = {
  label: string;
  year: number;
  month: number;
  received: number;
  projected: number;
};

export type ExpectedPaymentItem = {
  _id?: string;
  bucket?: string;
  amount: number;
  percent?: number;
  [key: string]: unknown;
};

export type StageWiseItem = {
  _id: string;
  key?: string;
  progressPct?: number;
  clientCount?: number;
  count?: number;
  amount: number;
  [key: string]: unknown;
};

export type RecentPaymentCustomer = {
  _id?: string;
  firstName?: string;
  lastName?: string;
};

export type RecentPaymentLead = {
  _id?: string;
  projectName?: string;
};

export type RecentPaymentLineItem = {
  _id?: string;
  description?: string;
  items?: string[];
  rate?: number;
  quantity?: number;
  total?: number;
  [key: string]: unknown;
};

export type RecentPaymentProofFile = {
  url?: string;
  name?: string;
};

export type RecentPaymentProof = {
  status?: string;
  files?: RecentPaymentProofFile[];
  transactionId?: string;
  paymentDate?: string;
  amount?: number;
  submittedAt?: string;
  [key: string]: unknown;
};

export type RecentPaymentItem = {
  id?: string;
  _id?: string;
  date?: string;
  clientName?: string;
  projectName?: string;
  clientProjectLabel?: string;
  invoiceNumber?: string;
  amount?: number;
  received?: number;
  paymentMode?: string;
  status?: string;
  statusLabel?: string;
  leadId?: RecentPaymentLead | null;
  customerId?: RecentPaymentCustomer | null;
  quotationId?: string | null;
  createdBy?: string;
  description?: string;
  daysToPay?: number | null;
  dueDate?: string | null;
  poNumber?: string;
  lineItems?: RecentPaymentLineItem[];
  subtotal?: number;
  markupTotal?: number;
  tax?: number;
  discount?: number;
  depositAmount?: number;
  totalAmount?: number;
  sentAt?: string | null;
  paidBy?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  paymentProof?: RecentPaymentProof;
  paymentMethod?: string;
  [key: string]: unknown;
};

export type PaymentsDashboardData = {
  stats: PaymentsDashboardStats;
  statusDistribution: StatusDistributionItem[];
  revenueTrend: RevenueTrendItem[];
  revenueTrendChart?: RevenueTrendChartItem[];
  expectedPayments: ExpectedPaymentItem[];
  stageWise: StageWiseItem[];
  recentPayments: RecentPaymentItem[];
  recentPaymentsPage?: number;
  recentPaymentsLimit?: number;
  recentPaymentsTotal?: number;
};

export type GetPaymentsDashboardParams = {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type GetPaymentsDashboardResponse = {
  success: boolean;
  message: string;
  data: PaymentsDashboardData;
};

export async function getPaymentsDashboardProvider(
  params?: GetPaymentsDashboardParams
) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/payments-dashboard${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await apiClient.get<GetPaymentsDashboardResponse>(url);
  return response.data;
}

export async function exportPaymentsDashboardProvider(
  params?: GetPaymentsDashboardParams
) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/payments-dashboard/export${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
}


