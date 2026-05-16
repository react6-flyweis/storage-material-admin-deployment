import { apiClient } from "@/modules/auth/auth.api";

export type ImportLeadsPayload = {
  csv: string;
};

export type ImportLeadsResponse = {
  success: boolean;
  message: string;
  data: {
    created: number;
    skipped: number;
    errors: unknown[];
  };
};

export async function importLeadsProvider(payload: ImportLeadsPayload) {
  const response = await apiClient.post<ImportLeadsResponse>(
    "/api/admin/leads/import",
    payload,
  );

  return response.data;
}
