import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpDown,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Eye,
  Filter,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/ui/stat-card";
import ProfileCard from "@/components/profile-card";
import Pagination from "@/components/Pagination";
import { useCustomerDetailQuery, useCustomerProjectsQuery } from "@/modules/customers/customers.hooks";
import type { CustomerProject } from "@/modules/customers/customers.types";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProjectStatus = "Work in Progress" | "Active" | "Completed" | "Canceled";

type ProjectRow = {
  id: string;
  name: string;
  building: string;
  startDate: string;
  stage: string;
  quoteValue: string;
  status: ProjectStatus;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatJoinedDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toTitleCase(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Strips trailing timestamp suffix appended by backend
// e.g. "Ayesha Saloon garage 2026-05-18T22-25-15-035Z" → "Ayesha Saloon garage"
function cleanProjectName(name?: string) {
  if (!name) return "-";
  return name.replace(/\s*\d{4}-\d{2}-\d{2}T[\d-]+Z$/, "").trim() || name;
}

function getStatusFromLifecycle(lifecycleStatus?: string): ProjectStatus {
  switch (lifecycleStatus) {
    case "closed_won":
      return "Completed";
    case "canceled":
      return "Canceled";
    case "negotiation":
    case "quotation_sent":
    case "proposal_sent":
      return "Work in Progress";
    default:
      return "Active";
  }
}

function mapApiProject(project: CustomerProject): ProjectRow {
  return {
    id: project._id,
    name: cleanProjectName(project.projectName),
    building: project.numberOfBuildings != null
      ? String(project.numberOfBuildings)
      : "-",
    startDate: formatDate(project.createdAt),
    stage: project.lifecycleStatus
      ? toTitleCase(project.lifecycleStatus)
      : "Initial Contact",
    quoteValue:
      project.quoteValue != null && project.quoteValue > 0
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(project.quoteValue)
        : "-",
    status: project.isTerminated
      ? "Canceled"
      : getStatusFromLifecycle(project.lifecycleStatus),
  };
}

// ─── Status Styles ───────────────────────────────────────────────────────────

const statusStyles: Record<ProjectStatus, string> = {
  "Work in Progress": "bg-[#FEF3C7] text-[#D97706]",
  Active: "bg-[#DCFCE7] text-[#16A34A]",
  Completed: "bg-[#DCFCE7] text-[#166534]",
  Canceled: "bg-[#FEE2E2] text-[#C2410C]",
};

const statusDotStyles: Record<ProjectStatus, string> = {
  "Work in Progress": "bg-[#F59E0B]",
  Active: "bg-[#16A34A]",
  Completed: "bg-[#166534]",
  Canceled: "bg-[#DC2626]",
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr
          key={`skel-${i}`}
          className="animate-pulse border-b border-[#E5E7EB]"
        >
          <td className="px-4 py-4">
            <div className="h-4 w-16 rounded bg-gray-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-16 rounded bg-gray-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-32 rounded bg-gray-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-20 rounded bg-gray-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-5 w-24 rounded-md bg-gray-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-20 rounded bg-gray-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-20 rounded bg-gray-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-6 w-6 rounded-full bg-gray-200" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AllProjectsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ?? "unknown";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: customerDetailResponse,
    isLoading: isCustomerLoading,
    isError,
  } = useCustomerDetailQuery(id);

  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useCustomerProjectsQuery(id);

  const isLoading = isCustomerLoading || isProjectsLoading;

  const customerData = customerDetailResponse?.data.customer;

  // Map real API projects to display rows
  const allProjects: ProjectRow[] = useMemo(() => {
    const list = projectsResponse?.data?.projects ?? [];
    return list.map(mapApiProject);
  }, [projectsResponse]);

  // Derived stats from real data
  const statsData = useMemo(() => {
    const total = allProjects.length;
    const completed = allProjects.filter((p) => p.status === "Completed").length;
    const wip = allProjects.filter(
      (p) => p.status === "Work in Progress",
    ).length;
    const canceled = allProjects.filter((p) => p.status === "Canceled").length;
    return { total, completed, wip, canceled };
  }, [allProjects]);

  const projectStats = [
    {
      title: "Total Projects",
      value: String(statsData.total),
      bg: "bg-[#1D51A4]",
      icon: BriefcaseBusiness,
    },
    {
      title: "Completed",
      value: String(statsData.completed),
      bg: "bg-[#45B649]",
      icon: CheckCircle2,
    },
    {
      title: "Work in progress",
      value: String(statsData.wip),
      bg: "bg-[#F5B700]",
      icon: ShieldCheck,
    },
    {
      title: "Canceled",
      value: String(statsData.canceled),
      bg: "bg-[#FD8D5B]",
      icon: CircleAlert,
    },
  ] as const;

  // Search filter
  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return allProjects;
    return allProjects.filter((row) =>
      [row.name, row.building, row.startDate, row.stage, row.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [allProjects, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / rowsPerPage),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentProjects = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProjects.slice(start, start + rowsPerPage);
  }, [filteredProjects, currentPage, rowsPerPage]);

  // Profile data
  const customerName =
    `${customerData?.firstName ?? ""} ${customerData?.lastName ?? ""}`.trim() ||
    "-";
  const phoneNumber = customerData?.phone?.number ?? "";
  const phoneCountryCode = customerData?.phone?.countryCode ?? "";
  const phone =
    phoneCountryCode && phoneNumber
      ? `${phoneCountryCode} ${phoneNumber}`
      : phoneNumber || "-";

  const profileData = {
    name: customerName,
    status: (customerData?.isActive ? "Active" : "Inactive") as
      | "Active"
      | "Inactive",
    id: customerData?.customerId ?? customerData?._id ?? id,
    joined: formatJoinedDate(customerData?.createdAt),
    phone,
    email: customerData?.email ?? "-",
    address: "-",
  };

  return (
    <div className="space-y-6 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate('/customers')}
            className="px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg">All Projects</h1>
        </div>
      </div>

      {(isError || isProjectsError) ? (
        <Card className="p-4">
          <CardContent className="px-0 py-0 text-sm text-red-600">
            Failed to load customer details. Please refresh and try again.
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Card */}
      <ProfileCard profile={profileData} isLoading={isLoading} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`stat-skel-${i}`}
                className="animate-pulse rounded-xl bg-gray-100 h-24"
              />
            ))
          : projectStats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                color={stat.bg}
                icon={
                  <stat.icon
                    className={`h-5 w-5 ${stat.bg.replace("bg-", "text-")}`}
                  />
                }
              />
            ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[135px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search"
            className="h-7 rounded-[4px] border-[#DDE5F3] bg-white pl-8 text-[12px] shadow-none placeholder:text-slate-400"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-7 rounded-[4px] border-[#DDE5F3] bg-white px-3 text-[12px] font-normal text-slate-600 shadow-none hover:bg-slate-50"
        >
          <Filter className="mr-1.5 h-3 w-3" />
          Filter
        </Button>
      </div>

      <Card className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <CardContent className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-gray-50 text-[12px] font-medium text-slate-500 uppercase">
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Project
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Job ID
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Project Name
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Budget
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      Start Date
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    End Date
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton />
              ) : currentProjects.length === 0 ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No projects found for this customer.
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {currentProjects.map((project, index) => (
                    <tr
                      key={project.id}
                      className="border-b border-[#E5E7EB] text-[13px] text-slate-700 last:border-b-0 hover:bg-slate-50"
                    >
                      {/* Project N */}
                      <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                        Project {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      {/* Job ID — short last 6 chars */}
                      <td className="px-4 py-4 text-slate-500 font-mono text-xs">
                        {project.id.slice(-6).toUpperCase()}
                      </td>
                      {/* Project Name */}
                      <td className="px-4 py-4 text-slate-700">
                        {project.name}
                      </td>
                      {/* Budget */}
                      <td className="px-4 py-4 text-slate-700">
                        {project.quoteValue}
                      </td>
                      {/* Status badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyles[project.status]}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${statusDotStyles[project.status]}`}
                          />
                          {project.status}
                        </span>
                      </td>
                      {/* Start Date */}
                      <td className="px-4 py-4 text-slate-700">
                        {project.startDate}
                      </td>
                      {/* End Date */}
                      <td className="px-4 py-4 text-slate-500">
                        -
                      </td>
                      {/* Action */}
                      <td className="px-4 py-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            navigate(
                              `/customers/${id}/project-details/${project.id}`,
                            )
                          }
                          className="h-6 w-6 rounded-full p-0 text-[#3B82F6] hover:bg-blue-50 hover:text-blue-700"
                          aria-label={`View ${project.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded">
        <Pagination
          totalItems={filteredProjects.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
