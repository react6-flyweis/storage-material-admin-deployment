import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getSavingsProvider,
  exportSavingsProvider,
  type GetSavingsParams,
  type GetSavingsResponse,
} from "./savings.api";

export function useSavingsQuery(params?: GetSavingsParams) {
  return useQuery<GetSavingsResponse>({
    queryKey: ["plant", "savings", params],
    queryFn: () => getSavingsProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useExportSavingsMutation() {
  return useMutation({
    mutationFn: (params?: Omit<GetSavingsParams, "page" | "limit">) =>
      exportSavingsProvider(params),
  });
}
