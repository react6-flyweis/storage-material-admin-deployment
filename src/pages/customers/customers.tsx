import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import AddCustomerDialog from "@/components/customers/add-customer-dialog";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import {
  useCustomersQuery,
  useCustomerStatsQuery,
} from "@/modules/customers/customers.hooks";
import type { AdminCustomer } from "@/modules/customers/customers.types";
import CustomersTable, {
  type CustomerListItem,
} from "@/components/customers/customers-table";

import totalCustomersIcon from "@/assets/icons/customers/total-customers.svg";
import activeCustomersIcon from "@/assets/icons/customers/active-customers.svg";
import totalProjectsIcon from "@/assets/icons/customers/total-projects.svg";
import projectsInExecutionIcon from "@/assets/icons/customers/projects-execution.svg";
import { CirclePlay } from "lucide-react";
import TotalProjectsView from "@/components/customers/total-projects-view";
import ProjectsInExecutionView from "@/components/customers/projects-in-execution-view";
import UnassignedProjectsView from "@/components/customers/unassigned-projects-view";
import CompletedProjectsView from "@/components/customers/completed-projects-view";

type Customer = CustomerListItem & {
  createdAt: Date;
  isReturning?: boolean;
};

type StatCard = {
  title: string;
  value: string | number;
  icon: string;
  iconBgClassName: string;
  onClick?: () => void;
};

function mapApiCustomerToCustomer(apiCustomer: AdminCustomer): Customer {
  const fullName =
    `${apiCustomer.firstName ?? ""} ${apiCustomer.lastName ?? ""}`.trim();

  const phoneNumber = apiCustomer.phone?.number;
  const phoneCountryCode = apiCustomer.phone?.countryCode;

  return {
    id: apiCustomer._id,
    customerId: apiCustomer.customerId,
    customerName: fullName,
    phone:
      phoneNumber && phoneCountryCode
        ? `${phoneCountryCode} ${phoneNumber}`
        : (phoneNumber ?? ""),
    email: apiCustomer.email ?? "",
    // Keep columns blank when the API omits a value instead of inventing placeholder data.
    inquiryFor: apiCustomer.inquiryFor ?? "",
    status:
      typeof apiCustomer.isActive === "boolean"
        ? apiCustomer.isActive
          ? "Active"
          : "Inactive"
        : "",
    totalProjects: apiCustomer.totalProjects ?? 0,
    isActive: apiCustomer.isActive ?? false,
    createdAt: apiCustomer.createdAt
      ? new Date(apiCustomer.createdAt)
      : new Date(0),
    isReturning: apiCustomer.isReturning,
  };
}

function CustomerStatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
      <div className="flex flex-col items-start gap-3">
        <div className="size-16 rounded-full bg-gray-200" />
        <div className="flex-1 w-full space-y-2 mt-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-12 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState<Period>("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const dateRange = useMemo(() => {
    if (period === "All Time") {
      return { startDate: undefined, endDate: undefined };
    }

    const end = new Date();
    const start = new Date();
    if (period === "Today") {
      // Keep start and end as today
    } else if (period === "Week") {
      start.setDate(end.getDate() - 7);
    } else if (period === "Month") {
      start.setDate(end.getDate() - 30);
    }

    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }, [period]);

  // Prepare filters for backend API
  const filters = useMemo(() => ({
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery.trim() || undefined,
  }), [statusFilter, dateRange.startDate, dateRange.endDate, searchQuery]);

  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    isFetching: isCustomersFetching,
  } = useCustomersQuery(currentPage, rowsPerPage, filters);

  const { data: customerStatsResponse, isLoading: isStatsLoading } = useCustomerStatsQuery(
    dateRange.startDate,
    dateRange.endDate
  );
  const customerStats = customerStatsResponse?.data;

  const customers = useMemo(() => {
    return (customersResponse?.data.customers ?? []).map(
      mapApiCustomerToCustomer,
    );
  }, [customersResponse]);

  const totalItems = customersResponse?.data.total ?? 0;

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setRowsPerPage(nextRowsPerPage);
    setCurrentPage(1);
  };

  const statCards: StatCard[] = [
    {
      title: "Total Customers",
      value: isStatsLoading ? "..." : (customerStats?.totalCustomers ?? 0),
      icon: totalCustomersIcon,
      iconBgClassName: "bg-blue-500",
      onClick: () => console.log("Total Customers clicked"),
    },
    {
      title: "Active Customers",
      value: isStatsLoading ? "..." : (customerStats?.activeCustomers ?? 0),
      icon: activeCustomersIcon,
      iconBgClassName: "bg-orange-500",
      onClick: () => console.log("Active Customers clicked"),
    },
    {
      title: "Total Projects",
      value: isStatsLoading ? "..." : (customerStats?.totalProjects ?? 0),
      icon: totalProjectsIcon,
      iconBgClassName: "bg-teal-700",
      onClick: () => console.log("Total Projects clicked"),
    },
    {
      title: "Project in Execution",
      value: isStatsLoading ? "..." : (customerStats?.projectsInExecution ?? 0),
      icon: projectsInExecutionIcon,
      iconBgClassName: "bg-pink-500",
      onClick: () => console.log("Project in Execution clicked"),
    },
    {
      title: "Project Not Assigned",
      value: isStatsLoading ? "..." : (customerStats?.projectsNotAssigned ?? 0),
      icon: activeCustomersIcon,
      iconBgClassName: "bg-orange-500",
      onClick: () => console.log("Project Not Assigned clicked"),
    },
    {
      title: "Completed Projects",
      value: isStatsLoading ? "..." : (customerStats?.completedProjects ?? 0),
      icon: totalProjectsIcon,
      iconBgClassName: "bg-teal-700",
      onClick: () => console.log("Completed Projects clicked"),
    },
  ];

  console.log("customerStatsResponse", customerStatsResponse);

  return (
    <>
      <FilterTabs
        initialPeriod={period}
        onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
      />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl  text-gray-900">Customer Management</h1>
            <p className="text-gray-500 mt-1">
              Easily view, manage, and track all your customers in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <AddCustomerDialog
              onAdd={() => { }}
              // onAdd={(c) => {
              //   const newCustomer = c ?? generateRandomCustomer();
              //   setCustomers((prev) => [newCustomer, ...prev]);
              // }}
              trigger={
                <Button size="lg" className="">
                  Add New Customer
                </Button>
              }
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {isStatsLoading
            ? Array.from({ length: 6 }).map((_, index) => (
              <CustomerStatCardSkeleton key={index} />
            ))
            : statCards.map(({ title, value, icon: Icon, iconBgClassName, onClick }) => {
              const isSelected = selectedStat === title;
              return (
                <button
                  type="button"
                  key={title}
                  onClick={() => {
                    setSelectedStat(isSelected ? null : title);
                    onClick?.();
                  }}
                  className={`bg-white rounded-lg p-4 border transition-all cursor-pointer active:scale-[0.98] w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isSelected
                      ? "border-blue-500 shadow-md bg-blue-50/30"
                      : "border-gray-200 hover:shadow-md hover:border-blue-300"
                    }`}
                >
                  <div className="flex flex-col items-start gap-3">
                    <div className={`${iconBgClassName} rounded-full p-4`}>
                      <img src={Icon} alt={title} className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium">{title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {value}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Conditional Content Based on Selected Stat */}
        {(() => {
          if (!selectedStat || selectedStat === "Total Customers" || selectedStat === "Active Customers") {
            return (
              <>
                <CustomersTable
                  customers={customers}
                  isLoading={isCustomersLoading || isCustomersFetching}
                  isError={isCustomersError}
                  totalItems={totalItems}
                  currentPage={currentPage}
                  rowsPerPage={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />

                <div className="rounded-lg border border-gray-200 bg-white">
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 px-6 py-6 lg:pr-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Status Legends
                      </h2>

                      <div className="mt-4 space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Project Status
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-full bg-gray-300" />
                              <span>Not Started</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-full bg-blue-500" />
                              <span>In Transaction</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-full bg-green-600" />
                              <span>Completed</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Assignment Status
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-full bg-green-600" />
                              <span>Assigned to Plant</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-full bg-red-600" />
                              <span>Not Assigned</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block w-px bg-gray-200" />

                    <div className="flex-1 px-6 py-6 lg:pl-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Assign to Plant
                      </h2>
                      <p className="mt-3 text-sm text-gray-600">
                        Assign Customer Projects to a plant for execution and start
                        budget planning
                      </p>

                      <Button
                        variant="outline"
                        className="mt-4 h-10 w-full max-w-xs rounded-lg border border-blue-600 bg-transparent px-4 text-sm font-medium text-blue-600 shadow-none hover:bg-blue-50"
                      >
                        <span className="flex items-center gap-2">
                          <CirclePlay className="h-5 w-5" />
                          <span>How it Works</span>
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            );
          }

          if (selectedStat === "Total Projects") {
            return <TotalProjectsView />;
          }

          if (selectedStat === "Project in Execution") {
            return <ProjectsInExecutionView />;
          }

          if (selectedStat === "Project Not Assigned") {
            return <UnassignedProjectsView />;
          }

          if (selectedStat === "Completed Projects") {
            return <CompletedProjectsView />;
          }

          // Fallback
          return null;
        })()}
      </div>
    </>
  );
}
