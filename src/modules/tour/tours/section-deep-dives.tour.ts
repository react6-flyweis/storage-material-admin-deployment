import type { TourDefinition, TourStepConfig } from "../tour.types";

/**
 * Section deep dives walk a sidebar group page by page. Each step's route is a
 * sidebar entry, so the coordinator first highlights the sidebar clicks that
 * lead there, then highlights the page itself.
 */

const PAGE_CONTENT = '[data-tour="page-content"]';

function pageStep(
  id: string,
  route: string,
  title: string,
  description: string,
  element = PAGE_CONTENT,
): TourStepConfig {
  return { id, route, element, title, description, side: "left", align: "start" };
}

export const plantDeepDiveTour: TourDefinition = {
  id: "plant-deep-dive",
  name: "Plant Deep Dive",
  description: "Every page in the Plant section, from projects to equipment.",
  estimatedMinutes: 6,
  steps: [
    pageStep("step-plant-overview", "/plant", "Plant Overview",
      "Production status, active projects, and delivery health across plants.",
      '[data-tour="plant-overview"]'),
    pageStep("step-plant-projects", "/plant/projects", "Plant Projects",
      "Projects released to the plant, with their fabrication progress."),
    pageStep("step-plant-bom-files", "/plant/uploaded-bom-files", "Uploaded BOM Files",
      "Bills of material uploaded for each project, ready for review."),
    pageStep("step-plant-shipper-quotation", "/plant/shipper-quotation", "Shipper Quotation",
      "Request and compare shipping quotes for finished orders."),
    pageStep("step-plant-load-planning", "/plant/load-planning", "Load Planning",
      "Plan bundles and truck loads so material ships efficiently."),
    pageStep("step-plant-packing-list", "/plant/packing-list", "Packing List",
      "Packing lists generated for each load."),
    pageStep("step-plant-qr-labels", "/plant/qr-labels", "QR Labels",
      "Print QR labels that track bundles from plant to site."),
    pageStep("step-plant-shippers", "/plant/shippers", "Shippers",
      "The shippers you work with and their details."),
    pageStep("step-plant-freight-carriers", "/plant/freight-carriers", "Freight Carriers",
      "Freight carriers available for bidding on loads."),
    pageStep("step-plant-costing", "/plant/costing", "Costing",
      "Material and production costs per project."),
    pageStep("step-plant-savings", "/plant/savings", "Savings",
      "Savings achieved on freight and material."),
    pageStep("step-plant-freight-loads", "/plant/freight-loads", "Freight Loads",
      "Loads open for freight requests and carrier bids."),
    pageStep("step-plant-awarded-loads", "/plant/awarded-loads", "Awarded Loads",
      "Loads already awarded to a carrier."),
    pageStep("step-plant-delivery-calendar", "/plant/delivery-calendar", "Deliveries Calendar",
      "Scheduled deliveries on a calendar."),
    pageStep("step-plant-all-deliveries", "/plant/all-deliveries", "All Deliveries",
      "Every delivery with its status and tracking."),
    pageStep("step-plant-notification-history", "/plant/notification-history", "Notification History",
      "Alerts raised by plant operations."),
    pageStep("step-plant-equipment", "/plant/equipment_management", "Equipment",
      "Plant equipment and its current status."),
    pageStep("step-plant-inventory", "/plant/material_inventory_management", "Material Inventory",
      "Stock levels for raw material and components."),
    pageStep("step-plant-production", "/plant/production_management", "Production Management",
      "Production schedules and work in progress."),
    pageStep("step-plant-maintenance", "/plant/maintenance_logs", "Maintenance Logs",
      "Maintenance history for plant equipment."),
    pageStep("step-plant-upcoming-schedule", "/plant/upcoming_schedule", "Upcoming Schedule",
      "Planned maintenance coming up."),
    pageStep("step-plant-breakdowns", "/plant/breakdown_cases", "Breakdown Cases",
      "Equipment breakdowns and their resolution."),
    pageStep("step-plant-service-providers", "/plant/service_providers", "Service Providers",
      "Vendors that service plant equipment."),
    pageStep("step-plant-equipment-allocation", "/plant/equipment_allocation", "Equipment Allocation",
      "Which equipment is assigned to which job or site."),
    pageStep("step-plant-transfer-requests", "/plant/transfer_requests", "Transfer Requests",
      "Requests to move equipment between locations."),
    pageStep("step-plant-usage-tracking", "/plant/usage_tracking", "Usage Tracking & Logs",
      "Equipment usage hours and logs."),
  ],
};

