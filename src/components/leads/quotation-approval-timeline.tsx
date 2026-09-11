import type { Quotation } from "@/modules/quotations/quotations.api";
import { ApprovalHistoryTimeline } from "@/components/timeline/approval-history-timeline";

export interface QuotationApprovalTimelineProps {
  quotation: Quotation;
  className?: string;
  showEmpty?: boolean;
  version?: number | string;
  approvedVersion?: number | string;
}

export default function QuotationApprovalTimeline({
  quotation,
  className = "",
  showEmpty = true,
  version,
  approvedVersion,
}: QuotationApprovalTimelineProps) {
  return (
    <ApprovalHistoryTimeline
      history={quotation.approval?.history}
      quotation={quotation}
      version={version ?? quotation.versionNumber}
      approvedVersion={approvedVersion ?? quotation.approval?.approvedVersionNumber}
      className={className}
      showEmpty={showEmpty}
    />
  );
}
