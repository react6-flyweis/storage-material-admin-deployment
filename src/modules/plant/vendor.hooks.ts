import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getPlantVendorsProvider,
  createPlantVendorProvider,
  getPlantVendorProvider,
  updatePlantVendorProvider,
  type GetPlantVendorsParams,
  type CreatePlantVendorRequest,
  type UpdatePlantVendorRequest,
} from "./vendor.api";

export function usePlantVendorsQuery(
  params?: GetPlantVendorsParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "vendors", params],
    queryFn: () => getPlantVendorsProvider(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreatePlantVendorMutation() {
  return useMutation({
    mutationFn: (payload: CreatePlantVendorRequest) => createPlantVendorProvider(payload),
  });
}

export function usePlantVendorQuery(
  vendorId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "vendor", vendorId],
    queryFn: () => getPlantVendorProvider(vendorId),
    enabled: !!vendorId && options?.enabled !== false,
  });
}

export function useUpdatePlantVendorMutation() {
  return useMutation({
    mutationFn: ({
      vendorId,
      body,
    }: {
      vendorId: string;
      body: UpdatePlantVendorRequest;
    }) => updatePlantVendorProvider(vendorId, body),
  });
}
