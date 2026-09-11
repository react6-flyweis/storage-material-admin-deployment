import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  CalendarDays,
  Truck,
  CheckSquare,
  Bell,
  Download,
  FileText
} from "lucide-react";
import { QuickActionButton, TimelineItem } from "./LayoutCards";
import { formatStatusText } from "../utils";

interface ReceivingPocCardProps {
  receivingPocName: string;
  receivingPocPhone: string;
}

export const ReceivingPocCard = ({ receivingPocName, receivingPocPhone }: ReceivingPocCardProps) => {
  const avatarInitials = receivingPocName
    ? receivingPocName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "POC";

  return (
    <div className="bg-white border border-gray-100 rounded-[14px] p-5 shadow-xs space-y-4 font-inter">
      <h2 className="text-base font-semibold text-[#212B36]">Receiving Point of Contact</h2>
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>{avatarInitials}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-[#212B36] text-sm">
          {receivingPocName || "—"}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[#6A7282] shrink-0 text-sm">
          <Phone size={14} className="shrink-0" />
          <span>{receivingPocPhone || "—"}</span>
        </div>
      </div>
    </div>
  );
};

interface QuickActionsCardProps {
  currentStatus: string;
  onReschedule: () => void;
  onMarkInTransit: () => void;
  onMarkDelivered: () => void;
}

export const QuickActionsCard = ({
  currentStatus,
  onReschedule,
  onMarkInTransit,
  onMarkDelivered
}: QuickActionsCardProps) => {
  const statusLower = currentStatus.toLowerCase();
  const isDelivered = statusLower === "delivered";
  const isInTransit = statusLower === "in_transit" || statusLower === "in transit";

  return (
    <div className="bg-white border border-[#0000001A] rounded-[14px] p-5 shadow-sm space-y-4">
      <h2 className="text-base font-semibold text-[#212B36]">Quick Actions</h2>
      <div className="space-y-2">
        <QuickActionButton
          icon={CalendarDays}
          label="Reschedule Delivery"
          onClick={onReschedule}
          disabled={isDelivered}
        />
        <QuickActionButton
          icon={Truck}
          label="Mark In Transit"
          onClick={onMarkInTransit}
          disabled={isInTransit || isDelivered}
        />
        <QuickActionButton
          icon={CheckSquare}
          label="Mark Delivered"
          onClick={onMarkDelivered}
          disabled={isDelivered}
        />
        <QuickActionButton icon={Bell} label="Send Reminder Now" />
        <QuickActionButton icon={Download} label="Download Details" />
        <QuickActionButton icon={FileText} label="View Documents" />
      </div>
    </div>
  );
};

interface StatusHistoryCardProps {
  displayStatusHistory: Array<{
    status: string;
    changedAt: string;
  }>;
}

export const StatusHistoryCard = ({ displayStatusHistory }: StatusHistoryCardProps) => {
  return (
    <div className="bg-white border border-[#0000001A] rounded-[14px] p-5 shadow-sm font-inter">
      <h2 className="text-base font-semibold text-[#212B36] mb-5">Status History</h2>
      <div className="relative">
        <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-[#E5E7EB]" />
        <div className="space-y-2">
          {displayStatusHistory.length > 0 ? (
            displayStatusHistory.map((historyItem, idx) => (
              <TimelineItem
                key={idx}
                status={formatStatusText(historyItem.status)}
                date={new Date(historyItem.changedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit"
                })}
                description={`Delivery status changed to ${formatStatusText(historyItem.status)}`}
                isLast={idx === displayStatusHistory.length - 1}
              />
            ))
          ) : (
            <TimelineItem
              status="Created"
              date="—"
              description="Delivery created and scheduled by System"
              isLast
            />
          )}
        </div>
      </div>
    </div>
  );
};
