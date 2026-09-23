import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  CalendarDays,
  Bell,
  Download,
  FileText,
  RotateCcw,
  SquarePen,
} from "lucide-react";
import { QuickActionButton, TimelineItem } from "./LayoutCards";
import {
  formatStatusLabel,
  getStatusBadgeStyle,
  isFinalStatus,
} from "../../deliveryStatusConstants";

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

export const DeliveryStatusActionButton = ({
  status,
  onClick,
  disabled,
}: {
  status: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const currentLabel = formatStatusLabel(status || "material_prepared");
  const isDelivered = isFinalStatus(status);
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isDelivered}
      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border-[0.7px] border-[#0000001A] rounded-[8px] transition-all group shadow-xs text-left disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <RotateCcw size={18} className="text-[#0A0A0A] shrink-0" />
        <span className={`text-sm font-medium ${badgeStyle.text} truncate`}>
          Status: {currentLabel}
        </span>
      </div>

      <div className="shrink-0 flex items-center ml-2">
        {!isDelivered ? (
          <SquarePen
            size={16}
            className="text-[#637381] group-hover:text-blue-600 group-hover:scale-110 transition-all shrink-0"
          />
        ) : (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Completed
          </span>
        )}
      </div>
    </button>
  );
};

interface QuickActionsCardProps {
  currentStatus: string;
  onOpenStatusModal?: () => void;
  onReschedule: () => void;
  isUpdatingStatus?: boolean;
}

export const QuickActionsCard = ({
  currentStatus,
  onOpenStatusModal,
  onReschedule,
  isUpdatingStatus = false,
}: QuickActionsCardProps) => {
  const isDelivered = isFinalStatus(currentStatus);

  return (
    <div className="bg-white border border-[#0000001A] rounded-[14px] p-5 shadow-sm space-y-4">
      <h2 className="text-base font-semibold text-[#212B36]">Quick Actions</h2>
      <div className="space-y-2.5">
        <DeliveryStatusActionButton
          status={currentStatus}
          onClick={onOpenStatusModal}
          disabled={isUpdatingStatus}
        />
        <QuickActionButton
          icon={CalendarDays}
          label="Reschedule Delivery"
          onClick={onReschedule}
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
                status={formatStatusLabel(historyItem.status)}
                date={new Date(historyItem.changedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit"
                })}
                description={`Delivery status changed to ${formatStatusLabel(historyItem.status)}`}
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
