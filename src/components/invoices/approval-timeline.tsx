import { useMemo } from "react";
import type {
  InvoiceApproval,
  InvoiceApprovalRequest,
  WorkflowStatus,
} from "@/modules/invoices/invoices.api";
import {
  ApprovalHistoryTimeline,
  type ApprovalHistoryItem,
} from "@/components/timeline/approval-history-timeline";

export interface ApprovalTimelineProps {
  invoiceStatus?: string;
  approval?: InvoiceApproval;
  approvalRequests?: InvoiceApprovalRequest[];
  workflowStatus?: WorkflowStatus | string;
  revision?: number;
  sendMethod?: "platform" | "manual" | string | null;
  sentAt?: string | null;
  sentTo?: string;
  sentCc?: string[];
  sentMessage?: string;
  className?: string;
}

function getInvoiceTimelineHistory({
  approval,
  approvalRequests,
  workflowStatus,
  sendMethod,
  sentAt,
  sentMessage,
}: {
  approval?: InvoiceApproval;
  approvalRequests?: InvoiceApprovalRequest[];
  workflowStatus?: WorkflowStatus | string;
  sendMethod?: string | null;
  sentAt?: string | null;
  sentMessage?: string;
}): ApprovalHistoryItem[] {
  const history = (approval?.history || []) as Array<Record<string, unknown>>;
  const requests = (approvalRequests ||
    approval?.approvalRequests ||
    []) as InvoiceApprovalRequest[];
  const isSent = workflowStatus === "sent" || Boolean(sentAt || sendMethod);

  const items: ApprovalHistoryItem[] = [];

  if (history && history.length > 0) {
    items.push(
      ...history.map((item) => {
        // Try finding revision directly on the history item, or match with approvalRequests
        let itemRevision =
          (item.revision as number | string | undefined) ??
          (item.version as number | string | undefined) ??
          (item.versionNumber as number | string | undefined);

        if (itemRevision === undefined && requests.length > 0) {
          const matched = requests.find(
            (r) =>
              (r.submittedAt && r.submittedAt === item.at) ||
              (r.closedAt && r.closedAt === item.at) ||
              (r.closedNote && r.closedNote === item.note) ||
              (r.note && r.note === item.note)
          );
          if (matched) {
            itemRevision = matched.revision;
          }
        }

        return {
          status: (item.status as string) || "draft",
          note: (item.note as string) || undefined,
          by: item.by,
          at: (item.at as string) || undefined,
          revision: itemRevision,
          version: itemRevision,
          versionNumber: itemRevision,
        };
      })
    );

    // If sent occurred and not recorded in history, append sent event
    const hasSent = history.some(
      (h) =>
        (h.status as string) === "sent" ||
        (h.status as string) === "marked_sent" ||
        (h.status as string) === "sent_via_email"
    );
    if (isSent && !hasSent) {
      items.push({
        status: sendMethod === "manual" ? "marked_sent" : "sent",
        by: approval?.reviewedBy || "Admin",
        at: sentAt || undefined,
        note: sentMessage || undefined,
      });
    }
  } else if (requests && requests.length > 0) {
    // Generate timeline directly from approvalRequests
    requests.forEach((req) => {
      // 1. Decision event (Approved or Rejected)
      if (
        req.closedAt &&
        req.status !== "pending" &&
        req.status !== "pending_approval"
      ) {
        items.push({
          status: req.status,
          note: req.closedNote,
          by: approval?.reviewedBy || "Admin",
          at: req.closedAt,
          revision: req.revision,
          version: req.revision,
          versionNumber: req.revision,
        });
      }

      // 2. Submission event (Pending Approval)
      if (req.submittedAt) {
        items.push({
          status: "pending_approval",
          note: req.note,
          by: req.submittedBy,
          at: req.submittedAt,
          revision: req.revision,
          version: req.revision,
          versionNumber: req.revision,
        });
      }
    });

    if (isSent) {
      items.push({
        status: sendMethod === "manual" ? "marked_sent" : "sent",
        by: approval?.reviewedBy || "Admin",
        at: sentAt || undefined,
        note: sentMessage || undefined,
      });
    }
  } else {
    // Fallback if neither history nor approvalRequests exist
    if (isSent) {
      items.push({
        status: sendMethod === "manual" ? "marked_sent" : "sent",
        by: approval?.reviewedBy || "Admin",
        at: sentAt || undefined,
        note: sentMessage || undefined,
      });
    }

    if (approval?.status === "approved") {
      items.push({
        status: "approved",
        by: approval.reviewedBy || "Admin",
        at: approval.reviewedAt || undefined,
      });
    } else if (approval?.status === "rejected") {
      items.push({
        status: "rejected",
        by: approval.reviewedBy || "Admin",
        at: approval.reviewedAt || undefined,
        note: approval.rejectionReason,
      });
    }

    if (approval?.submittedAt || approval?.status === "pending_approval") {
      items.push({
        status: "pending_approval",
        by: approval?.submittedBy || "User",
        at: approval?.submittedAt || undefined,
      });
    }
  }

  return items;
}

export default function ApprovalTimeline({
  approval,
  approvalRequests,
  workflowStatus,
  revision = 1,
  sendMethod,
  sentAt,
  sentMessage,
  className = "",
}: ApprovalTimelineProps) {
  const historyItems = useMemo(() => {
    return getInvoiceTimelineHistory({
      approval,
      approvalRequests,
      workflowStatus,
      sendMethod,
      sentAt,
      sentMessage,
    });
  }, [approval, approvalRequests, workflowStatus, sendMethod, sentAt, sentMessage]);

  return (
    <ApprovalHistoryTimeline
      history={historyItems}
      version={revision}
      approvedVersion={approval?.approvedRevision}
      className={className}
      showEmpty={true}
    />
  );
}
