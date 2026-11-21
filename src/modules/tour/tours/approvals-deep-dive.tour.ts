import type { TourDefinition } from "../tour.types";

const CLICK_OR_NEXT = "Click it yourself, or press Next and we'll do it for you.";

/**
 * Every admin approval flow. Approve / Reject controls only render for
 * records that are waiting on a decision, so each of those steps has a
 * fallback that highlights the surrounding table and explains the flow.
 */
export const approvalsDeepDiveTour: TourDefinition = {
  id: "approvals-deep-dive",
  name: "Approvals Deep Dive",
  description:
    "Every approval an admin handles: quotations, purchase orders, payments, vendor and carrier invoices, material requests, escalations, and shipments.",
  estimatedMinutes: 5,
  steps: [
    // ── Quotations ─────────────────────────────────────────────────────────
    {
      id: "step-approvals-quotation-stats",
      route: "/leads/quotation-list",
      element: '[data-tour="quotations-stats"]',
      title: "Quotation Approvals",
      description:
        "Salespeople send quotations to you for approval before they reach the customer. <b>Pending</b> is your queue: click it to show only quotations waiting on you.",
      speechText:
        "Quotations need your approval before they reach the customer. The pending card is your queue.",
      side: "bottom",
    },
    {
      id: "step-approvals-quotation-approve",
      route: "/leads/quotation-list",
      element: '[data-tour="quotation-approve-btn"]',
      title: "Approve or Reject a Quotation",
      description:
        "<b>Approve</b> releases the quotation so it can be sent to the customer. <b>Reject</b> asks for a reason and sends it back to the salesperson to revise.",
      speechText:
        "Approve releases the quote for sending. Reject sends it back to the salesperson with your reason.",
      side: "left",
      fallback: {
        element: '[data-tour="quotations-table"]',
        description:
          "No quotations are waiting for approval right now. When a salesperson clicks <b>Send for Approval</b>, the quotation shows here as <b>Pending Approval</b> with <b>Approve</b> and <b>Reject</b> buttons in its row. Approving releases it to be sent; rejecting returns it to the salesperson with your reason.",
        speechText:
          "Nothing is pending right now. When a quote is sent for approval, Approve and Reject buttons appear in its row.",
      },
    },
    {
      id: "step-approvals-quotation-send",
      route: "/leads/quotation-list",
      element: '[data-tour="quotation-send-btn"]',
      title: "Send to Customer",
      description:
        "Once approved, <b>Send to customer</b> emails the quotation. After it's sent, the button becomes <b>Resend</b>.",
      speechText: "Approved quotes can be sent to the customer from here.",
      side: "left",
      fallback: {
        element: '[data-tour="quotations-table"]',
        description:
          "After you approve a quotation, a <b>Send to customer</b> button appears in its row to email it. Once the customer accepts, <b>Next steps</b> takes you to invoicing.",
        speechText:
          "After approval, a Send to customer button appears in the row. Once accepted, Next steps takes you to invoicing.",
      },
    },
    {
      id: "step-approvals-quotation-submit",
      route: "/leads/quotation-list",
      element: '[data-tour="quotation-submit-btn"]',
      title: "Drafts & Revisions",
      description:
        "Drafts and rejected quotations show <b>Send for Approval</b> so they can go back through review once revised.",
      speechText:
        "Drafts and rejected quotes can be sent back for approval once revised.",
      side: "left",
      optional: true,
    },

    // ── Purchase orders ────────────────────────────────────────────────────
    {
      id: "step-approvals-po-approve",
      route: "/leads/purchase-orders",
      element: '[data-tour="po-approve-btn"]',
      title: "Approve Purchase Orders",
      description:
        "When sales converts a won deal to a PO, it lands here for approval. <b>Approve PO</b> is only enabled once the lead's payment is marked <b>Paid</b>.",
      speechText:
        "Purchase orders from won deals land here. You can approve a PO once its payment is marked paid.",
      side: "left",
      fallback: {
        element: '[data-tour="purchase-orders-table"]',
        description:
          "No purchase orders yet. When sales clicks <b>Convert to PO</b> on a lead, the request appears here with an <b>Approve PO</b> button, enabled once the lead's payment is marked <b>Paid</b>.",
        speechText:
          "No purchase orders yet. When sales converts a lead to a PO, it appears here for your approval once paid.",
      },
    },
    {
      id: "step-approvals-po-assign-plant",
      route: "/leads/purchase-orders",
      element: '[data-tour="po-assign-plant-btn"]',
      title: "Assign to a Plant",
      description:
        "After a PO is approved and paid, <b>Assign Plant</b> releases it to a plant for fabrication.",
      speechText: "Approved, paid POs are released to a plant with Assign Plant.",
      side: "left",
      fallback: {
        element: '[data-tour="purchase-orders-table"]',
        description:
          "Once a PO is approved and paid, its <b>Approve PO</b> button turns into <b>Assign Plant</b>, which releases the order to a plant for fabrication.",
        speechText:
          "Once a PO is approved and paid, Assign Plant releases it to a plant.",
      },
    },
    {
      id: "step-approvals-po-details",
      route: "/leads/purchase-orders/:poId",
      element: '[data-tour="po-details-approve-btn"]',
      title: "Review a PO in Detail",
      description:
        "The PO details page shows the full order. <b>Reject</b> or <b>Approve PO</b> from the top-right once you've checked it.",
      speechText:
        "Open a PO to review it in full, then approve or reject it from the top right.",
      side: "bottom",
      align: "end",
      via: {
        fromRoute: "/leads/purchase-orders",
        element: '[data-tour="po-row-view-btn"]',
        title: "Open a Purchase Order",
        description: `Click the <b>eye icon</b> to open a PO's details. ${CLICK_OR_NEXT}`,
        speechText: "Click the eye icon to open a purchase order.",
      },
      fallback: {
        element:
          '[data-tour="po-details-actions"], [data-tour="purchase-orders-table"]',
        description:
          "This PO has already been decided, so its <b>Approve PO</b> and <b>Reject</b> buttons are hidden. They show here for any PO that is still pending. Approved, paid POs show <b>Assign to Plant</b> instead.",
        speechText:
          "This PO is already decided. Approve and reject show here while a PO is pending.",
      },
    },

    // ── Payments ───────────────────────────────────────────────────────────
    {
      id: "step-approvals-payment-stats",
      route: "/payments/payment-approvals",
      element: '[data-tour="payment-approvals-stats"]',
      title: "Payment Approvals",
      description:
        "Payment requests waiting for review, with totals for each status: pending, approved, rejected, and more.",
      speechText:
        "Payment requests are summarized here by status.",
      side: "bottom",
    },
    {
      id: "step-approvals-payment-review",
      route: "/payments/payment-approvals",
      element: '[data-tour="payment-review-btn"]',
      title: "Review a Payment Request",
      description:
        "<b>Review</b> opens the request with its details and documents, where you approve or reject it.",
      speechText:
        "Click Review to open a payment request and approve or reject it.",
      side: "left",
      fallback: {
        element: '[data-tour="payment-approvals-table"]',
        description:
          "No payment requests to review right now. Each request listed here has a <b>Review</b> button that opens its details, where you approve or reject it.",
        speechText:
          "No payment requests right now. Each request gets a Review button to approve or reject it.",
      },
    },

    // ── Vendor & carrier invoices ──────────────────────────────────────────
    {
      id: "step-approvals-vendor-invoices",
      route: "/invoice/invoices-management",
      element: '[data-tour="payable-approval-actions"]',
      title: "Approve Vendor Invoices",
      description:
        "Vendor invoices pending approval show <b>Approve</b> and <b>Reject</b> in their row. Rejecting asks for a reason.",
      speechText:
        "Approve or reject vendor invoices that are pending approval.",
      side: "left",
      fallback: {
        element: '[data-tour="payables-table"]',
        description:
          "No vendor invoices are pending approval. When one is, <b>Approve</b> and <b>Reject</b> buttons appear in its row, next to View and Download. Rejecting asks for a reason.",
        speechText:
          "No vendor invoices are pending. When one is, approve and reject buttons appear in its row.",
      },
    },
    {
      id: "step-approvals-carrier-invoices",
      route: "/invoice/carrier-invoices",
      element: '[data-tour="payable-approval-actions"]',
      title: "Approve Carrier Invoices",
      description:
        "Freight carrier invoices go through the same approval: <b>Approve</b> or <b>Reject</b> with a reason.",
      speechText: "Freight carrier invoices are approved the same way.",
      side: "left",
      fallback: {
        element: '[data-tour="payables-table"]',
        description:
          "No carrier invoices are pending approval. When one is, <b>Approve</b> and <b>Reject</b> buttons appear in its row, the same as vendor invoices.",
        speechText:
          "No carrier invoices are pending. When one is, approve and reject buttons appear in its row.",
      },
    },

    // ── Construction ───────────────────────────────────────────────────────
    {
      id: "step-approvals-material-requests",
      route: "/construction/materials",
      element: '[data-tour="material-approve-btn"]',
      title: "Approve Material Requests",
      description:
        "Site crews request materials from here. Pending requests show <b>Approve</b> and <b>Reject</b>.",
      speechText:
        "Approve or reject material requests raised from construction sites.",
      side: "left",
      fallback: {
        element: '[data-tour="materials-table"]',
        description:
          "No material requests are pending. When a site crew raises one, <b>Approve</b> and <b>Reject</b> buttons appear in its row.",
        speechText:
          "No material requests are pending. When one is raised, approve and reject appear in its row.",
      },
    },

    // ── Escalations ────────────────────────────────────────────────────────
    {
      id: "step-approvals-escalations",
      route: "/leads/escalated",
      element: '[data-tour="escalation-resolve-btn"]',
      title: "Resolve Escalations",
      description:
        "Leads escalated by sales wait here for an admin decision. The <b>✓</b> icon resolves the escalation once handled.",
      speechText: "Resolve escalated leads with the check icon once handled.",
      side: "left",
      fallback: {
        element: '[data-tour="escalated-leads-table"]',
        description:
          "No open escalations. When sales escalates a lead, it appears here with a <b>✓ Resolve</b> icon you click once it's handled.",
        speechText:
          "No open escalations. Escalated leads appear here with a resolve icon.",
      },
    },

    // ── Plant shipments ────────────────────────────────────────────────────
    {
      id: "step-approvals-shipments",
      route: "/plant/shipper-quotation",
      element: '[data-tour="page-content"]',
      title: "Approve Shipments",
      description:
        "Shipper quotes for each load are compared here. Open a project's comparison result to pick the best quote and click <b>Approve Shipment</b>.",
      speechText:
        "Compare shipper quotes and approve the shipment from a project's comparison result.",
      side: "left",
      align: "start",
    },

    {
      id: "step-approvals-notifications",
      route: "",
      element: '[data-tour="notifications-menu"]',
      title: "Stay on Top of Requests",
      description:
        "Check notifications for new activity across the panel, so requests waiting on you don't sit unnoticed.",
      speechText:
        "Check notifications regularly so requests don't sit unnoticed.",
      side: "bottom",
      align: "end",
    },
  ],
};
