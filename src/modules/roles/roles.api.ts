import { apiClient } from "@/modules/auth/auth.api";
import type {
  GetRolesResponse,
  CreateRolePayload,
  CreateRoleResponse,
  UpdateRolePermissionsPayload,
  UpdateRolePermissionsResponse,
} from "./roles.types";

export async function getRolesProvider(): Promise<GetRolesResponse> {
  const response = await apiClient.get<GetRolesResponse>("/api/admin/roles");
  return response.data;
}

export async function createRoleProvider(
  payload: CreateRolePayload,
): Promise<CreateRoleResponse> {
  const response = await apiClient.post<CreateRoleResponse>(
    "/api/admin/roles",
    payload,
  );
  return response.data;
}

export async function updateRolePermissionsProvider(
  roleId: string,
  payload: UpdateRolePermissionsPayload,
): Promise<UpdateRolePermissionsResponse> {
  const response = await apiClient.put<UpdateRolePermissionsResponse>(
    `/api/admin/roles/${roleId}`,
    payload,
  );
  return response.data;
}

