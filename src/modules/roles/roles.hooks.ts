import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRolesProvider,
  createRoleProvider,
  updateRolePermissionsProvider,
} from "./roles.api";
import type {
  CreateRolePayload,
  UpdateRolePermissionsPayload,
} from "./roles.types";

export function useRolesQuery() {
  return useQuery({
    queryKey: ["admin", "roles"],
    queryFn: getRolesProvider,
    staleTime: 60 * 1000,
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRoleProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
  });
}

export function useUpdateRolePermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateRolePermissionsPayload;
    }) => updateRolePermissionsProvider(roleId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
  });
}

