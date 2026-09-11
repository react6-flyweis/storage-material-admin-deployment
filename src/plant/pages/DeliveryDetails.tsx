import { useParams } from "react-router";
import { useDeliveryDetailQuery } from "@/modules/plant/freight.hooks";
import DeliveryDetailsView from "./DeliveryDetailsView";

export default function DeliveryDetails() {
  const { id, deliveryId, projectId } = useParams<{
    id?: string;
    deliveryId?: string;
    projectId?: string;
  }>();

  const targetId = deliveryId || projectId || id || "";
  const { data: projectDeliveryData, isLoading, refetch } = useDeliveryDetailQuery(targetId, { enabled: !!targetId });
  const delivery = projectDeliveryData?.data?.delivery;

  return (
    <DeliveryDetailsView
      delivery={delivery}
      isLoading={isLoading}
      deliveryId={targetId}
      showQuickActions={true}
      refetch={refetch}
    />
  );
}
