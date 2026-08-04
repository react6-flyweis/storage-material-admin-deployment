import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLoadPlanningProjectsProvider,
  getBundlePlanDetails,
  generateBundlePlanProvider,
  getBundlePlanProvider,
  getBundleDetailsProvider,
  confirmBundlePlanProvider,
  editBundleProvider,
  generatePackingListPlanProvider,
  getLoadPlanningStateProvider,
  getTruckPlanProvider,
  confirmTruckPlanProvider,
  getFreightAutofillProvider,
  getPackingListPlanProvider,
  type EditBundleBody,
} from "./load-planning.api";

export function useLoadPlanningProjectsQuery(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ["plant", "load-planning", "projects", page, limit, search],
    queryFn: () => getLoadPlanningProjectsProvider(page, limit, search),
    staleTime: 60 * 1000,
  });
}

export function useBundlePlanDetailsQuery(bundlePlanId: string) {
  return useQuery({
    queryKey: ["plant", "bundle-plans", bundlePlanId],
    queryFn: () => getBundlePlanDetails(bundlePlanId),
    enabled: !!bundlePlanId,
    staleTime: 60 * 1000,
  });
}

export function useGenerateBundlePlanMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (requestId: string) => generateBundlePlanProvider(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "load-planning"] });
    },
  });

  const trigger = (requestId: string) => ({
    unwrap: () => mutation.mutateAsync(requestId),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}

export function useGetBundlePlanQuery(projectId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "bundle-plan", projectId],
    queryFn: () => getBundlePlanProvider(projectId),
    enabled: !!projectId && !options?.skip,
    staleTime: 30 * 1000,
  });
}

export function useGetBundleDetailsQuery(bundleId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "bundle-details", bundleId],
    queryFn: () => getBundleDetailsProvider(bundleId),
    enabled: !!bundleId && !options?.skip,
    staleTime: 30 * 1000,
  });
}

export function useConfirmBundlePlanMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (bundlePlanId: string) => confirmBundlePlanProvider(bundlePlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "bundle-plan"] });
      queryClient.invalidateQueries({ queryKey: ["plant", "load-planning"] });
    },
  });

  const trigger = (bundlePlanId: string) => ({
    unwrap: () => mutation.mutateAsync(bundlePlanId),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}

export function useEditBundleMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ bundleId, body }: { bundleId: string; body: EditBundleBody }) =>
      editBundleProvider(bundleId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plant", "bundle-details", variables.bundleId] });
      queryClient.invalidateQueries({ queryKey: ["plant", "bundle-plan"] });
    },
  });

  const trigger = (args: { bundleId: string; body: EditBundleBody }) => ({
    unwrap: () => mutation.mutateAsync(args),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}

export function useGeneratePackingListPlanMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (bundlePlanId: string) => generatePackingListPlanProvider(bundlePlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "load-planning"] });
    },
  });

  const trigger = (bundlePlanId: string) => ({
    unwrap: () => mutation.mutateAsync(bundlePlanId),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}

export function useGetLoadPlanningStateQuery(projectId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "load-planning-state", projectId],
    queryFn: () => getLoadPlanningStateProvider(projectId),
    enabled: !!projectId && !options?.skip,
    staleTime: 30 * 1000,
  });
}

export function useGetTruckPlanQuery(projectId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "truck-plan", projectId],
    queryFn: () => getTruckPlanProvider(projectId),
    enabled: !!projectId && !options?.skip,
    staleTime: 30 * 1000,
  });
}

export function useConfirmTruckPlanMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (projectId: string) => confirmTruckPlanProvider(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plant", "truck-plan"] });
      queryClient.invalidateQueries({ queryKey: ["plant", "load-planning"] });
    },
  });

  const trigger = (projectId: string) => ({
    unwrap: () => mutation.mutateAsync(projectId),
  });

  return [trigger, { isLoading: mutation.isPending, isPending: mutation.isPending, error: mutation.error }] as const;
}

export function useGetFreightAutofillQuery(projectId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "freight-autofill", projectId],
    queryFn: () => getFreightAutofillProvider(projectId),
    enabled: !!projectId && !options?.skip,
    staleTime: 30 * 1000,
  });
}

export function useGetPackingListPlanQuery(packingListPlanId: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: ["plant", "packing-list-plan", packingListPlanId],
    queryFn: () => getPackingListPlanProvider(packingListPlanId),
    enabled: !!packingListPlanId && !options?.skip,
    staleTime: 30 * 1000,
  });
}
