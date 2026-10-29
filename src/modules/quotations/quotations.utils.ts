import type { Quotation, QuotationWorkflowStatus } from "./quotations.api";

export type { QuotationWorkflowStatus };

export function formatUser(user?: unknown): string {
  if (!user) return "User";
  if (typeof user === "string") return user;
  if (typeof user === "object" && user !== null) {
    const u = user as {
      name?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      username?: string;
      _id?: string;
    };
    const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");
    return fullName || u.name || u.username || u.email || u._id || "User";
  }
  return "User";
}

export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getQuotationSalesSubmission(quotation?: Quotation | null): {
  message?: string;
  submittedBy?: unknown;
  submittedAt?: string;
  authorName?: string;
} {
  if (!quotation) {
    return { message: undefined, submittedBy: undefined, submittedAt: undefined, authorName: undefined };
  }

  const approval = quotation.approval;
  const qObj = quotation as unknown as Record<string, unknown>;

  // 1. Check history for latest pending_approval event
  let historyMessage: string | undefined;
  let historyBy: unknown | undefined;
  let historyAt: string | undefined;

  if (Array.isArray(approval?.history) && approval.history.length > 0) {
    for (let i = approval.history.length - 1; i >= 0; i--) {
      const item = approval.history[i];
      if (item.status === "pending_approval") {
        if (item.note) historyMessage = item.note;
        if (item.by) historyBy = item.by;
        if (item.at) historyAt = item.at;
        break;
      }
    }
  }

  // 2. Resolve message from multiple possible properties
  const getStringProp = (val: unknown): string | undefined =>
    typeof val === "string" && val.trim().length > 0 ? val : undefined;

  const message =
    getStringProp(approval?.submissionNote) ||
    getStringProp(approval?.submitNote) ||
    historyMessage ||
    getStringProp(approval?.note) ||
    getStringProp(approval?.message) ||
    getStringProp(qObj.submissionNote) ||
    getStringProp(qObj.submitNote) ||
    getStringProp(qObj.approvalMessage) ||
    undefined;

  const submittedBy =
    approval?.submittedBy ||
    historyBy ||
    quotation.preparedBy ||
    quotation.assignedSalesperson ||
    quotation.createdBy;

  const submittedAt = approval?.submittedAt || historyAt || undefined;
  const authorName = formatUser(submittedBy);

  return { message, submittedBy, submittedAt, authorName };
}

export type QuotationResolvedLifecycle = QuotationWorkflowStatus;

export interface QuotationStatusConfigItem {
  status: QuotationWorkflowStatus;
  label: string;
  badgeClass: string;
  primaryCta: string;
  description: string;
}

export const QUOTATION_STATUS_CONFIG: Record<QuotationWorkflowStatus, QuotationStatusConfigItem> = {
  draft: {
    status: "draft",
    label: "Draft",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
    primaryCta: "Send for Approval",
    description: "Not submitted, or reopened after edit",
  },
  pending_approval: {
    status: "pending_approval",
    label: "Pending Approval",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
    primaryCta: "View Quotation",
    description: "Waiting on admin",
  },
  approved: {
    status: "approved",
    label: "Approved",
    badgeClass: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    primaryCta: "Send to customer",
    description: "Admin approved (OK to send to client)",
  },
  admin_rejected: {
    status: "admin_rejected",
    label: "Admin Rejected",
    badgeClass: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    primaryCta: "Edit → Send for Approval",
    description: "Admin rejected approval",
  },
  sent: {
    status: "sent",
    label: "Sent",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    primaryCta: "—",
    description: "Sent to customer",
  },
  accepted: {
    status: "accepted",
    label: "Accepted",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
    primaryCta: "Next steps",
    description: "Client accepted",
  },
  client_rejected: {
    status: "client_rejected",
    label: "Client Rejected",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100",
    primaryCta: "Edit → Send for Approval",
    description: "Client rejected",
  },
};

export function normalizeWorkflowStatus(
  status?: string | null
): QuotationWorkflowStatus {
  if (!status) return "draft";
  const s = status.toLowerCase().trim();
  if (s === "customer_rejected") return "client_rejected";
  if (s === "customer_accepted") return "accepted";
  if (
    s === "draft" ||
    s === "pending_approval" ||
    s === "approved" ||
    s === "admin_rejected" ||
    s === "sent" ||
    s === "accepted" ||
    s === "client_rejected"
  ) {
    return s as QuotationWorkflowStatus;
  }
  return "draft";
}

export interface QuotationLifecycleInfo {
  lifecycleStatus: QuotationWorkflowStatus;
  label: string;
  badgeClass: string;
  primaryCta: string;
  isCustomerRejected: boolean;
  isAdminRejected: boolean;
  isCustomerAccepted: boolean;
  isSent: boolean;
  isApproved: boolean;
  isPendingApproval: boolean;
  isDraft: boolean;
  isAccepted: boolean;
  isClientRejected: boolean;
  clientNotes?: string;
  adminRejectionReason?: string;
  customerDecisionAt?: string;
}

/**
 * Resolves quotation lifecycle UI state using strictly quotation.workflowStatus
 * as the single source of truth without falling back to legacy status/approvalStatus.
 */
export function resolveQuotationLifecycle(
  quotation?: {
    workflowStatus?: QuotationWorkflowStatus | string;
    sendMethod?: string | null;
    clientNotes?: string;
    approval?: { rejectionReason?: string };
    customerDecisionAt?: string | null;
    customerRejectedAt?: string | null;
    customerAcceptedAt?: string | null;
    updatedAt?: string;
  } | null
): QuotationLifecycleInfo {
  const status = normalizeWorkflowStatus(quotation?.workflowStatus);
  const config = QUOTATION_STATUS_CONFIG[status] || QUOTATION_STATUS_CONFIG.draft;

  return {
    lifecycleStatus: status,
    label: config.label,
    badgeClass: config.badgeClass,
    primaryCta: config.primaryCta,
    isDraft: status === "draft",
    isPendingApproval: status === "pending_approval",
    isApproved: status === "approved",
    isAdminRejected: status === "admin_rejected",
    isSent: status === "sent",
    isAccepted: status === "accepted",
    isClientRejected: status === "client_rejected",
    isCustomerAccepted: status === "accepted",
    isCustomerRejected: status === "client_rejected",
    clientNotes: quotation?.clientNotes,
    adminRejectionReason: quotation?.approval?.rejectionReason,
    customerDecisionAt:
      quotation?.customerRejectedAt ||
      quotation?.customerAcceptedAt ||
      quotation?.customerDecisionAt ||
      quotation?.updatedAt,
  };
}
