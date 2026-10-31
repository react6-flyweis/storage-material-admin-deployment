import { Badge } from "@/components/ui/badge";
import type { TaxStatusObject, TaxStatusTone } from "@/modules/payments/payments.api";

interface TaxStatusBadgeProps {
  status?: TaxStatusObject | string | null;
  className?: string;
}

function getToneFromStatusString(val?: string | null): TaxStatusTone {
  if (!val) return "neutral";
  const s = val.toLowerCase().trim().replace(/[-_]/g, " ");
  if (
    s.includes("due soon") ||
    s.includes("payment due") ||
    s.includes("overdue")
  ) {
    return "warning";
  }
  if (s.includes("no tax due")) {
    return "success";
  }
  if (s.includes("filed") || s.includes("paid")) {
    return "success";
  }
  if (s.includes("info")) {
    return "info";
  }
  if (s.includes("pending")) {
    return "neutral";
  }
  return "neutral";
}

function getToneClasses(tone?: TaxStatusTone) {
  switch (tone) {
    case "warning":
      return "bg-[#f9923b] hover:bg-[#eb842d] text-white"; // Orange (Due Soon, Payment Due)
    case "neutral":
      return "bg-slate-500 hover:bg-slate-600 text-white"; // Blue-gray (Pending)
    case "success":
      return "bg-emerald-600 hover:bg-emerald-700 text-white"; // Green (No tax due, Filed)
    case "info":
      return "bg-teal-600 hover:bg-teal-700 text-white"; // Teal (Filed)
    default:
      return "bg-slate-500 hover:bg-slate-600 text-white";
  }
}

export default function TaxStatusBadge({
  status,
  className = "",
}: TaxStatusBadgeProps) {
  if (!status) {
    return <span className="text-gray-400 text-sm">-</span>;
  }

  let label = "";
  let tone: TaxStatusTone = "neutral";

  if (typeof status === "object") {
    label = status.label || status.code || "-";
    tone = status.tone || getToneFromStatusString(label);
  } else {
    label = status;
    tone = getToneFromStatusString(status);
  }

  return (
    <Badge
      className={`font-medium text-xs px-2.5 py-0.5 rounded-sm border-0 capitalize shadow-none ${getToneClasses(
        tone
      )} ${className}`}
    >
      {label}
    </Badge>
  );
}
