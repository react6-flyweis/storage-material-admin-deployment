import { Building2, User, Calendar, Clock, MapPin, Box, CheckCircle2 } from "lucide-react";
import { CustomCard } from "./LayoutCards";
import { InfoRow, InfoBlock } from "./InfoDisplay";
import { formatDate } from "../utils";
import type { DeliveryDetails } from "@/modules/plant/freight.api";

interface DeliveryOverviewProps {
  delivery: DeliveryDetails;
  currentStatus: string;
  formDate: string;
  formTimeWindow: string;
}

export const DeliveryOverview = ({
  delivery,
  currentStatus,
  formDate,
  formTimeWindow
}: DeliveryOverviewProps) => {
  return (
    <div className="space-y-4">
      {/* Delivery Overview */}
      <CustomCard title="Delivery Overview" status={currentStatus}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 lg:gap-x-8 lg:gap-y-5">
          <InfoRow
            label="Project"
            value={delivery.project?.projectName || "—"}
            icon={Building2}
          />
          <InfoRow
            label="Customer"
            value={delivery.customer?.customerName || "—"}
            icon={User}
          />
          <InfoRow
            label="Delivery Date"
            value={formatDate(formDate || delivery.deliverySchedule?.deliveryDate || delivery.formDetails?.deliveryDate)}
            icon={Calendar}
          />
          <InfoRow
            label="Time Window"
            value={formTimeWindow || delivery.deliverySchedule?.timeWindow || delivery.formDetails?.timings || "—"}
            icon={Clock}
          />
          <div className="sm:col-span-2">
            <InfoRow
              label="Site Address"
              value={delivery.deliverySchedule?.dropoffAddress || delivery.formDetails?.deliveryLocation || "—"}
              icon={MapPin}
            />
          </div>
        </div>
      </CustomCard>

      {/* Delivery Information */}
      <CustomCard title="Delivery Information">
        <div className="space-y-5">
          <InfoRow
            label="Description"
            value={delivery.formDetails?.description || delivery.deliveryInformation?.description || "—"}
            icon={Box}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <InfoBlock
              label="Material Category"
              value={delivery.formDetails?.materialType || delivery.deliveryInformation?.materialCategory || "—"}
            />
            <InfoBlock
              label="Pickup Date"
              value={formatDate(delivery.formDetails?.pickupDate || delivery.deliveryInformation?.pickupDate)}
            />
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

interface SiteCoordinationAndFreightProps {
  delivery: DeliveryDetails;
  formSiteInstructions: string;
  requiredEquipment: string;
  formSpecialNotes: string;
  carrierName: string;
}

export const SiteCoordinationAndFreight = ({
  delivery,
  formSiteInstructions,
  requiredEquipment,
  formSpecialNotes,
  carrierName
}: SiteCoordinationAndFreightProps) => {
  return (
    <div className="space-y-4">
      {/* Site Coordination */}
      <CustomCard title="Site Coordination">
        <div className="space-y-5">
          <InfoBlock
            label="Site Instructions"
            value={formSiteInstructions || delivery.siteCoordinationNotes || delivery.formDetails?.specialRequirements || "—"}
          />
          <InfoBlock
            label="Required Equipment"
            value={requiredEquipment || "—"}
          />
          <div className="space-y-1">
            <p className="text-xs font-normal text-[#6A7282] shrink-0 uppercase tracking-wide">
              Equipment Confirmation Status
            </p>
            <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
              <CheckCircle2 size={16} /> Confirmed
            </div>
          </div>
          <InfoBlock
            label="Special Notes"
            value={formSpecialNotes || delivery.formDetails?.additionalNotes || "—"}
          />
        </div>
      </CustomCard>

      {/* Freight Link */}
      <CustomCard title="Freight Link">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <InfoBlock label="Awarded Carrier" value={carrierName || "—"} />
          <InfoBlock
            label="Price"
            value={
              delivery.selectedBid?.quotedAmount
                ? `$${delivery.selectedBid.quotedAmount} ${delivery.selectedBid.currency || "USD"}`
                : "—"
            }
          />
        </div>
      </CustomCard>
    </div>
  );
};
