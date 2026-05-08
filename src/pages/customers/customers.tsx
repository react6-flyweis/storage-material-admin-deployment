import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import AddCustomerDialog from "@/components/customers/add-customer-dialog";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import { useCustomersQuery } from "@/modules/customers/customers.hooks";
import type { AdminCustomer } from "@/modules/customers/customers.api";
import CustomersTable, {
  type CustomerListItem,
} from "@/components/customers/customers-table";

import totalCustomersIcon from "@/assets/icons/customers/total-customers.svg";
import activeCustomersIcon from "@/assets/icons/customers/active-customers.svg";
import totalProjectsIcon from "@/assets/icons/customers/total-projects.svg";
import projectsInExecutionIcon from "@/assets/icons/customers/projects-execution.svg";
import { CirclePlay } from "lucide-react";

type Customer = CustomerListItem & {
  createdAt: Date;
  isReturning?: boolean;
};

type StatCard = {
  title: string;
  value: string | number;
  icon: string;
  iconBgClassName: string;
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
    createdAt: apiCustomer.createdAt
      ? new Date(apiCustomer.createdAt)
      : new Date(0),
    isReturning: apiCustomer.isReturning,
  };
}

export default function CustomersPage() {
  const [searchQuery] = useState("");
  const [statusFilter] = useState("all");
  const [period, setPeriod] = useState<Period>("Month");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    isFetching: isCustomersFetching,
  } = useCustomersQuery(currentPage, rowsPerPage);

  const customers = useMemo(() => {
    return (customersResponse?.data.customers ?? []).map(
      mapApiCustomerToCustomer,
    );
  }, [customersResponse]);

  const totalItems = customersResponse?.data.total ?? 0;

  // Helper to check if a date matches the selected period
  const isInPeriod = useCallback(
    (date: Date) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const customerDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      if (period === "Today") {
        return customerDate.getTime() === today.getTime();
      } else if (period === "Week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return customerDate >= weekAgo && customerDate <= today;
      } else if (period === "Month") {
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        return customerDate >= monthAgo && customerDate <= today;
      }
      return true;
    },
    [period],
  );

  // Calculate period-filtered stats
  const periodFilteredCustomers = useMemo(() => {
    return customers.filter((c) => isInPeriod(c.createdAt));
  }, [customers, isInPeriod]);

  const stats = useMemo(() => {
    const total = periodFilteredCustomers.length;
    const active = periodFilteredCustomers.filter(
      (c) => c.status.toLowerCase() === "active",
    ).length;
    const newCustomers = periodFilteredCustomers.filter(
      (c) => c.isReturning === false,
    ).length;
    const returning = periodFilteredCustomers.filter(
      (c) => c.isReturning === true,
    ).length;

    return { total, active, newCustomers, returning };
  }, [periodFilteredCustomers]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customers.filter((c) => {
      // Status filter
      if (statusFilter !== "all" && c.status.toLowerCase() !== statusFilter) {
        return false;
      }

      // Search across several fields
      if (!q) return true;

      return (
        (c.customerId && c.customerId.toLowerCase().includes(q)) ||
        c.customerName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.inquiryFor.toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery, statusFilter]);

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setRowsPerPage(nextRowsPerPage);
    setCurrentPage(1);
  };

  const statCards: StatCard[] = [
    {
      title: "Total Customers",
      value: stats.total,
      icon: totalCustomersIcon,
      iconBgClassName: "bg-blue-500",
    },
    {
      title: "Active Customers",
      value: stats.active,
      icon: activeCustomersIcon,
      iconBgClassName: "bg-orange-500",
    },
    {
      title: "Total Projects",
      value: 78,
      icon: totalProjectsIcon,
      iconBgClassName: "bg-teal-700",
    },
    {
      title: "Project in Execution",
      value: 32,
      icon: projectsInExecutionIcon,
      iconBgClassName: "bg-pink-500",
    },
    {
      title: "Project Not Assigned",
      value: 24,
      icon: activeCustomersIcon,
      iconBgClassName: "bg-orange-500",
    },
    {
      title: "Completed Projects",
      value: 18,
      icon: totalProjectsIcon,
      iconBgClassName: "bg-teal-700",
    },
  ];

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
              onAdd={() => {}}
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
          {statCards.map(({ title, value, icon: Icon, iconBgClassName }) => (
            <div
              key={title}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
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
            </div>
          ))}
        </div>

        {/* Table */}
        <CustomersTable
          customers={filteredCustomers}
          isLoading={isCustomersLoading || isCustomersFetching}
          isError={isCustomersError}
          totalItems={totalItems}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={handleRowsPerPageChange}
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
      </div>
    </>
  );
}
