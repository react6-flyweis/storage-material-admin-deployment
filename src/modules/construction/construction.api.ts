import { apiClient } from "@/modules/auth/auth.api";

export interface ProjectCalendarItem {
  _id: string;
  location?: string;
  jobId?: string;
  projectName?: string;
  lifecycleStatus?: string;
}

export interface ProjectCalendarDelivery {
  _id?: string;
  deliveryId?: string;
  description?: string;
  deliveryNumber?: string;
  status?: string;
  deliveryDate?: string;
  project?: {
    projectName?: string;
    jobId?: string;
    location?: string;
  };
}

export interface ProjectsCalendarStats {
  total: number;
  active: number;
  upcoming: number;
  completed: number;
}

export interface ProjectsCalendarResponse {
  success: boolean;
  message: string;
  data: {
    stats: ProjectsCalendarStats;
    projects: ProjectCalendarItem[];
    deliveries: ProjectCalendarDelivery[];
  };
}

export async function getProjectsCalendar(month: number, year: number) {
  const response = await apiClient.get<ProjectsCalendarResponse>(
    `/api/admin/construction/projects-calendar`,
    {
      params: { month, year },
    }
  );
  return response.data;
}

export interface TaskLeadId {
  _id: string;
  projectName?: string;
  jobId?: string;
}

export interface TaskAssignedTo {
  _id: string;
  name: string;
  email: string;
}

