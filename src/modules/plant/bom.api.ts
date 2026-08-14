import { apiClient } from "@/modules/auth/auth.api";

export type BomStatsData = {
  totalBomFilesUploaded: number;
  pendingUploads: number;
  readyForShipper: number;
  issuesDetected: number;
};

export type BomStatsResponse = {
  success: boolean;
  message: string;
  data: BomStatsData;
};

export type FileStatus = "uploaded" | "extracting" | "extracted" | "failed";

export type BomProject = {
  leadId: string;
  projectId: string;
  projectName: string;
  projectNameAlias?: string;
  customerName: string;
  buildingType: string;
  location: string;
  buildingId: string;
  buildingNumber: number;
  uploadDate: string;
  itemCount: number;
  fileStatus: FileStatus;
  bomJobId: string;
};

export type GetBomProjectsData = {
  projects: BomProject[];
  total: number;
  page: number;
  limit: number;
};

export type GetBomProjectsResponse = {
  success: boolean;
  message: string;
  data: GetBomProjectsData;
};

export async function getBomStatsProvider(): Promise<BomStatsResponse> {
  const response = await apiClient.get<BomStatsResponse>("/api/admin/plant/bom/stats");
  return response.data;
}

export async function getBomProjectsProvider(
  page = 1,
  limit = 20
): Promise<GetBomProjectsResponse> {
  const response = await apiClient.get<GetBomProjectsResponse>(
    "/api/admin/plant/bom/projects",
    {
      params: { page, limit },
    }
  );
  return response.data;
}

export interface BomJob {
  _id: string;
  buildingId: string;
  buildingNumber: number;
  fileName: string;
  status: string;
  isConfirmed: boolean;
  totalItems: number;
  matchedItems: number;
  unmatchedItems: number;
  frameItems: number;
  extractionMethod: string;
  skippedSheets: string[];
  parseSuspect: boolean;
  parseAudit: unknown;
}

export interface BomItem {
  _id: string;
  bomJobId: string;
  buildingId: string;
  category: string;
  markId: string;
  partCode: string;
  partColor: string;
  description: string;
  quantity: number;
  lengthFeet: number;
  lengthRaw?: string;
  weight: number;
  costUnit: string;
  isPriced: boolean;
  isFrameType: boolean;
  matchStatus: string;
  priceSource: string;
  finalUnitCost: number;
  finalTotalCost: number;
  rowNumber: number;
  gauge?: string;
  type?: string;
  leadId?: string;
}

export interface BomSummary {
  totalItems: number;
  pricedItems: number;
  unpricedItems: number;
  bomPricedItems: number;
  frameItems: number;
  totalWeight: number;
  totalCost: number;
  isFullyPriced: boolean;
}

export interface BomDetailsData {
  bomJob: BomJob;
  itemsByCategory: Record<string, BomItem[]>;
  summary: BomSummary;
  total: number;
  page: number;
  limit: number;
}

export interface BomDetailsResponse {
  success: boolean;
  message: string;
  data: BomDetailsData;
}

export async function getBomDetailsProvider(
  jobId: string,
  filter: "all" | "unpriced" | "frames" | "matched" | "bom_priced" = "all",
  page = 1,
  limit = 50
): Promise<BomDetailsResponse> {
  const response = await apiClient.get<BomDetailsResponse>(
    `/api/admin/plant/bom/${encodeURIComponent(jobId)}`,
    {
      params: { filter, page, limit },
    }
  );
  return response.data;
}

export interface ConsolidatedBOMItem {
  _id?: string;
  category?: string;
  partCode?: string | null;
  description?: string | null;
  partColor?: string | null;
  markIds?: string[];
  totalQty?: number;
  totalLengthFeet?: number;
  costUnit?: string | null;
  totalWeight?: number;
  totalCost?: number;
  buildings?: (number | string)[];
  [key: string]: unknown;
}

export interface ConsolidatedBOMSentVendor {
  _id: string;
  vendorId: string;
  vendorName: string;
  sentAt: string;
}

