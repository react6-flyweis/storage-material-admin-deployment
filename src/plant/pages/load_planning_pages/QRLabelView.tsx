import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { QrCode } from "lucide-react";
import LoadPlanningHeader, { type HeaderAction } from "./LoadPlanningHeader";
import Button from "@/plant/components/common_component/Button";
import CommonInfoList from "@/plant/components/common_component/CommonInfoList";
import SubHeading from "@/plant/components/common_component/SubHeading";
import PackingListModal from "@/plant/components/modals/PackingListModal";
import { useGetTruckPlanQuery, useGetLoadPlanningStateQuery } from "@/modules/plant/load-planning.hooks";
import type { TruckPlanResponse, LoadPlanningStateResponse, PackingListEntry } from "@/modules/plant/load-planning.api";

interface Step5QRLabelProps {
  onViewLabel: (packingList: PackingListEntry) => void;
  truckPlan: TruckPlanResponse;
  stateData?: LoadPlanningStateResponse;
}

const Step5QRLabel: React.FC<Step5QRLabelProps> = ({
  onViewLabel,
  truckPlan,
  stateData,
}) => {
  const projectName = truckPlan?.project?.projectName || "N/A";
  const planNumber = truckPlan?.packingListPlan?.planNumber || "N/A";
  const totalBundles = stateData?.bundleSummary?.totalBundles ?? truckPlan.summary.totalBundles ?? 0;
  const totalWeight = stateData?.bundleSummary?.totalWeight ?? truckPlan.summary.totalWeight ?? 0;

  return (
    <div className="space-y-8 bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-8">
      {/* Project Header Card */}
      <CommonInfoList
        title={`Project: ${projectName} | Packing Plan: ${planNumber}`}
        items={[
          { label: "Project", value: projectName },
          { label: "Packing List Plan ID", value: planNumber },
          { label: "Bundles Created", value: totalBundles.toString() },
          { label: "Total Weight", value: `${totalWeight.toLocaleString()} LBS` },
        ]}
        labelWidth="min-w-[160px]"
      />

      {/* Summary Card Section */}
      <div className="space-y-6">
        <SubHeading text="Summary Card" />
        <div className="max-w-md space-y-4">
          {[
            { label: "Total Bundles", value: totalBundles.toString() },
            { label: "Labels Generated", value: totalBundles.toString() },
            { label: "Labels Printed", value: totalBundles.toString() },
            { label: "Pending Labels", value: "0" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center text-sm md:text-base">
              <span className="font-inter font-semibold text-[#212B36]">
                {item.label}
              </span>
              <span className="font-inter font-bold text-[#212B36]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100 my-8" />

      {/* Truck List Table */}
      <div className="space-y-4">
        <SubHeading text="Truck List" />
        <div className="overflow-x-auto rounded-lg border border-[#E2E4E6]">
          <table className="w-full text-left border-collapse min-w-[900px] font-inter">
            <thead>
              <tr className="bg-[#212B36] text-white text-xs font-semibold tracking-wider">
                <th className="py-4 px-6 w-16">#</th>
                <th className="py-4 px-6">Load ID</th>
                <th className="py-4 px-6">Truck</th>
                <th className="py-4 px-6">Bundles</th>
                <th className="py-4 px-6">Weight</th>
                <th className="py-4 px-6">Destination</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {truckPlan.packingLists.map((row, index) => (
                <tr key={row._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 px-6 font-normal text-gray-400">{index + 1}</td>
                  <td className="py-6 px-6 font-bold text-[#212B36]">{row.packingListNo}</td>
                  <td className="py-6 px-6 font-normal text-[#212B36]">
                    {row.truckLabel || row.truckType || (row.truckNo ? String(row.truckNo) : "N/A")}
                  </td>
                  <td className="py-6 px-6 font-normal text-[#637381]">{row.totalBundles}</td>
                  <td className="py-6 px-6 font-normal text-[#637381]">
                    {row.totalWeight.toLocaleString()} LBS
                  </td>
                  <td className="py-6 px-6 font-normal text-[#637381]">{projectName} Site A</td>
                  <td className="py-6 px-6 font-normal text-[#637381] capitalize">{row.status || "Ready"}</td>
                  <td className="py-6 px-6">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="blueFilled"
                        size="sm"
                        className="whitespace-nowrap bg-[#1E51A4] border-[#1E51A4] text-white hover:opacity-90 font-bold flex items-center gap-2 rounded-lg"
                        onClick={() => onViewLabel(row)}
                      >
                        <QrCode />
                        <span>View QR</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {truckPlan.packingLists.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No truck loads available.
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

const QRLabelView: React.FC = () => {
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
      label: "Review Load Plan",
      variant: "purpleFilled",
      className: "px-8 py-2.5 font-bold",
      onClick: () => {
        if (projectId) {
          navigate(`/plant/load-planning/${projectId}/load-plan-review`);
        }
      },
    },
  ];

  if (isTruckPlanLoading || isStateLoading) {
    return (
      <div className="min-h-screen">
        <LoadPlanningHeader
          requestId={projectId || ""}
          title="QR Label Generator"
          description="Generate and print QR labels for bundles and pallets to enable scanning and tracking."
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
          title="QR Label Generator"
          description="Generate and print QR labels for bundles and pallets to enable scanning and tracking."
          actions={[]}
        />
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-red-500 font-inter font-bold text-lg">Error loading QR label data</p>
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
        title="QR Label Generator"
        description="Generate and print QR labels for bundles and pallets to enable scanning and tracking."
        actions={actions}
      />
      <div className="md:p-6 p-3 pt-0">
        <Step5QRLabel
          onViewLabel={(packingList) => {
            setSelectedPackingList(packingList);
            setIsPackingListModalOpen(true);
          }}
          truckPlan={truckPlan}
          stateData={stateData}
        />
      </div>
      <PackingListModal
        showQr={true}
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

export default QRLabelView;
