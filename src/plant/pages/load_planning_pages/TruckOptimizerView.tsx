import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import LoadPlanningHeader, { type HeaderAction } from "./LoadPlanningHeader";
import SubHeading from "@/plant/components/common_component/SubHeading";
import CommonInfoList from "@/plant/components/common_component/CommonInfoList";
import { useGetTruckPlanQuery, useConfirmTruckPlanMutation } from "@/modules/plant/load-planning.hooks";

const TruckOptimizerView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetTruckPlanQuery(projectId || "");
  const [confirmTruckPlan, { isPending: isConfirming }] = useConfirmTruckPlanMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const isConfirmed = data?.packingListPlan?.status === "confirmed";

  const handleConfirm = async () => {
    if (!projectId) return;
    setApiError(null);
    try {
      await confirmTruckPlan(projectId).unwrap();
      navigate(`/plant/load-planning/${projectId}/packing-list`);
    } catch (err: unknown) {
      console.error("Failed to confirm truck plan:", err);
      const errObj = err as { data?: { message?: string }; message?: string };
      const errMsg = errObj?.data?.message || errObj?.message || "Failed to confirm truck plan.";
      setApiError(errMsg);
    }
  };

  const actions: HeaderAction[] = [
    {
      label: isConfirming ? "Confirming..." : "Generate Packing List",
      variant: "purpleFilled",
      className: `px-8 py-2.5 font-bold ${isConfirming ? "opacity-75 cursor-not-allowed" : ""}`,
      disabled: isConfirming,
      onClick: isConfirmed ? () => navigate(`/plant/load-planning/${projectId}/packing-list`) : handleConfirm,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadPlanningHeader
          requestId={projectId || ""}
          title="Truckload Optimizer"
          description="Optimize bundle assignments into truckloads to maximize utilization and prepare shipments for dispatch."
          actions={[]}
        />
        <div className="p-6 pt-0">
          <div className="space-y-8 bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen">
        <LoadPlanningHeader
          requestId={projectId || ""}
          title="Truckload Optimizer"
          description="Optimize bundle assignments into truckloads to maximize utilization and prepare shipments for dispatch."
          actions={actions}
        />
        <div className="md:p-6 p-3 pt-0">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm animate-fade-in">
            <p className="text-red-500 font-inter font-bold text-lg">Error loading truck plan</p>
            <p className="text-gray-500 font-inter text-sm max-w-md text-center">
              {((error as { data?: { message?: string }; message?: string })?.data?.message ||
                (error as { data?: { message?: string }; message?: string })?.message ||
                "Failed to load truck plan. Please try again.")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { packingLists } = data;
  const totalBundles = data.summary?.totalBundles ?? data.packingListPlan?.totalBundles ?? 0;
  const plannedTruckLoads = data.summary?.totalPackingLists ?? data.packingListPlan?.totalPackingLists ?? packingLists.length;
  const totalWeight = data.summary?.totalWeight ?? data.packingListPlan?.totalWeight ?? 0;

  const validPackingLists = packingLists.filter((p) => p.maxTruckWeight > 0);
  const averageLoadUtilization = validPackingLists.length
    ? Math.round(
        validPackingLists.reduce(
          (sum, row) => sum + (row.totalWeight / row.maxTruckWeight) * 100,
          0
        ) / validPackingLists.length
      )
    : 0;

  const optimizationSummary = [
    { label: "Total Bundles", value: totalBundles.toString() },
    { label: "Planned Truck Loads", value: plannedTruckLoads.toString() },
    { label: "Total Weight", value: `${totalWeight.toLocaleString()} LBS` },
    { label: "Average Load Utilization", value: `${averageLoadUtilization}%` },
  ];

  const truckSummary = data.summary?.truckSummary;
  const truckSummaryItems = [
    { label: "53' Semi Truck Count", value: (truckSummary?.semi53Count ?? 0).toString() },
    { label: "40' Hotshot Count", value: (truckSummary?.hotshot40Count ?? 0).toString() },
    { label: "Total Trucks", value: (truckSummary?.totalTrucks ?? 0).toString() },
  ];

  return (
    <div className="min-h-screen">
      {apiError && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {apiError}
        </div>
      )}
      <LoadPlanningHeader
        requestId={projectId || ""}
        title="Truckload Optimizer"
        description="Optimize bundle assignments into truckloads to maximize utilization and prepare shipments for dispatch."
        actions={actions}
      />
      <div className="p-6 pt-0">
        {data && (
          <div className="space-y-8 bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-8">
            <div className="bg-[#F8F9FB] rounded-xl p-4 border border-gray-100">
              <CommonInfoList
                title={`Project: ${data?.project?.projectName || "N/A"} | Packing Plan ID: ${data?.packingListPlan?.planNumber || "-"}`}
                items={[
                  { label: "Project ID", value: data?.project?.projectId || "" },
                  { label: "Packing Plan Id", value: data?.packingListPlan?.planNumber || "-" },
                ]}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4 max-w-lg">
                <SubHeading text="Optimization Summary Card" />
                <div className="space-y-3">
                  {optimizationSummary.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm md:text-base font-inter"
                    >
                      <span className="text-gray-500 font-medium">
                        {item.label}
                      </span>
                      <span className="text-[#212B36] font-normal">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 max-w-lg">
                <SubHeading text="Truck Summary" />
                <div className="space-y-3">
                  {truckSummaryItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm md:text-base font-inter"
                    >
                      <span className="text-gray-500 font-medium">
                        {item.label}
                      </span>
                      <span className="text-[#212B36] font-normal">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <SubHeading text="Truckload Table" />
              <div className="overflow-x-auto rounded-sm border border-[#E2E4E6]">
                <table className="w-full text-left border-collapse min-w-[900px] font-inter">
                  <thead>
                    <tr className="bg-[#212B36] text-white text-xs font-semibold tracking-wider">
                      <th className="py-4 px-6 w-16">#</th>
                      <th className="py-4 px-6">Load ID</th>
                      <th className="py-4 px-6">Bundle</th>
                      <th className="py-4 px-6">Total Weight</th>
                      <th className="py-4 px-6">Utilization</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {packingLists.map((row, idx) => {
                      const utilVal = row.maxTruckWeight
                        ? Math.round((row.totalWeight / row.maxTruckWeight) * 100)
                        : 0;
                      return (
                        <tr
                          key={row._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-6 px-6 font-normal text-gray-400">
                            {idx + 1}
                          </td>
                          <td className="py-6 px-6 font-normal text-[#212B36]">
                            {row.packingListNo}
                          </td>
                          <td className="py-6 px-6 font-normal text-[#637381] whitespace-pre-line leading-relaxed">
                            {row.totalBundles || (row.bundleIds ? row.bundleIds.length : 0)}
                          </td>
                          <td className="py-6 px-6 font-normal text-[#919EAB]">
                            {row.totalWeight} LBS
                          </td>
                          <td className="py-6 px-6 font-normal text-[#637381]">
                            {utilVal > 0 ? `${utilVal}%` : "-"}
                          </td>
                          <td className="py-6 px-6 font-normal text-[#637381] capitalize">
                            {row.status || "Ready"}
                          </td>
                        </tr>
                      );
                    })}
                    {packingLists.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500 font-inter">
                          No truckloads planned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckOptimizerView;
