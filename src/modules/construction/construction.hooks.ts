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
  createMaterialRequest,
  type CreateTaskPayload,
  type CreateWorkLogPayload,
  type CreateMaterialRequestPayload,
  type GetMaterialRequestsParams,
} from "./construction.api";

export function useProjectsCalendarQuery(month: number, year: number) {
  return useQuery({
    queryKey: ["construction", "projects-calendar", month, year],
    queryFn: () => getProjectsCalendar(month, year),
  });
}

export function useTasksQuery() {
  return useQuery({
    queryKey: ["construction", "tasks"],
    queryFn: () => getTasks(),
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

export function useCreateWorkLogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkLogPayload) => createWorkLog(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["construction", "tasks"] });
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


