import { useNavigate } from "react-router";
import {
  Building2,
  Clock,
  Phone,
  Truck,
  Bell,
  AlertTriangle,
  Van,
  CalendarSync,
  ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Delivery {
  id: string;
  title: string;
  projectId: string;
  status: "Scheduled" | "Confirmed" | "In Transit" | "Delivered" | "Delayed" | "Cancelled" | "Draft" | "Bidding Sent" | "Carrier Selected";
  badges?: { text: string; type: "critical" | "warning" }[];
  project: string;
  customer: string;
  timeWindow: string;
  receivingContact: string;
  vendor: string;
  siteLocation: string;
  requiredEquipment: string;
  internalOwner: string;
  carrier: string;
  freightLoad: string;
  date: string; // ISO string
}

export const statusConfig: Record<string, { color: string; bgColor: string; dotColor: string }> = {
  Draft: { color: "#919EAB", bgColor: "#F4F6F8", dotColor: "#DFE3E8" },
  "Bidding Sent": { color: "#155DFC", bgColor: "#E6F0FF", dotColor: "#155DFC" },
  "Carrier Selected": { color: "#155DFC", bgColor: "#E6F0FF", dotColor: "#155DFC" },
  Scheduled: { color: "#2B7FFF", bgColor: "#DCFCE7", dotColor: "#2B7FFF" },
  Confirmed: { color: "#22C55E", bgColor: "#F0FDF4", dotColor: "#22C55E" },
  "In Transit": { color: "#FFAB00", bgColor: "#FFF9EA", dotColor: "#FFAB00" },
  Delivered: { color: "#00B8D9", bgColor: "#E6FBFE", dotColor: "#00A76F" },
  Delayed: { color: "#FF5630", bgColor: "#FFE9D5", dotColor: "#FF8C00" },
  Cancelled: { color: "#FF5630", bgColor: "#FFE9D5", dotColor: "#FF5630" },
};

export const Badge = ({ text, type }: { text: string; type: "critical" | "warning" }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-normal tracking-wider flex items-center gap-1 ${type === "critical" ? "bg-[#FFE4DE] text-[#822900]" : "bg-[#FFF5CC] text-[#CC8D10]"
    }`}>
    {type === "warning" && <AlertTriangle size={12} />}
    {text}
  </span>
);

export const DetailItem = ({ label, value, icon: Icon, subValue }: any) => (
  <div className="space-y-1.5 text-left">
    <p className="text-[10px] font-bold text-[#919EAB] tracking-wider">{label}</p>
    <div className="flex items-start gap-2">
      {Icon && <Icon size={16} className="text-[#637381] mt-0.5 shrink-0" />}
      <div>
        <p className="text-sm font-normal text-[#212B36] leading-tight " style={{ overflowWrap: "break-word", wordBreak: "break-word", whiteSpace: "normal" }}>{value}</p>
        {subValue && <p className="text-xs text-[#637381] mt-0.5">{subValue}</p>}
      </div>
    </div>
  </div>
);

interface DeliveryCardProps {
  delivery: Delivery;
  onReschedule?: (id: string) => void;
  onMarkInTransit?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onSendReminder?: (id: string) => void;
}

export const DeliveryCard = ({
  delivery,
  onReschedule,
  onMarkInTransit,
  onMarkDelivered,
  onViewDetails,
  onSendReminder,
}: DeliveryCardProps) => {
  const config = statusConfig[delivery.status];
  const navigate = useNavigate();

  const currentStatus = (delivery.status || "").toLowerCase();
  const isDelivered = currentStatus === "delivered";
  const isInTransit = currentStatus === "in_transit" || currentStatus === "in transit";

  const actions = [
    { label: "View Details", icon: Van, onClick: () => onViewDetails ? onViewDetails(delivery.id) : navigate(`/plant/delivery-details/${delivery.id}`), disabled: false },
    { label: "Reschedule Delivery", icon: CalendarSync, onClick: () => onReschedule ? onReschedule(delivery.id) : navigate(`/plant/reschedule-delivery/${delivery.id}`), disabled: isDelivered },
    { label: "Mark In Transit", icon: Truck, onClick: () => onMarkInTransit?.(delivery.id), disabled: isInTransit || isDelivered },
    { label: "Mark Delivered", icon: ClipboardCheck, onClick: () => onMarkDelivered ? onMarkDelivered(delivery.id) : navigate(`/plant/mark-delivered/${delivery.id}`), disabled: isDelivered },
    { label: "Send Reminder Now", icon: Bell, onClick: () => onSendReminder?.(delivery.id), disabled: false },
  ];

  return (
    <div className="bg-white rounded-[14px] border border-gray-100  overflow-hidden transition-all mb-3 text-left">
      <div className="p-2 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-left">
          <div className="mt-1.5 w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: config.dotColor }} />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base md:text-lg font-semibold text-[#212B36]">{delivery.title}</h3>
              {delivery.badges?.map((badge, idx) => (
                <Badge key={idx} text={badge.text} type={badge.type} />
              ))}
            </div>
            <p className="text-sm font-medium text-[#637381]">{delivery.projectId}</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-normal ${config.bgColor} border self-start md:self-center`} style={{ borderColor: `${config.color}20`, color: config.color }}>
          {delivery.status}
        </div>
      </div>

      <div className="px-4 md:px-4 pb-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 md:gap-y-6 md:gap-x-10 gap-x-4 gap-y-2">
        <DetailItem label="PROJECT" value={delivery.project} icon={Building2} />
        <DetailItem label="CUSTOMER" value={delivery.customer} />
        <DetailItem label="TIME WINDOW" value={delivery.timeWindow} icon={Clock} />
        <div className="relative">
          <DetailItem label="RECEIVING CONTACT" value={delivery.receivingContact} />
          <Phone size={18} className="absolute right-0 bottom-1 text-[#2B7FFF] cursor-pointer" />
        </div>
        <DetailItem label="VENDOR" value={delivery.vendor} icon={Truck} />
        <DetailItem label="SITE LOCATION" value={delivery.siteLocation} />
        <DetailItem label="REQUIRED EQUIPMENT" value={delivery.requiredEquipment} />
        <DetailItem label="INTERNAL OWNER" value={delivery.internalOwner} />
        {/* <DetailItem label="CARRIER" value={delivery.carrier} subValue={`Freight Load: ${delivery.freightLoad}`} /> */}
        <DetailItem label="CARRIER" value={delivery.carrier} />
      </div>

      <div className="border-t border-gray-50 flex gap-3 flex-wrap items-center p-3">
        {actions.map((action, idx) => (
          <Button key={idx} variant="white" size="sm" onClick={action.onClick} disabled={action.disabled}>
            <action.icon size={18} className="text-[#454F5B] mr-2" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
