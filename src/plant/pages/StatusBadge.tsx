import React from "react";
import { formatStatusLabel, getStatusBadgeStyle } from "./deliveryStatusConstants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const cfg = getStatusBadgeStyle(status);
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.text} ${className}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
