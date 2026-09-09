import type { InvoiceApproval, WorkflowStatus } from "@/modules/invoices/invoices.api";
import InvoiceStatusBadge from "./invoice-status-badge";
import { Clock, CheckCircle, XCircle, FileText, Send, User } from "lucide-react";

interface ApprovalTimelineProps {
  invoiceStatus?: string;
  approval?: InvoiceApproval;
  workflowStatus?: WorkflowStatus | string;
  revision?: number;
  sendMethod?: "platform" | "manual" | string | null;
  sentAt?: string | null;
  sentTo?: string;
  sentCc?: string[];
  sentMessage?: string;
  className?: string;
}

function formatUser(user?: unknown): string {
  if (!user) return "System / User";
  if (typeof user === "string") return user;
  if (typeof user === "object" && user !== null) {
    const u = user as { name?: string; email?: string; _id?: string };
    return u.name || u.email || u._id || "User";
  }
  return "User";
}

function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? String(dateStr)
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function getEventIcon(status: string) {
  switch (status.toLowerCase()) {
    case "approved":
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-rose-600" />;
    case "pending_approval":
      return <Clock className="w-4 h-4 text-amber-600" />;
    case "sent":
      return <Send className="w-4 h-4 text-blue-600" />;
    default:
      return <FileText className="w-4 h-4 text-slate-500" />;
  }
}

export default function ApprovalTimeline({
  invoiceStatus,
  approval,
  workflowStatus,
  revision = 1,
  sendMethod,
  sentAt,
  sentTo,
  sentCc,
  sentMessage,
  className = "",
}: ApprovalTimelineProps) {
  const history = approval?.history || [];

  const isSent = workflowStatus === "sent" || Boolean(sentAt || sendMethod);

  return (
    <div className={`border border-gray-200 rounded-md bg-white p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Approval & Workflow Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Current Revision: <span className="font-medium text-slate-700">v{revision}</span>
            {approval?.approvedRevision !== undefined && approval?.approvedRevision > 0 && (
              <span className="ml-2 text-slate-500">
                (Approved: v{approval.approvedRevision})
              </span>
            )}
          </p>
        </div>
        <InvoiceStatusBadge
          invoiceStatus={invoiceStatus}
          workflowStatus={workflowStatus}
          approvalStatus={approval?.status}
          sendMethod={sendMethod}
        />
      </div>

      {/* Sent details banner if sent */}
      {isSent && (
        <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2.5">
            <Send className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1 w-full">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900">
                  {sendMethod === "manual" ? "Marked as Sent (External Email)" : "Sent via Platform Email (SMTP)"}
                </span>
                {sentAt && (
                  <span className="text-blue-600 text-[11px]">{formatDate(sentAt)}</span>
                )}
              </div>
              {sentTo && (
                <p className="text-blue-800">
                  <span className="font-medium text-blue-900">To:</span> {sentTo}
                  {sentCc && sentCc.length > 0 && (
                    <span className="ml-2">
                      <span className="font-medium text-blue-900">CC:</span> {sentCc.join(", ")}
                    </span>
                  )}
                </p>
              )}
              {sentMessage && (
                <p className="text-blue-700 mt-1 italic whitespace-pre-wrap">
                  "{sentMessage}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Alert if rejected */}
      {approval?.status === "rejected" && approval?.rejectionReason && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-md">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-rose-900">Rejection Reason</p>
              <p className="text-xs text-rose-700 mt-0.5 whitespace-pre-wrap">
                {approval.rejectionReason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline entries */}
      <div className="mt-6 space-y-6">
        {history.length > 0 ? (
          history.map((event, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              {idx < history.length - 1 && (
                <div className="absolute left-3.5 top-6 bottom-0 w-px bg-slate-200 -mb-6" />
              )}
              <div className="relative z-10 w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                {getEventIcon(event.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <InvoiceStatusBadge approvalStatus={event.status} />
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {formatUser(event.by)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(event.at)}
                  </span>
                </div>
                {event.note && (
                  <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2.5 rounded border border-slate-100 whitespace-pre-wrap">
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-500 py-2">
            {approval?.submittedAt && (
              <p className="mb-1">
                Submitted by <span className="font-medium text-slate-700">{formatUser(approval.submittedBy)}</span> on {formatDate(approval.submittedAt)}
              </p>
            )}
            {approval?.reviewedAt && (
              <p>
                Reviewed by <span className="font-medium text-slate-700">{formatUser(approval.reviewedBy)}</span> on {formatDate(approval.reviewedAt)}
              </p>
            )}
            {!approval?.submittedAt && !approval?.reviewedAt && (
              <p className="text-slate-400 italic">No approval history recorded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
