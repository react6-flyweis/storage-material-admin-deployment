import type { TourPageIntro } from "../tour.types";

/**
 * Shown over the whole page the first time a tour reaches it, before the tour
 * goes through its sections. Keyed by step route, without the query string.
 */
export const PAGE_INTROS: Partial<Record<string, TourPageIntro>> = {
  "/dashboard": {
    title: "Admin Dashboard",
    description: "The whole business on one page: sales, deliveries, finance, construction and plant. Next, we'll go through each section.",
  },
  "/leads": {
    title: "Leads",
    description: "Every lead in the pipeline, with its stats, filters and actions. Next, we'll go through each section.",
    coveredBy: '[data-tour="leads-page"]',
  },
  "/leads/add": {
    title: "Add a Lead",
    description: "The form that records a new lead and assigns it to your pipeline.",
  },
  "/leads/:leadId": {
    title: "Lead Workspace",
    description: "Everything about one lead: its details, actions and tabs. Next, we'll go through each section.",
    coveredBy: '[data-tour="lead-details-content"]',
  },
  "/leads/quotation-list": {
    title: "Quotations",
    description: "Every quotation created for your leads, with its approval status and actions.",
    coveredBy: '[data-tour="quotations-list-table"]',
  },
  "/leads/purchase-orders": {
    title: "Purchase Orders",
    description: "Every purchase order, with its approval status and plant assignment.",
    coveredBy: '[data-tour="purchase-orders-table"]',
  },
  "/leads/purchase-orders/:poId": {
    title: "Purchase Order Details",
    description: "One purchase order with its customer, project and approval.",
  },
  "/leads/escalated": {
    title: "Escalated Leads",
    description: "Every lead the sales team has escalated, with the reason and who resolves it.",
    coveredBy: '[data-tour="escalated-leads-table"]',
  },
  "/customers": {
    title: "Customers",
    description: "Every customer, with their stats, filters and actions. Next, we'll go through each section.",
    coveredBy: '[data-tour="customers-page"]',
  },
  "/customers/:customerId": {
    title: "Customer Workspace",
    description: "Everything about one customer: their profile, projects, invoices and documents. Next, we'll go through each section.",
    coveredBy: '[data-tour="customer-detail-workspace"]',
  },
  "/payments/payment-approvals": {
    title: "Payment Approvals",
    description: "Every payment waiting for review, with totals on top and the list below.",
    coveredBy: '[data-tour="page-content"]',
  },
  "/invoice/invoices-management": {
    title: "Vendor Invoices",
    description: "Invoices received from vendors, with their approval status.",
    coveredBy: '[data-tour="page-content"]',
  },
  "/invoice/carrier-invoices": {
    title: "Freight Carrier Invoices",
    description: "Invoices received from freight carriers, with their approval status.",
    coveredBy: '[data-tour="page-content"]',
  },
  "/finance/expenses": {
    title: "Expense Management",
    description: "Every business expense, with totals on top and the list below.",
    coveredBy: '[data-tour="page-content"]',
  },
  "/construction/materials": {
    title: "Material Requests",
    description: "Every material request raised from the site, with its approval status.",
    coveredBy: '[data-tour="page-content"]',
  },
};
