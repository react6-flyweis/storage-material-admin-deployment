import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, RotateCcw, Edit3 } from "lucide-react";
import RescheduleDeliveryDialog from "@/plant/components/RescheduleDeliveryDialog";
import MarkDeliveredSuccessDialog from "@/plant/components/MarkDeliveredSuccessDialog";
import { useDeliveryDetailQuery } from "@/modules/plant/freight.hooks";
import { useDeliveryStatusUpdate } from "./useDeliveryStatusUpdate";
import { RescheduleSuccessModal, InTransitSuccessModal } from "./DeliveryActionModals";
import EditDeliveryModal from "@/plant/components/EditDeliveryModal";

import { convertTo24Hour } from "./delivery-details/utils";
import { DeliveryDetailsSkeleton } from "./delivery-details/components/DeliverySkeleton";
import { DeliveryOverview, SiteCoordinationAndFreight } from "./delivery-details/components/DeliveryOverview";
import { DeliveryContacts } from "./delivery-details/components/DeliveryContacts";
import { ReceivingPocCard, QuickActionsCard, StatusHistoryCard } from "./delivery-details/components/DeliverySidebar";

export default function DeliveryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Modal / Dialog States
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isMarkDeliveredOpen, setIsMarkDeliveredOpen] = useState(false);
  const [isRescheduleSuccessOpen, setIsRescheduleSuccessOpen] = useState(false);
  const [isInTransitSuccessOpen, setIsInTransitSuccessOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Data / Status States
  const [rescheduleData, setRescheduleData] = useState<{ date: string; timeWindowStart: string; timeWindowEnd: string } | null>(null);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [localToast] = useState<string | null>(null);

  // Form Fields State
  const [localDate, setLocalDate] = useState<string | null>(null);
  const [localTimeWindow, setLocalTimeWindow] = useState<string | null>(null);

  const { data: projectDeliveryData, isLoading, refetch } = useDeliveryDetailQuery(id || "", { enabled: !!id });
  const delivery = projectDeliveryData?.data?.delivery;
  const { updateDeliveryStatus, toastMessage } = useDeliveryStatusUpdate();

  const formDate = localDate || (delivery?.deliverySchedule?.deliveryDate ? delivery.deliverySchedule.deliveryDate.split("T")[0] : delivery?.formDetails?.deliveryDate ? delivery.formDetails.deliveryDate.split("T")[0] : "");
  const formTimeWindow = localTimeWindow || delivery?.deliverySchedule?.timeWindow || delivery?.formDetails?.timings || "";
  const formSiteInstructions = delivery?.siteCoordinationNotes || delivery?.formDetails?.specialRequirements || "";
  const formSpecialNotes = delivery?.formDetails?.additionalNotes || "";

  if (isLoading) {
    return <DeliveryDetailsSkeleton />;
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center p-8 bg-white border border-slate-100 rounded-[14px] shadow-sm my-12 font-inter max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-[#212B36] mb-2">No Delivery Available</h3>
        <p className="text-sm text-[#6A7282] mb-6 max-w-xs leading-relaxed">
          We couldn't find any delivery details for this project.
        </p>
        <Button
          className="px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const currentStatus = localStatus || delivery.status || "Scheduled";

  // Dynamic Contact Extraction
  const vendorName = delivery.vendorDetails?.vendorName
    || delivery.shipperDetails?.vendorName
    || delivery.shipperVendor?.vendorName
    || "";
  const vendorContact = delivery.vendorDetails?.personName
    || delivery.shipperDetails?.personName
    || "";
  const vendorPhone = delivery.vendorDetails?.number
    || delivery.shipperDetails?.number
    || "";
  const vendorEmail = delivery.vendorDetails?.email
    || delivery.shipperDetails?.email
    || "";

  const carrierName = delivery.deliveryCompanyDetails?.carrierName
    || delivery.selectedBid?.carrierName
    || (delivery as unknown as Record<string, { carrierName?: string }>).carrier?.carrierName
    || "";
  const carrierContact = delivery.deliveryCompanyDetails?.personName || "";
  const carrierPhone = delivery.deliveryCompanyDetails?.number || "";

  const internalOwnerName = delivery.internalOwner?.name || "";
  const internalOwnerPhone = delivery.internalOwner?.phone || "";
  const internalOwnerEmail = delivery.internalOwner?.email || "";

  const loadSizeQty = delivery.deliveryTypeAndSize?.bundleCount
    ? `${delivery.deliveryTypeAndSize.bundleCount} bundle(s)`
    : delivery.deliveryTypeAndSize?.packageCount
      ? `${delivery.deliveryTypeAndSize.packageCount} packages`
      : delivery.formDetails?.packageCount
        ? `${delivery.formDetails.packageCount} packages`
        : "";

  const requiredEquipment = delivery.equipmentRequirement?.join(", ")
    || delivery.formDetails?.loadingEquipment?.join(", ")
    || "";

  // Time window parser for Reschedule Dialog
  const parsedTimeStart = delivery.formDetails?.timeWindowStart ||
    (delivery.formDetails?.timings || delivery.formDetails?.deliveryTime || delivery.deliverySchedule?.timeWindow || "").split(/\s*[-–]\s*/)[0] || "";
  const parsedTimeEnd = delivery.formDetails?.timeWindowEnd ||
    (delivery.formDetails?.timings || delivery.formDetails?.deliveryTime || delivery.deliverySchedule?.timeWindow || "").split(/\s*[-–]\s*/)[1] || "";

  const initialTimeStart = convertTo24Hour(parsedTimeStart);
  const initialTimeEnd = convertTo24Hour(parsedTimeEnd);

  // Status timeline combined with simulated client-side status history
  const displayStatusHistory = [...(delivery.statusHistory || [])];
  if (localStatus && !displayStatusHistory.some(h => h.status.toLowerCase() === localStatus.toLowerCase())) {
    displayStatusHistory.push({
      status: localStatus,
      changedAt: new Date().toISOString()
    });
  }

  return (
    <div className="xl:pr-5 px-2 pb-10 space-y-6 relative font-inter">
      {/* Toast Notification */}
      {(toastMessage || localToast) && (
        <div className={`fixed top-6 right-6 z-50 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce ${(toastMessage || localToast || "").includes("Error:") ? "bg-red-500" : "bg-[#10B981]"
          }`}>
          <AlertTriangle size={18} strokeWidth={3} />
          {toastMessage || localToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap md:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4">
          <ArrowLeft size={18} strokeWidth={2.5} className="cursor-pointer" onClick={() => navigate(-1)} />
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#212B36]">
              Delivery Details
            </h1>
            <p className="text-sm text-[#6A7282] shrink-0 font-medium mt-0.5">
              {delivery.deliveryNumber || id || "—"} - {delivery.formDetails?.description || delivery.deliveryInformation?.description || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentStatus.toLowerCase() !== "delivered" && (
            <>
              <Button
                variant="outline"
                className="bg-white gap-2 font-semibold text-[#212B36] border-slate-200 hover:bg-slate-50 px-6 h-10"
                onClick={() => setIsRescheduleOpen(true)}
              >
                <RotateCcw className="w-4 h-4" />
                Reschedule
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold px-6 h-10"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit3 className="w-4 h-4" />
                Edit Delivery
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        {/* Left Column */}
        <div className="space-y-4">
          <DeliveryOverview
            delivery={delivery}
            currentStatus={currentStatus}
            formDate={formDate}
            formTimeWindow={formTimeWindow}
          />

          <DeliveryContacts
            vendorName={vendorName}
            vendorContact={vendorContact}
            vendorPhone={vendorPhone}
            vendorEmail={vendorEmail}
            carrierName={carrierName}
            carrierContact={carrierContact}
            carrierPhone={carrierPhone}
            internalOwnerName={internalOwnerName}
            internalOwnerPhone={internalOwnerPhone}
            internalOwnerEmail={internalOwnerEmail}
            deliveryId={delivery.deliveryNumber || id || ""}
            deliveryDescription={delivery.formDetails?.description || delivery.deliveryInformation?.description || ""}
            loadSizeQty={loadSizeQty}
            deliveryMaterialType={delivery.formDetails?.materialType || delivery.deliveryInformation?.materialCategory || ""}
          />

          <SiteCoordinationAndFreight
            delivery={delivery}
            formSiteInstructions={formSiteInstructions}
            requiredEquipment={requiredEquipment}
            formSpecialNotes={formSpecialNotes}
            carrierName={carrierName}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ReceivingPocCard
            receivingPocName={delivery.receivingPocDetails?.receivingPoc || delivery.formDetails?.receivingPoc || ""}
            receivingPocPhone={delivery.receivingPocDetails?.pickupContactPhone || delivery.formDetails?.pickupContactPhone || ""}
          />

          <QuickActionsCard
            currentStatus={currentStatus}
            onReschedule={() => setIsRescheduleOpen(true)}
            onMarkInTransit={() => {
              updateDeliveryStatus(delivery.deliveryId || id || "", "in_transit", () => {
                setLocalStatus("in_transit");
                setIsInTransitSuccessOpen(true);
              });
            }}
            onMarkDelivered={() => {
              updateDeliveryStatus(delivery.deliveryId || id || "", "delivered", () => {
                setLocalStatus("delivered");
                setIsMarkDeliveredOpen(true);
              });
            }}
          />

          <StatusHistoryCard displayStatusHistory={displayStatusHistory} />
        </div>
      </div>

      <RescheduleDeliveryDialog
        open={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        deliveryId={delivery.deliveryId}
        initialDate={delivery.deliverySchedule?.deliveryDate || delivery.formDetails?.deliveryDate || ""}
        initialTimeWindowStart={initialTimeStart}
        initialTimeWindowEnd={initialTimeEnd}
        initialAdditionalNotes={delivery.formDetails?.additionalNotes || ""}
        onSubmit={(data) => {
          setRescheduleData(data);
          setIsRescheduleOpen(false);
          setIsRescheduleSuccessOpen(true);
          setLocalStatus("rescheduled");
          setLocalDate(data.date);
          setLocalTimeWindow(`${data.timeWindowStart} – ${data.timeWindowEnd}`);
        }}
      />

      <RescheduleSuccessModal
        isOpen={isRescheduleSuccessOpen}
        onClose={() => setIsRescheduleSuccessOpen(false)}
        projectName={delivery.formDetails?.description || delivery.project?.projectName || ""}
        newDate={rescheduleData ? new Date(rescheduleData.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : undefined}
        timeWindow={rescheduleData ? `${rescheduleData.timeWindowStart} – ${rescheduleData.timeWindowEnd}` : undefined}
        contact={delivery.receivingPocDetails?.receivingPoc || delivery.formDetails?.receivingPoc || ""}
      />

      <MarkDeliveredSuccessDialog
        open={isMarkDeliveredOpen}
        onOpenChange={setIsMarkDeliveredOpen}
        deliveryTime={new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        receiverName={delivery.receivingPocDetails?.receivingPoc || delivery.formDetails?.receivingPoc || ""}
        deliveryNotes={formSpecialNotes || delivery.formDetails?.additionalNotes || ""}
      />

      <InTransitSuccessModal
        isOpen={isInTransitSuccessOpen}
        onClose={() => setIsInTransitSuccessOpen(false)}
      />

      <EditDeliveryModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        deliveryId={id || ""}
        delivery={delivery}
        onSaveSuccess={() => refetch()}
      />
    </div>
  );
}

