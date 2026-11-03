import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type QuotationWorkflowStatus,
  normalizeWorkflowStatus,
  QUOTATION_STATUS_CONFIG,
} from "@/modules/quotations/quotations.utils";

export interface QuotationStatusBadgeProps {
  workflowStatus?: QuotationWorkflowStatus | string | null;
  status?: QuotationWorkflowStatus | string | null;
  sendMethod?: "platform" | "manual" | string | null;
  className?: string;
  showSendMethod?: boolean;
}

export function QuotationStatusBadge({
  workflowStatus,
  status,
  sendMethod,
  className,
  showSendMethod = false,
}: QuotationStatusBadgeProps) {
  // Single source of truth: workflowStatus
  const normalized = normalizeWorkflowStatus(workflowStatus || status);
  const config = QUOTATION_STATUS_CONFIG[normalized] || QUOTATION_STATUS_CONFIG.draft;

  let displayLabel = config.label;
  if (normalized === "sent" && showSendMethod) {
    if (sendMethod === "manual") {
      displayLabel = "Marked Sent";
    } else if (sendMethod === "platform") {
      displayLabel = "Sent via Email";
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap border capitalize",
        config.badgeClass,
        className
      )}
    >
      {displayLabel}
    </Badge>
  );
}

export default QuotationStatusBadge;

