import { NavLink, useLocation, useNavigate } from "react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  Users,
  DollarSign,
  Headphones,
  Megaphone,
  Factory,
  Hammer,
  type LucideIcon,
  MinusCircle,
  FilePenLine,
  UserPlus,
  LayoutDashboard,
  TableProperties,
  Sparkles,
  ChartBar,
} from "lucide-react";
import { useState, useEffect } from "react";
import dashboardIcon from "@/assets/icons/sidebar/dashboard.svg";
import communication from "@/assets/icons/sidebar/communication.svg";
import construction from "@/assets/icons/sidebar/construction.svg";
import customer from "@/assets/icons/sidebar/customer.svg";
import employee from "@/assets/icons/sidebar/employee.svg";
import finance from "@/assets/icons/sidebar/finance.svg";
import invoices from "@/assets/icons/sidebar/invoices.svg";
import leadsIcon from "@/assets/icons/sidebar/leads.svg";
import payments from "@/assets/icons/sidebar/payments.svg";
import plant from "@/assets/icons/sidebar/plant.svg";
import reportsIcon from "@/assets/icons/sidebar/reports.svg";
import { Button } from "./ui/button";
import activeBgImage from "@/assets/images/active-bg.png";
import { cn } from "@/lib/utils";

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
  icon?: LucideIcon;
  subItems?: {
    path: string;
    label: string;
    badge?: number;
    icon?: LucideIcon;
  }[];
}

