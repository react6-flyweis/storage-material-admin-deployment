import type { TourDefinition, TourStepConfig } from "../tour.types";

const CLICK_OR_NEXT = "Click it yourself, or press Next and we'll do it for you.";
const LEAD_ROUTE = "/leads/:leadId";

/** A step inside one tab of the lead workspace; first clicks that tab. */
function tabStep(
  tab: string,
  tabLabel: string,
  config: Omit<TourStepConfig, "route" | "via">,
): TourStepConfig {
  return {
    side: "top",
    ...config,
    route: `${LEAD_ROUTE}?tab=${tab}`,
    via: {
      fromRoute: LEAD_ROUTE,
      element: `[data-tour="lead-tab-trigger-${tab}"]`,
      title: `Open the ${tabLabel} tab`,
      description: `Click the <b>${tabLabel}</b> tab. ${CLICK_OR_NEXT}`,
      speechText: `Click the ${tabLabel} tab.`,
    },
  };
}

export const leadsDeepDiveTour: TourDefinition = {
  id: "leads-deep-dive",
  name: "Leads Deep Dive",
  description:
    "The full leads page, its filters and table actions, then every tab of the lead workspace.",
  estimatedMinutes: 6,
  steps: [
    // ── Leads page ─────────────────────────────────────────────────────────
    {
      id: "step-leads-page",
      route: "/leads",
      element: '[data-tour="leads-page"]',
      title: "The Leads Page",
      description:
        "Everything about your pipeline in one place: KPIs at the top, tools to add and filter leads, and the full leads table below. Let's go through it piece by piece.",
      speechText:
        "This is the leads page. Let's go through it piece by piece.",
      side: "left",
      align: "start",
    },
    {
      id: "step-leads-period",
      route: "/leads",
      element: '[data-tour="period-filter"]',
      title: "Time Period",
      description:
        "Switch between <b>Today</b>, <b>Week</b>, <b>Month</b>, and <b>All Time</b>. The KPI cards and the table update to match.",
      speechText:
        "Pick today, this week, this month, or all time. The cards and table update to match.",
      side: "bottom",
    },
    {
      id: "step-leads-date-range",
      route: "/leads",
      element: '[data-tour="leads-date-range"]',
      title: "Custom Date Range",
      description:
        "Need a specific window? Pick an exact start and end date instead.",
      speechText: "Or pick an exact date range.",
      side: "bottom",
      align: "end",
    },
    {
      id: "step-leads-archive-toggle",
      route: "/leads",
      element: '[data-tour="leads-archive-toggle"]',
      title: "Active vs Archived",
      description:
        "Switch between the active pipeline and archived leads that were removed as non-viable. Archived leads can be restored at any time.",
      speechText:
        "Switch between active and archived leads. Archived leads can be restored anytime.",
      side: "bottom",
      align: "end",
    },
    {
      id: "step-leads-stats",
      route: "/leads",
      element: '[data-tour="leads-stats-cards"]',
      title: "Lead KPIs",
      description:
        "<b>Total Leads</b> in the period, how many are <b>Assigned</b> to a salesperson, how many are still <b>Unassigned</b> and need an owner, and <b>Unopened Messages</b> from customers waiting for a reply.",
      speechText:
        "These cards show total leads, assigned and unassigned leads, and customer messages nobody has opened yet. Keep unassigned and unopened at zero.",
      side: "bottom",
    },
    {
      id: "step-leads-action-bar",
      route: "/leads",
      element: '[data-tour="leads-action-bar"]',
      title: "Add, Import, Export",
      description:
        "<b>Add Lead</b> captures a single inquiry, <b>Import</b> bulk-loads leads from a spreadsheet, and <b>Export Data</b> downloads the current list.",
      speechText:
        "Add leads one at a time, import them in bulk, or export the list.",
      side: "bottom",
    },
    {
      id: "step-leads-filters",
      route: "/leads",
      element: '[data-tour="leads-filters"]',
      title: "Search & Filters",
      description:
        "Search by name, then narrow by building type, business unit, project value, assignment, and lifecycle status. <b>Clear Filters</b> appears once any filter is set.",
      speechText:
        "Search, then filter by building type, business unit, value, assignment, and status.",
      side: "bottom",
      align: "end",
    },
    {
      id: "step-leads-table",
      route: "/leads",
      element: '[data-tour="leads-table"]',
      title: "Leads Table",
      description:
        "One row per lead: customer and project, owner, score, lifecycle status, quote value, chat, and actions. Let's look at the columns that matter most.",
      speechText:
        "Each row is one lead. Let's look at the columns that matter most.",
      side: "top",
    },
    {
      id: "step-leads-select-all",
      route: "/leads",
      element: '[data-tour="leads-select-all"]',
      title: "Bulk Selection",
      description:
        "Tick rows, or this box to select the whole page, to act on several leads at once.",
      speechText: "Select several leads to act on them together.",
      side: "right",
      optional: true,
    },
    {
      id: "step-leads-row-assignee",
      route: "/leads",
      element: '[data-tour="lead-row-assignee"]',
      title: "Assigned To",
      description:
        "The salesperson who owns the lead. If it shows <b>Unassigned</b>, click it to pick an owner right from the table.",
      speechText:
        "This shows who owns the lead. Click unassigned to pick an owner.",
      side: "bottom",
      optional: true,
    },
    {
      id: "step-leads-row-score",
      route: "/leads",
      element: '[data-tour="lead-row-score"]',
      title: "Lead Score",
      description:
        "A 0–100 score of how likely the lead is to close. Green is hot, red is cold, so work the highest scores first.",
      speechText:
        "The lead score shows how likely a deal is to close. Work the highest scores first.",
      side: "bottom",
      optional: true,
    },
    {
      id: "step-leads-row-chat",
      route: "/leads",
      element: '[data-tour="lead-row-chat"]',
      title: "Quick Chat",
      description:
        "Open the customer conversation without leaving the list. The red badge counts unread messages.",
      speechText:
        "Open the customer chat right from the list. The red badge counts unread messages.",
      side: "left",
      optional: true,
    },
    {
      id: "step-leads-row-actions",
      route: "/leads",
      element: '[data-tour="lead-row-actions"]',
      title: "Row Actions",
      description:
        "<b>👁 View</b> opens the lead workspace, <b>Assign</b> sets or changes the salesperson, <b>Archive</b> moves a non-viable lead out of the pipeline, and <b>Delete</b> removes it for good.",
      speechText:
        "Use these actions to view, assign, archive, or delete a lead.",
      side: "left",
      optional: true,
    },

    // ── Add lead ───────────────────────────────────────────────────────────
    {
      id: "step-add-lead-form",
      route: "/leads/add",
      element: '[data-tour="add-lead-form"]',
      title: "Add Lead Form",
      description:
        "Capture customer contact details, building specs, business unit, and assignment for a new inquiry.",
      speechText:
        "The add lead form captures customer details and building specifications.",
      side: "top",
      via: {
        fromRoute: "/leads",
        element: '[data-tour="add-lead-btn"]',
        title: "Add a Lead",
        description: `Click <b>Add Lead</b> to capture a new inquiry. ${CLICK_OR_NEXT}`,
        speechText: "Click Add Lead.",
      },
    },

    // ── Lead workspace ─────────────────────────────────────────────────────
    {
      id: "step-lead-detail-content",
      route: LEAD_ROUTE,
      element: '[data-tour="lead-details-content"]',
      title: "Lead Workspace",
      description:
        "Everything about a single deal: project details, quotations, chat, lifecycle, documents, follow-ups, and payments.",
      speechText:
        "This is the lead workspace, where everything about a single deal lives.",
      side: "left",
      align: "start",
      via: {
        fromRoute: "/leads",
        element: '[data-tour="lead-row-view-btn"]',
        title: "Open a Lead",
        description: `Click the <b>eye icon</b> on a lead to open its workspace. ${CLICK_OR_NEXT}`,
        speechText: "Click the eye icon to open a lead.",
      },
    },
    {
      id: "step-lead-detail-actions",
      route: LEAD_ROUTE,
      element: '[data-tour="lead-detail-actions"]',
      title: "Lead Actions",
      description:
        "<b>Edit Lead</b> updates details, <b>Assign a person</b> changes the owner, <b>Archive</b> parks a non-viable lead, and <b>Delete</b> removes it permanently.",
      speechText:
        "Edit, assign, archive, or delete the lead from here.",
      side: "bottom",
    },
    {
      id: "step-lead-detail-tabs",
      route: LEAD_ROUTE,
      element: '[data-tour="lead-details-tabs-nav"]',
      title: "Workspace Tabs",
      description:
        "Each tab covers one part of the deal. We'll open them one by one.",
      speechText: "Each tab covers one part of the deal. Let's open them one by one.",
      side: "bottom",
    },

    // Basic info tab
    tabStep("basic_info", "Basic info", {
      id: "step-lead-tab-basic-info",
      element: '[data-tour="lead-basic-info-card"]',
      title: "Project Overview",
      description:
        "Project name, current stage, business unit, building type, quote value, created date, and location.",
      speechText:
        "The overview shows the project, its stage, value, and location.",
    }),
    {
      id: "step-lead-detail-specs",
      route: `${LEAD_ROUTE}?tab=basic_info`,
      element: '[data-tour="lead-project-specs"]',
      title: "Project Specifications",
      description:
        "Building dimensions and specs captured for this inquiry.",
      speechText: "Building dimensions and specifications live here.",
      side: "top",
      optional: true,
    },
    {
      id: "step-lead-detail-progress",
      route: `${LEAD_ROUTE}?tab=basic_info`,
      element: '[data-tour="lead-progress"]',
      title: "Deal Progress",
      description:
        "Where the deal sits on the path from initial contact to release to the plant, with the current step's details.",
      speechText:
        "The progress tracker shows where the deal is, from first contact to plant release.",
      side: "top",
      optional: true,
    },
    {
      id: "step-lead-detail-status-actions",
      route: `${LEAD_ROUTE}?tab=basic_info`,
      element: '[data-tour="lead-status-actions"]',
      title: "Update Status & Notes",
      description:
        "Move the deal to its next stage with <b>Update Status</b>, or log a note about the latest conversation.",
      speechText: "Update the deal stage or add a note from here.",
      side: "top",
      optional: true,
    },
    {
      id: "step-lead-detail-activity",
      route: `${LEAD_ROUTE}?tab=basic_info`,
      element: '[data-tour="lead-activity-notes"]',
      title: "Status, Activity & Notes",
      description:
        "Project status at a glance, recent activity on the lead, and the full notes history.",
      speechText: "See project status, recent activity, and every note logged.",
      side: "top",
      optional: true,
    },
    {
      id: "step-lead-detail-scoring",
      route: `${LEAD_ROUTE}?tab=basic_info`,
      element: '[data-tour="lead-scoring"]',
      title: "Lead Scoring",
      description:
        "The lead's score, temperature, and what drives it.",
      speechText: "Lead scoring shows how hot this lead is and why.",
      side: "top",
      optional: true,
    },

    // Remaining tabs
    tabStep("quotations", "Quotations", {
      id: "step-lead-tab-quotations",
      element: '[data-tour="lead-tab-content-quotations"]',
      title: "Quotations",
      description: "Every quotation prepared for this lead, with status and value.",
      speechText: "The quotations tab lists every quote prepared for this lead.",
    }),
    {
      id: "step-lead-tab-quotation-approval",
      route: `${LEAD_ROUTE}?tab=quotations`,
      element: '[data-tour="lead-quotation-approve-btn"]',
      title: "Approve from the Lead",
      description:
        "Quotations waiting on you can be approved or rejected right here, without leaving the lead. Rejecting asks for a reason.",
      speechText:
        "Approve or reject this lead's pending quotations right here.",
      side: "left",
      fallback: {
        element: '[data-tour="lead-tab-content-quotations"]',
        description:
          "None of this lead's quotations are waiting for approval. When the salesperson sends one for approval, <b>Approve</b> and <b>Reject</b> buttons appear on it here. Approved quotes can then be sent to the customer.",
        speechText:
          "Nothing is pending for this lead. When a quote is sent for approval, approve and reject buttons appear here.",
      },
    },
    tabStep("open_chat", "Open Chat", {
      id: "step-lead-tab-open-chat",
      element: '[data-tour="lead-tab-content-open_chat"]',
      title: "Open Chat",
      description: "Call transcripts and the conversation history with the customer.",
      speechText: "Open chat shows transcripts and the conversation with the customer.",
    }),
    tabStep("lifecycle", "Lifecycle", {
      id: "step-lead-tab-lifecycle",
      element: '[data-tour="lead-tab-content-lifecycle"]',
      title: "Lifecycle",
      description:
        "The full stage history of the deal, from initial contact through release to the plant.",
      speechText: "The lifecycle tab tracks the deal from first contact to plant release.",
    }),
    tabStep("documents", "Documents", {
      id: "step-lead-tab-documents",
      element: '[data-tour="lead-tab-content-documents"]',
      title: "Documents",
      description: "Drawings, contracts, and other files attached to the lead.",
      speechText: "Documents holds drawings, contracts, and other attached files.",
    }),
    tabStep("follow_ups", "Follow-Up History", {
      id: "step-lead-tab-follow-ups",
      element: '[data-tour="lead-tab-content-follow_ups"]',
      title: "Follow-Up History",
      description: "Past and upcoming follow-ups logged against this lead.",
      speechText: "Follow-up history shows every touchpoint logged for this lead.",
    }),
    tabStep("payments", "Payment History", {
      id: "step-lead-tab-payments",
      element: '[data-tour="lead-tab-content-payments"]',
      title: "Payment History",
      description: "Deposits and payments recorded for this deal.",
      speechText: "Payment history shows deposits and payments for this deal.",
    }),

    {
      id: "step-leads-tour-hub",
      route: "",
      element: '[data-tour="tour-hub-btn"]',
      title: "Replay Anytime",
      description:
        "Open this help menu to replay the leads deep dive whenever you need a refresher.",
      speechText: "Open this help menu anytime to replay the leads deep dive.",
      side: "bottom",
      align: "end",
    },
  ],
};
