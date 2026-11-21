import type { TourDefinition, TourStepBranchConfig, TourStepConfig } from "../tour.types";

/**
 * A sidebar-only step: highlights a section's icon without leaving the current
 * page. Sections with several pages offer a branch into their deep dive.
 */
function sectionStep(
  groupId: string,
  title: string,
  description: string,
  speechText: string,
  branch?: TourStepBranchConfig,
): TourStepConfig {
  return {
    id: `step-section-${groupId}`,
    route: "",
    element: `[data-group-id="${groupId}"]`,
    title,
    description,
    speechText,
    side: "right",
    align: "center",
    branch,
  };
}

export const adminPlatformTour: TourDefinition = {
  id: "admin-platform",
  name: "Global Platform Walkthrough",
  description:
    "Walkthrough in sidebar order: Dashboard, Leads and Customers in detail, then every other section with its own deep dive.",
  estimatedMinutes: 5,
  steps: [
    // ── Dashboard ──────────────────────────────────────────────────────────
    {
      id: "step-dashboard-period",
      route: "/dashboard",
      element: '[data-tour="period-filter"]',
      title: "Time Period",
      description:
        "Welcome to the admin dashboard. Start by picking a period: <b>Today</b>, <b>Week</b>, <b>Month</b>, or <b>All Time</b>. Every number on this page follows it.",
      speechText:
        "Welcome to the admin dashboard. Pick today, this week, this month, or all time. Every number on the page follows it.",
      side: "bottom",
    },
    {
      id: "step-dashboard-kpis",
      route: "/dashboard",
      element: '[data-tour="dashboard-kpis"]',
      title: "Headline KPIs",
      description:
        "<b>Total Leads</b>, <b>Confirmed Leads</b>, <b>Pipeline Value</b>, and <b>Revenue</b> for the selected period. Click a card to jump to the details behind it.",
      speechText:
        "These cards show total and confirmed leads, pipeline value, and revenue. Click a card for the details.",
      side: "bottom",
    },
    {
      id: "step-dashboard-delivery-finance",
      route: "/dashboard",
      element: '[data-tour="dashboard-delivery-finance"]',
      title: "Delivery & Finance Overview",
      description:
        "Delivery revenue and costs, load optimization, delivery operations, customer communication status, and freight activity.",
      speechText:
        "This overview covers delivery finances, load optimization, operations, and freight.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-sales-funnel",
      route: "/dashboard",
      element: '[data-tour="dashboard-sales-funnel"]',
      title: "Sales Funnel & Deal Size",
      description:
        "How leads move from inquiry to closed deal, and how deal sizes are spread, with the average deal size.",
      speechText:
        "The sales funnel shows how leads convert, alongside deal size distribution.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-reports",
      route: "/dashboard",
      element: '[data-tour="dashboard-reports"]',
      title: "Reports & Lead Sources",
      description:
        "Sales trends over time, and which channels your leads come from.",
      speechText: "See sales trends and where your leads come from.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-dispatch",
      route: "/dashboard",
      element: '[data-tour="dashboard-dispatch"]',
      title: "Dispatch Readiness",
      description: "Orders that are ready, or almost ready, to ship.",
      speechText: "Dispatch readiness shows which orders are ready to ship.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-conversion",
      route: "/dashboard",
      element: '[data-tour="dashboard-conversion"]',
      title: "Lead Conversion & Tonnage Sold",
      description: "Conversion rates by stage, and the steel tonnage sold.",
      speechText: "Track lead conversion and how much tonnage you've sold.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-pipeline",
      route: "/dashboard",
      element: '[data-tour="dashboard-pipeline"]',
      title: "Active Pipeline & Closed Deals",
      description:
        "A board of deals in each pipeline stage, next to the most recently closed deals.",
      speechText:
        "The pipeline board shows deals by stage, next to recently closed deals.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-team",
      route: "/dashboard",
      element: '[data-tour="dashboard-team"]',
      title: "Sales Activity & Top Performers",
      description:
        "What the sales team has been doing lately, and who is closing the most.",
      speechText: "See recent sales activity and your top performers.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-tax",
      route: "/dashboard",
      element: '[data-tour="dashboard-tax"]',
      title: "Sales Tax",
      description:
        "Tax collected overall, by state, and by building type. Filing status and report export follow just below.",
      speechText: "Sales tax is summarized overall, by state, and by building type.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-construction",
      route: "/dashboard",
      element: '[data-tour="dashboard-construction"]',
      title: "Construction Progress",
      description: "Progress on active construction projects.",
      speechText: "Follow progress on active construction projects.",
      side: "top",
      optional: true,
    },
    {
      id: "step-dashboard-plant",
      route: "/dashboard",
      element: '[data-tour="dashboard-plant"]',
      title: "Plant Production Status",
      description:
        "Production stats, business highlights, customer approvals, invoices generated, and the plant sales mix.",
      speechText:
        "Plant production status covers production, approvals, invoices, and sales mix.",
      side: "top",
      optional: true,
    },
    {
      id: "step-sidebar-nav",
      route: "/dashboard",
      element: '[data-tour="sidebar-nav"]',
      title: "Main Navigation",
      description:
        "Pick a section from the icon rail, then a page from the menu beside it. We'll show you each click as we go.",
      speechText:
        "Use the sidebar to move between sections. We'll show you each click as we go.",
      side: "right",
    },
    {
      id: "step-global-search",
      route: "/dashboard",
      element: '[data-tour="header-search"]',
      title: "Instant Global Search",
      description:
        "Find any customer, lead, project, or invoice from anywhere in the panel.",
      speechText:
        "Find any lead, customer, or project instantly from the global search bar.",
      side: "bottom",
    },
    {
      id: "step-notifications-menu",
      route: "/dashboard",
      element: '[data-tour="notifications-menu"]',
      title: "Live Notifications",
      description:
        "New leads, approvals, escalations, and system alerts show up here in real time.",
      speechText:
        "Real-time alerts for new leads, approvals, and escalations appear in the notification bell.",
      side: "bottom",
      align: "end",
    },

    // ── Leads ──────────────────────────────────────────────────────────────
    {
      id: "step-leads-pipeline",
      route: "/leads",
      element: '[data-tour="leads-table"]',
      title: "Leads Pipeline",
      description:
        "Every lead across the sales team. Filter by status, business unit, assignment, and project value, then open a lead to manage it.",
      speechText:
        "This is the company-wide leads pipeline. Click Explore Leads in Depth for a complete tour of every leads feature.",
      side: "top",
      branch: {
        tourId: "leads-deep-dive",
        label: "Explore Leads in Depth (6 min)",
        description:
          "Want a full walkthrough of filters, KPI cards, and the lead workspace tabs?",
      },
    },
    {
      id: "step-followups-overview",
      route: "/leads/follow-up",
      element: '[data-tour="followups-overview"]',
      title: "Follow-Up Center",
      description:
        "Track scheduled follow-ups across the team and make sure no prospect goes cold.",
      speechText:
        "The follow-up center keeps every scheduled touchpoint across the team in one place.",
      side: "top",
    },
    {
      id: "step-escalated-leads",
      route: "/leads/escalated",
      element: '[data-tour="escalated-leads-table"]',
      title: "Escalated Leads",
      description:
        "Leads flagged for admin attention. Review, reassign, or resolve escalations here.",
      speechText:
        "Escalated leads need admin attention. Review and resolve them here.",
      side: "top",
    },
    {
      id: "step-purchase-orders",
      route: "/leads/purchase-orders",
      element: '[data-tour="purchase-orders-table"]',
      title: "Purchase Orders",
      description:
        "Won deals converted into purchase orders, ready for review and release to the plant.",
      speechText:
        "Purchase orders from won deals are reviewed here before release to the plant.",
      side: "top",
    },
    {
      id: "step-quotations-list",
      route: "/leads/quotation-list",
      element: '[data-tour="quotations-list-table"]',
      title: "Quotations",
      description:
        "All quotations sent to customers, with their status and value.",
      speechText:
        "Every quotation is listed here with its status. Click Explore Approvals to see every approval you handle as an admin.",
      side: "top",
      branch: {
        tourId: "approvals-deep-dive",
        label: "Explore All Approvals (5 min)",
        description:
          "Want to see every approval flow: quotations, POs, payments, invoices, material requests, and more?",
      },
    },

    // ── Customers ──────────────────────────────────────────────────────────
    {
      id: "step-customers-table",
      route: "/customers",
      element: '[data-tour="customers-table"]',
      title: "Customer Management",
      description:
        "View and manage every customer account, their projects, and assignment status.",
      speechText:
        "Manage every customer account here. Click Explore Customers in Depth for a closer look.",
      side: "top",
      branch: {
        tourId: "customers-deep-dive",
        label: "Explore Customers in Depth (4 min)",
        description:
          "Want a walkthrough of customer stats and the customer workspace?",
      },
    },
    {
      id: "step-meetings",
      route: "/customers/meetings",
      element: '[data-tour="meetings-workspace"]',
      title: "Meetings",
      description:
        "Schedule, reschedule, and review customer meetings across the team.",
      speechText: "Schedule and review customer meetings here.",
      side: "top",
    },
    {
      id: "step-contracts",
      route: "/customers/contracts",
      element: '[data-tour="contracts-workspace"]',
      title: "Contracts",
      description: "Signed customer agreements and their current status.",
      speechText: "Customer contracts and agreements live here.",
      side: "top",
    },

    // ── Other sections: sidebar only, each with its own deep dive ──────────
    sectionStep(
      "gallery",
      "Plant",
      "Plant projects, BOM files, load planning, shipping, deliveries, costing, and equipment.",
      "The plant section covers production, load planning, shipping, and equipment.",
      {
        tourId: "plant-deep-dive",
        label: "Explore Plant in Depth",
        description: "Want a page-by-page walkthrough of the plant section?",
      },
    ),
    sectionStep(
      "settings",
      "Payments",
      "Customer payments, approvals, payment status, and sales tax reporting.",
      "The payments section tracks payments, approvals, and sales tax.",
      {
        tourId: "payments-deep-dive",
        label: "Explore Payments in Depth",
        description: "Want a page-by-page walkthrough of payments and tax?",
      },
    ),
    sectionStep(
      "documents",
      "Invoices",
      "Create customer invoices and review vendor and freight carrier invoices.",
      "The invoices section handles customer, vendor, and carrier invoices.",
      {
        tourId: "invoices-deep-dive",
        label: "Explore Invoices in Depth",
        description: "Want a page-by-page walkthrough of invoicing?",
      },
    ),
    sectionStep(
      "construction",
      "Construction",
      "On-site projects, drawings, deliveries, tasks, and material requests.",
      "The construction section follows on-site projects, tasks, and materials.",
      {
        tourId: "construction-deep-dive",
        label: "Explore Construction in Depth",
        description: "Want a page-by-page walkthrough of construction?",
      },
    ),


    // ── Employee Management ────────────────────────────────────────────────
    {
      id: "step-employees",
      route: "/employees",
      element: '[data-tour="employees-workspace"]',
      title: "Employee Management",
      description:
        "Everyone in the company with their role, team, and status. Use the Employees menu to filter by Sales, Plant, Construction, or Support.",
      speechText:
        "Manage every team member here, and filter by team from the Employees menu.",
      side: "top",
    },
    {
      id: "step-employees-sales-team",
      route: "/employees?team=sales",
      element: '[data-tour="employees-workspace"]',
      title: "Employees by Team",
      description:
        "Each team has its own filtered list. Here's the sales team.",
      speechText: "Each team has its own list. Here's the sales team.",
      side: "top",
    },
    {
      id: "step-employee-performance",
      route: "/employees/performance",
      element: '[data-tour="page-content"]',
      title: "Sales Employee Performance",
      description:
        "How each salesperson is performing against targets.",
      speechText: "Track how each salesperson is performing against targets.",
      side: "left",
      align: "start",
    },
    {
      id: "step-employee-audit-log",
      route: "/employees/audit-log",
      element: '[data-tour="page-content"]',
      title: "Audit Log",
      description: "A record of who changed what, and when.",
      speechText: "The audit log records who changed what, and when.",
      side: "left",
      align: "start",
    },

    // ── Single-page sections ───────────────────────────────────────────────
    {
      id: "step-role-permissions",
      route: "/role-permissions",
      element: '[data-tour="role-permissions-workspace"]',
      title: "Role Permissions",
      description:
        "Control what each role can see and do across the panels.",
      speechText: "Role permissions control what each role can access.",
      side: "top",
    },
    {
      id: "step-product-library",
      route: "/product-library",
      element: '[data-tour="product-library-workspace"]',
      title: "Product Library",
      description:
        "The catalog of products and components used in quotations and BOMs.",
      speechText:
        "The product library holds every product used in quotes and bills of material.",
      side: "top",
    },

    // ── Finance ────────────────────────────────────────────────────────────
    sectionStep(
      "accounts",
      "Financial Overview",
      "Revenue, expenses, WIP profits, margins, freight costs, and budget versus actuals.",
      "The finance section covers revenue, expenses, margins, and budgets.",
      {
        tourId: "finance-deep-dive",
        label: "Explore Finance in Depth",
        description: "Want a page-by-page walkthrough of finance?",
      },
    ),
    // ── Communication ──────────────────────────────────────────────────────
    {
      id: "step-communication",
      route: "/communication",
      element: '[data-tour="communication-view"]',
      title: "Communication Hub",
      description:
        "Chat with team members and customers in one unified inbox.",
      speechText: "Chat with your team and customers from the communication hub.",
      side: "top",
    },

    {
      id: "step-tour-hub",
      route: "",
      element: '[data-tour="tour-hub-btn"]',
      title: "Replay Anytime",
      description:
        "Open this help menu to replay this walkthrough or start any deep dive, and to mute or unmute voice guidance.",
      speechText:
        "That's the tour! Open this help menu anytime to replay a walkthrough or start a deep dive.",
      side: "bottom",
      align: "end",
    },
  ],
};
