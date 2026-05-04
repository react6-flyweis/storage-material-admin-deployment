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
import { useCustomerDetailQuery } from "@/modules/customers/customers.hooks";

type ProjectRow = {
  name: string;
  building: string;
  startDate: string;
  stage: string;
  progress: string;
  status: "Work in Progress" | "Active" | "Completed" | "Canceled";
};

const projectStats = [
  {
    title: "Total Projects",
    value: "04",
    bg: "bg-[#1D51A4]",
    icon: BriefcaseBusiness,
  },
  {
    title: "Completed",
    value: "3",
    bg: "bg-[#45B649]",
    icon: CheckCircle2,
  },
  {
    title: "Work in progress",
    value: "1",
    bg: "bg-[#F5B700]",
    icon: ShieldCheck,
  },
  {
    title: "Canceled",
    value: "1",
    bg: "bg-[#FD8D5B]",
    icon: CircleAlert,
  },
] as const;

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

const projectRows: ProjectRow[] = [
  {
    name: "ABC Warehouse",
    building: "2",
    startDate: "22 Feb 2025",
    stage: "Shipment",
    progress: "75%",
    status: "Work in Progress",
  },
  {
    name: "Tech Park Dev",
    building: "1",
    startDate: "07 Feb 2025",
    stage: "Engineering",
    progress: "30%",
    status: "Active",
  },
  {
    name: "Downtown Plaza",
    building: "3",
    startDate: "30 Jan 2025",
    stage: "Completed",
    progress: "100%",
    status: "Completed",
  },
  {
    name: "Riverside Complex",
    building: "1",
    startDate: "17 Jan 2025",
    stage: "Canceled",
    progress: "0%",
    status: "Canceled",
  },
];

const statusStyles: Record<ProjectRow["status"], string> = {
  "Work in Progress": "bg-[#FEF3C7] text-[#D97706]",
  Active: "bg-[#DCFCE7] text-[#16A34A]",
  Completed: "bg-[#DCFCE7] text-[#166534]",
  Canceled: "bg-[#FEE2E2] text-[#C2410C]",
};

export default function AllProjectsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ?? "unknown";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return projectRows;
    }

    return projectRows.filter((row) => {
      return [
        row.name,
        row.building,
        row.startDate,
        row.stage,
        row.progress,
        row.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchTerm]);

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

  const {
    data: customerDetailResponse,
    isLoading,
    isError,
  } = useCustomerDetailQuery(id);

  const customerData = customerDetailResponse?.data.customer;

  const customerName =
    `${customerData?.firstName ?? ""} ${customerData?.lastName ?? ""}`.trim() ||
    "-";

  const phoneNumber = customerData?.phone?.number ?? "";
  const phoneCountryCode = customerData?.phone?.countryCode ?? "";
  const phone =
    phoneCountryCode && phoneNumber
      ? `${phoneCountryCode} ${phoneNumber}`
      : phoneNumber || "-";

  const joinedDate = formatJoinedDate(customerData?.createdAt);

  const customer = {
    id: customerData?.customerId ?? customerData?._id ?? id,
    customerName,
    email: customerData?.email ?? "-",
    phone,
    inquiryFor:
      customerDetailResponse?.data.projects?.[0]?.buildingType?.trim() || "-",
    status: customerData?.isActive ? "Active" : "Inactive",
    joined: joinedDate,
    address: "-",
  };

  const profileData = {
    name: customer.customerName,
    status: customer.status as "Active" | "Inactive",
    id: customer.id,
    joined: customer.joined,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg">All Projects</h1>
        </div>
      </div>

      {isError ? (
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
        {projectStats.map((stat) => (
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
                <tr className="border-b border-[#E5E7EB] bg-white text-[12px] font-medium text-slate-500">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all projects"
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Project Name
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Building
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      Start Date
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      Stage
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      Progress
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentProjects.map((project) => (
                  <tr
                    key={`${project.name}-${project.startDate}`}
                    className="border-b border-[#E5E7EB] text-[13px] text-slate-700 last:border-b-0"
                  >
                    <td className="px-3 py-4 align-middle">
                      <input
                        type="checkbox"
                        aria-label={`Select ${project.name}`}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {project.name}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {project.building}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {project.startDate}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {project.stage}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {project.progress}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyles[project.status]}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            project.status === "Work in Progress"
                              ? "bg-[#F59E0B]"
                              : project.status === "Active"
                                ? "bg-[#16A34A]"
                                : project.status === "Completed"
                                  ? "bg-[#166534]"
                                  : "bg-[#DC2626]"
                          }`}
                        />
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          navigate(`/customers/${id}/project-details`)
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
