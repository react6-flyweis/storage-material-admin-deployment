import type { RouteObject } from "react-router";
import { lazy } from "react";
import { NotFound } from "@/pages/not-found";
import { AdminLayout } from "@/components/admin-layout";
import { ProtectedRoute, PublicOnlyRoute } from "@/modules/auth/auth.guards";

const SignIn = lazy(() => import("@/pages/sign-in"));
const ForgotPassword = lazy(() => import("../pages/forgot-password"));
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
const RescheduleMeeting = lazy(
  () => import("@/pages/customers/reschedule-meeting"),
);
const TerminatedProjects = lazy(
  () => import("@/pages/customers/terminated-projects"),
);

// leads section
const Leads = lazy(() => import("@/pages/leads/leads"));
const LeadDetails = lazy(() => import("@/pages/leads/lead-details"));
const AssignPerson = lazy(() => import("@/pages/leads/actions/assign-person"));
const CallHistory = lazy(() => import("@/pages/leads/actions/call-history"));
const OrderLifecycle = lazy(() => import("@/pages/leads/actions/order-lifecycle"));
const LeadDocuments = lazy(() => import("@/pages/leads/actions/documents"));
const LeadChats = lazy(() => import("@/pages/leads/actions/chats"));
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
const ActivityLogPage = lazy(() => import("@/pages/leads/activity-log"));
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
const RFQPage = lazy(() => import("@/pages/leads/rfq"));

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

const ProductLibrary = lazy(
  () => import("@/pages/product-library/product-library"),
);

// Finance
const FinancialOverview = lazy(
  () => import("@/pages/finance/financial-overview"),
);
const WipProfitsPage = lazy(() => import("@/pages/finance/wip-profits"));
const ProfitLossPage = lazy(() => import("@/pages/finance/profit-loss"));
const ExpensesManagement = lazy(
  () => import("@/pages/finance/expenses-management"),
);
const FreightCostTracking = lazy(
  () => import("@/pages/finance/freight-cost-tracking"),
);
const MarginAnalysisPage = lazy(
  () => import("@/pages/finance/margin-analysis"),
);
const BudgetActualPage = lazy(() => import("@/pages/finance/budget-actual"));

// Invoice section
const InvoiceForm = lazy(() => import("@/pages/invoices/invoice-form"));
const EditInvoice = lazy(() => import("@/pages/invoices/edit-invoice"));
const InvoiceList = lazy(() => import("@/pages/invoices/invoice-list"));
// const SalesGrowth = lazy(() => import("@/pages/invoices/sales-growth"));
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
const PlantOverview = lazy(() => import("@/plant/pages/PlantOverview"));
const AllDeliveries = lazy(() => import("@/plant/pages/AllDeliveries"));
const LoadPlanning = lazy(() => import("@/plant/pages/LoadPlanning"));
const LoadPlanningProject = lazy(() => import("@/plant/pages/LoadPlanningProject"));
const LoadPlanDetails = lazy(() => import("@/plant/pages/LoadPlanDetails"));
const ShipperQuotation = lazy(() => import("@/plant/pages/ShipperQuotation"));
const ShipperQuotationProject = lazy(() => import("@/plant/pages/ShipperQuotationProject"));
const ShipperFileDetails = lazy(() => import("@/plant/pages/ShipperFileDetails"));
const OrderVerification = lazy(() => import("@/plant/pages/OrderVerification"));
const PackingList = lazy(() => import("@/plant/pages/PackingList"));
const PackingListProject = lazy(() => import("@/plant/pages/PackingListProject"));
const PackingListDetails = lazy(() => import("@/plant/pages/PackingListDetails"));
const QrLabels = lazy(() => import("@/plant/pages/QrLabels"));
const QrLabelsProject = lazy(() => import("@/plant/pages/QrLabelsProject"));
const ShippersList = lazy(() => import("@/plant/pages/ShippersList"));
const AddShipper = lazy(() => import("@/plant/pages/AddShipper"));
const ShipperDetails = lazy(() => import("@/plant/pages/ShipperDetails"));
const EditShipper = lazy(() => import("@/plant/pages/EditShipper"));
const FreightCarriersList = lazy(() => import("@/plant/pages/FreightCarriersList"));
const AddFreightCarrier = lazy(() => import("@/plant/pages/AddFreightCarrier"));
const EditFreightCarrier = lazy(() => import("@/plant/pages/EditFreightCarrier"));
const FreightCarrierDetails = lazy(() => import("@/plant/pages/FreightCarrierDetails"));
const PlantDashboard = lazy(() => import("@/plant/pages/PlantPage"));
const ItemCostList = lazy(() => import("@/plant/pages/ItemCostList"));
const BOMFileDetails = lazy(() => import("@/plant/pages/BOMFileDetails"));
const FreightLoads = lazy(() => import("@/plant/pages/FreightLoads"));
const FreightRequestDetails = lazy(() => import("@/plant/pages/FreightRequestDetails"));
const CreateFreightRequest = lazy(() => import("@/plant/pages/CreateFreightRequest"));
const NotificationHistory = lazy(() => import("@/plant/pages/NotificationHistory"));
const DeliveryCalendar = lazy(() => import("@/plant/pages/DeliveryCalendar"));
const DeliveryDetails = lazy(() => import("@/plant/pages/DeliveryDetails"));
const AwardedLoads = lazy(() => import("@/plant/pages/AwardedLoads"));
const UploadedBomFiles = lazy(() => import("@/plant/pages/UploadedBomFiles"));
const BomFileDetails = lazy(() => import("@/plant/pages/BOMFileDetails"));
const GenerateShipperOrder = lazy(() => import("@/plant/pages/GenerateShipperOrder"));

