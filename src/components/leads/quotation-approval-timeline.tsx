import type { Quotation, ApprovalHistoryItem } from "@/modules/quotations/quotations.api";
import {
  formatUser,
  formatDate,
  getQuotationSalesSubmission,
} from "@/modules/quotations/quotations.utils";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  User,
  MessageSquare,
  AlertTriangle,
  History,
  ShieldCheck,
  Mail,
} from "lucide-react";

interface QuotationApprovalTimelineProps {
  quotation: Quotation;
  className?: string;
}

function getTimelineStatusBadge(status: string) {
  const norm = status.toLowerCase();
  switch (norm) {
    case "approved":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
          Approved
        </Badge>
      );
    case "pending_approval":
    case "pending":
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
          Pending Approval
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
          Rejected
        </Badge>
      );
    case "sent":
      return (
        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
          Sent
        </Badge>
      );
    case "accepted":
      return (
        <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
          Accepted
        </Badge>
      );
    case "draft":
    case "not_submitted":
    default:
      return (
        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
          Draft
        </Badge>
      );
  }
}

function getTimelineEventIcon(status: string) {
  const norm = status.toLowerCase();
  switch (norm) {
    case "approved":
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-rose-600" />;
    case "pending_approval":
    case "pending":
      return <Clock className="w-4 h-4 text-amber-600" />;
    case "sent":
      return <Send className="w-4 h-4 text-blue-600" />;
    case "accepted":
      return <ShieldCheck className="w-4 h-4 text-green-600" />;
    case "draft":
    case "not_submitted":
    default:
      return <FileText className="w-4 h-4 text-slate-500" />;
  }
}

interface NormalizedTimelineStep {
  id: string;
  status: string;
  title: string;
  actor: string;
  actorRole?: string;
  timestamp?: string;
  note?: string;
  noteType?: "sales_submission" | "admin_approval" | "admin_rejection" | "customer_send" | "general";
  metadata?: Record<string, unknown>;
}

