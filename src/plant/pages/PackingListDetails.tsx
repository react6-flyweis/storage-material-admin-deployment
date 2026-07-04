import React from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackingListPlanQuery, usePackingListDetailsQuery } from "@/modules/plant/packing-list.hooks";

export default function PackingListDetails() {
  const { projectId, packingId } = useParams();

  // Load general plan and project info
  const { data: planData, isLoading: isPlanLoading } = usePackingListPlanQuery(projectId || "");
  
  // Load specific packing list details
  const { data: detailsData, isLoading: isDetailsLoading, error: detailsError } = usePackingListDetailsQuery(packingId || "");

  const project = planData?.data?.project;
  const packingLists = planData?.data?.packingLists || [];
  const planSummary = planData?.data?.summary;

  const packingList = detailsData?.data?.packingList;
  const bundles = detailsData?.data?.bundles || [];

  const isLoading = isPlanLoading || isDetailsLoading;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-[#fafafa] min-h-screen font-sans">
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-96 mb-6" />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-40 w-80 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (detailsError || !packingList) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-[#fafafa] min-h-screen font-sans">
        <div className="flex items-center gap-4 mb-2">
          <Link 
            to={`/plant/packing-list/${projectId || "PRJ-001"}`} 
            className="inline-flex items-center text-lg font-bold text-gray-900 hover:underline"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Packing List
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-red-500 font-medium">
          Failed to load packing list details. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fafafa] min-h-screen font-sans">
      <div className="flex items-center gap-4 mb-2">
        <Link 
          to={`/plant/packing-list/${projectId || "PRJ-001"}`} 
          className="inline-flex items-center text-lg font-bold text-gray-900 hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Packing List
        </Link>
      </div>
      <p className="text-sm text-gray-500 max-w-xl mb-6">
        Generate and manage packing lists for truckloads and bundles.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        {/* Title Block */}
        <div className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100 mb-10">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-4">
            Project: {project?.projectName || "Riverside Complex"} | Truckloads: {planSummary?.totalPackingLists || packingLists.length}
          </h2>
          <div className="flex flex-col gap-2 text-sm font-bold text-gray-800">
            <span>Project: {project?.projectName || "Riverside Complex"}</span>
            <span>Job ID: {project?.jobId || "N/A"}</span>
            <span>Bundles Created: {planSummary?.totalBundles || 0}</span>
            <span>Total Weight: {(planSummary?.totalWeight || 0).toLocaleString()} lbs</span>
          </div>
        </div>

        {/* Optimization Summary Card */}
        <div className="mb-10 max-w-sm bg-[#f8fafc] rounded-xl p-6 border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2">Optimization Summary Card</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Truck Loads</span>
              <span className="font-bold text-gray-900">{planSummary?.totalPackingLists || packingLists.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Total Bundles</span>
              <span className="font-bold text-gray-900">{planSummary?.totalBundles || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Total Weight</span>
              <span className="font-bold text-gray-900">{(planSummary?.totalWeight || 0).toLocaleString()} lbs</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Packing List Generated</span>
              <span className="font-bold text-gray-900">{planSummary?.totalPackingLists || packingLists.length}</span>
            </div>
          </div>
        </div>

        {/* Packing List Table */}
        <div className="mb-10">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Packing Lists in Plan</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2a2a2a] text-white">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Load ID</th>
                  <th className="px-6 py-4">Truck</th>
                  <th className="px-6 py-4">Bundles</th>
                  <th className="px-6 py-4 w-32">Weight</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packingLists.map((row, index) => {
                  const isCurrent = row._id === packingId;
                  return (
                    <tr 
                      key={row._id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isCurrent ? "bg-blue-50/60 font-semibold border-l-4 border-l-blue-600" : ""
                      }`}
                    >
                      <td className="px-6 py-5 text-gray-500">{index + 1}</td>
                      <td className="px-6 py-5 font-medium text-gray-700">{row.packingListNo}</td>
                      <td className="px-6 py-5 font-bold text-gray-900">{row.truckNo} - {row.truckLabel}</td>
                      <td className="px-6 py-5 text-gray-600">{row.totalBundles}</td>
                      <td className="px-6 py-5 text-gray-500 w-32">
                        <div className="w-min leading-tight">{row.totalWeight.toLocaleString()} lbs</div>
                      </td>
                      <td className="px-6 py-5 text-gray-500">{project?.location || "N/A"}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${
                          row.status?.toLowerCase() === "dispatched" || row.status?.toLowerCase() === "completed"
                            ? "border-green-200 text-green-700 bg-green-50"
                            : row.status?.toLowerCase() === "ready" || row.status?.toLowerCase() === "generated"
                            ? "border-blue-200 text-blue-700 bg-blue-50"
                            : "border-yellow-200 text-yellow-700 bg-yellow-50"
                        }`}>
                          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-5 flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                          className="hover:bg-gray-100 text-gray-700"
                        >
                          <Link to={`/plant/packing-list/${projectId}/details/${row._id}`}>
                            <Eye className="w-5 h-5" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="w-10 h-10 bg-gray-400 border-none text-white hover:bg-gray-500 hover:text-white rounded">
                          <Download className="w-5 h-5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bundle List Table */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Bundle List for {packingList.packingListNo} ({packingList.truckNo})
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2a2a2a] text-white">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Bundle ID</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Length</th>
                  <th className="px-6 py-4 w-32">Unit Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bundles.map((row, index) => (
                  <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{row.bundleNo}</td>
                    <td className="px-6 py-5 text-gray-500 capitalize">{row.bundleType}</td>
                    <td className="px-6 py-5 text-gray-500">{row.title} ({row.totalQty} items)</td>
                    <td className="px-6 py-5 text-gray-500">{row.maxLengthFeet} ft</td>
                    <td className="px-6 py-5 text-gray-500 w-32">
                      <div className="w-min leading-tight">{row.totalWeight.toLocaleString()} lbs</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Footer Summary Row */}
            <div className="bg-[#2a2a2a] p-4 flex items-center justify-between text-white">
              <div className="flex items-center">
                <span className="font-bold px-6">Summary</span>
                <div className="flex flex-col ml-8">
                  <span className="font-bold text-sm">Total Bundles: {packingList.totalBundles}</span>
                  <span className="font-bold text-sm">Total Weight: {packingList.totalWeight.toLocaleString()} lbs</span>
                </div>
              </div>
              <div className="flex gap-4 pr-2">
                <Button variant="secondary" className="bg-[#e5e5e5] hover:bg-[#d4d4d4] text-gray-900 font-bold px-6 border-0 shadow-none">
                  Download PDF
                </Button>
                <Button variant="secondary" className="bg-[#e5e5e5] hover:bg-[#d4d4d4] text-gray-900 font-bold px-6 border-0 shadow-none">
                  Export Excel
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

