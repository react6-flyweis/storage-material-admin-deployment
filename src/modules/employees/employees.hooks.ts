import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminEmployeesProvider,
  getAdminEmployeeProfileProvider,
  getEmployeeStatsProvider,
  getEmployeePerformanceProvider,
  getEmployeeAuditLogProvider,
  createAdminEmployeeProvider,
  updateAdminEmployeeProvider,
  deleteAdminEmployeeProvider,
  resetEmployeePasswordProvider,
  type AdminEmployeesParams,
  type AdminEmployeeProfileQueryParams,
  type CreateEmployeeData,
  type UpdateEmployeeData,
} from "./employees.api";

export function useAdminEmployeesQuery(filters?: AdminEmployeesParams) {
  return useQuery({
    queryKey: ["employees", "admin", "list", filters],
    queryFn: () => getAdminEmployeesProvider(filters),
    staleTime: 60 * 1000,
  });
}

export function useEmployeeStatsQuery() {
  return useQuery({
    queryKey: ["employees", "admin", "stats"],
    queryFn: getEmployeeStatsProvider,
    staleTime: 60 * 1000,
  });
}

export function useEmployeePerformanceQuery() {
  return useQuery({
    queryKey: ["employees", "admin", "performance"],
    queryFn: getEmployeePerformanceProvider,
    staleTime: 60 * 1000,
  });
}

export function useEmployeeAuditLogQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["employees", "admin", "auditLog", page, limit],
    queryFn: () => getEmployeeAuditLogProvider(page, limit),
    staleTime: 60 * 1000,
  });
}

export function useAdminEmployeeProfileQuery(
  employeeId: string,
  params?: AdminEmployeeProfileQueryParams,
) {
  return useQuery({
    queryKey: ["employees", "admin", "profile", employeeId, params],
    queryFn: () => getAdminEmployeeProfileProvider(employeeId, params),
    staleTime: 60 * 1000,
    enabled: Boolean(employeeId),
  });
}

export function useCreateAdminEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeData) => createAdminEmployeeProvider(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employees", "admin", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["employees", "admin", "stats"] });
    },
  });
}

export function useUpdateAdminEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: UpdateEmployeeData }) => 
      updateAdminEmployeeProvider(employeeId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["employees", "admin", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["employees", "admin", "detail", variables.employeeId] });
      void queryClient.invalidateQueries({ queryKey: ["employees", "admin", "stats"] });
    },
  });
}

export function useDeleteAdminEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => deleteAdminEmployeeProvider(employeeId),
    onSuccess: (_, employeeId) => {
      void queryClient.invalidateQueries({ queryKey: ["employees", "admin", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["employees", "admin", "detail", employeeId] });
      void queryClient.invalidateQueries({ queryKey: ["employees", "admin", "stats"] });
    },
  });
}

export function useResetEmployeePasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      newPassword,
    }: {
      employeeId: string;
      newPassword: string;
    }) => resetEmployeePasswordProvider(employeeId, newPassword),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["employees", "admin", "detail", variables.employeeId],
      });
    },
  });
}


