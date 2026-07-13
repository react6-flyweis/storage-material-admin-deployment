import { useState } from "react";

export function useDeliveryStatusUpdate() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const updateDeliveryStatus = async (
    id: string,
    status: string,
    onSuccess?: () => void
  ) => {
    try {
      // In a real application, you might call an API endpoint here:
      // await apiClient.patch(`/api/admin/plant/deliveries/${id}/status`, { status });
      
      setToastMessage(`Delivery status updated to ${status}`);
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } catch (error: any) {
      setToastMessage(`Error: ${error.message || "Failed to update status"}`);
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
