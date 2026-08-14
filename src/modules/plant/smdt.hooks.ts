import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSmdtStatsProvider,
  getSmdtItemsProvider,
  createSmdtItemProvider,
  updateSmdtItemProvider,
  exportSmdtExcelProvider,
  type GetSmdtParams,
  type CreateSmdtItemRequest,
  type UpdateSmdtItemRequest,
} from "./smdt.api";

export function useSmdtStatsQuery() {
  return useQuery({
    queryKey: ["plant", "smdt", "stats"],
    queryFn: () => getSmdtStatsProvider(),
    staleTime: 60 * 1000,
  });
}

export function useSmdtItemsQuery(params?: GetSmdtParams) {
  return useQuery({
    queryKey: ["plant", "smdt", "items", params],
    queryFn: () => getSmdtItemsProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useCreateSmdtItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSmdtItemRequest) => createSmdtItemProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plant", "smdt"] });
    },
  });
}

export function useUpdateSmdtItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      body,
    }: {
      itemId: string;
      body: UpdateSmdtItemRequest;
    }) => updateSmdtItemProvider(itemId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plant", "smdt"] });
    },
  });
}

export function useExportSmdtExcelMutation() {
  return useMutation({
    mutationFn: (params?: Omit<GetSmdtParams, "page" | "limit">) =>
      exportSmdtExcelProvider(params),
  });
}


