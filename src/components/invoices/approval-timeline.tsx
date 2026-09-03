import type { InvoiceApproval, WorkflowStatus } from "@/modules/invoices/invoices.api";
import InvoiceStatusBadge from "./invoice-status-badge";
import { Clock, CheckCircle, XCircle, FileText, Send, User } from "lucide-react";

interface ApprovalTimelineProps {
  approval?: InvoiceApproval;
  workflowStatus?: WorkflowStatus | string;
  revision?: number;
  className?: string;
}

function formatUser(user?: any): string {
  if (!user) return "System / User";
  if (typeof user === "string") return user;
  return user.name || user.email || user._id || "User";
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
  approval,
  workflowStatus,
  revision = 1,
  className = "",
}: ApprovalTimelineProps) {
  const history = approval?.history || [];

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
          workflowStatus={workflowStatus}
          approvalStatus={approval?.status}
        />
      </div>

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
