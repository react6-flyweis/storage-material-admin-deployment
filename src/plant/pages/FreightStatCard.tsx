import React from "react";
import type { LucideIcon } from "lucide-react";

export interface FreightStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
}

export const FreightStatCard: React.FC<FreightStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}) => {
  return (
    <div
      className="flex-1 p-3 md:p-5 rounded-[14px] text-white relative overflow-hidden md:min-w-[200px] md:h-[160px] flex flex-col justify-between transition-all"
      style={{
        background: gradient,
        boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="relative z-10 flex justify-between items-start">
        <p className="text-sm font-normal">{title}</p>
        <Icon size={24} />
      </div>

      <div className="relative z-10">
        <p className="text-xl md:text-[32px] font-semibold leading-none mb-6">{value}</p>
        {subtitle && <p className="text-sm font-normal">{subtitle}</p>}
      </div>
    </div>
  );
};

export default FreightStatCard;
