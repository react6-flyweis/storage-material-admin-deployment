import React from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import xlxsIcon from "@/assets/icon/dashboard/xlxs.svg";

import Button from "@/plant/components/common_component/Button";

import {
  useGetConsolidatedBOMQuery,
  useGetConsolidatedBOMUrlQuery,
  type PlantProjectDetail,
} from "@/modules/plant/bom.hooks";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";

import { BOMListContent } from "./bom-list-content-view";

const BOMView: React.FC = () => {
  const navigate = useNavigate();
  const { id, projectId: paramProjectId } = useParams<{ id?: string; projectId?: string }>();
  const projectId = paramProjectId || id || "";

  const { data: leadData } = useLeadDetailQuery(projectId);

  const {
    data: consolidatedBOMData,
    isLoading: isBOMLoading,
    error: bomError,
  } = useGetConsolidatedBOMQuery(projectId);

  const {
    data: bomUrlData,
    isLoading: isBomUrlLoading,
  } = useGetConsolidatedBOMUrlQuery(projectId);

  if (isBOMLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E51A4]"></div>
        <p className="text-gray-500 font-inter font-medium text-sm">
          Loading BOM details...
        </p>
      </div>
    );
  }

  if (bomError) {
    const is404 = bomError && typeof bomError === "object" && "status" in bomError && (bomError as { status: number }).status === 404;
    return (
      <div className="xl:pr-5 px-2 pb-10 space-y-6">
        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="blueFilled"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold font-inter text-[#212B36]">
            BOM Files Details
          </h1>
        </div>
        <div className="p-10 text-center bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
          <p className="font-semibold text-lg font-inter text-[#212B36]">
            {is404 ? "Consolidated BOM Not Generated Yet" : "Error Loading BOM Details"}
          </p>
          <p className="text-sm text-gray-500 font-inter max-w-md">
            {is404
              ? "The consolidated Bill of Materials (BOM) has not been generated for this project. Please make sure that BOM files have been uploaded and processed."
              : "Something went wrong while retrieving the consolidated BOM. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const consolidatedBOM = consolidatedBOMData?.consolidatedBOM;
  if (!consolidatedBOM) {
    return null;
  }

  const leadObj = leadData?.data?.lead as Record<string, unknown> | undefined;
  const projectDetail: PlantProjectDetail | undefined = leadObj
    ? {
        lead: leadObj as PlantProjectDetail["lead"],
        client: typeof leadObj.customerId === "object" && leadObj.customerId !== null ? (leadObj.customerId as PlantProjectDetail["client"]) : undefined,
        jobId: typeof leadObj.jobId === "string" ? leadObj.jobId : (typeof leadObj.leadId === "string" ? leadObj.leadId : undefined),
      }
    : undefined;

  const handleDownload = () => {
    if (bomUrlData?.fileUrl) {
      window.open(bomUrlData.fileUrl, "_blank");
    }
  };

  return (
    <div className="xl:pr-5 px-2 pb-10 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="blueFilled"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold font-inter text-[#212B36]">
            BOM Files Details
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <Button
            variant="white"
            size="sm"
            onClick={handleDownload}
            disabled={isBomUrlLoading || !bomUrlData?.fileUrl}
          >
            <img src={xlxsIcon} alt="xlsx" className="w-4 h-4 mr-2" />
            {isBomUrlLoading ? "Loading..." : "Download Excel"}
          </Button>
          <Button
            size="sm"
            variant="purpleFilled"
            onClick={() => navigate(`generate-shipper-order`)}
          >
            Share with Shippers
          </Button>
        </div>
      </div>

      <BOMListContent consolidatedBOM={consolidatedBOM} projectDetail={projectDetail} />
    </div>
  );
};

export default BOMView;
