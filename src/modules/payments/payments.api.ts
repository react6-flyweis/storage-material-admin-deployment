import { apiClient } from "@/modules/auth/auth.api";

// ---------------- Payment Approvals Types & API ----------------

export type PaymentApprovalRequestedByUser = {
  _id?: string;
  userId?: string;
  name: string;
};

export type PaymentApprovalsFiltersData = {
  categories: string[];
  statuses: string[];
  requestedBy: PaymentApprovalRequestedByUser[];
};

export type GetPaymentApprovalsFiltersResponse = {
  success: boolean;
  message: string;
  data: PaymentApprovalsFiltersData;
};

export type PaymentApprovalItem = {
  _id: string;
  paymentId: string;
  payee: string;
  payeeType: string;
  category: string;
  amount: number;
  requestedBy: PaymentApprovalRequestedByUser | string;
  department?: string;
  notes?: string;
  status: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string;
  leadId?: string | null;
  invoiceNumber?: string;
  dueDate?: string | null;
  linkedType?: string | null;
  linkedId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type PaymentApprovalsStats = {
  totalRequests: number;
  pendingApproval: number;
  pendingAmount: number;
  approved: number;
  approvedAmount: number;
  rejected: number;
  totalAmount: number;
};

export type GetPaymentApprovalsParams = {
  requestedBy?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type GetPaymentApprovalsResponse = {
  success: boolean;
  message: string;
  data: {
    approvals: PaymentApprovalItem[];
    total: number;
    page: number;
    limit: number;
    stats: PaymentApprovalsStats;
  };
};

export async function getPaymentApprovalsFiltersProvider() {
  const response = await apiClient.get<GetPaymentApprovalsFiltersResponse>(
    "/api/admin/financials/payment-approvals/filters"
  );
  return response.data;
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
  const url = `/api/admin/financials/payment-approvals${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetPaymentApprovalsResponse>(url);
  return response.data;
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
  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/payment-approvals/export${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
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
  status: string;
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
  const url = `/api/admin/financials/project-wise-tax${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetProjectWiseTaxResponse>(url);
  return response.data;
}

export async function exportProjectWiseTaxProvider(params?: GetProjectWiseTaxParams) {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/project-wise-tax/export${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
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
  const url = `/api/admin/financials/project-wise-tax/stats${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetProjectWiseTaxStatsResponse>(url);
  return response.data;
}

// ---------------- Tax Filing Types & API ----------------

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
    "/api/admin/financials/tax-filing/filters"
  );
  return response.data;
}

export type TaxFilingLeadInfo = {
  _id: string;
  jobId: string;
  projectName: string;
};

export type TaxFilingCustomerInfo = {
  _id: string;
  firstName: string;
  lastName: string;
};

export type TaxFilingItem = {
  _id: string;
  state: string;
  dueDate: string;
  amount: number;
  filingFrequency?: string;
  threshold?: string;
  websiteLink?: string | null;
  status: string;
  leadId?: TaxFilingLeadInfo;
  customerId?: TaxFilingCustomerInfo;
  createdBy?: string;
  paidBy?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type TaxFilingStats = {
  totalTaxable: number;
  totalCollected: number;
  taxPayableByStates: number;
  filed: number;
  unfiled: number;
};

export type TaxFilingData = {
  stats: TaxFilingStats;
  pendingFiling: TaxFilingItem[];
  filingHistory: TaxFilingItem[];
  page: number;
  limit: number;
  total?: number;
};

export type GetTaxFilingParams = {
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
  const url = `/api/admin/financials/tax-filing${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetTaxFilingResponse>(url);
  return response.data;
}

export async function exportTaxFilingProvider(params?: GetTaxFilingParams) {
  const queryParams = new URLSearchParams();
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
  const url = `/api/admin/financials/tax-filing/export${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
}

// ---------------- State-Wise Tax Types & API ----------------

export type StateOverviewItem = {
  _id: string;
  taxCollected: number;
  taxableSales: number;
  paidFiled: number;
  payable: number;
  nextDue?: string;
  status: string;
  rate?: string;
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
  const url = `/api/admin/financials/state-wise-tax${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetStateWiseTaxResponse>(url);
  return response.data;
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

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/state-wise-tax/stats${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetStateWiseTaxStatsResponse>(url);
  return response.data;
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
  const url = `/api/admin/financials/state-wise-tax/export${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
}

export type StateWiseTaxDeadlineItem = {
  _id: string;
  state: string;
  filingType: string;
  dueDate: string;
  daysLeft: number;
};

export type GetStateWiseTaxUpcomingDeadlinesParams = {
  limit?: number;
};

export type GetStateWiseTaxUpcomingDeadlinesResponse = {
  success: boolean;
  message: string;
  data: {
    deadlines: StateWiseTaxDeadlineItem[];
    total: number;
  };
};

export async function getStateWiseTaxUpcomingDeadlinesProvider(
  params?: GetStateWiseTaxUpcomingDeadlinesParams
) {
  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/state-wise-tax/upcoming-deadlines${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await apiClient.get<GetStateWiseTaxUpcomingDeadlinesResponse>(url);
  return response.data;
}

// ---------------- Payments Dashboard Types & API ----------------

export type PaymentsDashboardStats = {
  totalPayments: number;
  totalReceived: number;
  totalOutstanding: number;
  totalOverdue: number;
  totalOverdueYTD: number;
  totalOverdueYTDPct: number;
};

export type StatusDistributionItem = {
  _id: string;
  count: number;
  amount: number;
};

export type RevenueTrendItem = {
  _id: {
    year: number;
    month: number;
    status: string;
  };
  amount: number;
};

export type ExpectedPaymentItem = {
  _id: string;
  amount: number;
};

export type StageWiseItem = {
  _id: string;
  count: number;
  amount: number;
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
  _id: string;
  leadId?: RecentPaymentLead | null;
  customerId?: RecentPaymentCustomer | null;
  quotationId?: string | null;
  createdBy?: string;
  invoiceNumber?: string;
  description?: string;
  date?: string;
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
  status?: string;
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
  expectedPayments: ExpectedPaymentItem[];
  stageWise: StageWiseItem[];
  recentPayments: RecentPaymentItem[];
};

export type GetPaymentsDashboardParams = {
  startDate?: string;
  endDate?: string;
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


