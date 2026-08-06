import { useNavigate, useParams } from "react-router";
import { useProjectDeliveryQuery, useDeliveryDetailQuery } from "@/modules/plant/freight.hooks";
import DeliveryDetailsView from "@/plant/pages/DeliveryDetailsView";
import { DeliveryDetailsSkeleton } from "@/plant/pages/delivery-details/components/DeliverySkeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PackageX } from "lucide-react";

const MaterialDeliveryView = () => {
  const navigate = useNavigate();
  const { projectId, deliveryId, id } = useParams<{
    projectId?: string;
    deliveryId?: string;
    id?: string;
  }>();

  // Extract leadId / projectId from URL params
  const targetLeadId = projectId || deliveryId || id || "";

  // 1. Fetch project delivery details summary (GET /api/admin/plant/deliveries/project/:leadId)
  const { data: projectData, isLoading: isProjectLoading } = useProjectDeliveryQuery(
    targetLeadId,
    { enabled: !!targetLeadId }
  );

  // Extract selectedDeliveryId from response (handles both root and nested data schemas)
  const selectedDeliveryId =
    projectData?.selectedDeliveryId ?? projectData?.data?.selectedDeliveryId ?? null;

  // 2. Fetch full delivery details for the selected delivery ID
  const {
    data: detailData,
    isLoading: isDetailLoading,
    refetch,
  } = useDeliveryDetailQuery(selectedDeliveryId || "", {
    enabled: Boolean(selectedDeliveryId),
  });

  const delivery = detailData?.data?.delivery;

  if (isProjectLoading || (selectedDeliveryId && isDetailLoading)) {
    return <DeliveryDetailsSkeleton />;
  }

  // If no selected delivery ID exists for this project, show customized Not Found screen
  if (!selectedDeliveryId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center font-inter max-w-lg mx-auto my-12 bg-white border border-slate-100 rounded-[20px] shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          <PackageX size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#212B36]">No Delivery Selected</h3>
          <p className="text-sm text-[#6A7282] max-w-sm leading-relaxed">
            There is currently no active or selected material delivery for this project.
          </p>
        </div>
        <Button
          onClick={() => navigate(-1)}
          className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <DeliveryDetailsView
      delivery={delivery}
      isLoading={isDetailLoading}
      deliveryId={selectedDeliveryId}
      showQuickActions={false}
      refetch={refetch}
    />
  );
};

export default MaterialDeliveryView;
