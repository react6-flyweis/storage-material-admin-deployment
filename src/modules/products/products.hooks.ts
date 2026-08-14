import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductsProvider,
  createProductProvider,
  getProductCategoriesProvider,
  exportProductsProvider,
} from "./products.api";
import type { GetProductsParams, CreateProductPayload } from "./products.types";

export function useProductsQuery(params?: GetProductsParams) {
  return useQuery({
    queryKey: ["admin", "products", params],
    queryFn: () => getProductsProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useProductCategoriesQuery() {
  return useQuery({
    queryKey: ["admin", "products", "categories"],
    queryFn: () => getProductCategoriesProvider(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProductProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useExportProductsMutation() {
  return useMutation({
    mutationFn: (params?: GetProductsParams) => exportProductsProvider(params),
  });
}


