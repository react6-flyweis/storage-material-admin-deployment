import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import Button from "../components/Button";

interface RescheduleDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  initialDate?: string;
  initialTimeWindowStart?: string;
  initialTimeWindowEnd?: string;
  onSubmit: (data: { date: string; timeWindowStart: string; timeWindowEnd: string }) => void;
}

const RescheduleDeliveryModal: React.FC<RescheduleDeliveryModalProps> = ({
  isOpen,
  onClose,
  deliveryId,
  initialDate = "",
  initialTimeWindowStart = "",
  initialTimeWindowEnd = "",
  onSubmit,
}) => {
  const [date, setDate] = useState(initialDate);
  const [timeWindowStart, setTimeWindowStart] = useState(initialTimeWindowStart);
  const [timeWindowEnd, setTimeWindowEnd] = useState(initialTimeWindowEnd);

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || "");
      setTimeWindowStart(initialTimeWindowStart || "");
      setTimeWindowEnd(initialTimeWindowEnd || "");
    }
  }, [isOpen, initialDate, initialTimeWindowStart, initialTimeWindowEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ date, timeWindowStart, timeWindowEnd });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-[480px]">
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 font-inter text-left">
        <div>
          <h2 className="text-xl font-bold text-[#212B36]">Reschedule Delivery</h2>
          <p className="text-sm text-[#637381] mt-1">Update the delivery date and time window</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#212B36] uppercase tracking-wider">New Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1E51A4] text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#212B36] uppercase tracking-wider">Time Window Start</label>
              <input
                type="text"
                placeholder="e.g. 8:00 AM"
                value={timeWindowStart}
                onChange={(e) => setTimeWindowStart(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1E51A4] text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#212B36] uppercase tracking-wider">Time Window End</label>
              <input
                type="text"
                placeholder="e.g. 12:00 PM"
                value={timeWindowEnd}
                onChange={(e) => setTimeWindowEnd(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1E51A4] text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="white" onClick={onClose} type="button">Cancel</Button>
          <Button variant="purpleFilled" type="submit">Reschedule</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RescheduleDeliveryModal;
