import type { WorkflowStatus, ApprovalStatus } from "@/modules/invoices/invoices.api";

interface InvoiceStatusBadgeProps {
  invoiceStatus?: string;
  workflowStatus?: WorkflowStatus | string;
  approvalStatus?: ApprovalStatus | string;
  financialStatus?: string;
  status?: string;
  sendMethod?: "platform" | "manual" | string | null;
  className?: string;
}

function getNormalizedStatusLabel(
  invoiceStatus?: string,
  workflowStatus?: string,
  approvalStatus?: string,
  financialStatus?: string,
  sendMethod?: "platform" | "manual" | string | null,
  status?: string,
): { label: string; bgClass: string } {
  // Prioritize invoiceStatus first, or fallback to workflowStatus, approvalStatus, financialStatus, status
  const rawStatus = (
    invoiceStatus ||
    workflowStatus ||
    approvalStatus ||
    financialStatus ||
    status ||
    "draft"
  ).trim();

  const normalized = rawStatus.toLowerCase().replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "paid":
      return { label: "Paid", bgClass: "bg-emerald-500" };
    case "sent":
      if (sendMethod === "manual") {
        return { label: "Marked Sent", bgClass: "bg-indigo-600" };
      }
      if (sendMethod === "platform") {
        return { label: "Sent via Email", bgClass: "bg-blue-600" };
      }
      return { label: "Sent", bgClass: "bg-blue-600" };
    case "pending_approval":
    case "pending":
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
  invoiceStatus,
  workflowStatus,
  approvalStatus,
  financialStatus,
  status,
  sendMethod,
  className = "",
}: InvoiceStatusBadgeProps) {
  const { label, bgClass } = getNormalizedStatusLabel(
    invoiceStatus,
    workflowStatus,
    approvalStatus,
    financialStatus,
    sendMethod,
    status,
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

