import axios from "axios";

type ApiErrorData = {
  message?: string;
  errors?: { msg?: string; path?: string }[];
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  if (axios.isAxiosError<ApiErrorData>(error)) {
    const message = error.response?.data?.message;
    const firstFieldError = error.response?.data?.errors?.find((e) => e?.msg)?.msg;
    if (message === "Validation failed" && firstFieldError) {
      return firstFieldError;
    }
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