interface NavigationGroup {
  id: NavGroup;
  icon: string;
  label: string;
  color: string;
  link: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    id: "dashboard" as NavGroup,
    icon: dashboardIcon,
    label: "Dashboard",
    color: "bg-[#1e3a8a]",
    link: "/dashboard",
    items: [],
  },
  {
    id: "users" as NavGroup,
    icon: customer,
    label: "Customer",
    color: "bg-[#EAB308]",
    link: "/customers",
    items: [
      { path: "/customers/meetings", label: "Meetings", icon: Users },
      {
        path: "/customers/terminated-projects",
        label: "Terminated Projects",
        icon: MinusCircle,
      },
      // recent-signed contracts
      {
        path: "/customers/contracts",
        label: "Recent Signed Contracts",
        icon: FilePenLine,
      },
    ],
  },
  {
    id: "links" as NavGroup,
    icon: leadsIcon,
    label: "Leads",
    color: "bg-[#a855f7]",
    link: "/leads",
    items: [
      {
        path: "/leads/follow-up",
        label: "Follow ups",
        icon: UserPlus,
        collapsible: true,
        subItems: [
          {
            path: "/leads/follow-up",
            label: "Overview",
            icon: LayoutDashboard,
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
            icon: TableProperties,
          },
          {
            path: "/leads/follow-up/script-generator",
            label: "AI Follow-Up Script Generator",
            icon: Sparkles,
          },
          {
            path: "/leads/follow-up/scoring",
            label: "Lead Scoring",
            icon: ChartBar,
          },
          { path: "/leads/follow-up/kpis", label: "Follow-Up KPIs" },
          // insights
          {
            path: "/leads/follow-up/insights",
            label: "Insights",
          },
        ],
      },
      // { path: "/leads/ai-marketing", label: "AI Support" },
      { path: "/leads/escalated", label: "Escalated Leads" },
      { path: "/leads/purchase-orders", label: "All Purchase Orders" },
      // new quotation list
      { path: "/leads/quotation-list", label: "New Quotation List" },
    ],
  },
  {
    id: "teams" as NavGroup,
    icon: employee,
    label: "Employee Management",
    color: "bg-[#ea580c]",
    link: "/employees",
    items: [
      {
        path: "/employees",
        label: "Employees",
        collapsible: true,
        subItems: [
          {
            path: "/employees?team=sales",
            label: "Sales",
            badge: 2,
            icon: DollarSign,
          },
          {
            path: "/employees?team=support",
            label: "Support",
            badge: 1,
            icon: Headphones,
          },
          {
            path: "/employees?team=marketing",
            label: "Marketing",
            badge: 1,
            icon: Megaphone,
          },
          {
            path: "/employees?team=construction",
            label: "Construction",
            badge: 1,
            icon: Hammer,
          },
          {
            path: "/employees?team=plant",
            label: "Plant",
            badge: 1,
            icon: Factory,
          },
        ],
      },
      { path: "/employees/performance", label: "Employee performance" },
      { path: "/employees/audit-log", label: "Audit Log" },
    ],
  },
  {
    id: "settings" as NavGroup,
    icon: payments,
    label: "Payments",
    color: "bg-[#16a34a]",
    link: "/payments",
    items: [
      // tax & report : Sales tax reporting
      {
        label: "Tax & Report",
        path: "/payments/sales-tax-reporting",
      },
      // taxation
      {
        label: "Taxation",
        path: "/payments/taxation",
      },
    ],
  },
  {
    id: "analytics" as NavGroup,
    icon: reportsIcon,
    label: "Reports & Analytics",
    color: "bg-[#000000]",
    link: "/analytics",
    items: [],
  },
  {
    id: "documents" as NavGroup,
    icon: invoices,
    label: "Invoices",
    color: "bg-[#a855f7]",
    link: "/invoice",
    items: [
      // invite list
      { path: "/invoice/list", label: "Invoice List" },
      // sales growth
      {
        path: "/invoice/sales-growth",
        label: "Sales Growth",
      },
    ],
  },
  {
    id: "gallery" as NavGroup,
    icon: plant,
    label: "Plant",
    color: "bg-[#0ea5e9]",
    link: "/plant",
    items: [
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
    ],
  },
  // {
  //   id: "reports" as NavGroup,
  //   icon: finance,
  //   label: "Finance",
  //   color: "bg-[#ca8a04]",
  //   link: "/finance",
  //   items: [{ path: "/finance", label: "Finance" }],
  // },
  {
    id: "accounts" as NavGroup,
    icon: finance,
    label: "Financial Overview",
    color: "bg-[#f97316]",
    link: "/accounts",
    items: [
      { path: "/accounts/payment_overview", label: "Payment Overview" },
      { path: "/accounts/order_payments", label: "Orders & Payments" },
      // { path: "/accounts/wip_profit", label: "WIP Profit" },
      // { path: "/accounts/cogs_analysis", label: "COGS Analysis" },
      { path: "/accounts/expenses", label: "Expenses Management" },
      { path: "/accounts/reports", label: "Reports Management" },
    ],
  },
  {
    id: "construction" as NavGroup,
    icon: construction,
    label: "Construction",
    color: "bg-[#dc2626]",
    link: "/construction",
    items: [
      { path: "/construction/projects", label: "Project & Calendar" },
      { path: "/construction/tasks", label: "Tasks & Progress" },
      { path: "/construction/materials", label: "Material Request" },
      { path: "/construction/reports", label: "Construction Reports" },
    ],
  },
  {
    id: "messages" as NavGroup,
    icon: communication,
    label: "Communication",
    color: "bg-gray-400",
    link: "/communication",
    items: [{ path: "/communication/ai-chat", label: "AI Chat" }],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
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

  const currentPath = location.pathname;

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
  }, [location.pathname, activeGroup]);

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
  // Each icon with gap is approximately 48px (36px icon + 12px gap)
  const calculatedPadding = 10 + activeGroupIndex * 48;

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
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

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
        <aside className="w-14 pt-28 bg-[#2563eb] h-screen flex flex-col items-center gap-4 z-20">
          <nav className="flex flex-col gap-3">
            {navigationGroups.map((group) => {
              const iconSrc = group.icon as string;
              const isActive = activeGroup.id === group.id;

              return (
                <button
                  key={group.id}
                  onClick={() => handleGroupChange(group)}
                  className={`relative flex items-center justify-center transition-all `}
                  title={group.label}
                >
                  {isActive && (
                    <img
                      src={activeBgImage}
                      alt="Active background"
                      className="absolute -right-3 max-w-13 object-contain"
                    />
                  )}
                  <div
                    className={`z-10 w-9 h-9 flex items-center justify-center rounded-full ${
                      group.color
                    } ${isActive ? "" : ""}`}
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
        </aside>

        {/* Main Sidebar */}
        <aside className="w-56 bg-[#E8EFF9] h-full flex flex-col overflow-y-auto thin-scrollbar z-30">
          {/* Header */}
          <div className="p-2 border-b relative">
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 lg:hidden p-1 hover:bg-gray-200 rounded"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
                <p className="text-xs text-gray-500">admin@steelpro.com</p>
              </div>
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
                  <ChevronLeft className="size-4" />
                </button>
                <button className="hover:text-gray-600">
                  <ChevronRight className="size-4" />
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
                className={() =>
                  cn(
                    "block px-4 py-2 rounded-lg transition-colors text-sm w-[95%] mb-5 text-white",
                    activeGroup.color,
                  )
                }
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
                          "w-full flex items-center justify-between text-sm px-4 py-2 rounded-lg transition-colors bg-white",
                          {
                            "ring shadow-lg": isAnySubItemActive,
                          },
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon ? (
                            <span className="text-gray-500">
                              {(() => {
                                const Icon = item.icon;
                                return <Icon className="w-4 h-4" />;
                              })()}
                            </span>
                          ) : null}
                          {item.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
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
                                className={() =>
                                  cn(
                                    "block px-4 py-2 rounded-lg transition-colors text-sm",
                                    {
                                      [`text-white ${activeGroup.color}`]:
                                        isActiveExact,
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
                                        {(() => {
                                          const Icon = subItem.icon;
                                          return <Icon className="w-4 h-4" />;
                                        })()}
                                      </span>
                                    )}
                                    <span>{subItem.label}</span>
                                  </div>

                                  {subItem.badge ? (
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 shadow text-sm text-gray-600">
                                      {subItem.badge}
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
                    className={({ isActive }) =>
                      cn(
                        "block px-4 py-2 rounded-lg transition-colors text-sm",
                        {
                          [`text-white ${activeGroup.color}`]: isActive,
                        },
                        {
                          "bg-white shadow-lg": !isActive,
                        },
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      {item.icon ? (
                        <span className="text-current">
                          {(() => {
                            const Icon = item.icon;
                            return <Icon className="w-4 h-4" />;
                          })()}
                        </span>
                      ) : null}
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
