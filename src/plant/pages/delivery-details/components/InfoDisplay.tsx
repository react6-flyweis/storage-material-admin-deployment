import React from "react";
import { formatStatusText, statusConfig } from "../utils";

export const StatusBadge = ({ status }: { status: string }) => {
  const formatted = statusConfig[status] ? status : status.toLowerCase();
  const cfg = statusConfig[formatted] || statusConfig[status] || statusConfig["Scheduled"];
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
      {formatStatusText(status)}
    </span>
  );
};

interface InfoRowProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export const InfoRow = ({ label, value, icon: Icon }: InfoRowProps) => (
  <div className="space-y-1 font-inter">
    <p className="text-xs md:text-sm font-medium text-[#6A7282] shrink-0 uppercase mb-2">{label}</p>
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-[#6A7282] shrink-0" />}
      <p className="text-sm font-medium text-[#212B36]">{value}</p>
    </div>
  </div>
);

export const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1 font-inter">
    <p className="text-xs md:text-sm font-normal text-[#6A7282] uppercase">{label}</p>
    <p className="text-sm md:text-base font-normal text-[#101828]">{value}</p>
  </div>
);
