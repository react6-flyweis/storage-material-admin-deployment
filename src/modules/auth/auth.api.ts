import axios from "axios";
import * as Sentry from "@sentry/react";
import { getAccessToken, getRefreshToken, useAuthStore } from "./auth.store";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "./auth.types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function captureApiError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
    return;
  }

  const statusCode = error.response?.status;
  const errorCode =
    error.response?.data?.code || error.response?.data?.errorCode;
  const requestId =
    error.response?.headers?.["x-request-id"] ||
    error.response?.headers?.["x-correlation-id"] ||
    error.response?.headers?.["x-correlationid"];
  const url = error.config?.url;
  const method = error.config?.method;

  const isExpectedAuthFailure = statusCode === 401 || statusCode === 403;

  if (isExpectedAuthFailure) {
    Sentry.captureMessage(
      `API Auth Warning (${statusCode}): ${method?.toUpperCase() || "REQUEST"} ${url || ""}`,
      {
        level: "warning",
        extra: {
          statusCode,
          errorCode,
          requestId,
          url,
          method,
          responseData: error.response?.data,
        },
      },
    );
  } else {
    Sentry.captureException(error, {
      level: "error",
      extra: {
        statusCode,
        errorCode,
        requestId,
        url,
        method,
        responseData: error.response?.data,
      },
    });
  }
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      captureApiError(error);
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      captureApiError(error);
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshPayload: RefreshTokenRequest = { refreshToken };
      const refreshResponse = await refreshClient.post<RefreshTokenResponse>(
        "/api/auth/refresh",
        refreshPayload,
      );

      const nextAccessToken = refreshResponse.data.data.accessToken;
      useAuthStore.getState().setAccessToken(nextAccessToken);

      if (refreshResponse.data.data.user) {
        useAuthStore.getState().updateUser(refreshResponse.data.data.user);
      } else if (typeof refreshResponse.data.data.isMainAdmin === "boolean") {
        useAuthStore.getState().updateUser({
          isMainAdmin: refreshResponse.data.data.isMainAdmin,
        });
      }

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${nextAccessToken}`,
      };

      return apiClient(originalRequest);
    } catch (refreshError) {
      captureApiError(refreshError);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    }
  },
);

export async function loginProvider(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>(
    "/api/auth/login",
    payload,
  );

  return response.data;
}

export async function logoutProvider() {
  const response = await apiClient.post<LogoutResponse>("/api/auth/logout");

  return response.data;
}

export async function forgotPasswordProvider(payload: ForgotPasswordRequest) {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/api/auth/forgot-password",
    payload,
  );
  return response.data;
}

export async function verifyOtpProvider(payload: VerifyOtpRequest) {
  const response = await apiClient.post<VerifyOtpResponse>(
    "/api/auth/verify-otp",
    payload,
  );
  return response.data;
}

export async function resetPasswordProvider(payload: ResetPasswordRequest) {
  const response = await apiClient.post<ResetPasswordResponse>(
    "/api/auth/reset-password",
    payload,
  );
  return response.data;
}
