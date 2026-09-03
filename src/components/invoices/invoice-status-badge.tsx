import type { WorkflowStatus, ApprovalStatus } from "@/modules/invoices/invoices.api";

interface InvoiceStatusBadgeProps {
  workflowStatus?: WorkflowStatus | string;
  approvalStatus?: ApprovalStatus | string;
  financialStatus?: string;
  className?: string;
}

export function getNormalizedStatusLabel(
  workflowStatus?: string,
  approvalStatus?: string,
  financialStatus?: string,
): { label: string; bgClass: string } {
  // If financial status is paid/overdue/cancelled, or if workflowStatus matches
  const normalized = (workflowStatus || approvalStatus || financialStatus || "draft").toLowerCase();

  switch (normalized) {
    case "paid":
      return { label: "Paid", bgClass: "bg-emerald-500" };
    case "sent":
      return { label: "Sent", bgClass: "bg-blue-600" };
    case "pending_approval":
      return { label: "Pending Approval", bgClass: "bg-amber-500" };
    case "approved":
      return { label: "Approved", bgClass: "bg-emerald-600" };
    case "rejected":
      return { label: "Rejected", bgClass: "bg-rose-600" };
    case "overdue":
      return { label: "Overdue", bgClass: "bg-red-600" };
    case "cancelled":
      return { label: "Cancelled", bgClass: "bg-gray-400" };
    case "not_submitted":
    case "draft":
    default:
      return { label: "Draft", bgClass: "bg-slate-500" };
  }
}

export default function InvoiceStatusBadge({
  workflowStatus,
  approvalStatus,
  financialStatus,
  className = "",
}: InvoiceStatusBadgeProps) {
  const { label, bgClass } = getNormalizedStatusLabel(
    workflowStatus,
    approvalStatus,
    financialStatus,
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold text-white ${bgClass} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      {label}
    </span>
  );
}
