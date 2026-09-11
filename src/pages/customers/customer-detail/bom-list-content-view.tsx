import React, { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import logo from "@/assets/logo.png";

import {
  type ConsolidatedBOM,
  type PlantProjectDetail,
  type ConsolidatedBOMItem,
} from "@/modules/plant/bom.hooks";
import { getLeadProjectName } from "@/lib/utils";

export interface BOMListContentProps {
  consolidatedBOM: ConsolidatedBOM;
  projectDetail?: PlantProjectDetail;
}

export const BOMListContent: React.FC<BOMListContentProps> = ({ consolidatedBOM, projectDetail }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const roundToTwo = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return "-";
    const num = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(num)) return val.toString();
    return (Math.round((num + Number.EPSILON) * 100) / 100).toString();
  };

  const projectName = getLeadProjectName(projectDetail?.lead, projectDetail?.client);
  const customerName = projectDetail?.client
    ? `${projectDetail.client.firstName || ""} ${projectDetail.client.lastName || ""}`.trim() || "N/A"
    : "N/A";
  const date = consolidatedBOM.createdAt
    ? new Date(consolidatedBOM.createdAt).toLocaleDateString()
    : "N/A";
  const jobId = projectDetail?.jobId || "N/A";

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    const sortableItems = [...(consolidatedBOM.items || [])];
    if (sortConfig !== null) {
      sortableItems.sort((a: ConsolidatedBOMItem, b: ConsolidatedBOMItem) => {
        let valA = (a as Record<string, unknown>)[sortConfig.key];
        let valB = (b as Record<string, unknown>)[sortConfig.key];

        if (Array.isArray(valA)) {
          valA = valA.join(", ");
        }
        if (Array.isArray(valB)) {
          valB = valB.join(", ");
        }

        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        if (typeof valA === "number" && typeof valB === "number") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        const strA = valA.toString().toLowerCase();
        const strB = valB.toString().toLowerCase();

        if (strA < strB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (strA > strB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [consolidatedBOM.items, sortConfig]);

  // Calculate dynamic totals
  const totalQty = useMemo(() => {
    return (consolidatedBOM.items || []).reduce((sum, item) => sum + (item.totalQty || 0), 0);
  }, [consolidatedBOM.items]);

  const totalWeight = consolidatedBOM.totalWeight || 0;
  const totalTons = totalWeight / 2000;
  const totalCost = consolidatedBOM.totalCost || 0;

  return (
    <div className="bg-white rounded-[14px] overflow-hidden shadow-sm border border-gray-100">
      {/* Project & BOM ID Header */}
      <div className="bg-[#F9FAFB] px-6 py-4 md:px-8 md:py-6 border-b border-gray-100">
        <h2 className="text-lg lg:text-2xl font-inter font-semibold text-[#212B36]">
          Project: <span className="font-bold">{projectName}</span>
        </h2>
      </div>

      <div className="p-4 lg:p-8 space-y-8">
        {/* BOM Summary Section */}
        <div className="bg-[#F4F6F8] rounded-xl p-6 max-w-md space-y-4">
          <h3 className="text-base font-inter font-bold text-[#212B36]">
            BOM Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#637381] font-medium">
                Total Items
              </span>
              <span className="text-sm text-[#212B36] font-bold">
                {consolidatedBOM.itemCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#637381] font-medium">
                Total Weight
              </span>
              <span className="text-sm text-[#212B36] font-bold">
                {roundToTwo(totalWeight)} lbs
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#637381] font-medium">
                Total Panels Area
              </span>
              <span className="text-sm text-[#212B36] font-bold">
                {roundToTwo(consolidatedBOM.totalPanelsArea)} sq ft
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#637381] font-medium">
                Total Cost
              </span>
              <span className="text-sm text-[#212B36] font-bold">
                ${roundToTwo(totalCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Header Block */}
        <div className="border-2 border-black rounded-sm overflow-hidden bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x-2 divide-black">
            {/* Logo Section */}
            <div className="md:col-span-4 flex items-center justify-center p-4">
              <img
                src={logo}
                alt="Logo"
                className="h-10 md:h-12 object-contain"
              />
            </div>

            {/* Title & Info Section */}
            <div className="md:col-span-8 flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x-2 divide-black h-full">
                <div className="md:col-span-3 flex flex-col divide-y-2 divide-black h-full">
                  <div className="p-2 text-center">
                    <h4 className="text-base lg:text-xl font-bold uppercase tracking-widest font-inter text-[#212B36]">
                      STUDS & TOP CHANNELS
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 h-full divide-y md:divide-y-0 lg:divide-x-2 divide-black border-t-2 border-b-2 border-black">
                    <div className="p-2 flex items-center justify-center bg-[#F9FAFB] md:bg-transparent border-b lg:border-b-0 border-black">
                      <span className="text-xs md:text-sm font-bold text-[#212B36]">
                        Customer:
                      </span>
                    </div>
                    <div className="md:col-span-2 p-2 flex items-center justify-center">
                      <span className="text-xs md:text-sm font-bold text-[#212B36]">
                        {customerName}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 h-full divide-y md:divide-y-0 lg:divide-x-2 divide-black border-t-2 border-black">
                    <div className="p-2 flex items-center justify-center bg-[#F9FAFB] md:bg-transparent border-b md:border-b-0 border-black">
                      <span className="text-xs md:text-sm font-bold text-[#212B36]">
                        Project Name:
                      </span>
                    </div>
                    <div className="md:col-span-2 p-2 flex items-center justify-center">
                      <span className="text-xs md:text-sm font-semibold text-[#212B36]">
                        {projectName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col divide-y-2 divide-black">
                  <div className="grid grid-cols-2 divide-x-2 divide-black">
                    <div className="p-1 px-2 text-xs md:text-sm font-semibold text-[#212B36] bg-[#F9FAFB] md:bg-transparent">
                      Date
                    </div>
                    <div className="p-1 px-2 text-xs md:text-sm font-semibold text-[#212B36]">
                      {date}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x-2 divide-black h-full">
                    <div className="p-1 px-2 text-xs md:text-sm font-semibold text-[#212B36] bg-[#F9FAFB] md:bg-transparent">
                      Job Id
                    </div>
                    <div className="p-1 px-2 text-xs md:text-sm font-semibold text-[#212B36]">
                      {jobId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-y border-gray-200">
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-1">
                    Category <ArrowUpDown size={12} className={sortConfig?.key === "category" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("partCode")}
                >
                  <div className="flex items-center gap-1">
                    Part Code <ArrowUpDown size={12} className={sortConfig?.key === "partCode" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center gap-1">
                    Description <ArrowUpDown size={12} className={sortConfig?.key === "description" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("partColor")}
                >
                  <div className="flex items-center gap-1">
                    Color <ArrowUpDown size={12} className={sortConfig?.key === "partColor" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("markIds")}
                >
                  <div className="flex items-center gap-1">
                    Mark <ArrowUpDown size={12} className={sortConfig?.key === "markIds" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("totalQty")}
                >
                  <div className="flex items-center gap-1">
                    QTY <ArrowUpDown size={12} className={sortConfig?.key === "totalQty" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("totalLengthFeet")}
                >
                  <div className="flex items-center gap-1">
                    Length <ArrowUpDown size={12} className={sortConfig?.key === "totalLengthFeet" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("totalWeight")}
                >
                  <div className="flex items-center gap-1">
                    Weight <ArrowUpDown size={12} className={sortConfig?.key === "totalWeight" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-xs md:text-sm font-semibold text-[#212B36] tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("totalCost")}
                >
                  <div className="flex items-center gap-1">
                    Total Cost <ArrowUpDown size={12} className={sortConfig?.key === "totalCost" ? "text-[#1E51A4]" : "text-gray-400"} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedItems.map((item, index) => (
                <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#637381]">
                    {item.category || "-"}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#212B36]">
                    {item.partCode || "-"}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#637381]">
                    {item.description || "-"}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#637381]">
                    {item.partColor || "-"}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#212B36]">
                    {item.markIds && item.markIds.length > 0 ? item.markIds.join(", ") : "-"}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#212B36]">
                    {item.totalQty || 0}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#212B36]">
                    {roundToTwo(item.totalLengthFeet)} {item.costUnit || "FT"}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#637381]">
                    {roundToTwo(item.totalWeight)}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm font-medium text-[#212B36]">
                    ${roundToTwo(item.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-normal">
                <td className="py-4 px-4 text-xs md:text-sm text-[#212B36]">
                  QTY Total
                </td>
                <td className="py-4 px-4 text-xs md:text-sm text-[#637381]">
                  Total Tons:
                </td>
                <td className="py-4 px-4 text-xs md:text-sm text-[#212B36]">
                  {roundToTwo(totalTons)}
                </td>
                <td className="py-4 px-4 text-xs md:text-sm text-[#637381]">
                  Total Cost:
                </td>
                <td className="py-4 px-4 text-xs md:text-sm text-[#212B36]">
                  ${roundToTwo(totalCost)}
                </td>
                <td className="py-4 px-4 text-xs md:text-sm text-[#212B36] font-bold">
                  {totalQty}
                </td>
                <td className="py-4 px-4" colSpan={2}>
                  <div className="flex justify-end pr-4 font-normal">
                    <span className="text-xs md:text-sm text-[#637381] ">
                      Total Weight (lbs)
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-xs md:text-sm text-[#212B36] text-right font-bold">
                  {roundToTwo(totalWeight)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={9}
                  className="py-8 px-4 text-xs md:text-sm text-[#637381] italic"
                >
                  Received By:
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BOMListContent;
