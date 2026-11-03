export type DashboardPeriod = "today" | "week" | "month" | "all";

export interface DashboardQueryParams {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface DashboardKPIs {
  totalLeads: number;
  confirmedLeads: number;
  pipelineValue: number;
  monthlyRevenue: number;
  revenue?: number;
  unreadMessages?: number;
}

export interface DeliveryFinance {
  freightSpend: number;
  pendingCarrierPayments: number;
  freightSavings: number;
}

export interface LoadOptimization {
  totalBundlesCreated: number;
  totalBundlesCreatedChangePct: number;
  totalTruckloadsPlanned: number;
  totalTruckloadsPlannedChangePct: number;
  avgLoadUtilizationPct: number;
  avgLoadUtilizationChangePct: number;
  optimizationSavings: number;
  optimizationSavingsChangePct: number;
  bundlePlans?: number;
}

export interface DeliveryOperations {
  totalDeliveriesToday: number;
  upcomingDeliveries: number;
  delayedDeliveries: number;
  rescheduledDeliveries: number;
  completedDeliveriesToday: number;
}

export interface CommunicationStatus {
  confirmationsSentPct: number;
  reminders48hrSentPct: number;
  reminders24hrSentPct: number;
  failedNotificationsPct: number;
  totals?: {
    sent: number;
    failed: number;
    total: number;
  };
}

export interface FreightActivity {
  activeFreightRequests: number;
  bidsPending: number;
  loadsAwardedToday: number;
  loadsInTransit: number;
  delayedShipments: number;
}

export interface ConversionFunnelStage {
  key: string;
  label: string;
  count: number;
  pct: number;
}

export interface ConversionFunnel {
  newLeads: number;
  contacted: number;
  inPipeline: number;
  closedWon: number;
  stages: ConversionFunnelStage[];
}

export interface DealSizeBucket {
  key: string;
  label: string;
  count: number;
  pct: number;
  totalValue: number;
}

export interface DealSizeDistribution {
  averageDealSize: number;
  totalDeals: number;
  buckets: DealSizeBucket[];
}

export interface ReportsWeeklyDataPoint {
  date: string;
  label: string;
  revenue: number;
  income: number;
  expense: number;
}

export interface ReportsOverview {
  customers: number;
  revenue: number;
  income: number;
  expense: number;
  weeklySeries: ReportsWeeklyDataPoint[];
}

export interface LeadSourceItem {
  source?: string;
  channel?: string;
  count: number;
  pct: number;
}

export interface LeadSources {
  totalLeads: number;
  bySource: LeadSourceItem[];
  byChannel: { channel: string; count: number; pct: number }[];
}

export interface DispatchReadiness {
  loadsReadyForPickup: number;
  loadsReadyForPickupChangePct: number;
  pendingMaterial: number;
  pendingMaterialChangePct: number;
  pickupsToday: number;
  pickupsTodayChangePct: number;
  missedPickups: number;
  missedPickupsChangePct: number;
}

export interface LeadConversionStage {
  key: string;
  label: string;
  count: number;
  pct: number;
}

export interface LeadConversion {
  totalLeads: number;
  stages: LeadConversionStage[];
}

export interface TonnageCategory {
  category: string;
  tonnage: number;
  deals: number;
  value: number;
  pct: number;
}

export interface TonnageSold {
  total: number;
  categories: TonnageCategory[];
}

export interface OpsKPIs {
  onTimeDeliveryPct: number;
  acknowledgementsPendingPct: number;
  deliverySuccessRate: number;
  rescheduleRate: number;
}

export interface PipelineStageOverviewItem {
  status: string;
  label: string;
  count: number;
}

export interface PipelineStageOverview {
  stages: PipelineStageOverviewItem[];
}

export interface QueryHandling {
  employeeHandled: number;
  employeeHandledPct: number;
  aiHandled: number;
  aiHandledPct: number;
  withAi?: number;
  withSales?: number;
  total: number;
}

export interface PipelineKanbanLead {
  id: string;
  name: string;
  value: number;
  updatedAt: string;
  assignedTo: string;
  lifecycleStatus: string;
}

export interface PipelineKanbanColumn {
  key: string;
  label: string;
  total: number;
  leads: PipelineKanbanLead[];
}

export interface PipelineKanban {
  columns: PipelineKanbanColumn[];
}

export interface RecentClosedDealItem {
  id: string;
  name: string;
  value: number;
  closedAt: string;
  assignedTo: string;
  status: string;
}

export interface RecentClosedDeals {
  totalThisWeek: number;
  items: RecentClosedDealItem[];
}

export interface SalesActivityItem {
  type: string;
  title: string;
  value: number;
  at: string;
  actor: string;
}

export interface SalesActivity {
  items: SalesActivityItem[];
}

export interface SalesPerformer {
  rank: number;
  id?: string;
  name: string;
  leads?: number;
  closedLeads: number;
  revenue: number;
  closeRate: number;
}

export interface TopSalesPerformers {
  teamTotal: number;
  topPerformer: SalesPerformer;
  performers: SalesPerformer[];
}

export interface TaxSummary {
  totalTaxDue: number;
  totalSales: number;
  avgTaxRate: number;
  filings: number;
}

export interface TaxByStateItem {
  state: string;
  contracts: number;
  taxDue: number;
  totalSales: number;
  taxRate: number;
}

export interface TaxByState {
  states: TaxByStateItem[];
}

export interface TaxByBuildingTypeItem {
  buildingType: string;
  sales: number;
  tax: number;
  deals: number;
  pct: number;
}

export interface TaxByBuildingType {
  totalTax: number;
  items: TaxByBuildingTypeItem[];
}

export interface ConstructionProgressProject {
  id: string;
  projectName: string;
  projectCode: string;
  manager: string;
  lifecycleStatus: string;
  statusLabel: string;
  progressPct: number;
}

export interface ConstructionProgress {
  projects: ConstructionProgressProject[];
}

export interface PlantProduction {
  materialValue: number;
  materialValueChangePct: number;
  outflowThisMonth: number;
  outflowChangePct: number;
  reorderRequestsPending: number;
  reorderRequestsChangePct: number;
  emergencyMaterialAlerts: number;
  emergencyAlertsChangePct: number;
}

export interface BusinessHighlightsTopSector {
  key: string;
  label: string;
  value: number;
  deals: number;
  monthOverMonthPct: number;
}

export interface BusinessHighlightsTopCustomer {
  id: string;
  name: string;
  totalProfit: number;
  revenue: number;
  deals: number;
}

export interface BusinessHighlights {
  topSector: BusinessHighlightsTopSector;
  topCustomerByProfit: BusinessHighlightsTopCustomer;
  currentMonthOI: number;
  oiGrowthRatePct: number;
}

export interface CustomerActivityApproval {
  id: string;
  name: string;
  date: string;
  status: string;
  amount: number;
  type: string;
}

export interface CustomerApprovals {
  totalInvoicesGenerated: number;
  activities: CustomerActivityApproval[];
  invoices: unknown[];
}

export interface SalesMixSlice {
  key: string;
  label: string;
  amount: number;
  pct: number;
}

export interface SalesMix {
  sales: number;
  revenue: number;
  expenses: number;
  slices: SalesMixSlice[];
}

export interface DashboardOverviewData {
  period: string;
  generatedAt: string;
  kpis: DashboardKPIs;
  deliveryFinance: DeliveryFinance;
  loadOptimization: LoadOptimization;
  deliveryOperations: DeliveryOperations;
  communicationStatus: CommunicationStatus;
  freightActivity: FreightActivity;
  conversionFunnel: ConversionFunnel;
  dealSizeDistribution: DealSizeDistribution;
  reportsOverview: ReportsOverview;
  leadSources: LeadSources;
  dispatchReadiness: DispatchReadiness;
  leadConversion: LeadConversion;
  tonnageSold: TonnageSold;
  opsKpis: OpsKPIs;
  pipelineStageOverview: PipelineStageOverview;
  queryHandling: QueryHandling;
  pipelineKanban: PipelineKanban;
  recentClosedDeals: RecentClosedDeals;
  salesActivity: SalesActivity;
  topPerformers: TopSalesPerformers;
  taxSummary: TaxSummary;
  taxByState: TaxByState;
  taxByBuildingType: TaxByBuildingType;
  constructionProgress: ConstructionProgress;
  plantProduction: PlantProduction;
  businessHighlights: BusinessHighlights;
  customerApprovals: CustomerApprovals;
  salesMix: SalesMix;
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: DashboardOverviewData;
}

export interface DashboardSearchLead {
  id: string;
  type: "lead";
  name: string;
  projectName?: string;
  projectId?: string;
  value?: number;
  status?: string;
}

export interface DashboardSearchProject {
  id: string;
  type: "project";
  name: string;
  projectId?: string;
  status?: string;
}

export interface DashboardSearchCustomer {
  id: string;
  type: "customer";
  name: string;
  email?: string;
}

export interface DashboardSearchData {
  query: string;
  leads: DashboardSearchLead[];
  projects: DashboardSearchProject[];
  customers: DashboardSearchCustomer[];
}

export interface DashboardSearchResponse {
  success: boolean;
  message: string;
  data: DashboardSearchData;
}