export const paymentsDeepDiveTour: TourDefinition = {
  id: "payments-deep-dive",
  name: "Payments Deep Dive",
  description: "Payments, approvals, and sales tax pages.",
  estimatedMinutes: 2,
  steps: [
    pageStep("step-payments-overview", "/payments", "Payments Overview",
      "Incoming customer payments and outstanding balances.",
      '[data-tour="payments-overview"]'),
    pageStep("step-payments-tax-filing", "/payments/sales-tax-filing", "Tax & Filing",
      "Sales tax collected and filing status."),
    pageStep("step-payments-state-tax", "/payments/state-wise-tax", "State-wise Tax",
      "Sales tax broken down by state."),
    pageStep("step-payments-project-tax", "/payments/project-wise-tax", "Project-wise Tax",
      "Sales tax broken down by project."),
    pageStep("step-payments-approvals", "/payments/payment-approvals", "Payment Approvals",
      "Payments waiting for admin approval."),
    pageStep("step-payments-status", "/payments/payment-status", "Payment Status",
      "Payment status across every project."),
  ],
};

export const invoicesDeepDiveTour: TourDefinition = {
  id: "invoices-deep-dive",
  name: "Invoices Deep Dive",
  description: "Creating invoices and reviewing customer, vendor, and carrier invoices.",
  estimatedMinutes: 2,
  steps: [
    pageStep("step-invoices-create", "/invoice", "Create Invoice",
      "Build a new customer invoice."),
    pageStep("step-invoices-list", "/invoice/list", "Invoice List",
      "Every customer invoice with its payment status.",
      '[data-tour="invoices-table"]'),
    pageStep("step-invoices-vendor", "/invoice/invoices-management", "Vendor Invoices",
      "Invoices received from vendors."),
    pageStep("step-invoices-carrier", "/invoice/carrier-invoices", "Freight Carrier Invoices",
      "Invoices received from freight carriers."),
  ],
};

export const constructionDeepDiveTour: TourDefinition = {
  id: "construction-deep-dive",
  name: "Construction Deep Dive",
  description: "On-site projects, drawings, deliveries, tasks, and materials.",
  estimatedMinutes: 2,
  steps: [
    pageStep("step-construction-dashboard", "/construction", "Construction Dashboard",
      "On-site progress, deliveries, and open issues at a glance.",
      '[data-tour="construction-dashboard"]'),
    pageStep("step-construction-projects", "/construction/projects", "Project & Calendar",
      "Construction projects and their schedule."),
    pageStep("step-construction-drawings", "/construction/drawing-attachment", "Drawing & Attachment",
      "Drawings and files shared with site crews."),
    pageStep("step-construction-deliveries", "/construction/all-deliveries", "All Deliveries",
      "Material deliveries arriving on site."),
    pageStep("step-construction-tasks", "/construction/tasks", "Tasks & Progress",
      "Site tasks and how far along they are."),
    pageStep("step-construction-materials", "/construction/materials", "Material Request",
      "Material requests raised from the site."),
    pageStep("step-construction-mismatch", "/construction/mismatch-orders", "Mismatch Orders",
      "Deliveries that didn't match what was ordered."),
  ],
};

export const financeDeepDiveTour: TourDefinition = {
  id: "finance-deep-dive",
  name: "Finance Deep Dive",
  description: "Profitability, expenses, freight costs, margins, and budgets.",
  estimatedMinutes: 2,
  steps: [
    pageStep("step-finance-overview", "/finance", "Financial Overview",
      "Revenue, expenses, and profit for the selected period.",
      '[data-tour="finance-overview"]'),
    pageStep("step-finance-wip", "/finance/wip-profits", "WIP Profits",
      "Profit on work that is still in progress."),
    pageStep("step-finance-expenses", "/finance/expenses", "Expense Management",
      "Record and review company expenses."),
    pageStep("step-finance-pnl", "/finance/profit-loss", "Profit and Loss",
      "The profit and loss statement."),
    pageStep("step-finance-freight", "/finance/freight-cost-tracking", "Freight Cost Tracking",
      "Freight spend per load and per project."),
    pageStep("step-finance-margins", "/finance/margin-analysis", "Margin Analysis",
      "Margins by project, product, and business unit."),
    pageStep("step-finance-budget", "/finance/budget-actual", "Budget vs Actual",
      "Planned budgets compared with actual spend."),
  ],
};
