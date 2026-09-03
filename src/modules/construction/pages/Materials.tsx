import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import CustomSelect from "../components/common/CustomSelect";
import ProjectSelector from "../components/common/ProjectSelector";
import IssueReportingModal from "../components/reportingIssueModel";
import RequestMaterialModel from "../components/requestMaterialModel";
import PhotoModel from "../components/photoModel";
import SuccessModal from "../components/common/SuccessModal";
import MaterialRequestDetailsDialog from "../components/MaterialRequestDetailsDialog";
import MaterialsList, { getRequestedByName } from "../components/MaterialsList";
import {
  useMaterialRequestsQuery,
  useReviewMaterialRequestMutation,
  useExportMaterialRequestsMutation,
  useMaterialRequestFiltersQuery,
} from "../construction.hooks";
import type { MaterialRequestItem } from "../construction.api";

import {
  DollarSign,
  ShoppingBag,
  Lock,
  Hourglass,
  Download,
  Calendar,
} from "lucide-react";

// Icons for Stat Cards (matching image design with subtle borders/colors)
function DollarStatIcon() {
  return (
    <div className="w-9 h-9 rounded-lg border border-[#9333EA]/30 bg-[#F5F3FF] flex items-center justify-center text-[#9333EA]">
      <DollarSign className="w-5 h-5" />
    </div>
  );
}

function ShoppingBagStatIcon() {
  return (
    <div className="w-9 h-9 rounded-lg border border-[#22C55E]/30 bg-[#F0FDF4] flex items-center justify-center text-[#22C55E]">
      <ShoppingBag className="w-5 h-5" />
    </div>
  );
}

function LockStatIcon() {
  return (
    <div className="w-9 h-9 rounded-lg border border-[#EAB308]/30 bg-[#FEFCE8] flex items-center justify-center text-[#EAB308]">
      <Lock className="w-5 h-5" />
    </div>
  );
}

function HourglassStatIcon() {
  return (
    <div className="w-9 h-9 rounded-lg border border-[#EF4444]/30 bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]">
      <Hourglass className="w-5 h-5" />
    </div>
  );
}

function formatTitleCase(str: string) {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Materials() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedReqBy, setSelectedReqBy] = useState("all");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const [openReportModel, setReportModel] = useState(false);
  const [openRequestModel, setRequestModel] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [openPhotoModel, setPhotoModel] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequestItem | null>(null);

  const { data: filtersData } = useMaterialRequestFiltersQuery();

  const queryParams = useMemo(() => {
    return {
      leadId: selectedProject === "all" ? undefined : selectedProject,
      department: selectedDept === "all" ? undefined : selectedDept,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      requestedBy: selectedReqBy === "all" ? undefined : selectedReqBy,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: search.trim() || undefined,
    };
  }, [selectedProject, selectedDept, selectedStatus, selectedReqBy, startDate, endDate, search]);

  const { data, isLoading, refetch } = useMaterialRequestsQuery(queryParams);
  const reviewMutation = useReviewMaterialRequestMutation();
  const exportMutation = useExportMaterialRequestsMutation();

  const departmentOptions = useMemo(() => {
    const apiDepts = filtersData?.data?.departments || [];
    const options = apiDepts.map((d) => ({ label: formatTitleCase(d), value: d }));
    return [{ label: "All Departments", value: "all" }, ...options];
  }, [filtersData]);

  const statusFilterOptions = useMemo(() => {
    const apiStatuses = filtersData?.data?.statuses || [];
    const options = apiStatuses.map((s) => ({ label: formatTitleCase(s), value: s }));
    return options.length > 0
      ? [{ label: "All Status", value: "all" }, ...options]
      : [
          { label: "All Status", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Fulfilled", value: "fulfilled" },
          { label: "Cancelled", value: "cancelled" },
        ];
  }, [filtersData]);

  const requestedByOptions = useMemo(() => {
    const apiReqBy = filtersData?.data?.requestedBy || [];
    const options = apiReqBy.map((user) => ({ label: user.name, value: user._id }));
    return [{ label: "All", value: "all" }, ...options];
  }, [filtersData]);

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(queryParams);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `material-requests-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessTitle("Data Exported Successfully");
      setSuccessOpen(true);
    } catch (error) {
      console.error("Failed to export material requests:", error);
    }
  };

  const handleReviewRequest = async (
    req: MaterialRequestItem,
    action: "approved" | "rejected"
  ) => {
    const targetId = req._id || req.requestId;
    if (!targetId) return;

    try {
      await reviewMutation.mutateAsync({
        requestId: targetId,
        payload: {
          action,
          reviewNotes: action === "approved" ? "Approved" : "Rejected",
        },
      });
      setSuccessTitle(
        action === "approved"
          ? "Material Request Approved"
          : "Material Request Rejected"
      );
      setSuccessOpen(true);
    } catch (error) {
      console.error(`Failed to ${action} material request:`, error);
    }
  };

  const apiRequests = data?.data?.requests || [];
  const statsData = data?.data?.stats;

  const totalRequestsCount = statsData?.total ?? apiRequests.length ?? 0;
  const pendingCount = statsData?.pending?.count ?? 0;
  const approvedCount = statsData?.approved?.count ?? 0;
  const rejectedCount = statsData?.rejected?.count ?? 0;

  const filteredRequests = useMemo(() => {
    let requests = apiRequests;

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
  }, [apiRequests, search]);

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
            onClick={() => void handleExport()}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-gray-600" />
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end bg-white p-6 rounded-lg">
        <div>
          <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
            Projects
          </label>
          <ProjectSelector
            value={selectedProject}
            onValueChange={setSelectedProject}
            placeholder="All Projects"
            includeAllOption
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
            <Calendar className="w-4 h-4 text-gray-500" />
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
            </div>
            <HourglassStatIcon />
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tl from-[#EF4444]/10 to-transparent rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Main Table Card */}
      <MaterialsList
        requests={filteredRequests}
        isLoading={isLoading}
        isReviewing={reviewMutation.isPending}
        onView={(req) => {
          setSelectedRequestId(req._id);
          setSelectedRequest(req);
          setDetailsOpen(true);
        }}
        onUploadPhoto={(requestId) => {
          setSelectedRequestId(requestId);
          setPhotoModel(true);
        }}
        onReview={handleReviewRequest}
      />

      {/* Modals */}
      <MaterialRequestDetailsDialog
        open={detailsOpen}
        requestId={selectedRequestId}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedRequest(null);
          setSelectedRequestId(null);
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
          setPhotoModel(false);
          setSelectedRequestId(null);
        }}
        onSuccess={() => {
          setSuccessTitle("Photo Uploaded Successfully");
          setPhotoModel(false);
          setSuccessOpen(true);
          setSelectedRequestId(null);
        }}
      />
    </div>
  );
}
