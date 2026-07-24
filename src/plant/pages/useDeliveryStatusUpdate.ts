import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/modules/auth/auth.api";

export function useDeliveryStatusUpdate() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateDeliveryStatus = async (
    id: string,
    status: string,
    onSuccess?: () => void
  ) => {
    try {
      await apiClient.patch(`/api/admin/plant/deliveries/${id}/status`, { status });
      
      setToastMessage(`Delivery status updated to ${status}`);
      
      // Invalidate query cache to refresh the views automatically
      queryClient.invalidateQueries({ queryKey: ["plant", "deliveries"] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = err.response?.data?.message || err.message || "Failed to update status";
      setToastMessage(`Error: ${errorMsg}`);
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
  };

  return {
    updateDeliveryStatus,
    toastMessage,
  };
}