// Financial Accounts section

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
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
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
                    path: "activity-log",
                    element: <ActivityLogPage />,
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
                  { index: true, element: <LeadDetails /> },
                  { path: "assign", element: <AssignPerson /> },
                  { path: "call-history", element: <CallHistory /> },
                  { path: "order-lifecycle", element: <OrderLifecycle /> },
                  { path: "documents", element: <LeadDocuments /> },
                  { path: "chats-ui", element: <LeadChats /> },
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
                  {
                    path: "rfq",
                    element: <RFQPage />,
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
                    path: "reschedule/:meetingId",
                    element: <RescheduleMeeting />,
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
                  { path: "project-details/:projectId", element: <ProjectDetails /> },
                  { path: "project-invoices", element: <ProjectInvoices /> },
                  { path: "project-invoices/:projectId", element: <ProjectInvoices /> },
                  { path: "material-delivery", element: <MaterialDelivery /> },
                  { path: "material-delivery/:projectId", element: <MaterialDelivery /> },
                  {
                    path: "project-shipper-files",
                    element: <ProjectShipperFiles />,
                  },
                  {
                    path: "project-shipper-files/:projectId",
                    element: <ProjectShipperFiles />,
                  },
                  { path: "project-quotation", element: <ProjectQuotation /> },
                  { path: "project-quotation/:projectId", element: <ProjectQuotation /> },
                  { path: "project-payments", element: <ProjectPayments /> },
                  { path: "project-payments/:projectId", element: <ProjectPayments /> },
                  { path: "project-bom", element: <ProjectBomFiles /> },
                  { path: "project-bom/:projectId", element: <ProjectBomFiles /> },
                  { path: "project-drawings", element: <ProjectDrawings /> },
                  { path: "project-drawings/:projectId", element: <ProjectDrawings /> },
                  { path: "budget-planning", element: <BudgetPlanning /> },
                  { path: "budget-planning/:projectId", element: <BudgetPlanning /> },
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
                path: "payment-status",
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
            path: "plant/costing",
            element: <ItemCostList />,
          },
          {
            path: "plant/freight-loads",
            element: <FreightLoads />,
          },
          {
            path: "plant/freight-request-details/:id",
            element: <FreightRequestDetails />,
          },
          {
            path: "plant/freight-request/new",
            element: <CreateFreightRequest />,
          },
          {
            path: "plant/freight-request/edit/:id",
            element: <CreateFreightRequest />,
          },
          {
            path: "plant/bom-details/:id",
            element: <BOMFileDetails />,
          },
          {
            path: "plant/dashboard",
            element: <PlantDashboard />,
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
              { path: ":id", element: <EditInvoice /> },
              { path: ":id/edit", element: <EditInvoice /> },
              // { path: "sales-growth", element: <SalesGrowth /> },
            ],
          },

          //plants routes
          {
            path: "plant",
            children: [
              { index: true, element: <PlantOverview /> },
              { path: "all-deliveries", element: <AllDeliveries /> },
              { path: "load-planning", element: <LoadPlanning /> },
              { path: "load-planning/:projectId", element: <LoadPlanningProject /> },
              { path: "load-planning/:projectId/details/:loadId", element: <LoadPlanDetails /> },
              { path: "shipper-quotation", element: <ShipperQuotation /> },
              { path: "shipper-quotation/:projectId", element: <ShipperQuotationProject /> },
              { path: "shipper-quotation/:projectId/file/:fileId", element: <ShipperFileDetails /> },
              { path: "order-verification", element: <OrderVerification /> },
              { path: "packing-list", element: <PackingList /> },
              { path: "packing-list/:projectId", element: <PackingListProject /> },
              { path: "packing-list/:projectId/details/:packingId", element: <PackingListDetails /> },
              { path: "qr-labels", element: <QrLabels /> },
              { path: "qr-labels/:projectId", element: <QrLabelsProject /> },
              { path: "shippers", element: <ShippersList /> },
              { path: "shippers/add", element: <AddShipper /> },
              { path: "shippers/:id", element: <ShipperDetails /> },
              { path: "shippers/:id/edit", element: <EditShipper /> },
              { path: "freight-carriers", element: <FreightCarriersList /> },
              { path: "freight-carriers/add", element: <AddFreightCarrier /> },
              { path: "freight-carriers/:id", element: <FreightCarrierDetails /> },
              { path: "freight-carriers/:id/edit", element: <EditFreightCarrier /> },
              { path: "notification-history", element: <NotificationHistory /> },
              { path: "delivery-calendar", element: <DeliveryCalendar /> },
              { path: "delivery-details/:id", element: <DeliveryDetails /> },
              { path: "awarded-loads", element: <AwardedLoads /> },
              { path: "uploaded-bom-files", element: <UploadedBomFiles /> },
              { path: "uploaded-bom-files/:id", element: <BomFileDetails /> },
              { path: "uploaded-bom-files/:id/generate-shipper-order", element: <GenerateShipperOrder /> },
              { path: "old-dashboard", element: <PlantDashboard /> },
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
            path: "finance",
            children: [
              { index: true, element: <FinancialOverview /> },
              { path: "budget-actual", element: <BudgetActualPage /> },
              { path: "wip-profits", element: <WipProfitsPage /> },
              { path: "profit-loss", element: <ProfitLossPage /> },
              { path: "expenses", element: <ExpensesManagement /> },
              {
                path: "freight-cost-tracking",
                element: <FreightCostTracking />,
              },
              {
                path: "margin-analysis",
                element: <MarginAnalysisPage />,
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
