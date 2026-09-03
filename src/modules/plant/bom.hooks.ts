import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBomStatsProvider,
  getBomProjectsProvider,
  getBomDetailsProvider,
  getPlantProjectDetailProvider,
  getConsolidatedBOMProvider,
  getConsolidatedUrlProvider,
  getProjectBuildingsProvider,
  getProjectBomFilesProvider,
  getProjectDrawingsProvider,
  uploadProjectBomsProvider,
  uploadProjectDrawingsProvider,
  getBomJobsStatusBatchProvider,
  getBomJobStatusProvider,
  generateConsolidatedBOMProvider,
  sendConsolidatedBOMToVendorsProvider,
  updateBomItemPriceProvider,
  confirmBuildingBomProvider,
  type ConsolidatedBOM,
  type PlantProjectDetail,
  type ConsolidatedBOMItem,
  type ConsolidatedBOMSentVendor,
  type ProjectBuilding,
} from "./bom.api";

export type { ConsolidatedBOM, PlantProjectDetail, ConsolidatedBOMItem, ConsolidatedBOMSentVendor, ProjectBuilding };

export function useBomStatsQuery() {
  return useQuery({
    queryKey: ["plant", "bom", "stats"],
    queryFn: () => getBomStatsProvider(),
    staleTime: 60 * 1000,
  });
}

export function useBomProjectsQuery(page = 1, limit = 20, projectId?: string) {
  return useQuery({
    queryKey: ["plant", "bom", "projects", page, limit, projectId],
    queryFn: () => getBomProjectsProvider(page, limit, projectId),
    staleTime: 60 * 1000,
  });
}

export function useGetProjectBuildingsQuery(leadId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "projects", leadId, "buildings"],
    queryFn: () => getProjectBuildingsProvider(leadId),
    enabled: Boolean(leadId) && !options?.skip,
    staleTime: 30 * 1000,
  });
}

export function useGetProjectBomFilesQuery(leadId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "projects", leadId, "bom-files"],
    queryFn: async () => {
      const resData = await getProjectBomFilesProvider(leadId);
      if (resData?.bomFiles && Array.isArray(resData.bomFiles)) {
        const buildings = resData.bomFiles.map((item: { buildingId: string; buildingNumber: number; status?: string; bomJobId?: string; fileName?: string; uploadedAt?: string; totalItems?: number; isConfirmed?: boolean; errorMessage?: string }) => ({
          buildingId: item.buildingId,
          buildingNumber: item.buildingNumber,
          bomJobStatus: item.status,
          hasBomJob: Boolean(item.bomJobId),
          latestBomJob: item.bomJobId
            ? {
                bomJobId: item.bomJobId,
                fileName: item.fileName,
                uploadedAt: item.uploadedAt,
                totalItems: item.totalItems,
                status: item.status,
                isConfirmed: item.isConfirmed,
                errorMessage: item.errorMessage,
              }
            : null,
        }));
        return { buildings, bomFiles: resData.bomFiles };
      }
      return { buildings: resData?.buildings || [], bomFiles: resData?.buildings || [], bomFilesList: resData?.bomFiles || [] };
    },
    enabled: Boolean(leadId) && !options?.skip,
    staleTime: 30 * 1000,
  });
}

export function useBomDetailsQuery(
  jobId: string,
  filter: "all" | "unpriced" | "frames" | "matched" | "bom_priced" = "all",
  page = 1,
  limit = 50,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "bom", "detail", jobId, filter, page, limit],
    queryFn: () => getBomDetailsProvider(jobId, filter, page, limit),
    enabled: Boolean(jobId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
  });
}

export function useGetPlantProjectDetailQuery(projectId: string) {
  return useQuery({
    queryKey: ["plant", "project-detail", projectId],
    queryFn: () => getPlantProjectDetailProvider(projectId),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
}

export function useGetConsolidatedBOMQuery(leadId: string) {
  return useQuery({
    queryKey: ["plant", "consolidated-bom", leadId],
    queryFn: () => getConsolidatedBOMProvider(leadId),
    enabled: Boolean(leadId),
    staleTime: 60 * 1000,
  });
}

export function useGetConsolidatedUrlQuery(leadId: string) {
  return useQuery({
    queryKey: ["plant", "consolidated-bom-url", leadId],
    queryFn: () => getConsolidatedUrlProvider(leadId),
    enabled: Boolean(leadId),
    staleTime: 60 * 1000,
  });
}

export const useGetConsolidatedBOMUrlQuery = useGetConsolidatedUrlQuery;

export function useGetProjectDrawingsQuery(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["plant", "project-drawings", projectId],
    queryFn: () => getProjectDrawingsProvider(projectId),
    enabled: Boolean(projectId) && enabled,
    staleTime: 60 * 1000,
  });
}

// React Query Mutations

export function useUploadProjectBomsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { leadId: string; bomFiles: Array<{ buildingId: string; fileUrl: string; fileName: string; fileFormat: string }> }) =>
      uploadProjectBomsProvider(params.leadId, params.bomFiles),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plant", "projects", variables.leadId, "bom-files"] });
    },
  });
}

export function useUploadProjectDrawingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { projectId: string; drawings: Array<{ buildingId: string; fileUrl: string; fileName: string }> }) =>
      uploadProjectDrawingsProvider(params.projectId, params.drawings),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plant", "project-drawings", variables.projectId] });
    },
  });
}

export function useGetBomJobsStatusBatchMutation() {
  return useMutation({
    mutationFn: (params: { jobIds: string[] }) => getBomJobsStatusBatchProvider(params.jobIds),
  });
}

export function useGetBomJobStatusQuery(jobId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["plant", "bom", "job-status", jobId],
    queryFn: () => getBomJobStatusProvider(jobId),
    enabled: Boolean(jobId) && (options?.enabled ?? true),
  });
}

export function useGenerateConsolidatedBOMMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => generateConsolidatedBOMProvider(leadId),
    onSuccess: (_, leadId) => {
      queryClient.invalidateQueries({ queryKey: ["plant", "consolidated-bom", leadId] });
      queryClient.invalidateQueries({ queryKey: ["plant", "consolidated-bom-url", leadId] });
    },
  });
}

export function useSendConsolidatedBOMToVendorsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { leadId: string; vendorIds: string[] }) =>
      sendConsolidatedBOMToVendorsProvider(params.leadId, params.vendorIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plant", "consolidated-bom", variables.leadId] });
    },
  });
}

export function useUpdateBomItemPriceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { bomItemId: string; manualUnitCost: number; saveToSMDT: boolean }) =>
      updateBomItemPriceProvider(params.bomItemId, params.manualUnitCost, params.saveToSMDT),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "bom", "detail"] });
    },
  });
}

export function useConfirmBuildingBomMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (buildingId: string) => confirmBuildingBomProvider(buildingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["plant", "bom"] });
    },
  });
}
