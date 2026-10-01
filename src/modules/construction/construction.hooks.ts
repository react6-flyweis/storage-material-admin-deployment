import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectsCalendar,
  getTasks,
  getDrawings,
  getDeliveries,
  getDeliveryById,
  getMaterialRequests,
  getMaterialRequestById,
  createTask,
  createWorkLog,
  getWorkLogs,
  createMaterialRequest,
  createDelivery,
  reviewMaterialRequest,
  getConstructionReports,
  exportConstructionReport,
  exportMaterialRequests,
  exportDeliveries,
  getDeliveryFilters,
  getMaterialRequestFilters,
  downloadMaterialRequestAttachment,
  attachMaterialRequestAttachment,
  addDrawingComment,
  getConstructionOverview,
  type CreateTaskPayload,
  type CreateWorkLogPayload,
  type GetWorkLogsParams,
  type GetTasksParams,
  type CreateMaterialRequestPayload,
  type CreateDeliveryPayload,
  type GetMaterialRequestsParams,
  type GetDeliveriesParams,
  type ReviewMaterialRequestPayload,
  type GetConstructionOverviewParams,
} from "./construction.api";

export function useConstructionReportsQuery() {
  return useQuery({
    queryKey: ["construction", "reports"],
    queryFn: () => getConstructionReports(),
  });
}

export function useExportConstructionReportMutation() {
  return useMutation({
    mutationFn: (params?: Parameters<typeof exportConstructionReport>[0]) =>
      exportConstructionReport(params),
  });
}

export function useProjectsCalendarQuery(
  monthOrParams: number | import("./construction.api").CalendarQueryParams,
  year?: number,
  extraParams?: { leadId?: string; projectId?: string }
) {
  const params: import("./construction.api").CalendarQueryParams =
    typeof monthOrParams === "number"
      ? {
          month: monthOrParams,
          year: year || new Date().getFullYear(),
          ...extraParams,
        }
      : monthOrParams;

  return useQuery({
    queryKey: [
      "construction",
      "projects-calendar",
      params.month,
      params.year,
      params.leadId,
      params.projectId,
    ],
    queryFn: () => getProjectsCalendar(params),
  });
}

export function useTasksQuery(params?: GetTasksParams) {
  return useQuery({
    queryKey: ["construction", "tasks", params],
    queryFn: () => getTasks(params),
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["construction", "tasks"] });
    },
  });
}

export function useWorkLogsQuery(params?: GetWorkLogsParams) {
  return useQuery({
    queryKey: ["construction", "work-logs", params],
    queryFn: () => getWorkLogs(params),
  });
}

export function useCreateWorkLogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkLogPayload) => createWorkLog(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["construction", "tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["construction", "work-logs"] });
    },
  });
}


export function useDrawingsQuery() {
  return useQuery({
    queryKey: ["construction", "drawings"],
    queryFn: () => getDrawings(),
  });
}



export function useDeliveriesQuery(params?: Parameters<typeof getDeliveries>[0]) {
  return useQuery({
    queryKey: ["construction", "deliveries", params],
    queryFn: () => getDeliveries(params),
  });
}

export function useCreateDeliveryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDeliveryPayload) => createDelivery(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["construction", "deliveries"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["construction", "projects-calendar"],
      });
    },
  });
}

export function useDeliveryDetailsQuery(deliveryId: string | null) {
  return useQuery({
    queryKey: ["construction", "delivery", deliveryId],
    queryFn: () => getDeliveryById(deliveryId!),
    enabled: Boolean(deliveryId),
  });
}

export function useMaterialRequestsQuery(params?: GetMaterialRequestsParams) {
  return useQuery({
    queryKey: ["construction", "material-requests", params],
    queryFn: () => getMaterialRequests(params),
  });
}

export function useMaterialRequestDetailsQuery(requestId: string | null) {
  return useQuery({
    queryKey: ["construction", "material-request", requestId],
    queryFn: () => getMaterialRequestById(requestId!),
    enabled: Boolean(requestId),
  });
}

export function useCreateMaterialRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMaterialRequestPayload) =>
      createMaterialRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["construction", "material-requests"],
      });
    },
  });
}

export function useReviewMaterialRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: ReviewMaterialRequestPayload;
    }) => reviewMaterialRequest(requestId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["construction", "material-requests"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["construction", "material-request"],
      });
    },
  });
}

export function useAttachMaterialRequestAttachmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: { name: string; url: string };
    }) => attachMaterialRequestAttachment(requestId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["construction", "material-requests"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["construction", "material-request"],
      });
    },
  });
}


export function useExportMaterialRequestsMutation() {
  return useMutation({
    mutationFn: (params?: GetMaterialRequestsParams) =>
      exportMaterialRequests(params),
  });
}

export function useExportDeliveriesMutation() {
  return useMutation({
    mutationFn: (params?: GetDeliveriesParams) => exportDeliveries(params),
  });
}

export function useDownloadMaterialRequestAttachmentMutation() {
  return useMutation({
    mutationFn: ({
      requestId,
      index,
    }: {
      requestId: string;
      index: number;
    }) => downloadMaterialRequestAttachment(requestId, index),
  });
}

export function useAddDrawingCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      payload,
    }: {
      docId: string;
      payload: { text: string };
    }) => addDrawingComment(docId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["construction", "drawings"],
      });
    },
  });
}

export function useDeliveryFiltersQuery() {
  return useQuery({
    queryKey: ["construction", "delivery-filters"],
    queryFn: () => getDeliveryFilters(),
  });
}

export function useMaterialRequestFiltersQuery() {
  return useQuery({
    queryKey: ["construction", "material-request-filters"],
    queryFn: () => getMaterialRequestFilters(),
  });
}

export function useConstructionOverviewQuery(params?: GetConstructionOverviewParams) {
  return useQuery({
    queryKey: ["construction", "overview", params],
    queryFn: () => getConstructionOverview(params),
  });
}







