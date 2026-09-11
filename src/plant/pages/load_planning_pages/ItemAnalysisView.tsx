import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import LoadPlanningHeader from "./LoadPlanningHeader";
import Button from "@/plant/components/common_component/Button";
import CommonInfoList from "@/plant/components/common_component/CommonInfoList";
import {
  useShipperDocumentQuery,
  useProjectShipperRequestsQuery,
} from "@/modules/plant/shipper.hooks";
import { useGenerateBundlePlanMutation } from "@/modules/plant/load-planning.hooks";

const Step1ItemAnalysis: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: shipperRequestsData, isLoading: isLoadingRequests } =
    useProjectShipperRequestsQuery(projectId || "");

  const approvedRequest = shipperRequestsData?.data?.shipperRequests?.find(
    (req) => req.fileStatus === "approved"
  );

  const { data: shipperDoc, isLoading: isLoadingDoc } = useShipperDocumentQuery(
    approvedRequest?.requestId || "",
    { enabled: !!approvedRequest?.requestId }
  );

  const [generateBundlePlan, { isPending: isGenerating }] = useGenerateBundlePlanMutation();

  const isLoading = isLoadingRequests || (!!approvedRequest && isLoadingDoc);

  const handleAutoOptimize = async () => {
    const requestId = approvedRequest?.requestId;
    if (!requestId) return;
    setErrorMsg(null);
    try {
      await generateBundlePlan(requestId).unwrap();
      navigate(`/plant/load-planning/${projectId}/bundle-planner`);
    } catch (err: unknown) {
      console.error("Failed to generate bundle plan:", err);
      const errorObj = err as { data?: { message?: string }; message?: string };
      const message = errorObj?.data?.message || errorObj?.message || "An unexpected error occurred during optimization.";
      setErrorMsg(message);
    }
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E51A4]"></div>
        <p className="text-gray-500 font-inter font-medium text-sm">
          Loading shipper document details...
        </p>
      </div>
    );
  }

  if (!approvedRequest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="text-red-500 font-inter font-medium text-sm">
          No approved shipper request found for this project.
        </p>
      </div>
    );
  }

  if (!shipperDoc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="text-gray-500 font-inter font-medium text-sm">
          Failed to load shipper document details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-5">
        {/* Project Details Header */}
        <div className="bg-[#F8F9FB] rounded-xl p-4 border border-gray-100">
          <CommonInfoList
            title={`Project: ${shipperDoc.projectName || "N/A"} `}
            items={[
              { label: "Project ID", value: shipperDoc.projectId || "" },
              { label: "Vendor Id", value: shipperDoc.vendorCode },
              { label: "Vendor", value: shipperDoc.vendorName },
            ]}
          />
        </div>
        <div className="flex flex-col gap-3">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-inter flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 font-bold ml-2 cursor-pointer">×</button>
            </div>
          )}
          {shipperDoc.fileStatus !== "approved" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-inter">
              Shipper request status must be approved to generate a bundle plan. Current status: <span className="font-bold">{getDisplayStatus(shipperDoc.fileStatus)}</span>.
            </div>
          )}
          <div className="flex justify-end">
            {shipperDoc.fileStatus === "approved" && (
              <Button
                variant="purpleFilled"
                className="font-bold px-6 py-2.5 whitespace-nowrap self-end md:self-auto cursor-pointer"
                onClick={handleAutoOptimize}
                disabled={isGenerating}
              >
                {isGenerating ? "Optimizing..." : "Auto Optimize Bundles"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white flex flex-col gap-5 rounded-xl border border-gray-100 p-5 shadow-sm">
        {/* Document Preview Section */}
        <div className="w-full overflow-hidden shadow-inner flex items-center justify-center">
          {shipperDoc.fileUrl ? (
            <iframe
              src={`${shipperDoc.fileUrl}#toolbar=0`}
              className="w-full h-[800px] rounded-lg border-0 bg-white"
              title={shipperDoc.fileName}
            />
          ) : (
            <div className="p-10 text-center text-gray-500 font-inter border border-dashed border-gray-200 rounded-lg w-full">
              No preview URL available for this document.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ItemAnalysisView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="min-h-screen">
      <LoadPlanningHeader
        requestId={projectId || ""}
        title="Item Analysis"
        description="Analyze the material list for accuracy and identify any missing or incompatible items."
        actions={[]}
      />
      <div className="md:p-6 p-3 pt-0">
        <Step1ItemAnalysis />
      </div>
    </div>
  );
};

export default ItemAnalysisView;
