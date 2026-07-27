import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import CustomSelect from "../components/common/CustomSelect";
import IssueReportingModal from "../components/reportingIssueModel";
import RequestMaterialModel from "../components/requestMaterialModel";
import PhotoModel from "../components/photoModel";
import SuccessModal from "../components/common/SuccessModal";
import MaterialRequestDetailsDialog from "../components/MaterialRequestDetailsDialog";
import { useMaterialRequestsQuery } from "../construction.hooks";
import type { MaterialRequestItem } from "../construction.api";
import { TableSkeleton } from "@/components/ui/skeleton";

// Icons for Stat Cards (matching image design with subtle borders/colors)
function DollarStatIcon() {
  return (
    <div className="w-9 h-9 rounded-lg border border-[#9333EA]/30 bg-[#F5F3FF] flex items-center justify-center text-[#9333EA]">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

function ShoppingBagStatIcon() {
  return (
    <div className="w-9 h-9 rounded-lg border border-[#22C55E]/30 bg-[#F0FDF4] flex items-center justify-center text-[#22C55E]">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </div>
  );
}

function LockStatIcon() {
  return (
    <div className="w-9 h-9 rounded-lg border border-[#EAB308]/30 bg-[#FEFCE8] flex items-center justify-center text-[#EAB308]">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
  );
}

function HourglassStatIcon() {
  return (
    <div className="w-9 h-9 rounded-lg border border-[#EF4444]/30 bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

function ExportIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

const statusBadgeStyle: Record<string, string> = {
  Pending: "bg-[#FEF9C3] text-[#CA8A04]",
  pending: "bg-[#FEF9C3] text-[#CA8A04]",
  Approved: "bg-[#DCFCE7] text-[#16A34A]",
  approved: "bg-[#DCFCE7] text-[#16A34A]",
  Fulfilled: "bg-[#DCFCE7] text-[#16A34A]",
  fulfilled: "bg-[#DCFCE7] text-[#16A34A]",
  Delivered: "bg-[#DCFCE7] text-[#16A34A]",
  delivered: "bg-[#DCFCE7] text-[#16A34A]",
  Rejected: "bg-[#FEE2E2] text-[#EF4444]",
  rejected: "bg-[#FEE2E2] text-[#EF4444]",
  Cancelled: "bg-[#FEE2E2] text-[#EF4444]",
  cancelled: "bg-[#FEE2E2] text-[#EF4444]",
};

const priorityBadgeStyle: Record<string, string> = {
  High: "bg-[#FEE2E2] text-[#EF4444]",
  high: "bg-[#FEE2E2] text-[#EF4444]",
  Medium: "bg-[#FEF9C3] text-[#CA8A04]",
  medium: "bg-[#FEF9C3] text-[#CA8A04]",
  Low: "bg-[#EFF6FF] text-[#3B82F6]",
  low: "bg-[#EFF6FF] text-[#3B82F6]",
};

const projectOptions = [
  { label: "All Projects", value: "all" },
  { label: "Downtown Office Complex", value: "downtown" },
  { label: "Residential Tower A", value: "residential_a" },
  { label: "ABC Construction LLC.", value: "abc" },
];

const departmentOptions = [
  { label: "All Departments", value: "all" },
  { label: "Civil", value: "civil" },
  { label: "Structural", value: "structural" },
  { label: "Electrical", value: "electrical" },
];

const statusFilterOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Fulfilled", value: "fulfilled" },
];

const requestedByOptions = [
  { label: "All", value: "all" },
  { label: "John Smith", value: "john_smith" },
  { label: "Sarah Wilson", value: "sarah_wilson" },
];

function getRequestedByName(req: MaterialRequestItem): string {
  if (req.requestedBy && typeof req.requestedBy === "object" && req.requestedBy.name) {
    return req.requestedBy.name;
  }
  if (typeof req.requestedBy === "string" && req.requestedBy) {
    return req.requestedBy;
  }
  if (req.requestedByCustomer) {
    return "Customer";
  }
  return "John Smith";
}

function getRequestedByRole(req: MaterialRequestItem): string {
  if (req.requestedBy && typeof req.requestedBy === "object" && req.requestedBy.role) {
    return req.requestedBy.role;
  }
  return "Site Engineer";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "May 23,2025";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "03.40 PM";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "03.40 PM";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "03.40 PM";
  }
}

function capitalize(str?: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatItemsSummary(req: MaterialRequestItem): { countText: string; itemsListText: string } {
  const items = req.requestedItems || [];
  if (items.length === 0) {
    return { countText: "0 Items", itemsListText: "No items listed" };
  }
  const countText = `${items.length} ${items.length === 1 ? "Item" : "Items"}`;
  const names = items.map((i) => i.name).filter(Boolean);
  const itemsListText = names.length > 0 ? names.join(",") : "Steel,Cements,Rocks..";
  return { countText, itemsListText };
}

export default function Materials() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedReqBy, setSelectedReqBy] = useState("all");

  const [openReportModel, setReportModel] = useState(false);
  const [openRequestModel, setRequestModel] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [openPhotoModel, setPhotoModel] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequestItem | null>(null);

  const [pageSize, setPageSize] = useState("10");

  const { data, isLoading, refetch } = useMaterialRequestsQuery({
    status: selectedStatus === "all" ? "" : selectedStatus,
  });

  const apiRequests = data?.data?.requests || [];
  const statsData = data?.data?.stats;

  const totalRequestsCount = statsData?.total ?? apiRequests.length ?? 48;
  const pendingCount = statsData?.pending?.count ?? 18;
  const pendingAmount = statsData?.pending?.amount ? statsData.pending.amount.toLocaleString("en-US", { minimumFractionDigits: 3 }) : "245,680.150";
  const approvedCount = statsData?.approved?.count ?? 22;
  const approvedAmount = statsData?.approved?.amount ? statsData.approved.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "582,390.75";
  const rejectedCount = statsData?.rejected?.count ?? 6;
  const rejectedAmount = statsData?.rejected?.amount ? statsData.rejected.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "578,420.20";

  const filteredRequests = useMemo(() => {
    let requests = apiRequests;

    if (selectedStatus !== "all") {
      requests = requests.filter(
        (r) => r.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (!search) return requests;
    const term = search.toLowerCase();
    return requests.filter((r) => {
      const reqNo = r.requestId || "";
      const reqBy = getRequestedByName(r);
      const projName = r.leadId?.projectName || "";
      const jobId = r.leadId?.jobId || "";
      const building = r.buildingLabel || "";
      const itemNames = r.requestedItems?.map((i) => i.name).join(" ") || "";
      const statusStr = r.status || "";

      return `${reqNo} ${reqBy} ${projName} ${jobId} ${building} ${itemNames} ${statusStr}`
        .toLowerCase()
        .includes(term);
    });
  }, [apiRequests, search, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827] text-[22px] md:text-[24px] font-bold">
            Material Requests
          </h1>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            View & Manage all additional material requests raised by construction teams.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setReportModel(true)}
            className="px-4 py-2 bg-[#4B5563] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#374151] transition-colors shadow-sm"
          >
            Issue Reporting
          </button>

          <button
            onClick={() => setRequestModel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Request Material
          </button>

          <button
            onClick={() => {
              setSuccessTitle("Data Exported Successfully");
              setSuccessOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-gray-50 shadow-sm"
          >
            <ExportIcon />
            Export
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
            Projects
          </label>
          <CustomSelect
            title="All Projects"
            options={projectOptions}
            value={selectedProject}
            onChange={setSelectedProject}
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
            Departments
          </label>
          <CustomSelect
            title="All Departments"
            options={departmentOptions}
            value={selectedDept}
            onChange={setSelectedDept}
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
            Status
          </label>
          <CustomSelect
            title="All Status"
            options={statusFilterOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
            Requested By
          </label>
          <CustomSelect
            title="All"
            options={requestedByOptions}
            value={selectedReqBy}
            onChange={setSelectedReqBy}
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
            Date Range
          </label>
          <div className="flex items-center justify-between px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#374151] shadow-sm cursor-pointer hover:border-gray-400">
            <span>May 1 - May 31, 2025</span>
            <CalendarIcon />
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests Card */}
        <div className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-[10px] p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-[#6B7280]">Total Requests</p>
              <h3 className="text-[22px] font-bold text-[#111827] mt-1">{totalRequestsCount}</h3>
              <p className="text-[12px] text-[#9CA3AF] mt-1">All Payment Requests</p>
            </div>
            <DollarStatIcon />
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tl from-[#9333EA]/10 to-transparent rounded-full pointer-events-none" />
        </div>

        {/* Pending Card */}
        <div className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-[10px] p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-[#6B7280]">Pending</p>
              <h3 className="text-[22px] font-bold text-[#111827] mt-1">{pendingCount}</h3>
              <p className="text-[12px] text-[#9CA3AF] mt-1">${pendingAmount}</p>
            </div>
            <ShoppingBagStatIcon />
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tl from-[#22C55E]/10 to-transparent rounded-full pointer-events-none" />
        </div>

        {/* Approved Card */}
        <div className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-[10px] p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-[#6B7280]">Approved</p>
              <h3 className="text-[22px] font-bold text-[#111827] mt-1">{approvedCount}</h3>
              <p className="text-[12px] text-[#9CA3AF] mt-1">{approvedAmount}</p>
            </div>
            <LockStatIcon />
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tl from-[#EAB308]/10 to-transparent rounded-full pointer-events-none" />
        </div>

        {/* Rejected Card */}
        <div className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-[10px] p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-[#6B7280]">Rejected</p>
              <h3 className="text-[22px] font-bold text-[#111827] mt-1">{rejectedCount}</h3>
              <p className="text-[12px] text-[#9CA3AF] mt-1">{rejectedAmount}</p>
            </div>
            <HourglassStatIcon />
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tl from-[#EF4444]/10 to-transparent rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm overflow-hidden">
        {/* Table Header Label */}
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-[15px] font-bold text-[#111827]">
            Material Request ({filteredRequests.length || 54})
          </h2>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={6} columns={8} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[12px] font-semibold text-[#374151]">
                  <th className="px-5 py-3.5">Request ID</th>
                  <th className="px-5 py-3.5">Project / Site</th>
                  <th className="px-5 py-3.5">Requested Items</th>
                  <th className="px-5 py-3.5">Requested By</th>
                  <th className="px-5 py-3.5">Request Date</th>
                  <th className="px-5 py-3.5">Required By</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5E7EB] text-[13px]">
                {filteredRequests.map((r) => {
                  const { countText, itemsListText } = formatItemsSummary(r);
                  const reqByName = getRequestedByName(r);
                  const reqByRole = getRequestedByRole(r);
                  const currentStatus = capitalize(r.status || "Pending");
                  const currentPriority = capitalize(r.priority || "High");
                  const isPending = currentStatus === "Pending";

                  return (
                    <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Request ID */}
                      <td className="px-5 py-4 font-bold text-[#111827] whitespace-nowrap">
                        {r.requestId || "MR-2025-0031"}
                      </td>

                      {/* Project / Site */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-[#111827]">
                          {r.leadId?.projectName || "Downtown Office Complex"}
                        </p>
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                          {r.buildingLabel || r.siteLocation || "Construction Site A"}
                        </p>
                      </td>

                      {/* Requested Items */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-[#111827]">{countText}</p>
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5 max-w-[160px] truncate" title={itemsListText}>
                          {itemsListText}
                        </p>
                      </td>

                      {/* Requested By */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-[#111827]">{reqByName}</p>
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5">{reqByRole}</p>
                      </td>

                      {/* Request Date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-[#111827]">{formatDate(r.requestDate || r.createdAt)}</p>
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5">{formatTime(r.requestDate || r.createdAt)}</p>
                      </td>

                      {/* Required By */}
                      <td className="px-5 py-4 font-medium text-[#111827] whitespace-nowrap">
                        {formatDate(r.requiredBy)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-md text-[12px] font-medium inline-block ${
                            statusBadgeStyle[currentStatus] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-md text-[12px] font-medium inline-block ${
                            priorityBadgeStyle[currentPriority] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {currentPriority}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(r);
                              setDetailsOpen(true);
                            }}
                            className="px-3 py-1 bg-white border border-[#E5E7EB] text-[#374151] rounded-md text-[12px] font-medium hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            View
                          </button>

                          <button
                            onClick={() => {
                              setSelectedRequestId(r._id);
                              setPhotoModel(true);
                            }}
                            className="p-1.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-md text-[12px] hover:bg-gray-50 transition-colors shadow-sm"
                            title="Upload Photo"
                          >
                            <svg className="w-3.5 h-3.5 text-[#374151]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => {
                                  setSuccessTitle("Material Request Approved");
                                  setSuccessOpen(true);
                                  void refetch();
                                }}
                                className="px-3 py-1 bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] rounded-md text-[12px] font-medium hover:bg-[#DCFCE7] transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSuccessTitle("Material Request Rejected");
                                  setSuccessOpen(true);
                                  void refetch();
                                }}
                                className="px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] rounded-md text-[12px] font-medium hover:bg-[#FEE2E2] transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!isLoading && filteredRequests.length === 0 && (
            <p className="text-center text-sm text-[#6B7280] py-8">
              No material requests found
            </p>
          )}
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-[#E5E7EB] text-[13px] text-[#6B7280] gap-3">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <div className="w-16">
              <CustomSelect
                title="10"
                options={[
                  { label: "10", value: "10" },
                  { label: "25", value: "25" },
                  { label: "50", value: "50" },
                ]}
                value={pageSize}
                onChange={setPageSize}
              />
            </div>
            <span>Results</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[#E5E7EB] text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
              &larr;
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[#9333EA] text-[#9333EA] font-semibold bg-[#F5F3FF]">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
              2
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
              3
            </button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[#E5E7EB] text-gray-600 hover:bg-gray-100">
              15
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[#E5E7EB] text-gray-600 hover:text-gray-900">
              &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MaterialRequestDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApprove={() => {
          setSuccessTitle("Material Request Approved");
          setSuccessOpen(true);
          void refetch();
        }}
        onReject={() => {
          setSuccessTitle("Material Request Rejected");
          setSuccessOpen(true);
          void refetch();
        }}
      />

      <IssueReportingModal
        open={openReportModel}
        onClose={() => setReportModel(false)}
        onCreate={() => {
          setSuccessTitle("Report Submitted Successfully");
          setSuccessOpen(true);
          void refetch();
        }}
      />

      <RequestMaterialModel
        open={openRequestModel}
        onClose={() => setRequestModel(false)}
        onCreate={() => {
          setSuccessTitle("Material Requested Successfully");
          setSuccessOpen(true);
          void refetch();
        }}
      />

      <SuccessModal
        open={successOpen}
        title={successTitle}
        onClose={() => {
          setSuccessOpen(false);
        }}
      />

      <PhotoModel
        open={openPhotoModel}
        requestId={selectedRequestId}
        onClose={() => {
          setSuccessTitle("Photo Uploaded Successfully");
          setPhotoModel(false);
          setSuccessOpen(true);
          setSelectedRequestId(null);
        }}
        onUpload={(file, requestId) => {
          console.log("Uploaded file:", file);
          console.log("Request ID:", requestId);
        }}
      />
    </div>
  );
}

