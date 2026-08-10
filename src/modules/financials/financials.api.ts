import { apiClient } from "@/modules/auth/auth.api";

export type PaymentRecord = {
  _id: string;
  payerName: string;
  paymentType: string;
  amount: number;
  paymentDate: string;
  transactionId: string;
  remarks: string;
  recordedBy: string;
  recordedAt: string;
};

export type LeadInfo = {
  _id: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  location: string;
  jobId: string;
  projectName: string;
};

export type WipItem = {
  _id: string;
  leadId: LeadInfo;
  orderValue: number;
  currentCost: number;
  depositPaid: number;
  progressPaid: number;
  finalPaid: number;
  outstanding: number;
  wipProfit: number;
  marginPct: number;
  status: string;
  notes: string;
  createdBy: string;
  payments: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type WipStats = {
  _id: string | null;
  totalOrderValue: number;
  totalReceived: number;
  outstanding: number;
  wipProfit: number;
};

export type GetWipProfitsParams = {
  clientId?: string;
  page?: number;
  limit?: number;
};

export type GetWipProfitsResponse = {
  success: boolean;
  message: string;
  data: {
    stats: WipStats;
    wips: WipItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function getWipProfitsProvider(params?: GetWipProfitsParams) {
  const queryParams = new URLSearchParams();
  if (params?.clientId) queryParams.append("clientId", params.clientId);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/wip-profits${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetWipProfitsResponse>(url);
  return response.data;
}

export async function exportWipProfitsProvider(params?: { clientId?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.clientId) queryParams.append("clientId", params.clientId);

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/wip-profits/export${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });
  return response.data;
}

export type ExpenseFilterProject = {
  leadId: string;
  projectName: string;
  jobId: string;
};

export type ExpensesFiltersData = {
  categories: string[];
  buildingLabels: string[];
  statuses: string[];
  paymentMethods: string[];
  projects: ExpenseFilterProject[];
};

export type GetExpensesFiltersResponse = {
  success: boolean;
  message: string;
  data: ExpensesFiltersData;
};

export type ExpenseCategoryStat = {
  category: string;
  total: number;
};

export type ExpenseStats = {
  totalExpense: number;
  byCategory: ExpenseCategoryStat[];
};

export type ExpenseUserRef = {
  _id: string;
  name: string;
};

export type ExpenseLeadRef = {
  _id: string;
  jobId: string;
  projectName: string;
};

export type ExpenseItem = {
  _id: string;
  expenseId: string;
  category: string;
  subcategory: string;
  date: string;
  amount: number;
  description: string;
  leadId: ExpenseLeadRef | string | null;
  buildingLabel: string;
  paymentMethod: string;
  status: string;
  receiptFile?: string;
  isActive: boolean;
  createdBy: ExpenseUserRef | string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type GetExpensesParams = {
  projectId?: string;
  buildingLabel?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type GetExpensesResponse = {
  success: boolean;
  message: string;
  data: {
    stats: ExpenseStats;
    expenses: ExpenseItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function getExpensesFiltersProvider() {
  const response = await apiClient.get<GetExpensesFiltersResponse>(
    "/api/admin/financials/expenses/filters"
  );
  return response.data;
}

export async function getExpensesProvider(params?: GetExpensesParams) {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append("projectId", params.projectId);
  if (params?.buildingLabel) queryParams.append("buildingLabel", params.buildingLabel);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/admin/financials/expenses${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GetExpensesResponse>(url);
  return response.data;
}

export type ExpenseCategoryApiItem = {
  _id: string;
  name: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type GetExpenseCategoriesResponse = {
  success: boolean;
  message: string;
  data: {
    categories: ExpenseCategoryApiItem[];
  };
};

export async function getExpenseCategoriesProvider() {
  const response = await apiClient.get<GetExpenseCategoriesResponse>(
    "/api/admin/financials/expenses/categories"
  );
  return response.data;
}

export type CreateExpenseCategoryPayload = {
  name: string;
};

export type CreateExpenseCategoryResponse = {
  success: boolean;
  message: string;
  data: ExpenseCategoryApiItem;
};

export async function createExpenseCategoryProvider(
  payload: CreateExpenseCategoryPayload
) {
  const response = await apiClient.post<CreateExpenseCategoryResponse>(
    "/api/admin/financials/expenses/categories",
    payload
  );
  return response.data;
}

export type MonthlyExpenseCategory = {
  category: string;
  total: number;
};

export type MonthlyExpensesSummaryData = {
  month: string;
  totalExpenses: number;
  categories: MonthlyExpenseCategory[];
};

export type GetMonthlyExpensesSummaryResponse = {
  success: boolean;
  message: string;
  data: MonthlyExpensesSummaryData;
};

export async function getMonthlyExpensesSummaryProvider() {
  const response = await apiClient.get<GetMonthlyExpensesSummaryResponse>(
    "/api/admin/financials/expenses/summary/monthly"
  );
  return response.data;
}

export type ExpenseByCategoryItem = {
  category: string;
  total: number;
  percentage: number;
};

export type ExpensesByCategoryData = {
  totalExpenses: number;
  categories: ExpenseByCategoryItem[];
};

export type GetExpensesByCategoryResponse = {
  success: boolean;
  message: string;
  data: ExpensesByCategoryData;
};

export async function getExpensesByCategoryProvider() {
  const response = await apiClient.get<GetExpensesByCategoryResponse>(
    "/api/admin/financials/expenses/by-category"
  );
  return response.data;
}

export type BudgetVsActualTrendItem = {
  month: string;
  budget: number;
  actual: number;
};

export type BudgetVsActualTrendData = {
  totalBudget: number;
  totalActual: number;
  variancePct: number;
  trend: BudgetVsActualTrendItem[];
};

export type GetBudgetVsActualTrendResponse = {
  success: boolean;
  message: string;
  data: BudgetVsActualTrendData;
};


export async function getBudgetVsActualTrendProvider() {
  const response = await apiClient.get<GetBudgetVsActualTrendResponse>(
    "/api/admin/financials/expenses/budget-vs-actual-trend"
  );
  return response.data;
}

export type CreateExpensePayload = {
  category: string;
  subcategory: string;
  date: string;
  amount: number;
  description?: string;
  leadId?: string;
  buildingLabel?: string;
  paymentMethod: string;
  status: string;
  receiptFile?: string;
};

export type CreateExpenseResponse = {
  success: boolean;
  message: string;
  data: {
    expense: ExpenseItem;
  };
};

export async function createExpenseProvider(payload: CreateExpensePayload) {
  const response = await apiClient.post<CreateExpenseResponse>(
    "/api/admin/financials/expenses",
    payload
  );
  return response.data;
}

export type AddWipPaymentPayload = {
  payerName?: string;
  paymentType: string;
  amount: number;
  paymentDate: string;
  transactionId: string;
  remarks?: string;
};

export type AddWipPaymentResponse = {
  success: boolean;
  message: string;
  data: PaymentRecord;
};

export async function addWipPaymentProvider(
  leadId: string,
  payload: AddWipPaymentPayload
) {
  const response = await apiClient.post<AddWipPaymentResponse>(
    `/api/admin/financials/wip-profits/${encodeURIComponent(leadId)}/payments`,
    payload
  );
  return response.data;
}

export type ProfitLossSummaryPeriod = {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit?: number;
};

export type ProfitLossIncomeBreakdown = {
  projectRevenue: number;
  otherIncome: number;
  totalIncome: number;
};

export type ProfitLossExpenseBreakdown = {
  directCosts: number;
  indirectCosts: number;
  administrativeExpenses: number;
  otherExpenses: number;
  totalExpenses: number;
};

export type ProfitLossData = {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  netProfitMargin: number;
  summary: {
    thisMonth: ProfitLossSummaryPeriod;
    lastMonth: ProfitLossSummaryPeriod;
  };
  incomeBreakdown: ProfitLossIncomeBreakdown;
  expenseBreakdown: ProfitLossExpenseBreakdown;
};

export type GetProfitLossResponse = {
  success: boolean;
  message: string;
  data: ProfitLossData;
};

export async function getProfitLossProvider() {
  const response = await apiClient.get<GetProfitLossResponse>(
    "/api/admin/financials/profit-loss"
  );
  return response.data;
}

export type MonthlyFreightCostTrendItem = {
  _id: {
    year: number;
    month: number;
  };
  cost: number;
  deliveries: number;
};

export type CostDistributionByCarrierItem = {
  _id: string;
  total: number;
  carrierName: string;
};

export type FreightCostTrackingData = {
  totalFreightCost: number;
  activeCarriers: number;
  avgCostPerDelivery: number;
  pendingInvoices: number;
  monthlyFreightCostTrend: MonthlyFreightCostTrendItem[];
  costDistributionByCarrier: CostDistributionByCarrierItem[];
};

export type GetFreightCostTrackingResponse = {
  success: boolean;
  message: string;
  data: FreightCostTrackingData;
};

export async function getFreightCostTrackingProvider() {
  const response = await apiClient.get<GetFreightCostTrackingResponse>(
    "/api/admin/financials/freight-cost-tracking"
  );
  return response.data;
}

export type MarginTrendItem = {
  _id: {
    year: number;
    month: number;
  };
  revenue: number;
};

export type ProjectMarginItem = {
  _id: string;
  revenue: number;
  projectName: string;
  category: string;
};

export type MarginAnalysisData = {
  grossMarginPct: number;
  operatingMarginPct: number;
  netProfitMarginPct: number;
  contributionMarginPct: number;
  avgSellingPrice: number;
  marginTrend: MarginTrendItem[];
  projectMargins: ProjectMarginItem[];
  plSummary: ProjectMarginItem[];
};

export type GetMarginAnalysisResponse = {
  success: boolean;
  message: string;
  data: MarginAnalysisData;
};

export async function getMarginAnalysisProvider() {
  const response = await apiClient.get<GetMarginAnalysisResponse>(
    "/api/admin/financials/margin-analysis"
  );
  return response.data;
}











