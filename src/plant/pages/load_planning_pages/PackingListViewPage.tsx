import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Download } from "lucide-react";
import LoadPlanningHeader, { type HeaderAction } from "./LoadPlanningHeader";
import Button from "@/plant/components/common_component/Button";
import CommonInfoList from "@/plant/components/common_component/CommonInfoList";
import SubHeading from "@/plant/components/common_component/SubHeading";
import PackingListModal from "@/plant/components/modals/PackingListModal";
import { useGetTruckPlanQuery, useGetLoadPlanningStateQuery } from "@/modules/plant/load-planning.hooks";
import type { TruckPlanResponse, LoadPlanningStateResponse, PackingListEntry } from "@/modules/plant/load-planning.api";
import { exportPackingListToPDF } from "@/lib/exportUtils";

interface Step4PackingListProps {
  onViewPackingList: (packingList: PackingListEntry) => void;
  truckPlan: TruckPlanResponse;
  stateData?: LoadPlanningStateResponse;
}

const Step4PackingList: React.FC<Step4PackingListProps> = ({
  onViewPackingList,
  truckPlan,
  stateData,
}) => {
  const projectName = truckPlan?.project?.projectName || "N/A";
  const planNumber = truckPlan?.packingListPlan?.planNumber || "N/A";
  const totalBundles = stateData?.bundleSummary?.totalBundles ?? truckPlan.summary.totalBundles ?? 0;
  const totalWeight = stateData?.bundleSummary?.totalWeight ?? truckPlan.summary.totalWeight ?? 0;

  const handlePdfDownload = (row: PackingListEntry) => {
    const planId = truckPlan?.packingListPlan?._id;
    const bundles = stateData?.bundles || [];
    const resolvedBundles = bundles.filter((b) =>
      (row.bundleIds || []).includes(b._id)
    );

    const loadInfo = {
      packingListNo: row.packingListNo || "-",
      loadId: planNumber,
      projectName: projectName,
      truck: row.truckLabel || row.truckType || (row.truckNo ? String(row.truckNo) : "-"),
      driver: "-",
      destination: "-",
      dispatchDate: "-",
    };

    const summary = {
      totalBundles: row.totalBundles || row.bundleIds.length || 0,
      totalItems: row.totalItems || resolvedBundles.reduce((sum, b) => sum + (b.totalQty || b.itemCount || 0), 0),
      totalWeight: row.totalWeight || 0,
      maxLengthFeet: row.maxLengthFeet || 0,
    };

    const bundleList = resolvedBundles.map((b) => ({
      _id: b._id,
      bundleNo: b.bundleNo,
      partNumber: b.bundleType || b.title || "N/A",
      qty: b.totalQty || b.itemCount || 0,
      length: b.maxLengthFeet || 0,
      weight: b.totalWeight || 0,
      status: b.status || "Ready",
    }));

    exportPackingListToPDF(loadInfo, summary, bundleList, true, planId);
  };

  return (
    <div className="space-y-8 bg-white rounded-[14px] border border-gray-100 shadow-sm p-4 md:p-8">
      <CommonInfoList
        title={`Project: ${projectName} | Truckloads: ${truckPlan.summary.totalPackingLists}`}
        items={[
          { label: "Project", value: projectName },
          { label: "Packing List Plan ID", value: planNumber },
          { label: "Bundles Created", value: totalBundles.toString() },
          { label: "Total Weight", value: `${totalWeight.toLocaleString()} LBS` },
        ]}
        labelWidth="min-w-[160px]"
      />
      <div className="space-y-6">
        <SubHeading text="Optimization Summary Card" />
        <div className="max-w-md space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-inter font-semibold text-[#212B36]">
              Truck Loads
            </span>
            <span className="font-inter font-bold text-[#212B36]">
              {truckPlan.summary.totalPackingLists}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-inter font-semibold text-[#212B36]">
              Total Bundles
            </span>
            <span className="font-inter font-bold text-[#212B36]">
              {truckPlan.summary.totalBundles}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-inter font-semibold text-[#212B36]">
              Total Weight
            </span>
            <span className="font-inter font-bold text-[#212B36]">
              {truckPlan.summary.totalWeight.toLocaleString()} LBS
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-inter font-semibold text-[#212B36]">
              Packing List Generated
            </span>
            <span className="font-inter font-semibold text-[#212B36]">
              {truckPlan.packingLists.length}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 my-8" />

      <div className="space-y-4">
        <SubHeading text="Packing List" />
        <div className="overflow-x-auto rounded-sm border border-[#E2E4E6]">
          <table className="w-full text-left border-collapse min-w-[900px] font-inter">
            <thead>
              <tr className="bg-[#212B36] text-white text-xs font-semibold tracking-wider">
                <th className="py-4 px-6 w-16">#</th>
                <th className="py-4 px-6">Load ID</th>
                <th className="py-4 px-6">Truck</th>
                <th className="py-4 px-6">Bundles</th>
                <th className="py-4 px-6">Weight</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {truckPlan.packingLists.map((row, index) => (
                <tr
                  key={row._id}
                  className="hover:bg-gray-50/50 transition-colors font-inter"
                >
                  <td className="py-6 px-6 font-normal">{index + 1}</td>
                  <td className="py-6 px-6 font-normal text-gray-700">
                    {row.packingListNo}
                  </td>
                  <td className="py-6 px-6 font-normal text-gray-700">
                    {row.truckLabel || row.truckType || (row.truckNo ? String(row.truckNo) : "N/A")}
                  </td>
                  <td className="py-6 px-6 font-normal text-gray-700">
                    {row.totalBundles}
                  </td>
                  <td className="py-6 px-6 font-normal text-gray-700">
                    <div className="leading-tight">
                      <div>{row.totalWeight.toLocaleString()}</div>
                      <div>LBS</div>
                    </div>
                  </td>
                  <td className="py-6 px-6 font-normal text-gray-700 capitalize">
                    {row.status || "Ready"}
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <Button variant="grayFilled" size="sm" onClick={() => handlePdfDownload(row)}>
                        <Download size={18} strokeWidth={2.5} />
                      </Button>
                      <Button
                        variant="grayFilled"
                        size="sm"
                        className="px-6"
                        onClick={() => onViewPackingList(row)}
                      >
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {truckPlan.packingLists.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No packing lists available.
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

const PackingListViewPage: React.FC = () => {
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
      label: "Generate QR Label",
      variant: "purpleFilled",
      className: "px-8 py-2.5 font-bold",
      onClick: () => {
        if (projectId) {
          navigate(`/plant/load-planning/${projectId}/qr-label`);
        }
      },
    },
  ];

  if (isTruckPlanLoading || isStateLoading) {
    return (
      <div className="min-h-screen">
        <LoadPlanningHeader
          requestId={projectId || ""}
          title="Packing List"
          description="Generate and manage packing lists for truckloads and bundles."
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
          title="Packing List"
          description="Generate and manage packing lists for truckloads and bundles."
          actions={[]}
        />
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-red-500 font-inter font-bold text-lg">Error loading packing list data</p>
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
        title="Packing List"
        description="Generate and manage packing lists for truckloads and bundles."
        actions={actions}
      />
      <div className="md:p-6 p-3 pt-0">
        <Step4PackingList
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

export default PackingListViewPage;
