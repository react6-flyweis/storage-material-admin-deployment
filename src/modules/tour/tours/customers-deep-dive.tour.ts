import type { TourDefinition } from "../tour.types";

const CLICK_OR_NEXT = "Click it yourself, or press Next and we'll do it for you.";
const CUSTOMER_ROUTE = "/customers/:customerId";

export const customersDeepDiveTour: TourDefinition = {
  id: "customers-deep-dive",
  name: "Customers Deep Dive",
  description:
    "The customers page, its filters and row actions, then a customer's workspace, projects, invoices, and documents.",
  estimatedMinutes: 4,
  steps: [
    // ── Customers page ─────────────────────────────────────────────────────
    {
      id: "step-customers-page",
      route: "/customers",
      element: '[data-tour="customers-page"]',
      title: "Customer Management",
      description:
        "Every customer account in one place: KPIs at the top, the customer list below, and a legend explaining each status.",
      speechText:
        "This is customer management. Let's go through it piece by piece.",
      side: "left",
      align: "start",
    },
    {
      id: "step-customers-period",
      route: "/customers",
      element: '[data-tour="period-filter"]',
      title: "Time Period",
      description:
        "Switch between <b>Today</b>, <b>Week</b>, <b>Month</b>, and <b>All Time</b> to change the period the KPI cards cover.",
      speechText: "Pick the time period the customer KPIs cover.",
      side: "bottom",
    },
    {
      id: "step-customers-stats",
      route: "/customers",
      element: '[data-tour="customers-stats-cards"]',
      title: "Customer KPIs",
      description:
        "Totals for customers and their projects. These cards are clickable: pick one to switch the view below, for example to projects in execution, completed, or unassigned projects. Click it again to go back to the list.",
      speechText:
        "These cards summarize customers and projects. Click a card to switch the view below.",
      side: "bottom",
    },
    {
      id: "step-add-customer",
      route: "/customers",
      element: '[data-tour="add-customer-btn"]',
      title: "Add New Customer",
      description:
        "Create a customer account directly. Email and phone are optional.",
      speechText: "Create a new customer account from here.",
      side: "left",
    },
    {
      id: "step-customers-filters",
      route: "/customers",
      element: '[data-tour="customers-filters"]',
      title: "Date & Status Filters",
      description:
        "Limit the list to a date range, or show only <b>Active</b> or <b>Inactive</b> accounts.",
      speechText: "Filter customers by date range and account status.",
      side: "bottom",
      align: "end",
      optional: true,
    },
    {
      id: "step-customers-search",
      route: "/customers",
      element: '[data-tour="customers-search"]',
      title: "Search Customers",
      description:
        "Find a customer by name, ID, email, or phone. Use <b>Rows Per Page</b> on the left to show more at once.",
      speechText: "Search customers by name, ID, email, or phone.",
      side: "bottom",
      align: "end",
      optional: true,
    },
    {
      id: "step-customers-table",
      route: "/customers",
      element: '[data-tour="customers-table"]',
      title: "Customer List",
      description:
        "Each row shows the customer ID, name, contact details, assigned plant, number of projects, and account status.",
      speechText:
        "Each row shows a customer's contact details, plant, projects, and status.",
      side: "top",
    },
    {
      id: "step-customer-row-actions",
      route: "/customers",
      element: '[data-tour="customer-row-actions"]',
      title: "Row Actions",
      description:
        "This menu holds every action for a customer: <b>View Details</b>, <b>View Projects</b>, <b>Edit Customer</b>, and <b>Deactivate</b> or <b>Reactivate Account</b>.",
      speechText:
        "Open this menu to view, edit, or deactivate a customer. Next, we'll open a customer's details.",
      side: "left",
      optional: true,
    },

    // ── Customer workspace ─────────────────────────────────────────────────
    {
      id: "step-customer-detail",
      route: CUSTOMER_ROUTE,
      element: '[data-tour="customer-detail-workspace"]',
      title: "Customer Workspace",
      description:
        "This is what <b>View Details</b> opens: everything about one customer on a single page.",
      speechText:
        "This is the customer workspace, everything about one customer on a single page.",
      side: "left",
      align: "start",
    },
    {
      id: "step-customer-detail-actions",
      route: CUSTOMER_ROUTE,
      element: '[data-tour="customer-detail-actions"]',
      title: "Customer Actions",
      description:
        "<b>Message Customer</b> opens a chat (once they have a portal login), <b>Edit</b> updates their details, <b>Create new Project</b> starts a project, and <b>Schedule Meeting</b> books time with them.",
      speechText:
        "Message the customer, edit their details, create a project, or schedule a meeting.",
      side: "bottom",
      align: "end",
    },
    {
      id: "step-customer-profile",
      route: CUSTOMER_ROUTE,
      element: '[data-tour="customer-profile-card"]',
      title: "Profile",
      description:
        "Status, customer ID, join date, phone, email, and address.",
      speechText: "The profile card shows the customer's status and contact details.",
      side: "bottom",
    },
    {
      id: "step-customer-stats",
      route: CUSTOMER_ROUTE,
      element: '[data-tour="customer-detail-stats"]',
      title: "Account Totals",
      description:
        "<b>Total Paid</b>, <b>Pending Payment</b>, <b>Total Invoices</b>, and <b>Revenue Generated</b> for this customer.",
      speechText:
        "See what this customer has paid, what's pending, their invoices, and revenue.",
      side: "bottom",
    },
    {
      id: "step-customer-tabs",
      route: CUSTOMER_ROUTE,
      element: '[data-tour="customer-detail-tabs"]',
      title: "Projects & Documents",
      description:
        "The <b>Projects</b> tab shows projects, invoices, and photos. <b>Customer Documents</b> holds the customer's files.",
      speechText: "Switch between projects and customer documents here.",
      side: "bottom",
    },
    {
      id: "step-customer-projects",
      route: CUSTOMER_ROUTE,
      element: '[data-tour="customer-projects-card"]',
      title: "Customer Projects",
      description:
        "Every project for this customer with its budget, status, and start date. <b>View All</b> opens the full project list.",
      speechText: "These are the customer's projects with budget and status.",
      side: "top",
    },
    {
      id: "step-customer-invoices",
      route: CUSTOMER_ROUTE,
      element: '[data-tour="customer-invoices-card"]',
      title: "Invoice List",
      description:
        "Invoices with amount, paid, and amount due. Export to PDF or Excel, print, or mark an unpaid invoice as paid.",
      speechText:
        "Track this customer's invoices, export them, or mark them as paid.",
      side: "top",
    },
    {
      id: "step-customer-project-details",
      route: "/customers/:customerId/project-details/:projectId",
      element: '[data-tour="customer-project-details"]',
      title: "Project Details",
      description:
        "A single project's full picture: specs, lifecycle, BOM, drawings, delivery, and payments.",
      speechText:
        "Project details show everything about one project, from specs to delivery.",
      side: "left",
      align: "start",
      via: {
        fromRoute: CUSTOMER_ROUTE,
        element: '[data-tour="customer-project-view-btn"]',
        title: "Open a Project",
        description: `Click the <b>eye icon</b> on a project to open its details. ${CLICK_OR_NEXT}`,
        speechText: "Click the eye icon to open a project.",
      },
    },
    {
      id: "step-customer-documents",
      route: `${CUSTOMER_ROUTE}?tab=documents`,
      element: '[data-tour="customer-tab-content-documents"]',
      title: "Customer Documents",
      description:
        "Contracts, drawings, and other files for this customer, across all their projects.",
      speechText: "Customer documents keeps every file for this customer.",
      side: "top",
      via: {
        fromRoute: CUSTOMER_ROUTE,
        element: '[data-tour="customer-tab-trigger-documents"]',
        title: "Open Customer Documents",
        description: `Click the <b>Customer Documents</b> tab. ${CLICK_OR_NEXT}`,
        speechText: "Click the customer documents tab.",
      },
    },

    {
      id: "step-customers-tour-hub",
      route: "",
      element: '[data-tour="tour-hub-btn"]',
      title: "Replay Anytime",
      description:
        "Open this help menu to replay the customers deep dive whenever you need it.",
      speechText: "Open this help menu anytime to replay the customers deep dive.",
      side: "bottom",
      align: "end",
    },
  ],
};
