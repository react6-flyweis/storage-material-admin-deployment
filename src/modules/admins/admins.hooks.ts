import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminsProvider,
  setMainSelfProvider,
  createAdminProvider,
  updateAdminProvider,
  toggleAdminStatusProvider,
  deleteAdminProvider,
  transferMainAdminProvider,
} from "./admins.api";
import type { CreateAdminPayload, UpdateAdminPayload } from "./admins.types";
import { useAuthStore } from "@/modules/auth/auth.store";

export const ADMINS_QUERY_KEY = ["admin", "admins"] as const;

export function useAdminsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ADMINS_QUERY_KEY,
    queryFn: getAdminsProvider,
    staleTime: 30 * 1000,
    enabled: options?.enabled,
    retry: 1,
  });
}

export function useSetMainSelfMutation() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: setMainSelfProvider,
    onSuccess: (data) => {
      if (data?.data?.admin) {
        updateUser({
          isMainAdmin: data.data.admin.isMainAdmin,
          role: data.data.admin.role,
        });
      } else {
        updateUser({ isMainAdmin: true });
      }
      void queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => createAdminProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin", "employees"] });
    },
  });
}

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      adminId,
      payload,
    }: {
      adminId: string;
      payload: UpdateAdminPayload;
    }) => updateAdminProvider(adminId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin", "employees"] });
    },
  });
}

export function useToggleAdminStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminId: string) => toggleAdminStatusProvider(adminId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin", "employees"] });
    },
  });
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminId: string) => deleteAdminProvider(adminId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin", "employees"] });
    },
  });
}

export function useTransferMainAdminMutation() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (adminId: string) => transferMainAdminProvider(adminId),
    onSuccess: () => {
      // Caller has been demoted to isMainAdmin = false
      updateUser({ isMainAdmin: false });
      void queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
