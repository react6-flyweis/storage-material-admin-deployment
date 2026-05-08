import type { RouteObject } from "react-router";
import { lazy } from "react";
import { NotFound } from "@/pages/not-found";
import { AdminLayout } from "@/components/admin-layout";
import { ProtectedRoute, PublicOnlyRoute } from "@/modules/auth/auth.guards";

const SignIn = lazy(() => import("@/pages/sign-in"));
const Notifications = lazy(() => import("@/pages/notifications"));
const Communication = lazy(() => import("@/pages/communication"));
const AIChat = lazy(() => import("@/pages/communication-ai-chat"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Settings = lazy(() => import("@/pages/settings"));
const Profile = lazy(() => import("@/pages/profile"));
const RolePermissions = lazy(() => import("@/pages/role-permissions"));

// Dashboard section
const Dashboard = lazy(() => import("@/pages/dashboard/dashboard"));
const SalesTaxReportingLegacy = lazy(
  () => import("@/pages/dashboard/sales-tax-reporting"),
);
const SalesTaxFiling = lazy(() => import("@/pages/dashboard/sales-tax-filing"));
const StateWiseTax = lazy(() => import("@/pages/dashboard/state-wise-tax"));
const PipelineStages = lazy(() => import("@/pages/dashboard/pipeline-stages"));

// customers section
const Customers = lazy(() => import("@/pages/customers/customers"));
const CustomerInsights = lazy(
  () => import("@/pages/customers/customer-insights"),
);
const CustomerInfo = lazy(
  () => import("@/pages/customers/customer-detail/customer-info"),
);
const CustomerPayments = lazy(
  () => import("@/pages/customers/customer-detail/customer-payments"),
);
const CustomerStatus = lazy(
  () => import("@/pages/customers/customer-detail/customer-status"),
);
const CustomerOrder = lazy(
  () => import("@/pages/customers/customer-detail/customer-order"),
);
const CustomerProjects = lazy(
  () => import("@/pages/customers/customer-detail/all-projects"),
);
const ProjectDetails = lazy(
  () => import("@/pages/customers/customer-detail/project-details"),
);
const ProjectInvoices = lazy(
  () => import("@/pages/customers/customer-detail/project-invoices"),
);
const MaterialDelivery = lazy(
  () => import("@/pages/customers/customer-detail/material-delivery"),
);
const ProjectPayments = lazy(
  () => import("@/pages/customers/customer-detail/project-payments"),
);
const ProjectBomFiles = lazy(
  () => import("@/pages/customers/customer-detail/project-bom-files"),
);
const ProjectDrawings = lazy(
  () => import("@/pages/customers/customer-detail/project-drawings"),
);
const ProjectShipperFiles = lazy(
  () => import("@/pages/customers/customer-detail/project-shipper-files"),
);
const ProjectQuotation = lazy(
  () => import("@/pages/customers/customer-detail/project-quotation"),
);
const BudgetPlanning = lazy(() => import("@/pages/customers/budget-planning"));
const AddNewProjectPage = lazy(
  () => import("@/pages/customers/customer-detail/add-new-project"),
);
const EditCustomerDetailsPage = lazy(
  () => import("@/pages/customers/edit-customer-details"),
);
const Contracts = lazy(() => import("@/pages/customers/contracts"));
const ContractDetail = lazy(() => import("@/pages/customers/contract-detail"));
const Meetings = lazy(() => import("@/pages/customers/meetings"));
const ScheduleMeeting = lazy(
  () => import("@/pages/customers/schedule-meeting"),
);
const TerminatedProjects = lazy(
  () => import("@/pages/customers/terminated-projects"),
);

// leads section
const Leads = lazy(() => import("@/pages/leads/leads"));
const AddNewLead = lazy(() => import("@/pages/leads/add-new-lead"));
const EditLead = lazy(() => import("@/pages/leads/edit-lead"));
const FollowUp = lazy(() => import("@/pages/leads/follow-up"));
const LeadCommunicationTimelinePage = lazy(
  () => import("@/pages/leads/lead-communication-timeline"),
);
const SingleLeadTimelinePage = lazy(
  () => import("@/pages/leads/single-lead-timeline"),
);
const SingleLeadEmailsPage = lazy(
  () => import("@/pages/leads/single-lead-emails"),
);
const SingleLeadChatsPage = lazy(
  () => import("@/pages/leads/single-lead-chats"),
);
const SmartReminders = lazy(() => import("@/pages/leads/smart-reminders"));
const SmartReminderDetail = lazy(() => import("@/pages/leads/single-reminder"));
const SingleLeadNotesPage = lazy(
  () => import("@/pages/leads/single-lead-notes"),
);
const SingleLeadCallsPage = lazy(
  () => import("@/pages/leads/single-lead-calls"),
);
const LeadPaymentsPage = lazy(() => import("@/pages/leads/lead-payments"));
const AiScriptGeneratorPage = lazy(
  () => import("@/pages/leads/ai-script-generator"),
);
const LeadScoring = lazy(() => import("@/pages/leads/lead-scoring"));
const FollowUpKpis = lazy(() => import("@/pages/leads/follow-up-kpis"));
const AIMarketing = lazy(() => import("@/pages/leads/ai-marketing"));
const EscalatedLeads = lazy(() => import("@/pages/leads/escalated-leads"));
const AllPurchaseOrders = lazy(
  () => import("@/pages/leads/all-purchase-orders"),
);
const PurchaseOrderDetails = lazy(
  () => import("@/pages/leads/purchase-order-details"),
);
const QuotationList = lazy(() => import("@/pages/leads/quotation-list"));
const QuotationDetails = lazy(() => import("@/pages/leads/quotation-details"));

// employees section
const Employees = lazy(() => import("@/pages/employees/employees"));
const EmployeeProfile = lazy(
  () => import("@/pages/employees/employee-profile"),
);
const EmployeePerformance = lazy(
  () => import("@/pages/employees/employee-performance"),
);
const EmployeeAuditLog = lazy(() => import("@/pages/employees/audit-log"));

// Payments section
const Payments = lazy(() => import("@/pages/payments/payments"));
const PaymentApprovals = lazy(
  () => import("@/pages/payments/payment-approvals"),
);
const SalesTaxReporting = lazy(
  () => import("@/pages/payments/sales-tax-reporting"),
);
const DetailedTaxReportPage = lazy(
  () => import("@/pages/payments/detailed-tax-report"),
);
const PaymentTaxationPage = lazy(() => import("@/pages/payments/taxation"));
const ProjectWiseTaxPage = lazy(
  () => import("@/pages/dashboard/project-wise-tax"),
);
const CustomerPaymentProfile = lazy(
  () => import("@/pages/payments/customer-payment-profile"),
);
const PaymentStatusDashboard = lazy(
  () => import("@/pages/payments/payment-status-dashboard"),
);

// Invoice section
const InvoiceForm = lazy(() => import("@/pages/invoices/invoice-form"));
const InvoiceList = lazy(() => import("@/pages/invoices/invoice-list"));
const SalesGrowth = lazy(() => import("@/pages/invoices/sales-growth"));
const InvoicePreviewPage = lazy(
  () => import("@/pages/invoices/invoice-preview"),
);
const InvoicesManagementPage = lazy(
  () => import("@/pages/invoices/invoices-management"),
);
const CarrierInvoices = lazy(() => import("@/pages/invoices/carrier-invoices"));

// plant management section
const EquipmentView = lazy(() => import("@/plant/components/EquipmentView"));
const MaterialInventoryView = lazy(
  () =>
    import("@/plant/components/material_inventory_management/MaterialInventoryView"),
);
const ProductionManagementView = lazy(
  () => import("@/plant/components/ProductionManagementView"),
);
const MaintenanceAndSchedulingView = lazy(
  () =>
    import("@/plant/components/maintenance_and_scheduling/MaintenanceAndSchedulingView"),
);
const UpcomingScheduleView = lazy(
  () =>
    import("@/plant/components/maintenance_and_scheduling/UpcomingScheduleView"),
);
const BreakdownCasesView = lazy(
  () =>
    import("@/plant/components/maintenance_and_scheduling/BreakdownCasesView"),
);
const ServiceProvidersView = lazy(
  () =>
    import("@/plant/components/maintenance_and_scheduling/ServiceProvidersView"),
);
const EquipmentAllocationView = lazy(
  () =>
    import("@/plant/components/equipment_allocation/EquipmentAllocationView"),
);
const TransferRequestsView = lazy(
  () => import("@/plant/components/equipment_allocation/TransferRequestsView"),
);
const UsageTrackingView = lazy(
  () => import("@/plant/components/equipment_allocation/UsageTrackingView"),
);
const PlantDashboard = lazy(() => import("@/plant/pages/PlantPage"));

// Financial Accounts section

const PaymentOverview = lazy(
  () => import("@/modules/accounts/pages/PaymentOverview"),
);
const OrdersAndPaymentsPage = lazy(
  () => import("@/modules/accounts/pages/OrdersAndPaymentsPage"),
);
const WipProfitPage = lazy(
  () => import("@/modules/accounts/pages/analysis/WipProfitPage"),
);
const CogsAnalysis = lazy(
  () => import("@/modules/accounts/pages/analysis/CogsAnalysis"),
);
const ExpensesPage = lazy(
  () => import("@/modules/accounts/pages/management/ExpensesPage"),
);
const ProductLibrary = lazy(
  () => import("@/pages/product-library/product-library"),
);
const IncomePage = lazy(
  () => import("@/modules/accounts/pages/management/IncomePage"),
);
const LaborExpensesPage = lazy(
  () => import("@/modules/accounts/pages/management/LaborExpensesPage"),
);
const AccountsDashboard = lazy(
  () => import("@/modules/accounts/pages/Dashboard"),
);
const NewInvoice = lazy(() => import("@/modules/accounts/pages/NewInvoice"));
const InvoicePreview = lazy(
  () => import("@/modules/accounts/pages/InvoicePreview"),
);
const FinancialReportPage = lazy(
  () => import("@/modules/accounts/pages/management/FinancialReportPage"),
);
const TaxationPage = lazy(
  () => import("@/modules/accounts/pages/management/TaxationPage"),
);

// Construction Panel (lazy imports)
const ConstructionDashboard = lazy(
  () => import("@/modules/construction/pages/Dashboard"),
);
const Projects = lazy(() => import("@/modules/construction/pages/Projects"));
const Tasks = lazy(() => import("@/modules/construction/pages/Tasks"));
const Materials = lazy(() => import("@/modules/construction/pages/Materials"));
const Reports = lazy(() => import("@/modules/construction/pages/Reports"));
const MaterialsViewPage = lazy(
  () => import("@/modules/construction/pages/MaterialsViewPage"),
);
const ProjectViewPage = lazy(
  () => import("@/modules/construction/pages/ProjectViewPage"),
);
const DrawingAttachment = lazy(
  () => import("@/modules/construction/pages/DrawingAttachment"),
);

export const adminRoutes: RouteObject[] = [
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "sales-tax-filing", element: <SalesTaxFiling /> },
          { path: "pipeline-stages", element: <PipelineStages /> },
          { path: "sales-tax", element: <SalesTaxReportingLegacy /> },
          { path: "product-library", element: <ProductLibrary /> },

          // leads routes
          {
            path: "leads",
            children: [
              { index: true, element: <Leads /> },
              { path: "add", element: <AddNewLead /> },
              { path: "escalated", element: <EscalatedLeads /> },
              { path: "ai-marketing", element: <AIMarketing /> },
              {
                path: "purchase-orders",
                children: [
                  { index: true, element: <AllPurchaseOrders /> },
                  { path: ":poId", element: <PurchaseOrderDetails /> },
                ],
              },
              { path: "quotation-list", element: <QuotationList /> },
              { path: "quotation-details", element: <QuotationDetails /> },
              { path: "quotation-details/:id", element: <QuotationDetails /> },

              // /leads/follow-up routes
              {
                path: "follow-up",
                children: [
                  { index: true, element: <FollowUp /> },
                  {
                    path: "communication-timeline",
                    element: <LeadCommunicationTimelinePage />,
                  },
                  {
                    path: "script-generator",
                    element: <AiScriptGeneratorPage />,
                  },
                  {
                    path: "scoring",
                    element: <LeadScoring />,
                  },
                  {
                    path: "kpis",
                    element: <FollowUpKpis />,
                  },
                  {
                    path: "smart-reminders",
                    children: [
                      { index: true, element: <SmartReminders /> },
                      {
                        path: ":id",
                        element: <SmartReminderDetail />,
                      },
                    ],
                  },
                  { path: "insights", element: <CustomerInsights /> },
                ],
              },

              // /leads/:leadId routes
              {
                path: ":leadId",
                children: [
                  { path: "edit", element: <EditLead /> },
                  { path: "timeline", element: <SingleLeadTimelinePage /> },
                  {
                    path: "emails",
                    element: <SingleLeadEmailsPage />,
                  },
                  {
                    path: "chats",
                    element: <SingleLeadChatsPage />,
                  },
                  {
                    path: "notes",
                    element: <SingleLeadNotesPage />,
                  },
                  {
                    path: "calls",
                    element: <SingleLeadCallsPage />,
                  },
                  {
                    path: "payments",
                    element: <LeadPaymentsPage />,
                  },
                ],
              },
            ],
          },

          // customers routes
          {
            path: "customers",
            children: [
              { index: true, element: <Customers /> },
              // /customers/meetings routes
              {
                path: "meetings",
                children: [
                  { index: true, element: <Meetings /> },
                  { path: "schedule", element: <ScheduleMeeting /> },
                  {
                    path: "reschedule/:id",
                    element: <ScheduleMeeting />,
                  },
                ],
              },
              {
                path: "contracts",
                children: [
                  { index: true, element: <Contracts /> },
                  { path: ":id", element: <ContractDetail /> },
                ],
              },
              { path: "terminated-projects", element: <TerminatedProjects /> },

              // /customers/:id routes
              {
                path: ":id",
                children: [
                  { index: true, element: <CustomerInfo /> },
                  { path: "payments", element: <CustomerPayments /> },
                  { path: "status", element: <CustomerStatus /> },
                  { path: "order", element: <CustomerOrder /> },
                  { path: "projects", element: <CustomerProjects /> },
                  { path: "project-details", element: <ProjectDetails /> },
                  { path: "project-invoices", element: <ProjectInvoices /> },
                  { path: "material-delivery", element: <MaterialDelivery /> },
                  {
                    path: "project-shipper-files",
                    element: <ProjectShipperFiles />,
                  },
                  { path: "project-quotation", element: <ProjectQuotation /> },
                  { path: "project-payments", element: <ProjectPayments /> },
                  { path: "project-bom", element: <ProjectBomFiles /> },
                  { path: "project-drawings", element: <ProjectDrawings /> },
                  { path: "budget-planning", element: <BudgetPlanning /> },
                ],
              },
              { path: ":id/edit", element: <EditCustomerDetailsPage /> },
              { path: ":id/projects/new", element: <AddNewProjectPage /> },
            ],
          },

          //  payments routes
          {
            path: "payments",
            children: [
              { index: true, element: <Payments /> },
              {
                path: "payment-status-dashboard",
                element: <PaymentStatusDashboard />,
              },
              { path: "payment-approvals", element: <PaymentApprovals /> },
              { path: "sales-tax-reporting", element: <SalesTaxReporting /> },
              { path: "sales-tax-filing", element: <SalesTaxFiling /> },
              { path: "state-wise-tax", element: <StateWiseTax /> },
              { path: "project-wise-tax", element: <ProjectWiseTaxPage /> },
              {
                path: "detailed-tax-report",
                element: <DetailedTaxReportPage />,
              },
              { path: "taxation", element: <PaymentTaxationPage /> },
              {
                path: "customer/:customerId",
                element: <CustomerPaymentProfile />,
              },
            ],
          },

          // employees routes
          {
            path: "employees",
            children: [
              { index: true, element: <Employees /> },
              { path: "performance", element: <EmployeePerformance /> },
              { path: "audit-log", element: <EmployeeAuditLog /> },
              { path: ":id", element: <EmployeeProfile /> },
            ],
          },

          // global routes
          { path: "notifications", element: <Notifications /> },
          {
            path: "communication",
            children: [
              { index: true, element: <Communication /> },
              { path: "ai-chat", element: <AIChat /> },
            ],
          },
          {
            path: "analytics",
            element: <Analytics />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "role-permissions",
            element: <RolePermissions />,
          },

          // invoice routes
          {
            path: "invoice",
            children: [
              { index: true, element: <InvoiceForm /> },
              { path: "list", element: <InvoiceList /> },
              { path: "preview", element: <InvoicePreviewPage /> },
              {
                path: "invoices-management",
                element: <InvoicesManagementPage />,
              },
              {
                path: "carrier-invoices",
                element: <CarrierInvoices />,
              },
              { path: "new", element: <InvoiceForm /> },
              { path: ":id", element: <InvoiceForm /> },
              { path: "sales-growth", element: <SalesGrowth /> },
            ],
          },

          //plants routes
          {
            path: "plant",
            children: [
              { index: true, element: <PlantDashboard /> },
              { path: "equipment_management", element: <EquipmentView /> },
              {
                path: "material_inventory_management",
                element: <MaterialInventoryView />,
              },
              {
                path: "production_management",
                element: <ProductionManagementView />,
              },
              {
                path: "maintenance_logs",
                element: <MaintenanceAndSchedulingView />,
              },
              {
                path: "upcoming_schedule",
                element: <UpcomingScheduleView />,
              },
              {
                path: "breakdown_cases",
                element: <BreakdownCasesView />,
              },
              {
                path: "service_providers",
                element: <ServiceProvidersView />,
              },
              {
                path: "equipment_allocation",
                element: <EquipmentAllocationView />,
              },
              {
                path: "transfer_requests",
                element: <TransferRequestsView />,
              },
              {
                path: "usage_tracking",
                element: <UsageTrackingView />,
              },
            ],
          },

          // Financial accounts routes
          {
            path: "/accounts",
            children: [
              { index: true, element: <AccountsDashboard /> },
              {
                path: "",
                element: <AccountsDashboard />,
              },
              {
                path: "payment_overview",
                element: <PaymentOverview />,
              },
              {
                path: "payments/new-invoice",
                element: <NewInvoice />,
              },
              {
                path: "payments/invoice/preview",
                element: <InvoicePreview />,
              },
              {
                path: "order_payments",
                element: <OrdersAndPaymentsPage />,
              },
              {
                path: "cogs_analysis",
                element: <CogsAnalysis />,
              },

              {
                path: "expenses",
                element: <ExpensesPage />,
              },
              {
                path: "wip_profit",
                element: <WipProfitPage />,
              },
              {
                path: "reports",
                element: <FinancialReportPage />,
              },
              {
                path: "taxation",
                element: <TaxationPage />,
              },
              {
                path: "income",
                element: <IncomePage />,
              },
              {
                path: "labor_expenses",
                element: <LaborExpensesPage />,
              },
            ],
          },

          // Construction Panel routes
          {
            path: "construction",
            children: [
              { index: true, element: <ConstructionDashboard /> },
              { path: "projects", element: <Projects /> },
              { path: "project-view-page", element: <ProjectViewPage /> },
              { path: "drawing-attachment", element: <DrawingAttachment /> },
              { path: "tasks", element: <Tasks /> },
              { path: "materials", element: <Materials /> },
              { path: "material-view-page", element: <MaterialsViewPage /> },
              { path: "reports", element: <Reports /> },
            ],
          },

          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];
