import React, { useState } from "react";
import { Award, CheckCircle2 } from "lucide-react";
import Modal from "../components/Modal";
import type { FreightBidItem } from "@/modules/plant/freight.api";

// --- Custom local Button component to match the requested UI variants ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradientGreen" | "white" | "primary" | "secondary";
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
    gradientGreen: "bg-gradient-to-r from-[#00C950] to-[#00A76F] hover:brightness-105 text-white shadow-lg shadow-[#00A76F]/20",
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

// --- Custom Toggle Component ---
interface ToggleProps {
  active: boolean;
  onChange: () => void;
  title: string;
  subtitle: string;
}

const Toggle: React.FC<ToggleProps> = ({ active, onChange, title, subtitle }) => (
  <div className="flex items-center justify-between gap-4 py-2 font-inter">
    <button
      type="button"
      onClick={onChange}
      className={`md:w-[56px] w-[48px] md:h-[24px] h-[20px] rounded-full transition-all duration-300 relative flex items-center px-1 shrink-0 ${
        active ? "bg-[#00A76F]" : "bg-[#919EAB]/30"
      }`}
    >
      <div
        className={`md:w-7 w-5 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
          active ? "translate-x-[22px]" : "translate-x-0"
        }`}
      />
      {active && (
        <span className="absolute left-2 text-xs font-bold text-white uppercase select-none">
          I
        </span>
      )}
    </button>
    <div className="flex-1">
      <p className="text-sm font-semibold text-[#212B36]">{title}</p>
      <p className="text-xs text-[#637381] font-normal leading-tight mt-0.5">
        {subtitle}
      </p>
    </div>
  </div>
);

interface AwardLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  carrier: FreightBidItem | null;
  isLoading?: boolean;
  error?: string;
}

export const AwardLoadModal: React.FC<AwardLoadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  carrier,
  isLoading = false,
  error,
}) => {
  const [sendEmail, setSendEmail] = useState(true);
  const [autoCreate, setAutoCreate] = useState(true);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-[580px]">
      <div className="p-2 md:p-0 md:space-y-8 space-y-4 font-inter text-[#212B36]">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="md:w-12 md:h-12 w-10 h-10 bg-linear-to-br from-[#00C950] to-[#00A63E] hover:brightness-110 transition rounded-full flex items-center justify-center text-white shadow-lg shadow-[#00A76F]/20">
            <Award className="md:size-6 size-5" />
          </div>
          <h2 className="text-lg md:text-2xl font-semibold text-[#212B36]">
            Award Load Confirmation
          </h2>
        </div>

        {/* Winner Card */}
        <div className="bg-[linear-gradient(135deg,#F0FDF4_0%,#ECFDF5_100%)] border-2 border-[#B9F8CF] rounded-[10px] p-4 md:p-6 flex justify-between items-center relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <p className="text-sm font-semibold text-[#212B36] mb-1">
              Winning Carrier
            </p>
            <h3 className="text-base md:text-[22px] font-semibold text-[#212B36]">
              {carrier?.carrierName || ""}
            </h3>
          </div>
          <div className="text-right relative z-10">
            <p className="text-xs font-medium text-[#4A5565] mb-1">
              Award Amount
            </p>
            <p className="text-[26px] md:text-[36px] font-semibold md:font-bold text-[#00A76F] leading-none mb-1">
              {carrier?.bidAmount ? `$${carrier.bidAmount.toLocaleString()}` : ""}
            </p>
            <p className="text-[11px] font-semibold text-[#00A76F] uppercase tracking-[0.5px]">
              BEST RATE
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2 pt-2">
          <Toggle
            active={sendEmail}
            onChange={() => setSendEmail(!sendEmail)}
            title="Send award confirmation email to carrier"
            subtitle={`Notify ${carrier?.carrierName || "carrier"} that they've been awarded the load`}
          />
          <Toggle
            active={autoCreate}
            onChange={() => setAutoCreate(!autoCreate)}
            title="Auto-create delivery from this freight request"
            subtitle="Automatically generate a delivery record with all details from this request"
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-2 md:p-3 rounded-[14px] text-red-800 text-sm font-medium">
            <p className="font-bold">Error Awarding Load</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-[#EFF6FF] border border-[#BEDBFF] p-2 md:p-3 rounded-[14px] flex gap-2 md:gap-4 items-start">
          <CheckCircle2 className="size-4 md:size-8 shrink-0 mt-0.5" strokeWidth={2} color="#155DFC" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#155DFC]">
              Ready to Award
            </p>
            <p className="text-xs md:text-sm text-[#155DFC] font-normal leading-relaxed">
              This will finalize the freight request for{" "}
              <span className="font-normal">
                {carrier?.carrierName || ""}
              </span>{" "}
              at{" "}
              <span className="font-normal">{carrier?.bidAmount ? `$${carrier.bidAmount.toLocaleString()}` : ""}</span>{" "}
              and trigger all selected automation workflows.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex lg:flex-nowrap flex-wrap justify-between gap-4 pt-2">
          <Button
            variant="gradientGreen"
            onClick={onConfirm}
            size="lg"
            disabled={isLoading}
          >
            <Award className="size-5 mr-2" />
            {isLoading ? "Awarding Load..." : "Confirm & Award Load"}
          </Button>
          <Button onClick={onClose} variant="white" disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
