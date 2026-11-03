import { apiClient } from "@/modules/auth/auth.api";
import { useAuthStore } from "@/modules/auth/auth.store";
import type {
  UserProfile,
  GetProfileApiResponse,
  UpdateProfileRequest,
  UpdateProfileApiResponse,
  ChangePasswordRequest,
  ChangePasswordApiResponse,
  UpdateNotificationSettingsRequest,
  UpdateNotificationSettingsApiResponse,
  NotificationSettings,
} from "./profile.types";

/**
 * Fetch current user profile (includes notificationSettings)
 * GET /api/profile
 * Response: data.profile (with legacy data.user)
 */
export async function getProfileApi(): Promise<UserProfile> {
  const response = await apiClient.get<GetProfileApiResponse | UserProfile>(
    "/api/profile"
  );
  const raw = response.data as any;
  const profile = raw?.data?.profile || raw?.profile || raw?.data || raw;
  return profile as UserProfile;
}

/**
 * Update current user profile
 * PUT /api/profile
 * Send only fields to change (at least one): name, email, phone, mobile, avatar
 * Response: 200 { success: true, message: ..., data: { profile, user } }
 */
export async function updateProfileApi(
  payload: UpdateProfileRequest
): Promise<UserProfile> {
  // Strip undefined values so we only send fields that are being updated
  const cleanPayload: Record<string, string> = {};
  if (payload.name !== undefined) cleanPayload.name = payload.name;
  if (payload.email !== undefined) cleanPayload.email = payload.email;
  if (payload.phone !== undefined) cleanPayload.phone = payload.phone;
  if (payload.mobile !== undefined) cleanPayload.mobile = payload.mobile;
  if (payload.avatar !== undefined) cleanPayload.avatar = payload.avatar;

  const response = await apiClient.put<UpdateProfileApiResponse | UserProfile>(
    "/api/profile",
    cleanPayload
  );
  const raw = response.data as any;
  const profile = (raw?.data?.profile || raw?.profile || raw?.data || raw) as UserProfile;

  // Sync auth store user if present
  if (profile) {
    useAuthStore.getState().updateUser({
      name: profile.name,
      email: profile.email,
      role: profile.role,
      ...(typeof profile.isMainAdmin === "boolean"
        ? { isMainAdmin: profile.isMainAdmin }
        : {}),
    });
  }

  return profile;
}

/**
 * Change current user password
 * PUT /api/profile/password
 * Body: { currentPassword, newPassword }
 * Response: 200 { success: true, data: {}, message: "Password updated" }
 */
export async function changePasswordApi(
  payload: ChangePasswordRequest
): Promise<ChangePasswordApiResponse> {
  try {
    const response = await apiClient.put<ChangePasswordApiResponse>(
      "/api/profile/password",
      payload
    );
    return response.data;
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr?.response?.status === 404) {
      // Fallback in case backend deployed with alternate route
      const fallbackResponse = await apiClient.put<ChangePasswordApiResponse>(
        "/api/auth/change-password",
        payload
      );
      return fallbackResponse.data;
    }
    throw err;
  }
}

/**
 * Update notification toggles
 * PUT /api/profile/notification-settings
 * Allowed keys: twoFactorAuth, emailNotification, smsNotification,
 * dashboardNotifications, weeklyEmailReports, systemAlerts, loginAlertsViaMail
 * Response: 200 { success: true, message: "Settings updated", data: { notificationSettings } }
 */
export async function updateNotificationSettingsApi(
  payload: UpdateNotificationSettingsRequest
): Promise<NotificationSettings> {
  const response = await apiClient.put<
    UpdateNotificationSettingsApiResponse | NotificationSettings
  >("/api/profile/notification-settings", payload);

  const raw = response.data as any;
  const notificationSettings = (raw?.data?.notificationSettings ||
    raw?.notificationSettings ||
    raw?.data ||
    raw) as NotificationSettings;

  return notificationSettings;
}
