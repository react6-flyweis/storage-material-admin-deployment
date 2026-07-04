import React, { useState } from "react";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, CheckCircle2, Clock, Eye } from "lucide-react";
import { usePackingListPlanQuery } from "@/modules/plant/packing-list.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function PackingListProject() {
  const { projectId } = useParams(); // Holds packingListPlanId from URL
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = usePackingListPlanQuery(projectId || "");

  const project = data?.data?.project;
  const packingLists = data?.data?.packingLists || [];

  // Filter packing lists based on search term
  const filteredPackingLists = packingLists.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.packingListNo.toLowerCase().includes(term) ||
      item.truckNo.toLowerCase().includes(term) ||
      item.truckLabel.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term)
    );
  });

  const getStatusStyles = (status: string) => {
    const normalized = status?.toLowerCase() || "";
    if (normalized === "dispatched" || normalized === "completed") {
      return "border-green-200 text-green-700 bg-green-50";
    }
    if (normalized === "ready" || normalized === "generated") {
      return "border-blue-200 text-blue-700 bg-blue-50";
    }
    return "border-yellow-200 text-yellow-700 bg-yellow-50"; // e.g. draft, planning
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fafafa] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            {isLoading ? (
              <Skeleton className="h-8 w-64" />
            ) : project ? (
              `Packing List - ${project.projectName}`
            ) : (
              "Packing List"
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            {isLoading ? (
              <Skeleton className="h-4 w-96 mt-2" />
            ) : project ? (
              `Project ID: ${project.projectId} | Location: ${project.location} | Customer: ${project.customer.name}`
            ) : (
              "View and manage packing lists generated from load planning for plant loading and shipment verification."
            )}
          </p>
        </div>
        <Button variant="outline" className="bg-white text-gray-700 shadow-sm border-gray-200">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search packing lists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-5 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-5">Packing ID</th>
                <th className="px-6 py-5">Truck No</th>
                <th className="px-6 py-5">Truck Type ⇅</th>
                <th className="px-6 py-5">Bundles ⇅</th>
                <th className="px-6 py-5">Weight ⇅</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-5 text-center">
                      <Skeleton className="h-4 w-4 mx-auto rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-red-500">
                    Failed to load packing lists. Please try again.
                  </td>
                </tr>
              ) : filteredPackingLists.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    No packing lists found.
                  </td>
                </tr>
              ) : (
                filteredPackingLists.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50">
                    <td className="px-6 py-5 text-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-medium">{row.packingListNo}</td>
                    <td className="px-6 py-5 text-gray-500">{row.truckNo}</td>
                    <td className="px-6 py-5 font-semibold text-gray-900">{row.truckLabel}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{row.totalBundles}</td>
                    <td className="px-6 py-5 text-gray-500">{row.totalWeight.toLocaleString()} lbs</td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusStyles(row.status)}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        {row.status.toLowerCase() === "dispatched" || row.status.toLowerCase() === "completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 text-gray-700">
                        <Link to={`/plant/packing-list/${projectId}/details/${row._id}`}>
                          <Eye className="w-5 h-5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

