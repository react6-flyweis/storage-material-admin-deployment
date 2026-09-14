import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type AdminEmployeeProfileLead } from "@/modules/employees/employees.api";
import { useAdminEmployeeProfileQuery } from "@/modules/employees/employees.hooks";

import { ArrowLeft } from "lucide-react";
import type { DateRange as RDateRange } from "react-day-picker";
import {
  EmployeeAssignedLeadsTab,
  type Lead,
} from "@/pages/employees/employee-assigned-leads-tab";
import {
  EmployeeAssignedProjectsTab,
  AssignedProjectsDateFilter,
} from "@/pages/employees/employee-assigned-projects-tab";
import {
  EmployeeAssignedConstructionProjectsTab,
  ConstructionProjectsDateFilter,
} from "@/pages/employees/employee-assigned-construction-projects-tab";
import { EmployeePersonalTab } from "@/pages/employees/employee-personal-tab";
import { EmployeePerformanceTab } from "@/pages/employees/employee-performance-tab";

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatJoinedDate = (date?: string) => {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "N/A";
  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatRole = (role?: string) => {
  switch (role?.toLowerCase()) {
    case "account":
      return "Account";
    case "admin":
      return "Admin";
    case "sales":
      return "Sales";
    default:
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : "N/A";
  }
};

const formatLifecycleStatus = (status?: string) => {
  if (!status) return "Not set";
  return status
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const mapLead = (lead: AdminEmployeeProfileLead): Lead => ({
  id: lead._id,
  name: lead.customerId?.firstName ?? lead.name ?? "Unknown Lead",
  code: lead.customerId?.customerId ?? lead.code ?? lead._id,
  location:
    [lead.buildingType, lead.location || lead.source]
      .filter(Boolean)
      .join(" · ") ||
    lead.location ||
    lead.source ||
    "N/A",
  quoteValue:
    lead.quoteValue !== undefined
      ? formatCurrency(lead.quoteValue)
      : (lead.priority ?? "N/A"),
  status: formatLifecycleStatus(lead.lifecycleStatus ?? lead.stage),
  createdAt: lead.createdAt,
});

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const employeeId = id ?? "";

  const {
    data: employeeProfileResponse,
    isLoading,
    error,
  } = useAdminEmployeeProfileQuery(employeeId);

  const profile = employeeProfileResponse?.data;
  const employee = profile?.employee;
  const employeeStats = profile?.stats;

  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabFromUrl || "assignedConstructionProjects",
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [plantDateRange, setPlantDateRange] = useState<RDateRange | undefined>({
    from: new Date(2025, 4, 16),
    to: new Date(2025, 5, 21),
  });
  const [constructionDateRange, setConstructionDateRange] = useState<RDateRange | undefined>({
    from: new Date(2025, 4, 15),
    to: new Date(2025, 4, 21),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const assignedLeads = useMemo(
    () => (profile?.leads ?? []).map(mapLead),
    [profile?.leads],
  );

  const filteredAssignedLeads = useMemo(() => {
    const from = plantDateRange?.from ? new Date(plantDateRange.from) : undefined;
    const to = plantDateRange?.to ? new Date(plantDateRange.to) : from;

    if (!from && !to) return assignedLeads;

    const startTime = from
      ? new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
      : undefined;
    const endTime = to
      ? new Date(
          to.getFullYear(),
          to.getMonth(),
          to.getDate(),
          23,
          59,
          59,
          999,
        ).getTime()
      : startTime;

    return assignedLeads.filter((lead) => {
      if (!lead.createdAt || startTime === undefined || endTime === undefined) {
        return true;
      }

      const leadTime = new Date(lead.createdAt).getTime();
      if (Number.isNaN(leadTime)) return true;
      return leadTime >= startTime && leadTime <= endTime;
    });
  }, [assignedLeads, plantDateRange]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssignedLeads.length / rowsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAssignedLeads = useMemo(
    () =>
      filteredAssignedLeads.slice(
        (safeCurrentPage - 1) * rowsPerPage,
        safeCurrentPage * rowsPerPage,
      ),
    [filteredAssignedLeads, rowsPerPage, safeCurrentPage],
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Card className="p-6">Loading employee profile...</Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button asChild size="sm">
            <Link to="/employees" className="inline-flex items-center gap-2">
              <ArrowLeft />
              Back
            </Link>
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold">Employee Profile</h2>
        </div>
        <Card className="p-6 text-sm text-gray-600">
          Employee details are unavailable.
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button asChild size="sm">
          <Link to="/employees" className="inline-flex items-center gap-2">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <h2 className="text-lg sm:text-xl font-semibold">Employee Profile</h2>
      </div>

      <Card className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>
              {employee.name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold truncate">
              {employee.name}
            </h3>
            <div className="text-sm text-gray-600 mt-1">
              {formatRole(employee.role)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Joined {formatJoinedDate(employee.createdAt)}
            </div>
          </div>
        </div>
        <div className="text-right mt-4 sm:mt-0">
          <div className="inline-flex flex-col items-end gap-2">
            <Badge variant="secondary">
              {employee.isActive ? "Active" : "Inactive"}
            </Badge>
            <div className="text-sm text-gray-600">
              <span className="text-2xl sm:text-3xl font-semibold text-gray-900 mr-1">
                {employeeStats?.totalLeads ?? assignedLeads.length}
              </span>
              <span className="text-sm text-gray-600">leads assigned</span>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="border-b border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-6">
            <nav className="flex -mb-px space-x-6 sm:space-x-8 overflow-x-auto">
              <button
                className={`py-4 text-sm whitespace-nowrap font-medium transition-colors ${
                  activeTab === "personal"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("personal")}
              >
                Personal Info
              </button>
              <button
                className={`py-4 text-sm whitespace-nowrap font-medium transition-colors ${
                  activeTab === "assignedPlantProjects" || activeTab === "assignedProjects"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("assignedPlantProjects")}
              >
                Assigned plant projects
              </button>
              <button
                className={`py-4 text-sm whitespace-nowrap font-medium transition-colors ${
                  activeTab === "assignedConstructionProjects"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("assignedConstructionProjects")}
              >
                Assigned construction projects
              </button>
              <button
                className={`py-4 text-sm whitespace-nowrap font-medium transition-colors ${
                  activeTab === "performance"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("performance")}
              >
                Performance
              </button>
            </nav>

            {(activeTab === "assignedPlantProjects" || activeTab === "assignedProjects") && (
              <div className="pb-3 sm:pb-0">
                <AssignedProjectsDateFilter
                  value={plantDateRange}
                  onChange={setPlantDateRange}
                />
              </div>
            )}

            {activeTab === "assignedConstructionProjects" && (
              <div className="pb-3 sm:pb-0">
                <ConstructionProjectsDateFilter
                  value={constructionDateRange}
                  onChange={setConstructionDateRange}
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-6">
          {activeTab === "personal" && (
            <EmployeePersonalTab
              employee={employee}
              onEdit={() => setEditDialogOpen(true)}
            />
          )}

          {(activeTab === "assignedPlantProjects" || activeTab === "assignedProjects") && (
            <EmployeeAssignedProjectsTab
              dateRange={plantDateRange}
              onDateRangeChange={setPlantDateRange}
              hideDateFilter={true}
            />
          )}

          {activeTab === "assignedConstructionProjects" && (
            <EmployeeAssignedConstructionProjectsTab
              dateRange={constructionDateRange}
              onDateRangeChange={setConstructionDateRange}
              hideDateFilter={true}
            />
          )}

          {activeTab === "assignedLeads" && (
            <EmployeeAssignedLeadsTab
              leads={paginatedAssignedLeads}
              dateRange={plantDateRange}
              onDateRangeChange={(range) => {
                setPlantDateRange(range);
                setCurrentPage(1);
              }}
              currentPage={safeCurrentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
            />
          )}

          {activeTab === "performance" && (
            <EmployeePerformanceTab stats={employeeStats} />
          )}
        </div>
      </div>

      <AddEmployeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        hideTrigger
        initialValues={{
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          role:
            employee.role?.toLowerCase() === "account"
              ? "Manager"
              : employee.role?.toLowerCase() === "sales"
                ? "Employee"
                : employee.role?.toLowerCase() === "admin"
                  ? "Admin"
                  : (employee.role ?? "Employee"),
          team: "Sales",
          status: employee.isActive ? "active" : "inactive",
          password: "",
        }}
      />
    </div>
  );
}
