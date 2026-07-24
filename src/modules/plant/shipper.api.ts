import { apiClient } from "@/modules/auth/auth.api";

export type ShipperStatsData = {
  totalFiles: number;
  filesReceived: number;
  ordersSent: number;
  revisionsSent: number;
};

export type ShipperStatsResponse = {
  success: boolean;
  message: string;
  data: ShipperStatsData;
};

export type FileReceivedStatus = "none" | "partial" | "all";

export type ShipperProject = {
  leadId: string;
  projectId: string;
  jobId: string;
  projectName: string;
  customerName: string;
  buildingType: string;
  location: string;
  totalShipperFiles: number;
  receivedShipperFiles: number;
  fileReceivedStatus: FileReceivedStatus;
  latestSubmittedAt: string;
};

export type GetShipperProjectsData = {
  projects: ShipperProject[];
  total: number;
};

export type GetShipperProjectsResponse = {
  success: boolean;
  message: string;
  data: GetShipperProjectsData;
};

export async function getShipperStatsProvider(): Promise<ShipperStatsResponse> {
  const response = await apiClient.get<ShipperStatsResponse>("/api/admin/plant/shipper-files/stats");
  return response.data;
}

export async function getShipperProjectsProvider(
  page = 1,
  limit = 20
): Promise<GetShipperProjectsResponse> {
  const response = await apiClient.get<GetShipperProjectsResponse>(
    "/api/admin/plant/shipper-files/projects",
    {
      params: { page, limit },
    }
  );
  return response.data;
}

export type ProjectShipperStatsData = {
  leadId: string;
  projectId: string;
  projectName: string;
  totalFiles: number;
  filesReceived: number;
  ordersSent: number;
  revisionsSent: number;
};

export type ProjectShipperStatsResponse = {
  success: boolean;
  message: string;
  data: ProjectShipperStatsData;
};

export type ShipperRequestAmountComparison = {
  bomAmount: number;
  shipperSubmittedAmount: number;
  difference: number;
  isMismatch: boolean;
  canCompare: boolean;
};

export type ShipperRequest = {
  requestId: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  fileName: string;
  uploadedDate: string;
  rates: number;
  fileStatus: string;
  comparisonStatus: string;
  resubmitCount: number;
  resubmitRequestedAt: string | null;
  canRequestResubmit: boolean;
  amountComparison: ShipperRequestAmountComparison;
};

export type ProjectShipperRequestsData = {
  leadId: string;
  projectId: string;
  projectName: string;
  stats: {
    totalFiles: number;
    filesReceived: number;
    ordersSent: number;
    revisionsSent: number;
  };
  shipperRequests: ShipperRequest[];
  total: number;
};

export type ProjectShipperRequestsResponse = {
  success: boolean;
  message: string;
  data: ProjectShipperRequestsData;
};

export async function getProjectShipperStatsProvider(
  leadId: string
): Promise<ProjectShipperStatsResponse> {
  const response = await apiClient.get<ProjectShipperStatsResponse>(
    `/api/admin/plant/shipper-files/projects/${encodeURIComponent(leadId)}/stats`
  );
  return response.data;
}

export async function getProjectShipperRequestsProvider(
  leadId: string,
  page = 1,
  limit = 20,
  search?: string
): Promise<ProjectShipperRequestsResponse> {
  const response = await apiClient.get<ProjectShipperRequestsResponse>(
    `/api/admin/plant/shipper-files/projects/${encodeURIComponent(leadId)}/requests`,
    {
      params: { page, limit, search },
    }
  );
  return response.data;
}

export type ShipperDocumentData = {
  requestId: string;
  leadId: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  fileName: string;
  fileUrl: string;
  uploadedDate: string;
  rates: number;
  fileStatus: string;
  compareJobId?: string;
  amountComparison?: {
    bomAmount: number;
    shipperSubmittedAmount: number;
    difference: number;
    isMismatch: boolean;
    canCompare: boolean;
  };
};

export type ShipperDocumentResponse = {
  success: boolean;
  message: string;
  data: ShipperDocumentData;
};

export async function getShipperDocumentProvider(
  requestId: string
): Promise<ShipperDocumentResponse> {
  const response = await apiClient.get<ShipperDocumentResponse>(
    `/api/admin/plant/shipper-files/${encodeURIComponent(requestId)}/document`
  );
  return response.data;
}

export type PollCompareJobsStatusRequest = {
  jobIds: string[];
};

export type CompareJobDetail = {
  id: string;
  status: string;
};

export type PollCompareJobsStatusResponse = {
  success: boolean;
  message: string;
  jobs?: CompareJobDetail[];
};

export async function pollCompareJobsStatusProvider(
  data: PollCompareJobsStatusRequest
): Promise<PollCompareJobsStatusResponse> {
  const response = await apiClient.post<PollCompareJobsStatusResponse>(
    "/api/admin/plant/shipper-files/compare-jobs/status",
    data
  );
  return response.data;
}


