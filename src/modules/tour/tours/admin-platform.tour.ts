import type { TourDefinition } from "../tour.types";
import { anchor, click, dialog } from "./tour-helpers";

export const adminPlatformTour: TourDefinition = {
  id: "admin-platform",
  name: "Global Platform Walkthrough",
  description:
    "Walkthrough in sidebar order: every section's main page, and how to add, edit or open a record there.",
  estimatedMinutes: 8,
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
        // The deep dive already covers adding and opening a lead.
        resumeStepId: "step-followups-overview",
      },
    },
    {
      id: "step-lead-add",
      route: "/leads/add",
      element: anchor("add-lead-form"),
      title: "Leads: Add",
      description:
        "Record the customer's contact details, the building requirements, and who the lead is assigned to.",
      speechText: "Fill in this form to add a new lead.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/leads",
        ...click("add-lead-btn", "Add a Lead", "<b>Add Lead</b> opens the new lead form."),
      },
    },
    {
      id: "step-lead-details",
      route: "/leads/:leadId",
      element: anchor("lead-details-content"),
      title: "Leads: Details",
      description:
        "Everything about one lead: project details, quotations, chat, lifecycle, documents, follow-ups, and payments.",
      speechText: "The details page shows everything about one lead.",
      side: "left",
      align: "start",
      locked: true,
      via: {
        fromRoute: "/leads",
        ...click("lead-row-view-btn", "Open a Lead", "The <b>eye</b> icon opens that lead."),
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
      id: "step-customer-details",
      route: "/customers/:customerId",
      element: anchor("customer-detail-workspace"),
      title: "Customers: Details",
      description:
        "Everything about one customer: their profile, projects, invoices, and documents.",
      speechText: "The details page shows everything about one customer.",
      side: "left",
      align: "start",
      locked: true,
      via: {
        fromRoute: "/customers",
        element: anchor("customer-row-actions"),
        title: "Open a Customer",
        description:
          "Open a row's menu and choose <b>View Details</b>. Press Next and we'll open one for you.",
        speechText: "View details is in this menu. Press next to open a customer.",
        showOnly: true,
      },
    },
    {
      id: "step-customer-edit",
      route: "/customers/:customerId/edit",
      element: anchor("customer-edit-form"),
      title: "Customers: Edit",
      description: "Update the customer's contact details and address, then save.",
      speechText: "Update a customer's details here.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/customers/:customerId",
        ...click("customer-edit-btn", "Edit a Customer", "<b>Edit</b> opens the customer's details for editing."),
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

    // ── Plant ──────────────────────────────────────────────────────────────
    {
      id: "step-plant",
      route: "/plant",
      element: anchor("plant-overview"),
      title: "Plant",
      description:
        "Production status, active projects, and delivery health. The menu leads to BOM files, load planning, shipping, costing, and equipment.",
      speechText:
        "The plant section covers production, load planning, shipping, and equipment.",
      side: "left",
      align: "start",
      branch: {
        tourId: "plant-deep-dive",
        label: "Explore Plant in Depth",
        description: "Want a page-by-page walkthrough of the plant section?",
      },
    },
    {
      id: "step-shippers",
      route: "/plant/shippers",
      element: anchor("shippers-page"),
      title: "Plant: Shippers",
      description:
        "The shippers you work with, with their materials, orders, and status.",
      speechText: "This is your list of shippers.",
      side: "left",
      align: "start",
    },
    {
      id: "step-shipper-details",
      route: "/plant/shippers/:id",
      element: anchor("shipper-details-profile"),
      title: "Shippers: Details",
      description:
        "The shipper's profile. Their order history, documents, and notes are on this page too.",
      speechText: "The details page shows a shipper's profile, orders, and documents.",
      side: "bottom",
      locked: true,
      via: {
        fromRoute: "/plant/shippers",
        ...click("shipper-row-view", "View a Shipper", "The <b>eye</b> icon opens that shipper."),
      },
    },
    {
      id: "step-shipper-add",
      route: "/plant/shippers/add",
      element: anchor("shipper-form"),
      title: "Shippers: Add",
      description:
        "Fill in the shipper's information, address, materials, and documents. Fields marked <b>*</b> are required.",
      speechText: "Fill in this form to add a new shipper.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/plant/shippers",
        ...click("shipper-add", "Add a Shipper", "<b>Add Vendor</b> opens the new shipper form."),
      },
    },

    // ── Payments ───────────────────────────────────────────────────────────
    {
      id: "step-payments",
      route: "/payments",
      element: anchor("payments-overview"),
      title: "Payments",
      description:
        "Incoming payments and outstanding balances. The menu leads to approvals, payment status, and sales tax.",
      speechText: "The payments section tracks payments, approvals, and sales tax.",
      side: "left",
      align: "start",
      branch: {
        tourId: "payments-deep-dive",
        label: "Explore Payments in Depth",
        description: "Want a page-by-page walkthrough of payments and tax?",
      },
    },
    {
      id: "step-payment-request-add",
      route: "/payments/payment-approvals",
      element: anchor("payment-request-dialog"),
      title: "Payments: New Request",
      description:
        "Enter who is being paid, the category, and the amount to send a payment for approval.",
      speechText: "Create a payment request here.",
      panel: dialog(
        "payment-request-dialog",
        click("payment-request-add", "New Payment Request", "<b>New Request</b> opens the payment request form."),
      ),
    },

    // ── Invoices ───────────────────────────────────────────────────────────
    {
      id: "step-invoice-add",
      route: "/invoice",
      element: anchor("invoice-form"),
      title: "Invoices: Add",
      description:
        "The invoices section opens on a new invoice. Fill in the customer, line items, and payment details, then save.",
      speechText: "The invoices section opens on a new invoice form.",
      side: "left",
      align: "start",
      locked: true,
      branch: {
        tourId: "invoices-deep-dive",
        label: "Explore Invoices in Depth",
        description: "Want a page-by-page walkthrough of invoicing?",
      },
    },
    {
      id: "step-invoice-list",
      route: "/invoice/list",
      element: anchor("invoices-table"),
      title: "Invoices: List",
      description: "Every customer invoice with its payment status.",
      speechText: "Every customer invoice is listed here.",
      side: "left",
      align: "start",
    },
    {
      id: "step-invoice-details",
      route: "/invoice/preview",
      element: anchor("invoice-details"),
      title: "Invoices: Details",
      description:
        "The full invoice, with its approval and the actions to approve, send, or mark it paid.",
      speechText: "The details page shows the full invoice and its actions.",
      side: "left",
      align: "start",
      locked: true,
      needsClick: true,
      via: {
        fromRoute: "/invoice/list",
        ...click("invoice-row-view", "View an Invoice", "The <b>eye</b> icon opens that invoice."),
      },
    },

    // ── Construction ───────────────────────────────────────────────────────
    {
      id: "step-construction",
      route: "/construction",
      element: anchor("construction-dashboard"),
      title: "Construction",
      description:
        "On-site progress at a glance. The menu leads to projects, drawings, deliveries, tasks, and material requests.",
      speechText:
        "The construction section follows on-site projects, tasks, and materials.",
      side: "left",
      align: "start",
      branch: {
        tourId: "construction-deep-dive",
        label: "Explore Construction in Depth",
        description: "Want a page-by-page walkthrough of construction?",
      },
    },
    {
      id: "step-material-details",
      route: "/construction/materials",
      element: anchor("material-details-dialog"),
      title: "Material Requests: Details",
      description:
        "Who requested the material, for which project, and the items. Pending requests are approved or rejected here.",
      speechText: "The details show what was requested, and by whom.",
      panel: dialog(
        "material-details-dialog",
        click("material-row-view", "View a Material Request", "<b>View</b> opens that request."),
        "material-details-close",
      ),
    },

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
      id: "step-employee-add",
      route: "/employees",
      element: anchor("employee-add-dialog"),
      title: "Employees: Add",
      description:
        "Enter the employee's details, role, and password, and choose their permissions.",
      speechText: "Fill in this form to add an employee.",
      panel: dialog(
        "employee-add-dialog",
        click("employee-add", "Add an Employee", "<b>Add Employee</b> opens the new employee form."),
      ),
    },
    {
      id: "step-employee-details",
      route: "/employees/:id",
      element: anchor("employee-profile"),
      title: "Employees: Profile",
      description: "One employee's personal information, status, and assigned work.",
      speechText: "The profile shows an employee's information and assigned work.",
      side: "left",
      align: "start",
      locked: true,
      via: {
        fromRoute: "/employees",
        ...click("employee-row-view", "View an Employee", "The <b>eye</b> icon opens that employee's profile."),
      },
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
      id: "step-role-add",
      route: "/role-permissions",
      element: anchor("role-add-dialog"),
      title: "Roles: Add",
      description: "Name the role, describe it, and choose its permissions.",
      speechText: "Create a new role here.",
      panel: dialog(
        "role-add-dialog",
        click("role-add", "Add a Role", "<b>Add New Role</b> opens the role form."),
      ),
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
    {
      id: "step-product-add",
      route: "/product-library",
      element: anchor("product-add-dialog"),
      title: "Products: Add",
      description: "Enter the product's details, category, and pricing.",
      speechText: "Add a product to the library here.",
      panel: dialog(
        "product-add-dialog",
        click("product-add", "Add a Product", "<b>Add New Product</b> opens the product form."),
      ),
    },

    // ── Finance ────────────────────────────────────────────────────────────
    {
      id: "step-finance",
      route: "/finance",
      element: anchor("finance-overview"),
      title: "Financial Overview",
      description:
        "Revenue, expenses, and profit. The menu leads to WIP profits, expenses, margins, freight costs, and budgets.",
      speechText: "The finance section covers revenue, expenses, margins, and budgets.",
      side: "left",
      align: "start",
      branch: {
        tourId: "finance-deep-dive",
        label: "Explore Finance in Depth",
        description: "Want a page-by-page walkthrough of finance?",
      },
    },
    {
      id: "step-expense-add",
      route: "/finance/expenses",
      element: anchor("expense-add-dialog"),
      title: "Finance: Add an Expense",
      description: "Record an expense with its category, amount, and receipt.",
      speechText: "Record a new expense here.",
      panel: dialog(
        "expense-add-dialog",
        click("expense-add", "Add an Expense", "<b>Add Expenses</b> opens the expense form."),
      ),
    },

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
