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
  const [searchParams, setSearchParams] = useSearchParams();
  const rawRoleParam = searchParams.get("role") || searchParams.get("team");
  const roleFilter = rawRoleParam ? rawRoleParam.trim().toLowerCase() : "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const handleRoleFilterChange = (newRole: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!newRole || newRole === "all") {
        next.delete("role");
        next.delete("team");
      } else {
        if (next.has("role")) {
          next.set("role", newRole);
          next.delete("team");
        } else {
          next.set("team", newRole);
          next.delete("role");
        }
      }
      return next;
    });
  };

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

  useEffect(() => {
    const statsData = employeeStatsResponse?.data;
    if (statsData) {
      const countsByTeam = (statsData.byRole ?? []).reduce<Record<string, number>>(
        (counts, item) => {
          const team = item._id?.trim().toLowerCase();
          if (team) {
            counts[team] = item.count;
          }
          return counts;
        },
        {},
      );

      setEmployeeCounts({
        total: statsData.total ?? 0,
        byTeam: countsByTeam,
      });
      return;
    }

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
  }, [employeeStatsResponse, employeesResponse, setEmployeeCounts]);

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
        employees={employees}
        loading={isEmployeesLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={handleRoleFilterChange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  );
}
