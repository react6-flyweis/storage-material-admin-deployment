import { toast } from "sonner";
import {
  downloadDeliveryDetails,
  triggerBlobDownload,
  getApiErrorMessage,
} from "@/modules/plant/deliveries.api";

export async function handleDownloadDeliveryDetailsPdf(
  deliveryId: string,
  deliveryNumber?: string
): Promise<boolean> {
  if (!deliveryId) {
    toast.error("Delivery ID is missing");
    return false;
  }
  const toastId = toast.loading("Downloading delivery details PDF...");
  try {
    const { blob, filename } = await downloadDeliveryDetails(
      deliveryId,
      deliveryNumber
        ? `delivery-${deliveryNumber}-details.pdf`
        : `delivery-${deliveryId}-details.pdf`
    );
    triggerBlobDownload(blob, filename);
    toast.success("Delivery details PDF downloaded", { id: toastId });
    return true;
  } catch (err: unknown) {
    const msg = await getApiErrorMessage(err);
    toast.error(msg, { id: toastId });
    return false;
  }
}
