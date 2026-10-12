import type { Quotation } from "./quotations.api";

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

export type QuotationResolvedLifecycle =
  | "draft"
  | "pending_approval"
  | "admin_rejected"
  | "approved"
  | "sent"
  | "customer_rejected"
  | "customer_accepted";

export interface QuotationLifecycleInfo {
  lifecycleStatus: QuotationResolvedLifecycle;
  label: string;
  isCustomerRejected: boolean;
  isAdminRejected: boolean;
  isCustomerAccepted: boolean;
  isSent: boolean;
  isApproved: boolean;
  isPendingApproval: boolean;
  isDraft: boolean;
  clientNotes?: string;
  adminRejectionReason?: string;
  customerDecisionAt?: string;
}

export function resolveQuotationLifecycle(
  quotation?: Quotation | null
): QuotationLifecycleInfo {
  if (!quotation) {
    return {
      lifecycleStatus: "draft",
      label: "Draft",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: true,
    };
  }

  const approvalStatus =
    quotation.approval?.status || quotation.approvalStatus;
  const quoteStatus = quotation.status;
  const workflowStatus = quotation.workflowStatus;

  // 1. Customer decisions (Portal decision: customer accepted or declined)
  // Backend returns quotation.status = "rejected" or "accepted"
  if (
    quoteStatus === "rejected" ||
    workflowStatus === "customer_rejected"
  ) {
    // Edge case guard: If quote was rejected internally by admin before sending
    // (approval status is rejected, never sent, and no client notes)
    if (
      approvalStatus === "rejected" &&
      !quotation.sentAt &&
      !quotation.clientNotes
    ) {
      return {
        lifecycleStatus: "admin_rejected",
        label: "Admin Rejected",
        isCustomerRejected: false,
        isAdminRejected: true,
        isCustomerAccepted: false,
        isSent: false,
        isApproved: false,
        isPendingApproval: false,
        isDraft: false,
        adminRejectionReason: quotation.approval?.rejectionReason,
      };
    }

    return {
      lifecycleStatus: "customer_rejected",
      label: "Declined by Customer",
      isCustomerRejected: true,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
      clientNotes: quotation.clientNotes,
      adminRejectionReason: quotation.approval?.rejectionReason,
      customerDecisionAt:
        quotation.customerRejectedAt ||
        quotation.customerDecisionAt ||
        quotation.updatedAt,
    };
  }

  if (
    quoteStatus === "accepted" ||
    workflowStatus === "accepted" ||
    workflowStatus === "customer_accepted"
  ) {
    return {
      lifecycleStatus: "customer_accepted",
      label: "Accepted by Customer",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: true,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
      clientNotes: quotation.clientNotes,
      customerDecisionAt:
        quotation.customerAcceptedAt ||
        quotation.customerDecisionAt ||
        quotation.updatedAt,
    };
  }

  // 2. Sent to Customer
  if (
    quoteStatus === "sent" ||
    workflowStatus === "sent" ||
    Boolean(quotation.sentAt)
  ) {
    return {
      lifecycleStatus: "sent",
      label:
        quotation.sendMethod === "manual" ? "Marked Sent" : "Sent to Customer",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: true,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
    };
  }

  // 3. Admin / Internal Gate (before quote goes to customer)
  if (approvalStatus === "rejected") {
    return {
      lifecycleStatus: "admin_rejected",
      label: "Admin Rejected",
      isCustomerRejected: false,
      isAdminRejected: true,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: false,
      isDraft: false,
      adminRejectionReason: quotation.approval?.rejectionReason,
    };
  }

  if (
    approvalStatus === "approved" ||
    quoteStatus === "approved" ||
    workflowStatus === "approved"
  ) {
    return {
      lifecycleStatus: "approved",
      label: "Approved",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: true,
      isPendingApproval: false,
      isDraft: false,
    };
  }

  if (
    approvalStatus === "pending_approval" ||
    approvalStatus === "pending" ||
    quoteStatus === "pending_approval" ||
    quoteStatus === "pending" ||
    workflowStatus === "pending_approval"
  ) {
    return {
      lifecycleStatus: "pending_approval",
      label: "Pending Approval",
      isCustomerRejected: false,
      isAdminRejected: false,
      isCustomerAccepted: false,
      isSent: false,
      isApproved: false,
      isPendingApproval: true,
      isDraft: false,
    };
  }

  return {
    lifecycleStatus: "draft",
    label: "Draft",
    isCustomerRejected: false,
    isAdminRejected: false,
    isCustomerAccepted: false,
    isSent: false,
    isApproved: false,
    isPendingApproval: false,
    isDraft: true,
  };
}
