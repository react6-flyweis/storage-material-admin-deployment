import React from "react";
import { cn } from "@/lib/utils";

interface InfoItem {
  label: string;
  value: string;
}

interface CommonInfoListProps {
  title?: string;
  items: InfoItem[];
  labelWidth?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

const CommonInfoList: React.FC<CommonInfoListProps> = ({
  title,
  items,
  labelWidth = "min-w-[140px]",
  className = "space-y-2 bg-[#F7F8F9] p-4 rounded-md",
  labelClassName,
  valueClassName,
}) => {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-lg md:text-2xl font-inter w-full font-bold text-[#212B36] mb-6">
          {title}
        </h2>
      )}
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm md:text-base font-inter font-semibold text-[#212B36]",
              labelWidth,
              labelClassName
            )}
          >
            {item.label}:
          </span>
          <span
            className={cn(
              "text-sm md:text-base font-inter text-[#637381]",
              valueClassName
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CommonInfoList;
