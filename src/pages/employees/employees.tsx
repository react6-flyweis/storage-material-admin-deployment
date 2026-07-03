import { useSearchParams } from "react-router";
import { EmployeeStatsGrid } from "@/components/employees/employee-stats-grid";
import {
  EmployeeTable,
  type Employee,
} from "@/components/employees/employee-table";
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog";
import { useAdminEmployeesQuery, useEmployeeStatsQuery } from "@/modules/employees/employees.hooks";
import { useEffect, useState, useDeferredValue } from "react";
import { useEmployeeCountsStore } from "@/modules/employees/employees.store";

const formatJoinedDate = (date?: string) => {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-US");
};

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { data: employeesResponse, isLoading: isEmployeesLoading } =
    useAdminEmployeesQuery({
      search: deferredSearchQuery,
      role: roleFilter,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      page: 1,
      limit: 100,
    });
  const { data: employeeStatsResponse, isLoading: isEmployeeStatsLoading } =
    useEmployeeStatsQuery();
  const setEmployeeCounts = useEmployeeCountsStore(
    (state) => state.setEmployeeCounts,
  );

  const [searchParams] = useSearchParams();
  const teamFilter = searchParams.get("team") ?? undefined;

  useEffect(() => {
    const employees = employeesResponse?.data.employees ?? [];

    const countsByTeam = employees.reduce<Record<string, number>>(
      (counts, employee) => {
        const team = employee.role?.trim().toLowerCase();

        if (!team) {
          return counts;
        }

        counts[team] = (counts[team] ?? 0) + 1;
        return counts;
      },
      {},
    );

    setEmployeeCounts({
      total: employeesResponse?.data.total ?? employees.length,
      byTeam: countsByTeam,
    });
  }, [employeesResponse, setEmployeeCounts]);

  const employees: Employee[] = (employeesResponse?.data.employees ?? []).map(
    (employee) => ({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone ?? "N/A",
      joinedDate: formatJoinedDate(employee.createdAt),
      role: employee.role?.toLowerCase() || "sales",
      team: employee.role || "N/A",
      status: employee.isActive ? "active" : "inactive",
      leads: employee.assignedLeadCount ?? 0,
    }),
  );

  const filteredEmployees = teamFilter
    ? employees.filter(
        (emp) => emp.role?.toLowerCase() === teamFilter.toLowerCase() || emp.team?.toLowerCase() === teamFilter.toLowerCase(),
      )
    : employees;

  const employeeStatsData = employeeStatsResponse?.data;

  const totalEmployees = employeeStatsData?.total ?? 0;
  const activeEmployees = employeeStatsData?.active ?? 0;
  const inactiveEmployees = Math.max(totalEmployees - activeEmployees, 0);

  const stats = {
    totalEmployees,
    inactiveEmployees,
    activeEmployees,
    totalTeams: employeeStatsData?.byRole?.length ?? 0,
    topPerformer: {
      name: employeeStatsData?.topPerformer?.name ?? "N/A",
      leadsCount: employeeStatsData?.topPerformer?.leadsCount ?? 0,
    },
  };

  return (
    <div className="space-y-6 p-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-gray-600 mt-1">
            Add, edit, and manage employees, teams, roles, and permissions.
          </p>
        </div>
        <AddEmployeeDialog />
      </div>

      {/* Stats Grid */}
      <EmployeeStatsGrid stats={stats} loading={isEmployeeStatsLoading} />

      {/* Employee Table */}
      <EmployeeTable
        employees={filteredEmployees}
        loading={isEmployeesLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  );
}
