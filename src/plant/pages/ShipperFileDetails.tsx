import React from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Scale, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useShipperDocumentQuery,
  usePollCompareJobsStatusMutation,
} from "@/modules/plant/shipper.hooks";
import { truncateMiddle } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  "Approved": "border-emerald-200 bg-emerald-100 text-emerald-600",
  "Comparison Completed": "border-emerald-200 bg-emerald-100 text-emerald-600",
  "Rejected": "border-rose-200 bg-rose-100 text-rose-500",
  "Comparison Failed": "border-rose-200 bg-rose-100 text-rose-500",
  "File Received": "border-amber-200 bg-amber-100 text-amber-600",
  "Comparison Processing": "border-amber-200 bg-amber-100 text-amber-600",
  "Sent": "border-indigo-200 bg-indigo-100 text-indigo-500",
  "Resubmit Requested": "border-cyan-200 bg-cyan-100 text-cyan-600",
};

const getDisplayStatus = (status: string) => {
  switch (status) {
    case "sent":
      return "Sent";
    case "submitted":
      return "File Received";
    case "comparison_processing":
      return "Comparison Processing";
    case "comparison_completed":
      return "Comparison Completed";
    case "comparison_failed":
      return "Comparison Failed";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "resubmit_requested":
      return "Resubmit Requested";
    default:
      return status;
  }
};

const ShipperFileDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { fileId: requestId } = useParams();

  const { data: shipperDocResponse, isLoading, error, refetch } = useShipperDocumentQuery(requestId || "");
  const { mutateAsync: pollCompareJobsStatus } = usePollCompareJobsStatusMutation();

  const shipperDoc = shipperDocResponse?.data;

  React.useEffect(() => {
    const compareJobId = shipperDoc?.compareJobId;
    if (!compareJobId || shipperDoc.fileStatus !== "comparison_processing") {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await pollCompareJobsStatus({ jobIds: [compareJobId] });
        const job = response.jobs?.[0];
        if (job) {
          const status = job.status?.toLowerCase();
          if (status !== "pending" && status !== "processing" && status !== "comparison_processing") {
            refetch();
          }
        }
      } catch (err) {
        console.error("Error polling comparison job status:", err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [shipperDoc?.compareJobId, shipperDoc?.fileStatus, pollCompareJobsStatus, refetch]);

  const handleDownload = async () => {
    if (!shipperDoc?.fileUrl) return;
    try {
      const response = await fetch(shipperDoc.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", shipperDoc.fileName || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file directly, falling back to opening:", error);
      window.open(shipperDoc.fileUrl, "_blank");
    }
  };

  // const showViewComparison = shipperDoc?.fileStatus === "comparison_completed" ||
  //   shipperDoc?.fileStatus === "approved" ||
  //   shipperDoc?.fileStatus === "resubmit_requested" ||
  //   shipperDoc?.fileStatus === "rejected";

  const showVerification = shipperDoc?.fileStatus !== "comparison_completed" &&
    shipperDoc?.fileStatus !== "approved" &&
    shipperDoc?.fileStatus !== "rejected" &&
    shipperDoc?.fileStatus !== "resubmit_requested";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E51A4]"></div>
        <p className="text-gray-500 font-inter font-medium text-sm">
          Loading shipper document details...
        </p>
      </div>
    );
  }

  if (error || !shipperDoc) {
    return (
      <div className="xl:pr-5 px-2 pb-10 space-y-6">
        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 shrink-0 bg-[#1E51A4] hover:bg-[#154085] text-white"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </Button>
          <h1 className="text-2xl font-inter font-bold text-[#212B36]">
            Shipper File Details
          </h1>
        </div>
        <div className="p-10 text-center bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
          <p className="font-semibold text-lg font-inter text-[#212B36]">
            Error Loading Shipper Document
          </p>
          <p className="text-sm text-gray-500 font-inter max-w-md">
            Something went wrong while retrieving shipper document details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const currentDisplayStatus = getDisplayStatus(shipperDoc.fileStatus);

  return (
    <div className="xl:pr-5 px-2 pb-10 space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 shrink-0 bg-[#1E51A4] hover:bg-[#154085] text-white"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </Button>
          <h1 className="text-2xl font-inter font-bold text-[#212B36]">
            Shipper File Details
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {shipperDoc.fileUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2 border-[#E2E8F0] font-inter font-bold text-[#212B36] bg-white hover:bg-gray-50"
            >
              <FileDown size={18} /> Download file
            </Button>
          )}
          {showVerification && (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/plant/order-verification")}
              className="flex items-center gap-2 font-inter font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              disabled={shipperDoc?.fileStatus === "comparison_processing"}
            >
              <Scale size={18} /> Order Verification
            </Button>
          )}
          {/* {showViewComparison && (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/load_planning/${requestId}/comparison-result`)}
              className="flex items-center gap-2 font-inter font-bold bg-[#1E51A4] hover:bg-[#154085] text-white"
            >
              <Eye size={18} /> View Comparison Detail
            </Button>
          )} */}
          {/* {shipperDoc?.fileStatus === "approved" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/load_planning/${shipperDoc.leadId}`)}
              className="flex items-center gap-2 font-inter font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              Start Load Planning
            </Button>
          )} */}
        </div>
      </div>

      {/* ── Main Content Card ─────────────────────────────────────────── */}
      <div className="bg-white p-5 space-y-5">

        {/* Project Details Header */}
        <div className="bg-[#F8FAFC] rounded-[10px] p-6 border border-[#F1F5F9]">
          <h2 className="text-2xl font-inter font-bold text-[#212B36] mb-5">
            Project: {shipperDoc.projectName || "ABC Warehouse Project"}
          </h2>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-inter font-medium text-[#637381] w-24">Project ID:</span>
                <span className="text-sm font-inter font-bold text-[#212B36]">{shipperDoc.projectId}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-inter font-medium text-[#637381] w-24">Shipper:</span>
                <span className="text-sm font-inter font-bold text-[#212B36]">{shipperDoc.vendorName}</span>
              </div>
            </div>


            <div className="hidden lg:block w-px h-16 bg-[#CBD5E1] mx-10"></div>


            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-inter font-medium text-[#637381] w-28">Shipper File:</span>
                <span className="text-sm font-inter font-bold text-[#212B36]" title={shipperDoc.fileName || undefined}>
                  {truncateMiddle(shipperDoc.fileName || "")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-inter font-medium text-[#637381] w-28">Upload Date:</span>
                <span className="text-sm font-inter font-bold text-[#212B36]">{formatDate(shipperDoc.uploadedDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-inter font-medium text-[#637381] w-28">Status:</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                    statusStyles[currentDisplayStatus] || "border-gray-200 bg-gray-50 text-gray-500"
                  )}
                >
                  {currentDisplayStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Document Preview Section */}
        <div className="w-full overflow-hidden shadow-inner flex items-center justify-center">
          {shipperDoc.fileUrl ? (
            <iframe
              src={`${shipperDoc.fileUrl}#toolbar=0`}
              className="w-full h-[800px] rounded-lg border-0 bg-white"
              title={shipperDoc.fileName}
            />
          ) : (
            <div className="p-10 text-center text-gray-500 font-inter">
              No preview URL available for this document.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipperFileDetailsView;
