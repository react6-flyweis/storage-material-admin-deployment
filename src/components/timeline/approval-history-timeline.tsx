import { useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  FileCheck,
  FileText,
  User,
  AlertCircle,
} from "lucide-react";
import type { Quotation } from "@/modules/quotations/quotations.api";
import { getQuotationSalesSubmission } from "@/modules/quotations/quotations.utils";

export interface ApprovalHistoryItem {
  status:
    | "pending_approval"
    | "submitted"
    | "approved"
    | "rejected"
    | "sent"
    | "sent_via_email"
    | "marked_sent"
    | "paid"
    | "accepted"
    | "declined"
    | "overdue"
    | "revised"
    | "draft"
    | "not_submitted"
    | string;
  note?: string | null;
  by?:
    | string
    | {
        _id?: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        email?: string;
        role?: string;
        username?: string;
      }
    | null
    | unknown;
  at?: string | null;
  version?: number | string | null;
  versionNumber?: number | string | null;
  revision?: number | string | null;
}

function formatTimelineDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

function getActorName(by?: ApprovalHistoryItem["by"]) {
  if (!by) return "User";
  if (typeof by === "string") return by;
  if (typeof by === "object" && by !== null) {
    const userObj = by as Record<string, unknown>;
    const firstName = typeof userObj.firstName === "string" ? userObj.firstName : "";
    const lastName = typeof userObj.lastName === "string" ? userObj.lastName : "";
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    if (typeof userObj.name === "string" && userObj.name) return userObj.name;
    if (typeof userObj.username === "string" && userObj.username) return userObj.username;
    if (typeof userObj.email === "string" && userObj.email) return userObj.email;
    if (typeof userObj.role === "string" && userObj.role) return userObj.role;
    return "User";
  }
  return "User";
}

function getStatusConfig(status?: string | null) {
  const effective = (status || "draft").toLowerCase().replace(/[\s-]/g, "_");

  switch (effective) {
    case "pending_approval":
    case "submitted":
    case "pending":
      return {
        label: "Pending Approval",
        bg: "bg-amber-500",
        icon: Clock,
      };
    case "approved":
      return {
        label: "Approved",
        bg: "bg-emerald-600",
        icon: CheckCircle2,
      };
    case "rejected":
      return {
        label: "Rejected",
        bg: "bg-rose-600",
        icon: XCircle,
      };
    case "sent":
    case "sent_via_email":
      return {
        label: "Sent via Email",
        bg: "bg-blue-600",
        icon: Send,
      };
    case "marked_sent":
      return {
        label: "Marked Sent",
        bg: "bg-blue-600",
        icon: Send,
      };
    case "paid":
      return {
        label: "Paid",
        bg: "bg-green-600",
        icon: FileCheck,
      };
    case "accepted":
      return {
        label: "Accepted by Customer",
        bg: "bg-emerald-600",
        icon: CheckCircle2,
      };
    case "declined":
      return {
        label: "Declined",
        bg: "bg-rose-600",
        icon: XCircle,
      };
    case "overdue":
      return {
        label: "Overdue",
        bg: "bg-red-600",
        icon: AlertCircle,
      };
    case "revised":
    case "modified":
      return {
        label: "Revised",
        bg: "bg-purple-600",
        icon: FileText,
      };
    case "not_submitted":
      return {
        label: "Not Submitted",
        bg: "bg-slate-700",
        icon: FileText,
      };
    case "draft":
    default:
      return {
        label:
          effective === "draft"
            ? "Draft"
            : effective
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()) || "Draft",
        bg: "bg-slate-500",
        icon: FileText,
      };
  }
}