export default function QuotationApprovalTimeline({
  quotation,
  className = "",
}: QuotationApprovalTimelineProps) {
  const approval = quotation.approval;
  const history = approval?.history || [];
  const effectiveStatus =
    quotation.workflowStatus || approval?.status || quotation.status || "draft";

  const isSent =
    effectiveStatus === "sent" || Boolean(quotation.sentAt || quotation.sendMethod);
  const isApproved = effectiveStatus === "approved";
  const isRejected = effectiveStatus === "rejected";
  const isPending =
    effectiveStatus === "pending" || effectiveStatus === "pending_approval";

  const salesSubmission = getQuotationSalesSubmission(quotation);

  // Build normalized chronological steps list
  const steps: NormalizedTimelineStep[] = [];

  if (history.length > 0) {
    // 1. Initial draft event if not explicitly starting with not_submitted
    const firstHistory = history[0];
    const firstStatus = firstHistory.status as string;
    if (
      firstStatus !== "not_submitted" &&
      firstStatus !== "draft" &&
      quotation.createdAt
    ) {
      steps.push({
        id: "created-0",
        status: "draft",
        title: `Quotation Created (v${quotation.versionNumber || 1})`,
        actor: formatUser(quotation.createdBy || quotation.preparedBy || "Sales"),
        actorRole: "Author",
        timestamp: quotation.createdAt,
        note: quotation.changeNote,
        noteType: "general",
      });
    }

    // 2. Map history items
    history.forEach((item: ApprovalHistoryItem, idx: number) => {
      let title = "Status Update";
      let actorRole: string | undefined;
      let noteType: NormalizedTimelineStep["noteType"] = "general";
      let noteContent = item.note;

      switch (item.status) {
        case "not_submitted":
          title = `Quotation Draft Initialized (v${quotation.versionNumber || 1})`;
          actorRole = "Author";
          break;
        case "pending_approval":
          title = "Submitted for Admin Approval";
          actorRole = "Sales";
          noteType = "sales_submission";
          if (!noteContent && salesSubmission.message) {
            noteContent = salesSubmission.message;
          }
          break;
        case "approved":
          title = "Quotation Approved";
          actorRole = "Admin";
          noteType = "admin_approval";
          break;
        case "rejected":
          title = "Quotation Rejected";
          actorRole = "Admin";
          noteType = "admin_rejection";
          if (!noteContent && approval?.rejectionReason) {
            noteContent = approval.rejectionReason;
          }
          break;
      }

      steps.push({
        id: `history-${idx}`,
        status: item.status,
        title,
        actor: formatUser(item.by || (item.status === "pending_approval" ? salesSubmission.submittedBy : undefined)),
        actorRole,
        timestamp: item.at || (item.status === "pending_approval" ? salesSubmission.submittedAt : undefined),
        note: noteContent,
        noteType,
      });
    });

    // 3. Sent step if sent and not in history
    if (isSent && !history.some((h) => (h.status as string) === "sent")) {
      steps.push({
        id: "sent-auto",
        status: "sent",
        title:
          quotation.sendMethod === "manual"
            ? "Quotation Marked as Sent (External Email)"
            : "Quotation Sent via Email",
        actor: formatUser(approval?.reviewedBy || "Admin"),
        actorRole: "Dispatch",
        timestamp: quotation.sentAt || undefined,
        note: quotation.sentMessage,
        noteType: "customer_send",
        metadata: {
          to: quotation.sentTo,
          cc: quotation.sentCc,
          sendMethod: quotation.sendMethod,
        },
      });
    }

    // 4. Accepted step if accepted
    if (effectiveStatus === "accepted" && !history.some((h) => (h.status as string) === "accepted")) {
      steps.push({
        id: "accepted-auto",
        status: "accepted",
        title: "Quotation Accepted by Customer",
        actor: formatUser(quotation.customerId || "Customer"),
        actorRole: "Customer",
        timestamp: quotation.updatedAt,
      });
    }
  } else {
    // Fallback: Generate sequential steps from quotation fields
    // Step 1: Created
    if (quotation.createdAt) {
      steps.push({
        id: "created-fallback",
        status: "draft",
        title: `Quotation Created (v${quotation.versionNumber || 1})`,
        actor: formatUser(quotation.createdBy || quotation.preparedBy || "Sales"),
        actorRole: "Author",
        timestamp: quotation.createdAt,
        note: quotation.changeNote,
        noteType: "general",
      });
    }

    // Step 2: Submission by sales
    if (approval?.submittedAt || isPending || isApproved || isRejected || isSent || salesSubmission.message) {
      steps.push({
        id: "submission-fallback",
        status: "pending_approval",
        title: "Submitted for Admin Approval",
        actor: formatUser(salesSubmission.submittedBy || "Sales Rep"),
        actorRole: "Sales",
        timestamp: salesSubmission.submittedAt || quotation.createdAt,
        note: salesSubmission.message,
        noteType: "sales_submission",
      });
    }

    // Step 3: Approval / Rejection
    if (isApproved || (approval?.reviewedAt && approval?.status === "approved")) {
      steps.push({
        id: "approved-fallback",
        status: "approved",
        title: "Quotation Approved",
        actor: formatUser(approval?.reviewedBy || "Admin"),
        actorRole: "Admin",
        timestamp: approval?.reviewedAt || quotation.updatedAt,
        note: approval?.note,
        noteType: "admin_approval",
      });
    } else if (isRejected || (approval?.reviewedAt && approval?.status === "rejected")) {
      steps.push({
        id: "rejected-fallback",
        status: "rejected",
        title: "Quotation Rejected",
        actor: formatUser(approval?.reviewedBy || "Admin"),
        actorRole: "Admin",
        timestamp: approval?.reviewedAt || quotation.updatedAt,
        note: approval?.rejectionReason,
        noteType: "admin_rejection",
      });
    }

    // Step 4: Sent
    if (isSent) {
      steps.push({
        id: "sent-fallback",
        status: "sent",
        title:
          quotation.sendMethod === "manual"
            ? "Quotation Marked as Sent (External Email)"
            : "Quotation Sent via Email",
        actor: formatUser(approval?.reviewedBy || "Admin"),
        actorRole: "Dispatch",
        timestamp: quotation.sentAt || undefined,
        note: quotation.sentMessage,
        noteType: "customer_send",
        metadata: {
          to: quotation.sentTo,
          cc: quotation.sentCc,
          sendMethod: quotation.sendMethod,
        },
      });
    }

    // Step 5: Accepted
    if (effectiveStatus === "accepted") {
      steps.push({
        id: "accepted-fallback",
        status: "accepted",
        title: "Quotation Accepted by Customer",
        actor: formatUser(quotation.customerId || "Customer"),
        actorRole: "Customer",
        timestamp: quotation.updatedAt,
      });
    }
  }

  return (
    <div className={`border border-gray-200 rounded-xl bg-white p-5 sm:p-6 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Approval & Workflow History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>
                Current Version: <span className="font-semibold text-slate-700">v{quotation.versionNumber || 1}</span>
              </span>
              {approval?.approvedVersionNumber !== undefined && approval?.approvedVersionNumber > 0 && (
                <span className="text-emerald-700 font-medium">
                  (Approved: v{approval.approvedVersionNumber})
                </span>
              )}
            </p>
          </div>
        </div>
        <div>
          {getTimelineStatusBadge(effectiveStatus)}
        </div>
      </div>

      {/* Featured: Approval Message Sent by Sales */}
      {salesSubmission.message && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100/90 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  Approval Message Sent by Sales
                </h4>
                {salesSubmission.submittedAt && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    {formatDate(salesSubmission.submittedAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-950 font-normal leading-relaxed whitespace-pre-wrap pl-3.5 border-l-2 border-amber-400">
                "{salesSubmission.message}"
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-800 pt-0.5">
                <User className="w-3 h-3 text-amber-600" />
                <span>Submitted by: <strong className="font-medium text-amber-950">{salesSubmission.authorName}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Alert if Rejected */}
      {isRejected && approval?.rejectionReason && (
        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  Quotation Rejection Reason
                </h4>
                {approval.reviewedAt && (
                  <span className="text-[11px] text-rose-600 font-medium">
                    {formatDate(approval.reviewedAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-800 whitespace-pre-wrap pl-3 border-l-2 border-rose-400">
                {approval.rejectionReason}
              </p>
              {Boolean(approval.reviewedBy) && (
                <p className="text-[11px] text-rose-700 pt-0.5">
                  Reviewed by: <strong className="font-medium">{formatUser(approval.reviewedBy)}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Send Details Banner if Sent */}
      {isSent && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 text-xs flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-blue-900">
                  {quotation.sendMethod === "manual"
                    ? "Quotation Marked as Sent (External Email)"
                    : "Quotation Sent to Customer via Email (SMTP)"}
                </span>
                {quotation.sentAt && (
                  <span className="text-blue-600 text-[11px] font-medium">
                    {formatDate(quotation.sentAt)}
                  </span>
                )}
              </div>
              {quotation.sentTo && (
                <p className="text-blue-800">
                  <span className="font-semibold text-blue-900">To:</span> {quotation.sentTo}
                  {quotation.sentCc && quotation.sentCc.length > 0 && (
                    <span className="ml-3">
                      <span className="font-semibold text-blue-900">CC:</span> {quotation.sentCc.join(", ")}
                    </span>
                  )}
                </p>
              )}
              {quotation.sentMessage && (
                <p className="text-blue-700 italic pl-3 border-l-2 border-blue-400 whitespace-pre-wrap">
                  "{quotation.sentMessage}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Chronological Audit Timeline */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Audit Trail & Timeline
        </h4>

        {steps.length > 0 ? (
          <div className="relative pl-2">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="relative flex items-start gap-3.5 pb-6 last:pb-0">
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-200" />
                  )}

                  {/* Node Icon */}
                  <div className="relative z-10 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {getTimelineEventIcon(step.status)}
                  </div>

                  {/* Node Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900">
                          {step.title}
                        </span>
                        {getTimelineStatusBadge(step.status)}
                        {step.actor && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {step.actor}
                            {step.actorRole && (
                              <span className="text-[10px] text-slate-400">({step.actorRole})</span>
                            )}
                          </span>
                        )}
                      </div>
                      {step.timestamp && (
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          {formatDate(step.timestamp)}
                        </span>
                      )}
                    </div>

                    {/* Step Notes / Messages */}
                    {step.note && (
                      <div
                        className={`mt-2 p-3 rounded-lg border text-xs leading-relaxed whitespace-pre-wrap ${
                          step.noteType === "sales_submission"
                            ? "bg-amber-50/70 border-amber-200 text-amber-950 font-normal"
                            : step.noteType === "admin_approval"
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-900 font-normal"
                            : step.noteType === "admin_rejection"
                            ? "bg-rose-50/60 border-rose-200 text-rose-900 font-normal"
                            : step.noteType === "customer_send"
                            ? "bg-blue-50/60 border-blue-200 text-blue-900 font-normal"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        {step.noteType === "sales_submission" && (
                          <div className="flex items-center gap-1 font-semibold text-amber-900 text-[11px] mb-1">
                            <MessageSquare className="w-3 h-3 text-amber-600" />
                            Approval Message from Sales:
                          </div>
                        )}
                        {step.noteType === "admin_approval" && (
                          <div className="flex items-center gap-1 font-semibold text-emerald-900 text-[11px] mb-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Admin Approval Note:
                          </div>
                        )}
                        {step.noteType === "admin_rejection" && (
                          <div className="flex items-center gap-1 font-semibold text-rose-900 text-[11px] mb-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejection Reason:
                          </div>
                        )}
                        {step.noteType === "customer_send" && (
                          <div className="flex items-center gap-1 font-semibold text-blue-900 text-[11px] mb-1">
                            <Send className="w-3 h-3 text-blue-600" />
                            Message Dispatched to Customer:
                          </div>
                        )}
                        <p className="italic">"{step.note}"</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-3 italic bg-slate-50 rounded-lg p-4 border border-slate-100">
            No history recorded yet for this quotation.
          </div>
        )}
      </div>
    </div>
  );
}
