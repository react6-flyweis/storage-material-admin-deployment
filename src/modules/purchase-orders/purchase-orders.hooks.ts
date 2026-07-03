import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchaseOrdersProvider,
  updatePurchaseOrderStatusProvider,
  assignPurchaseOrderProvider,
  getPurchaseOrderDetailsProvider,
} from "./purchase-orders.api";

export function usePurchaseOrdersQuery(status?: string) {
  return useQuery({
    queryKey: ["purchase-orders", "list", status],
    queryFn: () => getPurchaseOrdersProvider(status),
    staleTime: 60 * 1000,
  });
}

export function usePurchaseOrderDetailsQuery(poOrderId: string | undefined) {
  return useQuery({
    queryKey: ["purchase-orders", poOrderId],
    queryFn: () => getPurchaseOrderDetailsProvider(poOrderId as string),
    enabled: !!poOrderId,
  });
}

export function useUpdatePurchaseOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ poOrderId, status, adminNotes }: { poOrderId: string; status: string; adminNotes?: string }) =>
      updatePurchaseOrderStatusProvider(poOrderId, status, adminNotes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useAssignPurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ poOrderId, assignedTo, adminNotes }: { poOrderId: string; assignedTo: string; adminNotes?: string }) =>
      assignPurchaseOrderProvider(poOrderId, assignedTo, adminNotes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}
