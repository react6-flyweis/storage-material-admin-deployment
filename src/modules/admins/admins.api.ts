import { apiClient } from "@/modules/auth/auth.api";
import type {
  GetAdminsResponse,
  SetMainSelfResponse,
  CreateAdminPayload,
  CreateAdminResponse,
  UpdateAdminPayload,
  UpdateAdminResponse,
  ToggleAdminStatusResponse,
  DeleteAdminResponse,
  TransferMainAdminResponse,
} from "./admins.types";

/**
 * Bootstrap the current logged-in admin as the main admin.
 * Only succeeds if caller has role=admin and no other main admin exists yet.
 */
export async function setMainSelfProvider(): Promise<SetMainSelfResponse> {
  const response = await apiClient.post<SetMainSelfResponse>(
    "/api/admin/admins/set-main-self",
    {},
  );
  return response.data;
}

/**
 * List all admin users with summary statistics.
 * Caller must be main admin.
 */
export async function getAdminsProvider(): Promise<GetAdminsResponse> {
  const response = await apiClient.get<GetAdminsResponse>("/api/admin/admins");
  return response.data;
}

/**
 * Create a new admin user.
 * Caller must be main admin.
 * Creates user with role="admin" and isMainAdmin=false. Dispatches credentials email.
 */
export async function createAdminProvider(
  payload: CreateAdminPayload,
): Promise<CreateAdminResponse> {
  const response = await apiClient.post<CreateAdminResponse>(
    "/api/admin/admins",
    payload,
  );
  return response.data;
}

/**
 * Update an existing admin user's details or status.
 * Caller must be main admin. Cannot edit another main admin.
 */
export async function updateAdminProvider(
  adminId: string,
  payload: UpdateAdminPayload,
): Promise<UpdateAdminResponse> {
  const response = await apiClient.put<UpdateAdminResponse>(
    `/api/admin/admins/${encodeURIComponent(adminId)}`,
    payload,
  );
  return response.data;
}

/**
 * Toggle an admin user's active/inactive status.
 * Caller must be main admin. Main admin status cannot be toggled.
 */
export async function toggleAdminStatusProvider(
  adminId: string,
): Promise<ToggleAdminStatusResponse> {
  const response = await apiClient.patch<ToggleAdminStatusResponse>(
    `/api/admin/admins/${encodeURIComponent(adminId)}/toggle-status`,
    {},
  );
  return response.data;
}

/**
 * Delete an admin user.
 * Caller must be main admin. Cannot delete main admin or self.
 */
export async function deleteAdminProvider(
  adminId: string,
): Promise<DeleteAdminResponse> {
  const response = await apiClient.delete<DeleteAdminResponse>(
    `/api/admin/admins/${encodeURIComponent(adminId)}`,
  );
  return response.data;
}

/**
 * Transfer main admin role to another active admin user.
 * Caller must be current main admin.
 * Caller is demoted (isMainAdmin=false), target is promoted (isMainAdmin=true).
 */
export async function transferMainAdminProvider(
  adminId: string,
): Promise<TransferMainAdminResponse> {
  const response = await apiClient.post<TransferMainAdminResponse>(
    `/api/admin/admins/${encodeURIComponent(adminId)}/transfer-main`,
    {},
  );
  return response.data;
}
