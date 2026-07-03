import { NavLink, useLocation, useNavigate } from "react-router";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import dashboardIcon from "@/assets/icons/sidebar/dashboard.svg";
import activityLogIcon from "@/assets/icons/sidebar/activity-log.svg";
import aiScriptIcon from "@/assets/icons/sidebar/ai-script.svg";
import auditLogIcon from "@/assets/icons/sidebar/audit-log.svg";
import carrierInvoicesIcon from "@/assets/icons/sidebar/carrier-invoices.svg";
import communication from "@/assets/icons/sidebar/communication.svg";
import construction from "@/assets/icons/sidebar/construction.svg";
import constructionEmployeeIcon from "@/assets/icons/sidebar/construction-employee.svg";
import customer from "@/assets/icons/sidebar/customer.svg";
import employee from "@/assets/icons/sidebar/employee.svg";
import employeesIcon from "@/assets/icons/sidebar/employees.svg";
import finance from "@/assets/icons/sidebar/finance.svg";
import escalatedLeadsIcon from "@/assets/icons/sidebar/escalated-leads.svg";
import followupIcon from "@/assets/icons/sidebar/followup.svg";
// import followupKpiIcon from "@/assets/icons/sidebar/followup-kpi.svg";
// import insightIcon from "@/assets/icons/sidebar/insight.svg";
import invoiceListIcon from "@/assets/icons/sidebar/invoice-list.svg";
import invoices from "@/assets/icons/sidebar/invoices.svg";
import leadScoringIcon from "@/assets/icons/sidebar/lead-scoring.svg";
import leadsIcon from "@/assets/icons/sidebar/leads.svg";
import meetingsIcon from "@/assets/icons/sidebar/meetings.svg";
import overviewIcon from "@/assets/icons/sidebar/overview.svg";
import paymentApprovalIcon from "@/assets/icons/sidebar/payment-approval.svg";
import paymentStatusIcon from "@/assets/icons/sidebar/payment-status.svg";
import productLibraryIcon from "@/assets/icons/sidebar/product.svg";
import plantEmployeeIcon from "@/assets/icons/sidebar/plant-employee.svg";
import payments from "@/assets/icons/sidebar/payments.svg";
import plant from "@/assets/icons/sidebar/plant.svg";
import projectWiseTaxIcon from "@/assets/icons/sidebar/project-wise-tax.svg";
import purchaseOrdersIcon from "@/assets/icons/sidebar/purchase-orders.svg";
import recentContractsIcon from "@/assets/icons/sidebar/recent-contracts.svg";
import reportsIcon from "@/assets/icons/sidebar/reports.svg";
import salesIcon from "@/assets/icons/sidebar/sales.svg";
import salesPerformanceIcon from "@/assets/icons/sidebar/sales-performance.svg";
import stateWiseTaxIcon from "@/assets/icons/sidebar/state-wise-tax.svg";
import supportIcon from "@/assets/icons/sidebar/support.svg";
import taxFilingIcon from "@/assets/icons/sidebar/tax-filing.svg";
import terminatedProjectsIcon from "@/assets/icons/sidebar/terminated-projects.svg";
import vendorInvoicesIcon from "@/assets/icons/sidebar/vendor-invoices.svg";

// Finance icons
import WipProfitsIcon from "@/assets/icons/sidebar/wip-profit.svg";
import ExpenseManagementIcon from "@/assets/icons/sidebar/expense-management.svg";
import ProfitLossIcon from "@/assets/icons/sidebar/profit-loss.svg";
import FreightCostIcon from "@/assets/icons/sidebar/freight-cost-tracking.svg";
import MarginAnalysisIcon from "@/assets/icons/sidebar/margin-analysis.svg";
import BudgetVsActualIcon from "@/assets/icons/sidebar/budget-actual.svg";

import { Button } from "./ui/button";
import activeBgImage from "@/assets/images/active-bg.png";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";
import ProfileDialog from "@/components/profile-dialog";
import { useEmployeeCountsStore } from "@/modules/employees/employees.store";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  XIcon,
  ArrowLeft,
} from "lucide-react";

type NavGroup =
  | "dashboard"
  | "users"
  | "messages"
  | "teams"
  | "gallery"
  | "analytics"
  | "documents"
  | "settings"
  | "links"
  | "accounts"
  | "reports"
  | "construction"
  | "ai-marketing";

interface NavigationItem {
  path: string;
  label: string;
  collapsible?: boolean;
  icon?: string;
  subItems?: {
    path: string;
    label: string;
    badge?: number;
    icon?: string;
  }[];
}

