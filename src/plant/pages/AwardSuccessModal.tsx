import React from "react";
import Modal from "../components/Modal";
import type { FreightBidItem } from "@/modules/plant/freight.api";
import successIcon from "../assets/SuccessModalCheckIcon.svg";

interface AwardSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
  carrier: FreightBidItem | null;
  projectName?: string;
  deliveryId?: string;
  deliveryDate?: string;
  poc?: string;
  location?: string;
}

export const AwardSuccessModal: React.FC<AwardSuccessModalProps> = ({
  isOpen,
  onClose,
  onOk,
  carrier,
  projectName = "",
}) => {
  if (!isOpen) return null;

  const carrierName = carrier?.carrierName || "";
  const carrierAmountHeader = carrier?.bidAmount ? `$${carrier.bidAmount.toLocaleString()}` : "";
  const carrierAmountDetail = carrier?.bidAmount ? `$${carrier.bidAmount.toLocaleString()}` : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-[540px]">
      <div className="p-4 space-y-6 font-inter text-[#111827]">
        {/* Success Icon & Title */}
        <div className="flex items-center gap-5">
          <div className="shrink-0">
            <img src={successIcon} alt="Success" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight">
              Load awarded to {carrierName}
            </h2>
            <h2 className="text-xl md:text-2xl font-bold leading-tight">
              for {carrierAmountHeader}!
            </h2>
          </div>
        </div>

        {/* Carrier Details */}
        <div className="space-y-3 pt-2 text-base">
          <p>
            <span className="font-bold">Carrier:</span> {carrierName}
          </p>
          <p>
            <span className="font-bold">Amount:</span> {carrierAmountDetail}
          </p>
        </div>

        {/* Divider */}
        <hr className="border-t border-gray-300 my-2" />

        {/* Project Details */}
        <div className="space-y-3 text-base">
          <p>
            <span className="font-bold">Project:</span> {projectName}
          </p>
          <p>
            <span className="font-bold">Delivery Company:</span> {carrierName}
          </p>
        </div>

        {/* Navigation & Email Info */}
        <div className="space-y-3 pt-2 text-base">
          <p className="font-bold">
            View in Delivery Management <span className="font-normal text-gray-700">→ Delivery List</span>
          </p>
          <p className="font-semibold text-[#00A76F]">
            Confirmation email sent to {carrierName}.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onOk}
            className="w-full max-w-[320px] h-12 bg-[#3B59F6] hover:bg-[#2240D4] text-white font-semibold text-lg rounded-xl shadow-md transition-all text-center"
          >
            Ok
          </button>
        </div>
      </div>
    </Modal>
  );
};
