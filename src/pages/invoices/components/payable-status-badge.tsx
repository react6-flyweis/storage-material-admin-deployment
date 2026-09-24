import React from "react";
import type { PayableWorkflowStatus } from "@/modules/invoices/invoices.api";

interface PayableStatusBadgeProps {
  status?: PayableWorkflowStatus | string;
  paymentLabel?: string;
  className?: string;
}

export function PayableStatusBadge({
  status,
  paymentLabel,
  className = "",
}: PayableStatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let badgeStyle = "bg-gray-100 text-gray-800 border-gray-200";
  let label = status;

  switch (normalized) {
    case "pending_admin_approval":
    case "pending":
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-300";
      label = "Pending Admin Approval";
      break;
    case "approved_for_payment":
    case "approved":
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-300";
      label = "Approved for Payment";
      break;
    case "rejected":
      badgeStyle = "bg-red-50 text-red-700 border-red-300";
      label = "Rejected";
      break;
    case "paid":
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-300";
      label = "Paid";
      break;
    case "unpaid":
      badgeStyle = "bg-orange-50 text-orange-700 border-orange-300";
      label = "Unpaid";
      break;
    case "under_review":
      badgeStyle = "bg-purple-50 text-purple-700 border-purple-300";
      label = "Under Review";
      break;
    case "sent":
      badgeStyle = "bg-sky-50 text-sky-700 border-sky-300";
      label = "Sent";
      break;
  }

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
      >
        {label}
      </span>
      {paymentLabel && (
        <span className="text-[11px] text-gray-500 font-medium">
          {paymentLabel}
        </span>
      )}
    </div>
  );
}