interface NavigationGroup {
  id: NavGroup;
  icon: string;
  label: string;
  color: string; //hex string
  link: string;
  items: NavigationItem[];
}

function SidebarItemIcon({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("max-h-5 max-w-5 object-contain", className)}
    />
  );
}

const navigationGroups: NavigationGroup[] = [
  {
    id: "dashboard" as NavGroup,
    icon: dashboardIcon,
    label: "Dashboard",
    color: "#1e3a8a",
    link: "/dashboard",
    items: [],
  },
  {
    id: "links" as NavGroup,
    icon: leadsIcon,
    label: "Leads",
    color: "#a855f7",
    link: "/leads",
    items: [
      {
        path: "/leads/follow-up",
        label: "Follow ups",
        icon: followupIcon,
        collapsible: true,
        subItems: [
          {
            path: "/leads/follow-up",
            label: "Overview",
            icon: overviewIcon,
          },
          // Activity log
          // {
          //   path: "/leads/follow-up/communication-timeline",
          //   label: "Lead Communication Timeline",
          // },
          // {
          //   path: "/leads/follow-up/smart-reminders",
          //   label: "Smart Follow up Reminders",
          // },
          {
            path: "/leads/follow-up/activity-log",
            label: "Activity Log",
            icon: activityLogIcon,
          },
          {
            path: "/leads/follow-up/script-generator",
            label: "AI Follow-Up Script Generator",
            icon: aiScriptIcon,
          },
          {
            path: "/leads/follow-up/scoring",
            label: "Lead Scoring",
            icon: leadScoringIcon,
          },
          // {
          //   path: "/leads/follow-up/kpis",
          //   label: "Follow-Up KPIs",
          //   icon: followupKpiIcon,
          // },
          // insights
          // {
          //   path: "/leads/follow-up/insights",
          //   label: "Insights",
          //   icon: insightIcon,
          // },
        ],
      },
      // { path: "/leads/ai-marketing", label: "AI Support" },
      {
        path: "/leads/escalated",
        label: "Escalated Leads",
        icon: escalatedLeadsIcon,
      },
      {
        path: "/leads/purchase-orders",
        label: "All Purchase Orders",
        icon: purchaseOrdersIcon,
      },
      // new quotation list
      // {
      //   path: "/leads/quotation-list",
      //   label: "New Quotation List",
      //   icon: invoiceListIcon,
      // },
    ],
  },
  {
    id: "users" as NavGroup,
    icon: customer,
    label: "Customer",
    color: "#EAB308",
    link: "/customers",
    items: [
      { path: "/customers/meetings", label: "Meetings", icon: meetingsIcon },
      {
        path: "/customers/terminated-projects",
        label: "Terminated Projects",
        icon: terminatedProjectsIcon,
      },
      // recent-signed contracts
      {
        path: "/customers/contracts",
        label: "Recent Signed Contracts",
        icon: recentContractsIcon,
      },
    ],
  },
  {
    id: "gallery" as NavGroup,
    icon: plant,
    label: "Plant Overview",
    color: "#0ea5e9",
    link: "/plant",
    items: [
      { path: "/plant/uploaded-bom-files", label: "Uploaded BOM Files" },
      { path: "/plant/shipper-quotation", label: "Shipper Quotation" },
      { path: "/plant/load-planning", label: "Load Planning" },
      { path: "/plant/packing-list", label: "Packing List" },
      { path: "/plant/qr-labels", label: "QR Labels" },
      { path: "/plant/shippers", label: "Shippers" },
      { path: "/plant/freight-carriers", label: "Freight Carriers" },
      { path: "/plant/costing", label: "Costing" },
      { path: "/plant/freight-loads", label: "Freight Loads" },
      { path: "/plant/awarded-loads", label: "Awarded Loads" },
      { path: "/plant/delivery-calendar", label: "Deliveries Calendar" },
      { path: "/plant/all-deliveries", label: "All Deliveries" },
      { path: "/plant/notification-history", label: "Notification History" },
      /*
      { path: "/plant/equipment_management", label: "Equipment" },
      {
        path: "/plant/material_inventory_management",
        label: "Material Inventory",
      },
      {
        path: "/plant/production_management",
        label: "Production Management",
      },
      {
        path: "/plant/maintenance_logs",
        label: "Maintenance Logs",
      },
      {
        path: "/plant/upcoming_schedule",
        label: "Upcoming Schedule",
      },
      {
        path: "/plant/breakdown_cases",
        label: "Breakdown Cases",
      },
      {
        path: "/plant/service_providers",
        label: "Service Providers",
      },
      {
        path: "/plant/equipment_allocation",
        label: "Equipment Allocation",
      },
      {
        path: "/plant/transfer_requests",
        label: "Transfer Requests",
      },
      {
        path: "/plant/usage_tracking",
        label: "Usage Tracking & Logs",
      },
      */
    ],
  },
  {
    id: "settings" as NavGroup,
    icon: payments,
    label: "Payments",
    color: "#16a34a",
    link: "/payments",
    items: [
      // tax & report : Sales tax reporting
      // {
      //   label: "Tax & Report",
      //   path: "/payments/sales-tax-reporting",
      // },
      {
        label: "Tax & Filing",
        path: "/payments/sales-tax-filing",
        icon: taxFilingIcon,
      },
      // taxation
      // {
      //   label: "Taxation",
      //   path: "/payments/taxation",
      // },
      // state wise tax
      {
        label: "State-wise Tax",
        path: "/payments/state-wise-tax",
        icon: stateWiseTaxIcon,
      },
      {
        label: "Project-wise Tax",
        path: "/payments/project-wise-tax",
        icon: projectWiseTaxIcon,
      },
      {
        label: "Payment Approvals",
        path: "/payments/payment-approvals",
        icon: paymentApprovalIcon,
      },
      {
        label: "Payment Status",
        path: "/payments/payment-status",
        icon: paymentStatusIcon,
      },
    ],
  },
  {
    id: "documents" as NavGroup,
    icon: invoices,
    label: "Invoices",
    color: "#a855f7",
    link: "/invoice",
    items: [
      // invite list
      { path: "/invoice/list", label: "Invoice List", icon: invoiceListIcon },
      // sales growth
      // {
      //   path: "/invoice/sales-growth",
      //   label: "Sales Growth",
      //   icon: salesIcon,
      // },
      {
        label: "Vendor invoices",
        path: "/invoice/invoices-management",
        icon: vendorInvoicesIcon,
      },
      {
        label: "Freight Carrier invoices",
        path: "/invoice/carrier-invoices",
        icon: carrierInvoicesIcon,
      },
    ],
  },
  {
    id: "construction" as NavGroup,
    icon: construction,
    label: "Construction",
    color: "#dc2626",
    link: "/construction",
    items: [
      { path: "/construction/projects", label: "Project & Calendar" },
      { path: "/construction/tasks", label: "Tasks & Progress" },
      { path: "/construction/materials", label: "Material Request" },
      { path: "/construction/reports", label: "Construction Reports" },
    ],
  },
  {
    id: "teams" as NavGroup,
    icon: employee,
    label: "Employee Management",
    color: "#ea580c",
    link: "/employees",
    items: [
      {
        path: "/employees",
        label: "Employees",
        collapsible: true,
        subItems: [
          // All employees
          {
            path: "/employees",
            label: "All Employees",
            icon: employeesIcon,
          },
          {
            path: "/employees?team=sales",
            label: "Sales",
            badge: 2,
            icon: salesIcon,
          },
          {
            path: "/employees?team=plant",
            label: "Plant",
            badge: 1,
            icon: plantEmployeeIcon,
          },
          {
            path: "/employees?team=construction",
            label: "Construction",
            badge: 1,
            icon: constructionEmployeeIcon,
          },
          {
            path: "/employees?team=support",
            label: "Support",
            badge: 1,
            icon: supportIcon,
          },
        ],
      },
      {
        path: "/employees/performance",
        label: "Sales Employee performance",
        icon: salesPerformanceIcon,
      },
      { path: "/employees/audit-log", label: "Audit Log", icon: auditLogIcon },
    ],
  },
  {
    id: "role-permissions" as NavGroup,
    icon: reportsIcon,
    label: "Role Permissions",
    color: "#000000",
    link: "/role-permissions",
    items: [],
  },
  {
    id: "product-library" as NavGroup,
    icon: productLibraryIcon,
    label: "Product Library",
    color: "#55A6F7",
    link: "/product-library",
    items: [],
  },
  {
    id: "accounts" as NavGroup,
    icon: finance,
    label: "Financial Overview",
    color: "#f97316",
    link: "/finance",
    items: [
      // wip Profits
      {
        label: "WIP Profits",
        path: "/finance/wip-profits",
        icon: WipProfitsIcon,
      },
      // expense management
      {
        label: "Expense Management",
        path: "/finance/expenses",
        icon: ExpenseManagementIcon,
      },
      // Profit and Loss
      {
        label: "Profit and Loss",
        path: "/finance/profit-loss",
        icon: ProfitLossIcon,
      },
      //  Freight Cost Tracking
      {
        label: "Freight Cost Tracking",
        path: "/finance/freight-cost-tracking",
        icon: FreightCostIcon,
      },
      // Margin analysis
      {
        label: "Margin Analysis",
        path: "/finance/margin-analysis",
        icon: MarginAnalysisIcon,
      },
      // Budget vs Actual
      {
        label: "Budget vs Actual",
        path: "/finance/budget-actual",
        icon: BudgetVsActualIcon,
      },
    ],
  },
  {
    id: "messages" as NavGroup,
    icon: communication,
    label: "Communication",
    color: "#9ca3af",
    link: "/communication",
    items: [
      // { path: "/communication/ai-chat", label: "AI Chat" }
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMainCollapsed: boolean;
  setIsMainCollapsed: (val: boolean) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isMainCollapsed = false,
  setIsMainCollapsed,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const employeeCounts = useEmployeeCountsStore();
  const iconSidebarScrollRef = useRef<HTMLDivElement | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<{
    label: string;
    top: number;
    left: number;
  } | null>(null);
  const [activePillPosition, setActivePillPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => {
      return new Set(
        navigationGroups.flatMap((group) =>
          group.items
            .filter((item) => item.collapsible && item.subItems)
            .map((item) => item.path),
        ),
      );
    },
  );
  const [profileOpen, setProfileOpen] = useState(false);

  const currentPath = location.pathname;

  const getEmployeeBadge = (path: string, fallbackBadge?: number) => {
    if (path === "/employees") {
      return employeeCounts.total;
    }

    const teamParam = new URLSearchParams(path.split("?")[1] ?? "").get("team");

    if (!teamParam) {
      return fallbackBadge;
    }

    return employeeCounts.byTeam[teamParam.toLowerCase()] ?? 0;
  };

  // Determine active group based on current path
  const activeGroup =
    navigationGroups.find((group) => {
      if (group.link === currentPath) {
        return true;
      }
      return group.items.some((item) => {
        if (item.path === "/") {
          return currentPath === "/";
        }
        if (item.collapsible && item.subItems) {
          return item.subItems.some((subItem) =>
            currentPath.startsWith(subItem.path),
          );
        }
        return currentPath.startsWith(item.path);
      });
    }) || navigationGroups[0];

  useLayoutEffect(() => {
    const updateActivePillPosition = () => {
      const scrollContainer = iconSidebarScrollRef.current;
      const activeButton = scrollContainer?.querySelector<HTMLButtonElement>(
        `[data-group-id="${activeGroup.id}"]`,
      );

      if (!activeButton) {
        setActivePillPosition(null);
        return;
      }

      const rect = activeButton.getBoundingClientRect();

      setActivePillPosition({
        top: rect.top + rect.height / 2,
        left: rect.right - 12,
      });
    };

    updateActivePillPosition();

    const scrollContainer = iconSidebarScrollRef.current;
    scrollContainer?.addEventListener("scroll", updateActivePillPosition, {
      passive: true,
    });
    window.addEventListener("resize", updateActivePillPosition);

    return () => {
      scrollContainer?.removeEventListener("scroll", updateActivePillPosition);
      window.removeEventListener("resize", updateActivePillPosition);
    };
  }, [activeGroup.id, isOpen]);

  // Auto-expand collapsible section if any of its child routes is active
  useEffect(() => {
    activeGroup?.items.forEach((item) => {
      if (item.collapsible && item.subItems) {
        const fullPath = location.pathname + location.search;
        const isAnySubItemActive = item.subItems.some(
          (subItem) => fullPath === subItem.path,
        );
        if (isAnySubItemActive) {
          setCollapsedSections((prev) => {
            const newSet = new Set(prev);
            newSet.delete(item.path);
            return newSet;
          });
        }
      }
    });
  }, [location.pathname, location.search, activeGroup]);

  const toggleSection = (path: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Get the index of the active group
  const activeGroupIndex = navigationGroups.findIndex(
    (group) => group.id === activeGroup.id,
  );

  // Calculate padding based on active group index
  // Each icon with gap is approximately 56px (36px icon + 20px gap)
  const calculatedPadding = 10 + activeGroupIndex * 56;

  // Calculate the height needed for active group items
  const activeGroupItemsHeight =
    40 +
    activeGroup.items.reduce((total, item) => {
      let height = 40; // Base item height (py-2 + content)
      if (
        item.collapsible &&
        item.subItems &&
        !collapsedSections.has(item.path)
      ) {
        height += item.subItems.length * 36; // Sub-items are slightly smaller
      }
      return total + height;
    }, 0);

  // Top section height (header with UserMenu, buttons, border, padding)
  const topSectionHeight = 120;

  // Determine final padding: use calculated padding if content fits, otherwise use 5
  const menuPaddingTop =
    activeGroupItemsHeight + calculatedPadding + topSectionHeight + 20 <
    window.innerHeight
      ? calculatedPadding
      : 10;

  const handleGroupChange = (group: (typeof navigationGroups)[0]) => {
    navigate(group.link);
    setIsMainCollapsed(false);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // Detect if the icon sidebar has a vertical scrollbar and update width
  // useEffect(() => {
  //   const el = iconSidebarRef.current;
  //   if (!el) return;

  //   const checkScrollbar = () => {
  //     // If scrollHeight is greater than clientHeight, vertical scrollbar is present
  //     setHasScrollbar(el.scrollHeight > el.clientHeight);
  //   };

  //   // Initial check
  //   checkScrollbar();

  //   // Re-check on window resize
  //   window.addEventListener("resize", checkScrollbar);

  //   // Observe DOM changes inside the sidebar that may change scroll height
  //   const mo = new MutationObserver(checkScrollbar);
  //   mo.observe(el, { subtree: true, childList: true, characterData: true });

  //   return () => {
  //     window.removeEventListener("resize", checkScrollbar);
  //     mo.disconnect();
  //   };
  // }, [iconSidebarRef]);

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`flex fixed inset-y-0 left-0 lg:left-0 lg:top-0 z-50 transition-transform duration-300 lg:translate-x-0 h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Icon Sidebar */}
        <aside className="sidebar relative z-40 w-18 h-screen bg-sidebar overflow-visible">
          <div
            ref={iconSidebarScrollRef}
            style={{ scrollbarGutter: "stable", direction: "rtl" }}
            className="h-full pt-28 pb-8 flex flex-col items-center gap-4 overflow-y-scroll overflow-x-visible thin-scrollbar"
          >
            <div style={{ direction: "ltr" }}>
              <nav className="flex flex-col gap-5">
                {navigationGroups.map((group) => {
                  const iconSrc = group.icon as string;

                  return (
                    <button
                      key={group.id}
                      data-group-id={group.id}
                      onClick={() => handleGroupChange(group)}
                      onMouseEnter={(event) => {
                        const rect =
                          event.currentTarget.getBoundingClientRect();
                        setHoveredGroup({
                          label: group.label,
                          top: rect.top + rect.height / 2,
                          left: rect.left - 4,
                        });
                      }}
                      onMouseLeave={() => setHoveredGroup(null)}
                      className="relative flex items-center justify-center transition-all group focus:outline-none"
                    >
                      <div
                        style={{
                          backgroundColor: group.color,
                        }}
                        className="z-50 relative size-10 flex items-center justify-center rounded-full group-hover:scale-105"
                      >
                        <img
                          src={iconSrc}
                          alt={group.label}
                          className="max-w-5 max-h-5 object-contain"
                        />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {isOpen && activePillPosition && (
            <img
              src={activeBgImage}
              alt=""
              aria-hidden="true"
              className="pointer-events-none fixed z-40 w-14 object-contain"
              style={{
                top: activePillPosition.top,
                left: activePillPosition.left,
                transform: "translateY(-50%)",
              }}
            />
          )}

          {hoveredGroup && (
            <div
              className="fixed flex items-center bg-white rounded-full py-1 px-4 pointer-events-none whitespace-nowrap shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1),0_8px_8px_-6px_rgba(0,0,0,0.1)] z-40 -translate-y-1/2"
              style={{ top: hoveredGroup.top, left: hoveredGroup.left }}
            >
              <div className="w-10 h-10 shrink-0" />
              <span className="font-normal text-black text-sm lg:text-base tracking-tight">
                {hoveredGroup.label}
              </span>
            </div>
          )}
        </aside>

        {/* Main Sidebar */}
        <aside
          className={cn(
            "sidebar bg-[#E8EFF9] h-full flex flex-col overflow-y-auto thin-scrollbar z-30 transition-all duration-300",
            isMainCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-56",
          )}
          style={{ scrollbarGutter: "stable" }}
        >
          {/* Header */}
          <div className="p-2 border-b relative">
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 lg:hidden p-1 hover:bg-gray-200 rounded"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <UserMenu onOpenProfile={() => setProfileOpen(true)}>
                  <button className="flex items-center gap-3 text-left focus:outline-none hover:opacity-80 transition-opacity">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Admin Panel
                      </h2>
                      <p className="text-xs text-gray-500">admin@steelpro.com</p>
                    </div>
                  </button>
                </UserMenu>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent hidden lg:block"
                onClick={() => setIsMainCollapsed(true)}
              >
                <ArrowLeft />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
              <Button
                className="rounded bg-gray-300 px-4 text-foreground hover:bg-gray-400"
                size="sm"
              >
                <span>Today</span>
              </Button>
              <div className="flex gap-1">
                <button className="hover:text-gray-600">
                  <ChevronLeftIcon className="size-4" />
                </button>
                <button className="hover:text-gray-600">
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav
            className="flex-1 p-3 px-3"
            style={{ paddingTop: `${menuPaddingTop}px` }}
          >
            <div className="space-y-2">
              <NavLink
                to={activeGroup.link}
                onClick={handleNavClick}
                style={{
                  backgroundColor: activeGroup.color,
                }}
                className="block px-4 py-2 rounded-md transition-colors text-sm w-[95%] text-white"
              >
                <div className="flex items-center gap-2">
                  <span>{activeGroup.label}</span>
                </div>
              </NavLink>

              {activeGroup?.items.map((item) => {
                if (item.collapsible && item.subItems) {
                  const isExpanded = !collapsedSections.has(item.path);
                  const fullPath = location.pathname + location.search;
                  const isAnySubItemActive = item.subItems.some(
                    (subItem) => fullPath === subItem.path,
                  );

                  return (
                    <div key={item.path}>
                      <button
                        onClick={() => toggleSection(item.path)}
                        className={cn(
                          "w-full flex items-center justify-between text-sm px-4 py-2 rounded transition-colors bg-white",
                          {
                            "ring shadow-lg": isAnySubItemActive,
                          },
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-gray-500">
                            <SidebarItemIcon src={item.icon} alt={item.label} />
                          </span>
                          {item.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUpIcon className="size-4" />
                        ) : (
                          <ChevronDownIcon className="size-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 mb-1 space-y-2">
                          {item.subItems.map((subItem) => {
                            const fullSubPath =
                              location.pathname + location.search;
                            const isActiveExact = fullSubPath === subItem.path;
                            return (
                              <NavLink
                                key={subItem.path}
                                to={subItem.path}
                                onClick={handleNavClick}
                                style={
                                  isActiveExact
                                    ? { backgroundColor: activeGroup.color }
                                    : {}
                                }
                                className={() =>
                                  cn(
                                    "block px-4 py-2 rounded transition-colors text-sm",
                                    {
                                      "text-white": isActiveExact,
                                      "bg-white shadow": !isActiveExact,
                                    },
                                  )
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {subItem.icon && (
                                      <span
                                        className={cn(
                                          isActiveExact
                                            ? "text-white"
                                            : "text-gray-500",
                                        )}
                                      >
                                        <SidebarItemIcon
                                          className={cn({
                                            "brightness-0 invert":
                                              isActiveExact,
                                          })}
                                          src={subItem.icon}
                                          alt={subItem.label}
                                        />
                                      </span>
                                    )}
                                    <span>{subItem.label}</span>
                                  </div>

                                  {getEmployeeBadge(
                                    subItem.path,
                                    subItem.badge,
                                  ) !== undefined ? (
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 shadow text-sm text-gray-600">
                                      {getEmployeeBadge(
                                        subItem.path,
                                        subItem.badge,
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className="block"
                  >
                    {({ isActive }) => (
                      <div
                        style={
                          isActive ? { backgroundColor: activeGroup.color } : {}
                        }
                        className={cn(
                          "block px-4 py-2 rounded transition-colors text-sm",
                          {
                            "text-white": isActive,
                          },
                          {
                            "bg-white shadow-lg": !isActive,
                          },
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <SidebarItemIcon
                            src={item.icon}
                            alt={item.label}
                            className={cn({
                              "brightness-0 invert": isActive,
                            })}
                          />
                          <span>{item.label}</span>
                        </div>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </aside>
      </div>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
