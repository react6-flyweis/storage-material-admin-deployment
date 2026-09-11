import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getPlantCarriersProvider,
  createPlantCarrierProvider,
  getPlantCarrierProvider,
  updatePlantCarrierProvider,
  type GetPlantCarriersParams,
  type CreatePlantCarrierRequest,
  type UpdatePlantCarrierRequest,
} from "./carrier.api";

export function usePlantCarriersQuery(
  params?: GetPlantCarriersParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "carriers", params],
    queryFn: () => getPlantCarriersProvider(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreatePlantCarrierMutation() {
  return useMutation({
    mutationFn: (payload: CreatePlantCarrierRequest) =>
      createPlantCarrierProvider(payload),
  });
}

export function usePlantCarrierQuery(
  carrierId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["plant", "carrier", carrierId],
    queryFn: () => getPlantCarrierProvider(carrierId),
    enabled: !!carrierId && options?.enabled !== false,
  });
}

export function useUpdatePlantCarrierMutation() {
  return useMutation({
    mutationFn: ({
      carrierId,
      body,
    }: {
      carrierId: string;
      body: UpdatePlantCarrierRequest;
    }) => updatePlantCarrierProvider(carrierId, body),
  });
}


