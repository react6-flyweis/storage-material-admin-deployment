import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import {
  type AdminEmployeeProfileQueryParams,
  type AccountAssignedInvoiceItem,
} from "@/modules/employees/employees.api";
import { useAdminEmployeeProfileQuery } from "@/modules/employees/employees.hooks";
import { ArrowLeft } from "lucide-react";
import type { DateRange as RDateRange } from "react-day-picker";
import { EmployeeAssignedLeadsTab } from "@/pages/employees/employee-assigned-leads-tab";
import { EmployeeAssignedProjectsTab } from "@/pages/employees/employee-assigned-projects-tab";
import { EmployeeAssignedConstructionProjectsTab } from "@/pages/employees/employee-assigned-construction-projects-tab";
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

function EmployeeAssignedInvoicesTab({
  items,
  total,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  items: AccountAssignedInvoiceItem[];
  total: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (limit: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-[#ECEEF2] hover:bg-[#ECEEF2]">
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                Invoice #
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                Customer / Project
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                Amount
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                Due Date
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((inv, idx) => (
                <TableRow
                  key={inv.invoiceId || inv.invoiceNumber || idx}
                  className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                >
                  <TableCell className="px-4 py-4 align-top sm:px-6 font-semibold text-blue-600 text-sm">
                    {inv.invoiceNumber || inv.invoiceId || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top sm:px-6">
                    <div className="text-sm font-semibold text-gray-900">
                      {inv.customerName || "N/A"}
                    </div>
                    {inv.projectName && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {inv.projectName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top sm:px-6 font-semibold text-gray-900 text-sm">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top sm:px-6 text-sm text-gray-600">
                    {inv.dueDate || inv.date || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top sm:px-6">
                    <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-xs">
                      {inv.statusLabel || inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b border-gray-200">
                <TableCell
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-gray-500 sm:px-6"
                >
                  No assigned invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="bg-white">
          <Pagination
            totalItems={total}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const employeeId = id ?? "";

  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  // Filter and pagination state for API query parameters
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "");
  const [assignedPage, setAssignedPage] = useState<number>(1);
  const [assignedLimit, setAssignedLimit] = useState<number>(10);
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [revenuePeriod, setRevenuePeriod] = useState<"all" | "year" | "month">("year");
  const [lifecycleBucket] = useState<"all" | "active" | "closed">("all");
  const [temperature, setTemperature] = useState<"hot" | "warm" | "cold" | undefined>(undefined);
  const [scoreState, setScoreState] = useState<string | undefined>(undefined);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const queryParams: AdminEmployeeProfileQueryParams = useMemo(() => {
    const params: AdminEmployeeProfileQueryParams = {
      assignedPage,
      assignedLimit,
    };
    if (dateRange?.from) {
      params.startDate = dateRange.from.toISOString();
    }
    if (dateRange?.to) {
      params.endDate = dateRange.to.toISOString();
    }
    if (revenuePeriod && revenuePeriod !== "all") {
      params.revenuePeriod = revenuePeriod;
    }
    if (lifecycleBucket && lifecycleBucket !== "all") {
      params.lifecycleBucket = lifecycleBucket;
    }
    if (temperature) {
      params.temperature = temperature;
    }
    if (scoreState) {
      params.scoreState = scoreState;
    }
    return params;
  }, [assignedPage, assignedLimit, dateRange, revenuePeriod, lifecycleBucket, temperature, scoreState]);

  const {
    data: employeeProfileResponse,
    isLoading,
    error,
  } = useAdminEmployeeProfileQuery(employeeId, queryParams);

  const profile = employeeProfileResponse?.data;
  const header = profile?.header;
  const personalInfo = profile?.personalInfo;
  const assignedWork = profile?.assignedWork;
  const performance = profile?.performance;

  // Role-aware assigned work tab key and label
  const assignedTabKey = useMemo(() => {
    switch (assignedWork?.kind) {
      case "sales_leads":
        return "assignedLeads";
      case "plant_projects":
        return "assignedPlantProjects";
      case "construction_deliveries":
        return "assignedDeliveries";
      case "account_invoices":
        return "assignedInvoices";
      default:
        return "assignedWork";
    }
  }, [assignedWork?.kind]);

  const assignedTabLabel = useMemo(() => {
    switch (assignedWork?.kind) {
      case "sales_leads":
        return "Assigned Leads";
      case "plant_projects":
        return "Assigned Plant Projects";
      case "construction_deliveries":
        return "Assigned Deliveries";
      case "account_invoices":
        return "Assigned Invoices";
      default:
        return "Assigned Work";
    }
  }, [assignedWork?.kind]);

  // Determine current active tab (default to assigned tab once loaded or personal)
  const currentTab = activeTab || tabFromUrl || assignedTabKey;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Card className="p-6">Loading employee profile...</Card>
      </div>
    );
  }

  if (error || !profile || !header || !personalInfo) {
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

      {/* Profile Header Card */}
      <Card className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
        <div className="flex items-start sm:items-center gap-4">
          <Avatar size="lg" className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-white shadow-sm">
            {header.avatar && <AvatarImage src={header.avatar} alt={header.name} />}
            <AvatarFallback className="bg-blue-600 text-white font-bold text-lg sm:text-xl">
              {header.name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {header.name}
            </h3>
            <div className="text-sm font-medium text-gray-600 mt-1">
              {header.roleLabel || header.role}
            </div>
            {header.joinedAt && (
              <div className="text-sm text-gray-400 mt-1">
                Joined {formatJoinedDate(header.joinedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="text-right mt-4 sm:mt-0">
          <div className="inline-flex flex-col items-end gap-2">
            <Badge
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                header.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {header.isActive ? "Active" : "Inactive"}
            </Badge>
            {header.workSummary && (
              <div className="text-sm text-gray-600">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 mr-1">
                  {header.workSummary.count}
                </span>
                <span className="text-sm text-gray-500">
                  {header.workSummary.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Unified Tab Navigation */}
      <div>
        <div className="border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-6">
            <nav className="flex -mb-px space-x-6 sm:space-x-8 overflow-x-auto">
              <button
                type="button"
                className={`py-4 text-sm whitespace-nowrap font-medium transition-colors ${
                  currentTab === "personal"
                    ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("personal")}
              >
                Personal Info
              </button>

              <button
                type="button"
                className={`py-4 text-sm whitespace-nowrap font-medium transition-colors ${
                  currentTab === assignedTabKey
                    ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab(assignedTabKey)}
              >
                {assignedTabLabel}
              </button>

              <button
                type="button"
                className={`py-4 text-sm whitespace-nowrap font-medium transition-colors ${
                  currentTab === "performance"
                    ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("performance")}
              >
                Performance
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="pt-6">
          {currentTab === "personal" && (
            <EmployeePersonalTab
              personalInfo={personalInfo}
              onEdit={() => setEditDialogOpen(true)}
            />
          )}

          {currentTab === assignedTabKey && assignedWork?.kind === "sales_leads" && (
            <EmployeeAssignedLeadsTab
              items={assignedWork.items}
              total={assignedWork.total}
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                setAssignedPage(1);
              }}
              temperature={temperature}
              onTemperatureChange={(temp) => {
                setTemperature(temp);
                setAssignedPage(1);
              }}
              scoreState={scoreState}
              onScoreStateChange={(state) => {
                setScoreState(state);
                setAssignedPage(1);
              }}
              currentPage={assignedPage}
              rowsPerPage={assignedLimit}
              onPageChange={setAssignedPage}
              onRowsPerPageChange={(limit) => {
                setAssignedLimit(limit);
                setAssignedPage(1);
              }}
            />
          )}

          {currentTab === assignedTabKey && assignedWork?.kind === "plant_projects" && (
            <EmployeeAssignedProjectsTab
              items={assignedWork.items}
              total={assignedWork.total}
              currentPage={assignedPage}
              rowsPerPage={assignedLimit}
              onPageChange={setAssignedPage}
              onRowsPerPageChange={(limit) => {
                setAssignedLimit(limit);
                setAssignedPage(1);
              }}
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                setAssignedPage(1);
              }}
              hideDateFilter={false}
            />
          )}

          {currentTab === assignedTabKey && assignedWork?.kind === "construction_deliveries" && (
            <EmployeeAssignedConstructionProjectsTab
              items={assignedWork.items}
              total={assignedWork.total}
              currentPage={assignedPage}
              rowsPerPage={assignedLimit}
              onPageChange={setAssignedPage}
              onRowsPerPageChange={(limit) => {
                setAssignedLimit(limit);
                setAssignedPage(1);
              }}
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                setAssignedPage(1);
              }}
              hideDateFilter={false}
            />
          )}

          {currentTab === assignedTabKey && assignedWork?.kind === "account_invoices" && (
            <EmployeeAssignedInvoicesTab
              items={assignedWork.items}
              total={assignedWork.total}
              currentPage={assignedPage}
              rowsPerPage={assignedLimit}
              onPageChange={setAssignedPage}
              onRowsPerPageChange={(limit) => {
                setAssignedLimit(limit);
                setAssignedPage(1);
              }}
            />
          )}

          {currentTab === "performance" && (
            <EmployeePerformanceTab
              performance={performance}
              revenuePeriod={revenuePeriod}
              onRevenuePeriodChange={setRevenuePeriod}
            />
          )}
        </div>
      </div>

      <AddEmployeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        hideTrigger
        initialValues={{
          name: header.name,
          email: personalInfo.email,
          phone: personalInfo.phone,
          role: personalInfo.role,
          status: header.isActive ? "active" : "inactive",
          password: "",
        }}
      />
    </div>
  );
}
