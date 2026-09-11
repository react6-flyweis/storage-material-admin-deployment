import React from "react";
import Modal from "../components/Modal";
import { format } from "date-fns";
import { type Delivery, DeliveryCard } from "./DeliveryComponents";

interface DailyDeliveriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  deliveries: Delivery[];
  onReschedule?: (id: string) => void;
  onMarkInTransit?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onSendReminder?: (id: string) => void;
}

const DailyDeliveriesModal: React.FC<DailyDeliveriesModalProps> = ({
  isOpen,
  onClose,
  date,
  deliveries,
  onReschedule,
  onMarkInTransit,
  onMarkDelivered,
  onViewDetails,
  onSendReminder,
}) => {
  if (!isOpen || !date) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-[1000px] max-h-[85vh] overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#212B36]">
          {format(date, "EEEE, MMMM d, yyyy")}
        </h2>

        <div className="space-y-4 pr-2">
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onReschedule={onReschedule}
                onMarkInTransit={onMarkInTransit}
                onMarkDelivered={onMarkDelivered}
                onViewDetails={onViewDetails}
                onSendReminder={onSendReminder}
              />
            ))
          ) : (
            <div className="py-20 text-center space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-[#637381] font-medium">No deliveries scheduled for this day.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DailyDeliveriesModal;
