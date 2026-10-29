import React from "react";
import { FolderOpen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = "No data available",
  description = "There is no data to display for the selected period.",
  icon: Icon = FolderOpen,
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center my-auto min-h-45 w-full",
        className
      )}
    >
      <div className="size-11 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
