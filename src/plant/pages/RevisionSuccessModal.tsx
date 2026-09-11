import React from "react";
import Modal from "../components/Modal";
import type { FreightBidItem } from "@/modules/plant/freight.api";
import successIcon from "../assets/SuccessModalCheckIcon.svg";

// --- Custom local Button component to match the requested UI variants ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "white" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs h-9",
    md: "px-5 py-3 text-sm h-11",
    lg: "w-full py-3.5 px-6 text-base h-12 md:h-14",
  };

  const variantStyles = {
    gradient: "bg-gradient-to-r from-[#3B59F6] to-[#2240D4] hover:brightness-105 text-white shadow-lg shadow-[#3B59F6]/20",
    white: "border border-[#D1D5DB] bg-white hover:bg-gray-50 text-[#212B36]",
    primary: "bg-[#3B59F6] hover:bg-[#2240D4] text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  };

  return (
    <button
      type={props.type || "button"}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface RevisionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
  carrier: FreightBidItem | null;
  targetAmount: string;
  message: string;
}

export const RevisionSuccessModal: React.FC<RevisionSuccessModalProps> = ({
  isOpen,
  onClose,
  onOk,
  carrier,
  targetAmount,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-[620px]">
      <div className="p-6 md:p-2 space-y-10 font-inter">
        {/* Success Icon & Title */}
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <img src={successIcon} alt="Success" className="w-20 h-20 object-cover" />
          </div>
          <div className="pt-2">
            <h2 className="text-lg md:text-2xl font-bold text-[#111827] leading-tight">
              Revision request sent to {carrier?.carrierName || "QuickFreight Solutions"}!
            </h2>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div className="text-base md:text-xl">
            <span className="font-semibold text-[#111827]">Target Amount: </span>
            <span className="font-normal text-[#111827]">
              {targetAmount ? (targetAmount.startsWith('$') ? targetAmount : `$${targetAmount}`) : "N/A"}
            </span>
          </div>
          <div className="space-y-3">
            <p className="text-base md:text-xl">
              <span className="font-semibold text-[#111827]">Message: </span>
              <span className="font-normal text-[#111827] leading-relaxed">
                {message}
              </span>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-base md:text-xl font-semibold text-[#111827]">
          The carrier will be notified and can submit a revised bid.
        </p>

        {/* Action */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onOk}
            variant="gradient"
            size="lg"
          >
            Ok
          </Button>
        </div>
      </div>
    </Modal>
  );
};