export interface ConsolidatedBOM {
  _id?: string;
  leadId?: string;
  status?: string;
  fileUrl?: string;
  itemCount?: number;
  totalCost?: number;
  totalWeight?: number;
  totalPanelsArea?: number;
  items?: ConsolidatedBOMItem[];
  sentToVendors?: ConsolidatedBOMSentVendor[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlantProjectDetail {
  jobId?: string;
  lead?: { projectName?: string; name?: string; [key: string]: unknown };
  client?: { firstName?: string; lastName?: string; name?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface ConsolidatedBOMResponse {
  consolidatedBOM?: ConsolidatedBOM;
  fileUrl?: string;
  [key: string]: unknown;
}

export async function getPlantProjectDetailProvider(projectId: string): Promise<PlantProjectDetail> {
  const response = await apiClient.get<Record<string, unknown>>(
    `/api/admin/plant/projects/${projectId}`
  );
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    return (response.data as { data: PlantProjectDetail }).data;
  }
  return response.data as PlantProjectDetail;
}

export async function getConsolidatedBOMProvider(leadId: string): Promise<ConsolidatedBOMResponse> {
  const response = await apiClient.get<Record<string, unknown>>(
    `/api/admin/plant/projects/${encodeURIComponent(leadId)}/consolidated-bom`
  );
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    return (response.data as { data: ConsolidatedBOMResponse }).data;
  }
  return response.data as ConsolidatedBOMResponse;
}

export async function getConsolidatedBOMUrlProvider(leadId: string) {
  const response = await apiClient.get(
    `/api/admin/plant/bom/projects/${encodeURIComponent(leadId)}/consolidated-url`
  );
  return response.data?.data || response.data;
}

export const getConsolidatedUrlProvider = getConsolidatedBOMUrlProvider;

export interface ProjectBuilding {
  buildingId: string;
  buildingNumber: number;
  status?: string;
  latestDrawing?: unknown;
  latestDrawingStatus?: string | null;
  drawingCount?: number;
  hasDrawing?: boolean;
  latestBomJob?: {
    bomJobId?: string;
    fileName?: string;
    uploadedAt?: string;
    totalItems?: number;
    status?: string;
    isConfirmed?: boolean;
    errorMessage?: string;
    [key: string]: unknown;
  } | null;
  hasBomJob?: boolean;
  bomJobStatus?: string | null;
  [key: string]: unknown;
}

export interface ProjectBuildingsResponseData {
  leadId: string;
  projectName: string;
  numberOfBuildings: number;
  buildings: ProjectBuilding[];
}

export interface ProjectBuildingsResponse {
  success: boolean;
  message: string;
  data: ProjectBuildingsResponseData;
}

export async function getProjectBuildingsProvider(leadId: string): Promise<ProjectBuildingsResponseData> {
  const response = await apiClient.get<ProjectBuildingsResponse>(
    `/api/admin/plant/projects/${encodeURIComponent(leadId)}/buildings`
  );
  return response.data?.data;
}

export async function getProjectBomFilesProvider(leadId: string) {
  const response = await apiClient.get(
    `/api/admin/plant/projects/${encodeURIComponent(leadId)}/bom-files`
  );
  return response.data?.data || response.data;
}

export interface DrawingCommentUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface DrawingComment {
  _id: string;
  text: string;
  commentedBy?: string | DrawingCommentUser | null;
  commentedByCustomer?: DrawingCommentUser | null;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectDrawing {
  _id?: string;
  buildingId?: string;
  buildingNumber?: number;
  fileName?: string;
  fileUrl?: string;
  status?: string;
  versionNumber?: number;
  uploadedAt?: string;
  rejectionReason?: string;
  comments?: DrawingComment[];
}

export interface BuildingWithDrawings {
  buildingId: string;
  buildingNumber: number;
  latestDrawingStatus?: string;
  drawings?: ProjectDrawing[];
}

export interface ProjectDrawingsData {
  buildings: BuildingWithDrawings[];
  totalBuildings?: number;
}

export async function getProjectDrawingsProvider(projectId: string): Promise<ProjectDrawingsData> {
  const response = await apiClient.get<Record<string, unknown>>(
    `/api/admin/plant/projects/${encodeURIComponent(projectId)}/drawings`
  );
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    return (response.data as { data: ProjectDrawingsData }).data;
  }
  return response.data as unknown as ProjectDrawingsData;
}

export async function uploadProjectBomsProvider(leadId: string, bomFiles: Array<{ buildingId: string; fileUrl: string; fileName: string; fileFormat: string }>) {
  const response = await apiClient.post(`/api/admin/plant/projects/${encodeURIComponent(leadId)}/bom`, { bomFiles });
  return response.data?.data || response.data;
}

export async function uploadProjectDrawingsProvider(
  projectId: string,
  drawings: Array<{ buildingId: string; fileUrl: string; fileName: string }>
) {
  const response = await apiClient.post(
    `/api/admin/plant/projects/${encodeURIComponent(projectId)}/drawings`,
    { drawings }
  );
  return response.data?.data || response.data;
}

export async function getBomJobsStatusBatchProvider(jobIds: string[]) {
  const response = await apiClient.post("/api/admin/plant/bom/jobs/status", { jobIds });
  return response.data?.data || response.data;
}

export async function getBomJobStatusProvider(jobId: string) {
  const response = await apiClient.get(`/api/admin/plant/bom/job/${encodeURIComponent(jobId)}/status`);
  return response.data?.data || response.data;
}

export async function generateConsolidatedBOMProvider(leadId: string) {
  const response = await apiClient.post(`/api/admin/plant/projects/${encodeURIComponent(leadId)}/consolidated-bom/generate`);
  return response.data?.data || response.data;
}

export async function sendConsolidatedBOMToVendorsProvider(leadId: string, vendorIds: string[]) {
  const response = await apiClient.post(`/api/admin/plant/projects/${encodeURIComponent(leadId)}/consolidated-bom/send`, { vendorIds });
  return response.data?.data || response.data;
}

export async function updateBomItemPriceProvider(bomItemId: string, manualUnitCost: number, saveToSMDT: boolean) {
  const response = await apiClient.put(`/api/admin/plant/bom/items/${encodeURIComponent(bomItemId)}/price`, { manualUnitCost, saveToSMDT });
  return response.data?.data || response.data;
}

export async function confirmBuildingBomProvider(buildingId: string) {
  const response = await apiClient.post(`/api/admin/plant/bom/buildings/${encodeURIComponent(buildingId)}/confirm`);
  return response.data?.data || response.data;
}




