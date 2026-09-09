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
