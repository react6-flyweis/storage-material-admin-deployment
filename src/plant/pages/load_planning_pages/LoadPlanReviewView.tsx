import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Check } from "lucide-react";
import LoadPlanningHeader, { type HeaderAction } from "./LoadPlanningHeader";
import Button from "@/plant/components/common_component/Button";
import CommonInfoList from "@/plant/components/common_component/CommonInfoList";
import SubHeading from "@/plant/components/common_component/SubHeading";
import PackingListModal from "@/plant/components/modals/PackingListModal";
import { useGetTruckPlanQuery, useGetLoadPlanningStateQuery } from "@/modules/plant/load-planning.hooks";
import type { TruckPlanResponse, LoadPlanningStateResponse, PackingListEntry } from "@/modules/plant/load-planning.api";

interface Step6LoadPlanReviewProps {
  onViewPackingList: (packingList: PackingListEntry) => void;
  truckPlan: TruckPlanResponse;
  stateData?: LoadPlanningStateResponse;
}

const Step6LoadPlanReview: React.FC<Step6LoadPlanReviewProps> = ({
  onViewPackingList,
  truckPlan,
  stateData,
}) => {
  const projectName = truckPlan?.project?.projectName || "-";
  const planNumber = truckPlan?.packingListPlan?.planNumber || "-";

  return (
    <div className="space-y-12 bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-8">
      {/* Project Header Card */}
      <CommonInfoList
        title={`Project: ${projectName} | Packing Plan: ${planNumber}`}
        items={[
          { label: "Project", value: projectName },
          { label: "Packing List Plan ID", value: planNumber },
          { label: "Status", value: truckPlan.packingListPlan.status || "-" },
        ]}
        labelWidth="min-w-[160px]"
      />
      {/* Load Summary Card */}
      <div className="space-y-6">
        <SubHeading text="Load Summary Card" />
        <div className="max-w-md space-y-4">
          {[
            { label: "Total Bundles", value: truckPlan.summary.totalBundles.toString() },
            { label: "Total Loads", value: truckPlan.summary.totalPackingLists.toString() },
            { label: "Total Weight", value: `${truckPlan.summary.totalWeight.toLocaleString()} LBS` },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center text-sm md:text-base">
              <span className="font-inter font-bold text-[#212B36]">
                {item.label}
              </span>
              <span className="font-inter font-bold text-[#212B36]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Truckload Summary */}
      <div className="space-y-6">
        <SubHeading text="Truckload Summary" />
        <div className="overflow-x-auto rounded-lg border border-[#E2E4E6]">
          <table className="w-full text-left border-collapse min-w-[900px] font-inter">
            <thead>
              <tr className="bg-[#212B36] text-white text-sm font-medium tracking-wider">
                <th className="py-4 px-6 w-16">#</th>
                <th className="py-4 px-6">Load ID</th>
                <th className="py-4 px-6">Bundle</th>
                <th className="py-4 px-6">Total Weight</th>
                <th className="py-4 px-6">Ready</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {truckPlan.packingLists.map((row, index) => (
                <tr key={row._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 px-6 font-normal text-gray-400">{index + 1}</td>
                  <td className="py-6 px-6 font-normal text-[#212B36]">{row.packingListNo}</td>
                  <td className="py-6 px-6 font-normal text-[#212B36]">{row.totalBundles}</td>
                  <td className="py-6 px-6 font-normal text-[#919EAB]">{row.totalWeight.toLocaleString()} LBS</td>
                  <td className="py-6 px-6">
                    {(row.status === "confirmed" || row.status === "Ready" || row.status === "ready") ? (
                      <span className="text-[#212B36] font-normal text-lg">✔</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-6 px-6 text-center">
                    <Button
                      variant="grayFilled"
                      size="sm"
                      className="px-6 text-white font-bold"
                      onClick={() => onViewPackingList(row)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {truckPlan.packingLists.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No truck loads available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bundle Verification */}
      <div className="space-y-6">
        <SubHeading text="Bundle Verification" />
        <div className="overflow-x-auto rounded-lg border border-[#E2E4E6]">
          <table className="w-full text-left border-collapse min-w-[900px] font-inter">
            <thead>
              <tr className="bg-[#212B36] text-white text-sm font-medium tracking-wider">
                <th className="py-4 px-6 w-16">#</th>
                <th className="py-4 px-6">Bundle ID</th>
                <th className="py-4 px-6">Parts</th>
                <th className="py-4 px-6">Weight</th>
                <th className="py-4 px-6">Packing List Generated</th>
                <th className="py-4 px-6">QR Labels Generated</th>
                <th className="py-4 px-6">Bundles Assigned to Truck</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {(stateData?.bundles || []).map((bundle, index) => {
                const isAssigned = truckPlan.packingLists.some((pl) => pl.bundleIds.includes(bundle._id));
                return (
                  <tr key={bundle._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 px-6 font-normal text-gray-400">{index + 1}</td>
                    <td className="py-6 px-6 font-normal text-[#212B36]">{bundle.bundleNo}</td>
                    <td className="py-6 px-6 font-normal text-[#919EAB]">{bundle.bundleType || bundle.title || "-"}</td>
                    <td className="py-6 px-6 font-normal text-[#919EAB]">{bundle.totalWeight?.toLocaleString() || "-"} LBS</td>
                    <td className="py-6 px-6">
                      {isAssigned ? <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs"><Check size={14} /></div> : "-"}
                    </td>
                    <td className="py-6 px-6">
                      {isAssigned ? <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs"><Check size={14} /></div> : "-"}
                    </td>
                    <td className="py-6 px-6">
                      {isAssigned ? <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs"><Check size={14} /></div> : "-"}
                    </td>
                  </tr>
                );
              })}
              {(stateData?.bundles || []).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No bundles available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LoadPlanReviewView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isPackingListModalOpen, setIsPackingListModalOpen] = useState(false);
  const [selectedPackingList, setSelectedPackingList] = useState<PackingListEntry | null>(null);

  const { data: truckPlan, isLoading: isTruckPlanLoading, isError: isTruckPlanError, error: truckPlanError } = useGetTruckPlanQuery(projectId || "", {
    skip: !projectId,
  });

  const { data: stateData, isLoading: isStateLoading } = useGetLoadPlanningStateQuery(projectId || "", {
    skip: !projectId,
  });

  const actions: HeaderAction[] = [
    {
      label: "Approve & Create Freight Request",
      variant: "purpleFilled",
      className: "px-8 py-2.5 font-bold",
      onClick: () => {
        if (projectId) {
          navigate(`/plant/load-planning/${projectId}/freight-selection`);
        }
      },
    },
  ];

  if (isTruckPlanLoading || isStateLoading) {
    return (
      <div className="min-h-screen">
        <LoadPlanningHeader
          requestId={projectId || ""}
          title="Load Plan Review"
          description="Final check of the entire load plan, including bundles, trucks, and weights, before selecting freight carriers."
          actions={[]}
        />
        <div className="p-6 pt-0">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E51A4]" />
          </div>
        </div>
      </div>
    );
  }

  if (isTruckPlanError || !truckPlan) {
    return (
      <div className="min-h-screen">
        <LoadPlanningHeader
          requestId={projectId || ""}
          title="Load Plan Review"
          description="Final check of the entire load plan, including bundles, trucks, and weights, before selecting freight carriers."
          actions={[]}
        />
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-red-500 font-inter font-bold text-lg">Error loading load plan data</p>
            <p className="text-gray-500 font-inter text-sm max-w-md text-center">
              {((truckPlanError as { data?: { message?: string }; message?: string })?.data?.message ||
                (truckPlanError as { data?: { message?: string }; message?: string })?.message ||
                "Failed to load truck plan. Please try again.")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <LoadPlanningHeader
        requestId={projectId || ""}
        title="Load Plan Review"
        description="Final check of the entire load plan, including bundles, trucks, and weights, before selecting freight carriers."
        actions={actions}
      />
      <div className="md:p-6 p-3 pt-0">
        <Step6LoadPlanReview
          onViewPackingList={(row) => {
            setSelectedPackingList(row);
            setIsPackingListModalOpen(true);
          }}
          truckPlan={truckPlan}
          stateData={stateData}
        />
      </div>
      <PackingListModal
        isOpen={isPackingListModalOpen}
        onClose={() => {
          setIsPackingListModalOpen(false);
          setSelectedPackingList(null);
        }}
        packingList={selectedPackingList}
        bundles={stateData?.bundles}
        projectName={truckPlan?.project?.projectName}
        planNumber={truckPlan?.packingListPlan?.planNumber}
        planId={truckPlan?.packingListPlan?._id}
      />
    </div>
  );
};

export default LoadPlanReviewView;
