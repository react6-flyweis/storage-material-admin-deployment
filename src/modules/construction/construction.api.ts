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
  status?: string;
}

export async function getDeliveries(params?: GetDeliveriesParams) {
  const response = await apiClient.get<DeliveriesResponse>(
    `/api/admin/construction/deliveries`,
    { params }
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
  attachments?: unknown[];
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
}

export async function getMaterialRequests(params?: GetMaterialRequestsParams) {
  const response = await apiClient.get<MaterialRequestsResponse>(
    `/api/admin/construction/material-requests`,
    { params }
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