function getQuotationTimelineHistory(
  quotation?: Quotation | null
): ApprovalHistoryItem[] {
  if (!quotation) return [];
  const approval = quotation.approval;
  const history = (approval?.history || []) as Array<Record<string, unknown>>;
  const effectiveStatus =
    quotation.workflowStatus || approval?.status || quotation.status || "draft";
  const isSent =
    effectiveStatus === "sent" || Boolean(quotation.sentAt || quotation.sendMethod);

  const items: ApprovalHistoryItem[] = [];

  if (history && history.length > 0) {
    items.push(
      ...history.map((item) => ({
        status: (item.status as string) || "draft",
        note: (item.note as string) || undefined,
        by: item.by,
        at: (item.at as string) || undefined,
        // Take version per item directly from the API object
        version:
          (item.version as number | string | undefined) ??
          (item.versionNumber as number | string | undefined) ??
          (item.revision as number | string | undefined),
        versionNumber:
          (item.versionNumber as number | string | undefined) ??
          (item.version as number | string | undefined) ??
          (item.revision as number | string | undefined),
      }))
    );

    // If sent but not in history, append sent event
    const hasSent = history.some(
      (h) =>
        (h.status as string) === "sent" ||
        (h.status as string) === "marked_sent" ||
        (h.status as string) === "sent_via_email"
    );
    if (isSent && !hasSent) {
      items.push({
        status: quotation.sendMethod === "manual" ? "marked_sent" : "sent",
        by: approval?.reviewedBy || "Admin",
        at: quotation.sentAt || undefined,
        note: quotation.sentMessage || undefined,
      });
    }

    // If accepted by customer but not in history, append accepted event
    const hasAccepted = history.some((h) => (h.status as string) === "accepted");
    if (effectiveStatus === "accepted" && !hasAccepted) {
      items.push({
        status: "accepted",
        by: quotation.customerId || "Customer",
        at: quotation.updatedAt || undefined,
      });
    }
  } else {
    // Fallback if history array is not yet initialized
    const salesSubmission = getQuotationSalesSubmission(quotation);

    if (effectiveStatus === "accepted") {
      items.push({
        status: "accepted",
        by: quotation.customerId || "Customer",
        at: quotation.updatedAt || undefined,
      });
    }

    if (isSent) {
      items.push({
        status: quotation.sendMethod === "manual" ? "marked_sent" : "sent",
        by: approval?.reviewedBy || "Admin",
        at: quotation.sentAt || undefined,
        note: quotation.sentMessage || undefined,
      });
    }

    if (approval?.status === "approved" || effectiveStatus === "approved") {
      items.push({
        status: "approved",
        by: approval?.reviewedBy || "Admin",
        at: approval?.reviewedAt || quotation.updatedAt,
        note: approval?.note,
      });
    } else if (approval?.status === "rejected" || effectiveStatus === "rejected") {
      items.push({
        status: "rejected",
        by: approval?.reviewedBy || "Admin",
        at: approval?.reviewedAt || quotation.updatedAt,
        note: approval?.rejectionReason,
      });
    }

    if (
      approval?.submittedAt ||
      effectiveStatus === "pending" ||
      effectiveStatus === "pending_approval" ||
      salesSubmission.message
    ) {
      items.push({
        status: "pending_approval",
        by: salesSubmission.submittedBy || "Sales Rep",
        at: salesSubmission.submittedAt || quotation.createdAt,
        note: salesSubmission.message,
      });
    }

    if (quotation.createdAt) {
      items.push({
        status: "not_submitted",
        by: quotation.createdBy || quotation.preparedBy || "Sales",
        at: quotation.createdAt,
        note: quotation.changeNote || undefined,
      });
    }
  }

  return items;
}

export interface ApprovalHistoryTimelineProps {
  history?: ApprovalHistoryItem[] | null;
  quotation?: Quotation | null;
  version?: number | string | null;
  approvedVersion?: number | string | null;
  className?: string;
  showEmpty?: boolean;
}

export function ApprovalHistoryTimeline({
  history,
  quotation,
  version,
  approvedVersion,
  className = "",
  showEmpty = false,
}: ApprovalHistoryTimelineProps) {
  const resolvedVersion = version ?? quotation?.versionNumber;
  const resolvedApprovedVersion =
    approvedVersion ?? quotation?.approval?.approvedVersionNumber;

  const displayHistory = useMemo(() => {
    let source: ApprovalHistoryItem[] = [];

    if (history && history.length > 0) {
      source = [...history];
    } else if (quotation) {
      source = getQuotationTimelineHistory(quotation);
    }

    if (source.length === 0) return [];

    const hasDates = source.some((item) => Boolean(item.at));
    if (hasDates) {
      return [...source].sort((a, b) => {
        const timeA = a.at ? new Date(a.at).getTime() : 0;
        const timeB = b.at ? new Date(b.at).getTime() : 0;
        return timeB - timeA; // newest first (descending)
      });
    }

    return [...source].reverse();
  }, [history, quotation]);

  if (displayHistory.length === 0) {
    if (!showEmpty) return null;
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white p-5 shadow-xs text-center ${className}`}
      >
        <p className="text-xs text-gray-500 py-3">No approval events recorded yet.</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Approval History & Audit Trail
          </h4>
          {resolvedVersion !== undefined && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              v{resolvedVersion}
            </span>
          )}
          {resolvedApprovedVersion !== undefined &&
            Number(resolvedApprovedVersion) > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Approved: v{resolvedApprovedVersion}
              </span>
            )}
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {displayHistory.length} {displayHistory.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* Timeline track */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {displayHistory.map((event, index) => {
          const config = getStatusConfig(event.status);
          const Icon = config.icon;
          const itemVersion =
            event.version ?? event.versionNumber ?? event.revision;

          return (
            <div key={index} className="relative group">
              {/* Circular Dot with Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${config.bg} text-white`}
              >
                <Icon className="w-3 h-3" />
              </div>

              {/* Event Details */}
              <div className="space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-900">
                      {config.label}
                    </span>
                    {itemVersion !== undefined &&
                      itemVersion !== null &&
                      itemVersion !== "" && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          v{itemVersion}
                        </span>
                      )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {getActorName(event.by)}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {formatTimelineDate(event.at)}
                  </span>
                </div>

                {/* Optional Note / Reviewer feedback */}
                {Boolean(event.note && event.note.trim()) && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-md p-2 border border-gray-100 mt-1 whitespace-pre-wrap">
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ApprovalHistoryTimeline;