export interface ApiTaskItem {
  _id: string;
  title: string;
  description?: string;
  leadId?: TaskLeadId;
  assignedTo?: TaskAssignedTo | null;
  createdBy?: string;
  priority?: "high" | "medium" | "low" | string;
  status?: "todo" | "in_progress" | "done" | string;
  dueDate?: string | null;
  completedAt?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TasksStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export interface TasksBoardData {
  todo: ApiTaskItem[];
  in_progress: ApiTaskItem[];
  done: ApiTaskItem[];
}

export interface TasksResponse {
  success: boolean;
  message: string;
  data: {
    stats: TasksStats;
    board: TasksBoardData;
    tasks: ApiTaskItem[];
  };
}

export interface CreateTaskPayload {
  title: string;
  leadId: string;
  assignedTo: string;
  priority: "high" | "medium" | "low" | string;
  dueDate: string;
  description: string;
  status?: "todo" | "in_progress" | "done" | string;
}

export interface CreateTaskResponse {
  success: boolean;
  message: string;
  data: ApiTaskItem;
}

export async function getTasks() {
  const response = await apiClient.get<TasksResponse>(`/api/admin/construction/tasks`);
  return response.data;
}

export async function createTask(payload: CreateTaskPayload) {
  const response = await apiClient.post<CreateTaskResponse>(
    `/api/admin/construction/tasks`,
    payload
  );
  return response.data;
}

export interface DrawingLead {
  _id: string;
  location?: string;
  jobId?: string;
  projectName?: string;
}

export interface DrawingUploadedBy {
  _id: string;
  name: string;
}

export interface DrawingDocument {
  _id: string;
  leadId?: DrawingLead;
  buildingLabel?: string;
  category?: "drawing" | "document" | "photo" | string;
  name: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  documentType?: string;
  status: "approved" | "pending" | "under_review" | "revision_requested" | string;
  uploadedBy?: DrawingUploadedBy | string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  notes?: string;
  revisionNote?: string;
  revisionRequestedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DrawingProjectGroup {
  lead: DrawingLead;
  uploadedBy?: string;
  lastUpdate?: string;
  documents: DrawingDocument[];
}

export interface DrawingsResponse {
  success: boolean;
  message: string;
  data: {
    projects: DrawingProjectGroup[];
  };
}

export async function getDrawings() {
  const response = await apiClient.get<DrawingsResponse>(`/api/admin/construction/drawings`);
  return response.data;
}

export interface DeliveryProject {
  leadId?: string;
  projectName?: string;
  jobId?: string;
  site?: string;
}

export interface QrScanInfo {
  lastScanned?: string;
  scannedBy?: string;
  scanLocation?: string;
}

export interface ApiDeliveryItem {
  deliveryId: string;
  deliveryNumber: string;
  poNumber?: string;
  project?: DeliveryProject;
  material?: string;
  weight?: string;
  deliveryDate?: string;
  timings?: string;
  transporter?: string;
  driver?: string;
  driverPhone?: string;
  truckNo?: string;
  siteContact?: string;
  siteContactRole?: string;
  alternateContact?: string;
  alternateContactRole?: string;
  currentLocation?: string;
  receivedInfo?: string;
  receivedDate?: string;
  qrScanInfo?: QrScanInfo;
  status: string;
}

export interface DeliveriesStats {
  draft?: number;
  total?: number;
  scheduled?: number;
  confirmed?: number;
  inTransit?: number;
  delivered?: number;
  delayed?: number;
  cancelled?: number;
}

export interface DeliveriesResponse {
  success: boolean;
  message: string;
  data: {
    stats: DeliveriesStats;
    deliveries: ApiDeliveryItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetDeliveriesParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
  deliveryStatus?: string;
  siteDestination?: string;
  transporter?: string;
  driver?: string;
  startDate?: string;
  endDate?: string;
}

export async function getDeliveries(params?: GetDeliveriesParams) {
  const response = await apiClient.get<DeliveriesResponse>(
    `/api/admin/construction/deliveries`,
    { params }
  );
  return response.data;
}

export interface CreateDeliveryPayload {
  title: string;
  leadId: string;
  sectionLocation: string;
  deliveryDate: string;
  description?: string;
  notes?: string;
}

export interface CreateDeliveryResponse {
  success: boolean;
  message: string;
  data: ApiDeliveryItem;
}

export async function createDelivery(payload: CreateDeliveryPayload) {
  const response = await apiClient.post<CreateDeliveryResponse>(
    `/api/admin/construction/projects-calendar/deliveries`,
    payload
  );
  return response.data;
}

export interface StatusHistoryItem {
  _id?: string;
  status: string;
  changedAt: string;
}

export interface DeliveryDetailsItem extends ApiDeliveryItem {
  additionalNotes?: string;
  deliveryLocation?: string;
  statusHistory?: StatusHistoryItem[];
}

export interface SingleDeliveryResponse {
  success: boolean;
  message: string;
  data: {
    delivery: DeliveryDetailsItem;
  };
}

export async function getDeliveryById(deliveryId: string) {
  const response = await apiClient.get<SingleDeliveryResponse>(
    `/api/admin/construction/deliveries/${deliveryId}`
  );
  return response.data;
}

export interface CreateWorkLogPayload {
  leadId: string;
  taskId: string;
  date: string;
  progress: number;
  description: string;
  photos?: string[];
  issues?: string;
}

export interface CreateWorkLogResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}

export async function createWorkLog(payload: CreateWorkLogPayload) {
  const response = await apiClient.post<CreateWorkLogResponse>(
    `/api/admin/construction/work-logs`,
    payload
  );
  return response.data;
}

export interface MaterialRequestedItem {
  _id?: string;
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
  lengthFeet?: number | null;
  color?: string;
  deliveryStatus?: string;
  deliveryId?: string | null;
  deliveryReference?: string;
  deliveredAt?: string | null;
}

export interface MaterialRequestRequestedBy {
  _id: string;
  name: string;
  role?: string;
}

export interface MaterialRequestAttachment {
  _id?: string;
  name?: string;
  fileUrl?: string;
  url?: string;
  size?: string | number;
  fileSize?: string | number;
  type?: string;
  fileType?: string;
}

export interface MaterialRequestLead {
  _id: string;
  location?: string;
  projectName?: string;
  jobId?: string;
}

export interface MaterialRequestItem {
  _id: string;
  requestId: string;
  leadId?: MaterialRequestLead | null;
  siteLocation?: string;
  buildingLabel?: string;
  department?: string;
  source?: string;
  requestedBy?: MaterialRequestRequestedBy | string | null;
  requestedByCustomer?: string | null;
  requestedItems: MaterialRequestedItem[];
  requiredBy?: string | null;
  preferredDeliveryDate?: string | null;
  specialInstructions?: string;
  priority?: string;
  status: string;
  totalAmount?: number;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string;
  attachments?: MaterialRequestAttachment[];
  requestDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialRequestsStatGroup {
  count: number;
  amount?: number;
}

export interface MaterialRequestsStats {
  total: number;
  pending: MaterialRequestsStatGroup;
  approved: MaterialRequestsStatGroup;
  rejected: MaterialRequestsStatGroup;
}

export interface MaterialRequestsResponse {
  success: boolean;
  message: string;
  data: {
    stats: MaterialRequestsStats;
    requests: MaterialRequestItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetMaterialRequestsParams {
  status?: string;
  search?: string;
  leadId?: string;
  department?: string;
  requestedBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface MaterialRequestFiltersResponse {
  success: boolean;
  message: string;
  data: {
    statuses: string[];
    priorities: string[];
    departments: string[];
    requestedBy: Array<{
      _id: string;
      name: string;
      role: string;
    }>;
  };
}

export async function getMaterialRequests(params?: GetMaterialRequestsParams) {
  const response = await apiClient.get<MaterialRequestsResponse>(
    `/api/admin/construction/material-requests`,
    { params }
  );
  return response.data;
}

export async function getMaterialRequestFilters() {
  const response = await apiClient.get<MaterialRequestFiltersResponse>(
    `/api/admin/construction/material-requests/filters`
  );
  return response.data;
}

export interface CreateMaterialRequestedItem {
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
  lengthFeet?: number | null;
  color?: string;
}

export interface CreateMaterialRequestPayload {
  leadId: string;
  siteLocation?: string;
  department?: string;
  requestedItems: CreateMaterialRequestedItem[];
  priority?: "low" | "medium" | "high" | string;
  requiredBy?: string;
  specialInstructions?: string;
  buildingLabel?: string;
}

export interface CreateMaterialRequestResponse {
  success: boolean;
  message: string;
  data: MaterialRequestItem;
}

export async function createMaterialRequest(payload: CreateMaterialRequestPayload) {
  const response = await apiClient.post<CreateMaterialRequestResponse>(
    `/api/admin/construction/material-requests`,
    payload
  );
  return response.data;
}

export interface SingleMaterialRequestResponse {
  success: boolean;
  message: string;
  data: {
    request: MaterialRequestItem;
  };
}

export async function getMaterialRequestById(requestId: string) {
  const response = await apiClient.get<SingleMaterialRequestResponse>(
    `/api/admin/construction/material-requests/${requestId}`
  );
  return response.data;
}

export interface ReviewMaterialRequestPayload {
  action: "approved" | "rejected" | string;
  reviewNotes?: string;
}

export interface ReviewMaterialRequestResponse {
  success: boolean;
  message: string;
  data: MaterialRequestItem;
}

export async function reviewMaterialRequest(
  requestId: string,
  payload: ReviewMaterialRequestPayload
) {
  const response = await apiClient.put<ReviewMaterialRequestResponse>(
    `/api/admin/construction/material-requests/${requestId}/review`,
    payload
  );
  return response.data;
}

export interface AttachMaterialRequestAttachmentPayload {
  name: string;
  url: string;
}

export interface AttachMaterialRequestAttachmentResponse {
  success: boolean;
  message: string;
  data: unknown;
}

export async function attachMaterialRequestAttachment(
  requestId: string,
  payload: AttachMaterialRequestAttachmentPayload
) {
  const response = await apiClient.post<AttachMaterialRequestAttachmentResponse>(
    `/api/admin/construction/material-requests/${requestId}/attachments`,
    payload
  );
  return response.data;
}

export interface AddDrawingCommentPayload {
  text: string;
}

export interface AddDrawingCommentResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function addDrawingComment(
  docId: string,
  payload: AddDrawingCommentPayload
) {
  const response = await apiClient.post<AddDrawingCommentResponse>(
    `/api/admin/construction/drawings/${docId}/comments`,
    payload
  );
  return response.data;
}



export interface ConstructionReportsKpis {
  projectCompletionRate: number | null;
  avgDelayTimeDays: number | null;
  resourceUtilization: number | null;
  safetyCompliance: number | null;
}

export interface ProjectProgressVsPlanItem {
  project: string;
  actualProgress: number;
  status: string;
}

export interface MaterialUsageEfficiencyItem {
  material: string;
  requestedQty: number;
  fulfilledQty: number;
  usedPct: number;
}

export interface ConstructionReportsData {
  kpis: ConstructionReportsKpis;
  projectProgressVsPlan: ProjectProgressVsPlanItem[];
  materialUsageEfficiency: MaterialUsageEfficiencyItem[];
  safetyCompliance: unknown[];
  note?: string;
}

export interface ConstructionReportsResponse {
  success: boolean;
  message: string;
  data: ConstructionReportsData;
}

export async function getConstructionReports() {
  const response = await apiClient.get<ConstructionReportsResponse>(
    `/api/admin/construction/reports`
  );
  return response.data;
}

export interface ExportConstructionReportParams {
  period?: string;
  projectId?: string;
}

export async function exportConstructionReport(params?: ExportConstructionReportParams) {
  const queryParams: Record<string, string> = {};
  if (params?.period && params.period !== "all") {
    queryParams.period = params.period;
  }
  if (params?.projectId && params.projectId !== "all") {
    queryParams.projectId = params.projectId;
  }

  const response = await apiClient.get(
    `/api/admin/construction/reports/export`,
    {
      params: queryParams,
      responseType: "blob",
    }
  );
  return response.data;
}

export async function exportMaterialRequests(params?: GetMaterialRequestsParams) {
  const response = await apiClient.get(
    `/api/admin/construction/material-requests/export`,
    {
      params,
      responseType: "blob",
    }
  );
  return response.data;
}

export async function exportDeliveries(params?: GetDeliveriesParams) {
  const response = await apiClient.get(
    `/api/admin/construction/deliveries/export`,
    {
      params,
      responseType: "blob",
    }
  );
  return response.data;
}

export async function downloadMaterialRequestAttachment(
  requestId: string,
  index: number
) {
  const response = await apiClient.get(
    `/api/admin/construction/material-requests/${requestId}/attachments/${index}/download`,
    {
      responseType: "blob",
    }
  );
  return response.data;
}

export interface DeliveryFiltersResponse {
  success: boolean;
  message: string;
  data: {
    deliveryStatuses: string[];
    siteDestinations: string[];
    transporters: string[];
    drivers: string[];
  };
}

export async function getDeliveryFilters() {
  const response = await apiClient.get<DeliveryFiltersResponse>(
    `/api/admin/construction/deliveries/filters`
  );
  return response.data;
}

export interface OverviewStats {
  totalProjects: number;
  onTrack: number;
  delayed: number;
  completed: number;
  completionRate: number;
  upcomingDeadlinesCount: number;
}

export interface DeliveryOverview {
  todaysDeliveries: number;
  delivered: number;
  inTransit: number;
  delayed: number;
}

export interface MaterialRequestOverviewItem {
  _id: string;
  requestId: string;
  leadId?: {
    _id?: string;
    projectName?: string;
    jobId?: string;
  };
  siteLocation?: string;
  buildingLabel?: string;
  department?: string;
  source?: string;
  priority?: string;
  status?: string;
  totalAmount?: number;
  requestedItems?: Array<{
    _id?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
    lengthFeet?: number;
    color?: string;
    deliveryStatus?: string;
    deliveryReference?: string;
    deliveredAt?: string | null;
  }>;
  requiredBy?: string;
  requestDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialRequestOverview {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingAmount: number;
  recent: MaterialRequestOverviewItem[];
}

export interface TaskStats {
  todo: number;
  in_progress: number;
  done: number;
  total: number;
}

export interface UpcomingDeadlineItem {
  _id?: string;
  title?: string;
  projectName?: string;
  jobId?: string;
  date?: string;
  requiredBy?: string;
  dueDate?: string;
  subtitle?: string;
  buildingLabel?: string;
  daysLeft?: string | number;
}

export interface LiveSiteConstructionItem {
  leadId?: string;
  projectName?: string;
  jobId?: string;
  location?: string;
  progressPct?: number;
  tasks?: number;
  workersOnSite?: number | null;
  equipmentInUse?: number | null;
  currentPhase?: string;
}

export interface LiveSiteActivity {
  activeSites: number;
  workersOnSite: number | null;
  equipmentInUse: number | null;
  ongoingTasks: number;
  note?: string;
}

export interface BottomStats {
  totalSites: number;
  totalWorkers: number | null;
  materialInTransit: number;
  equipments: number | null;
  totalMaterialDelivered: number;
}

export interface ConstructionOverviewData {
  stats: OverviewStats;
  deliveryOverview: DeliveryOverview;
  materialRequestOverview: MaterialRequestOverview;
  taskStats: TaskStats;
  upcomingDeadlines: UpcomingDeadlineItem[];
  liveSiteConstruction: LiveSiteConstructionItem[];
  liveSiteActivity: LiveSiteActivity;
  bottomStats: BottomStats;
}

export interface ConstructionOverviewResponse {
  success: boolean;
  message: string;
  data: ConstructionOverviewData;
}

export interface GetConstructionOverviewParams {
  projectId?: string;
  building?: string;
  status?: string;
}

export async function getConstructionOverview(params?: GetConstructionOverviewParams) {
  const queryParams: Record<string, string> = {};
  if (params?.projectId && params.projectId !== "All Projects" && params.projectId !== "all") {
    queryParams.projectId = params.projectId;
  }
  if (params?.building && params.building !== "All Buildings" && params.building !== "all") {
    queryParams.building = params.building;
  }
  if (params?.status && params.status !== "All Status" && params.status !== "all") {
    queryParams.status = params.status;
  }

  const response = await apiClient.get<ConstructionOverviewResponse>(
    `/api/admin/construction/overview`,
    { params: queryParams }
  );
  return response.data;
}



