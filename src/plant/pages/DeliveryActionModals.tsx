import React from "react";
import SuccessModal from "../components/common_component/SuccessModal";

interface RescheduleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  newDate?: string;
  timeWindow?: string;
  contact?: string;
}

export const RescheduleSuccessModal: React.FC<RescheduleSuccessModalProps> = ({
  isOpen,
  onClose,
  projectName,
  newDate = "N/A",
  timeWindow = "N/A",
  contact = "N/A",
}) => {
  return (
    <SuccessModal
      isLogoBottom={false}
      isOpen={isOpen}
      onClose={onClose}
      title="Delivery Rescheduled Successfully"
      buttonText="Ok"
    >
      <div className="space-y-3 pt-2 pb-6 text-left">
        <p className="text-sm font-semibold text-[#212B36]">
          Project: <span className="font-normal">{projectName}</span>
        </p>
        <p className="text-sm font-semibold text-[#212B36]">
          New Date: <span className="font-normal">{newDate}</span>
        </p>
        <p className="text-sm font-semibold text-[#212B36]">
          Time Window: <span className="font-normal">{timeWindow}</span>
        </p>
        <p className="text-sm font-semibold text-[#212B36]">
          Receiving Contact: <span className="font-normal">{contact}</span>
        </p>
      </div>
    </SuccessModal>
  );
};
