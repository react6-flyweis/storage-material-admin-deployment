import React from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { useBundlePlanDetailsQuery } from "@/modules/plant/load-planning.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadPlanDetails() {
  const { projectId, loadId } = useParams();

  // Fetch bundle plan details
  const { data: response, isLoading, error } = useBundlePlanDetailsQuery(loadId || "");

  const bundlePlan = response?.data?.bundlePlan;
  const bundles = response?.data?.bundles || [];
  const summary = response?.data?.summary;

  // Group bundles by loadSequence
  const bundlesByLoad = React.useMemo(() => {
    const groups: Record<number, typeof bundles> = {};
    bundles.forEach((b) => {
      const seq = b.loadSequence || 1;
      if (!groups[seq]) {
        groups[seq] = [];
      }
      groups[seq].push(b);
    });
    return groups;
  }, [bundles]);

  // Generate truckload summary dynamically
  const truckloadSummaryData = React.useMemo(() => {
    return Object.entries(bundlesByLoad)
      .map(([seqStr, list]) => {
        const seq = Number(seqStr);
        const totalWeight = list.reduce((sum, b) => sum + (b.totalWeight || 0), 0);
        return {
          id: `LOAD-${String(seq).padStart(3, "0")}`,
          loadSequence: seq,
          bundleCount: list.length,
          weight: `${totalWeight.toLocaleString()} LBS`,
          destination: "Site Delivery",
          checked: list.every((b) => b.status === "assigned_to_truck" || b.status === "delivered"),
        };
      })
      .sort((a, b) => a.loadSequence - b.loadSequence);
  }, [bundlesByLoad]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-[#fbfbfe] min-h-screen font-sans">
        <div className="w-24 h-5">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-10">
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="max-w-md space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundlePlan) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-[#fbfbfe] min-h-screen font-sans">
        <Link 
          to={`/plant/load-planning/${projectId || "PRJ-001"}`} 
          className="inline-flex items-center text-sm font-bold text-gray-900 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Load Plan
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <h3 className="text-xl font-bold text-gray-900">Failed to Load Plan Details</h3>
          <p className="text-gray-500 max-w-md">
            {error instanceof Error ? error.message : "The requested bundle plan could not be retrieved."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fbfbfe] min-h-screen font-sans">
      <Link 
        to={`/plant/load-planning/${projectId || "PRJ-001"}`} 
        className="inline-flex items-center text-sm font-bold text-gray-900 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Load Plan
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-10">
        
        {/* Header Box */}
        <div className="bg-[#f8fafc] rounded-lg p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Plan: {bundlePlan.planNumber || "N/A"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Project ID: {projectId || "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              bundlePlan.status === "confirmed" 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {bundlePlan.status}
            </span>
          </div>
        </div>

        {/* Load Summary Card */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Load Summary Card</h3>
          <div className="max-w-md space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Total Bundles</span>
              <span className="font-medium text-gray-700">{summary?.totalBundles ?? bundlePlan.totalBundles}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Total Loads</span>
              <span className="font-medium text-gray-700">{truckloadSummaryData.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Total Weight</span>
              <span className="font-medium text-gray-700">{(summary?.totalWeight ?? bundlePlan.totalWeight).toLocaleString()} LBS</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Max Length</span>
              <span className="font-medium text-gray-700">{(summary?.maxLengthFeet ?? bundlePlan.maxLengthFeet)} FT</span>
            </div>
          </div>
        </div>

        {/* Truckload Summary */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Truckload Summary</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2a2a2a] text-white font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Load ID</th>
                  <th className="px-6 py-4">Bundles</th>
                  <th className="px-6 py-4">Total Weight</th>
                  <th className="px-6 py-4">Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {truckloadSummaryData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{row.id}</td>
                    <td className="px-6 py-4 text-gray-600">{row.bundleCount}</td>
                    <td className="px-6 py-4 text-gray-600">{row.weight}</td>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-6">
                      {row.destination}
                      {row.checked && <Check className="w-5 h-5 text-gray-800" />}
                    </td>
                  </tr>
                ))}
                {truckloadSummaryData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No loads configured for this plan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Truck Loads Tables */}
        {Object.entries(bundlesByLoad)
          .sort(([seqA], [seqB]) => Number(seqA) - Number(seqB))
          .map(([seqStr, list]) => {
            const seq = Number(seqStr);
            return (
              <div key={seq} className="space-y-6 pt-6 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Truck Load {seq}</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#2a2a2a] text-white font-semibold">
                      <tr>
                        <th className="px-6 py-4 w-16">#</th>
                        <th className="px-6 py-4">Bundle ID</th>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Qty</th>
                        <th className="px-6 py-4">Weight</th>
                        <th className="px-6 py-4 text-center">Packing List Generated</th>
                        <th className="px-6 py-4 text-center">QR Labels Generated</th>
                        <th className="px-6 py-4 text-center">Bundles Assigned to Truck</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {list.map((row, idx) => (
                        <tr key={row._id} className="hover:bg-gray-50">
                          <td className="px-6 py-5 text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-5 font-medium text-gray-700">{row.bundleNo}</td>
                          <td className="px-6 py-5 text-gray-900">{row.title}</td>
                          <td className="px-6 py-5 text-gray-500 capitalize">{row.bundleType}</td>
                          <td className="px-6 py-5 text-gray-500">{row.totalQty}</td>
                          <td className="px-6 py-5 text-gray-500 max-w-[80px]">{row.totalWeight.toLocaleString()} LBS</td>
                          <td className="px-6 py-5 text-center">
                            {row.packingListId && <Check className="w-5 h-5 text-gray-800 mx-auto" />}
                          </td>
                          <td className="px-6 py-5 text-center">
                            {row.packingListId && <Check className="w-5 h-5 text-gray-800 mx-auto" />}
                          </td>
                          <td className="px-6 py-5 text-center">
                            {(row.status === "assigned_to_truck" || row.status === "delivered") && (
                              <Check className="w-5 h-5 text-gray-800 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

      </div>
    </div>
  );
}
