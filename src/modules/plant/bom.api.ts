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

