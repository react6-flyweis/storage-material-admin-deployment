import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeleton";
import CustomSelect from "./common/CustomSelect";
import type { MaterialRequestItem } from "../construction.api";

const statusBadgeStyle: Record<string, string> = {
  Pending: "bg-[#FEF9C3] text-[#CA8A04]",
  pending: "bg-[#FEF9C3] text-[#CA8A04]",
  Approved: "bg-[#DCFCE7] text-[#16A34A]",
  approved: "bg-[#DCFCE7] text-[#16A34A]",
  Fulfilled: "bg-[#DCFCE7] text-[#16A34A]",
  fulfilled: "bg-[#DCFCE7] text-[#16A34A]",
  Delivered: "bg-[#DCFCE7] text-[#16A34A]",
  delivered: "bg-[#DCFCE7] text-[#16A34A]",
  Rejected: "bg-[#FEE2E2] text-[#EF4444]",
  rejected: "bg-[#FEE2E2] text-[#EF4444]",
  Cancelled: "bg-[#FEE2E2] text-[#EF4444]",
  cancelled: "bg-[#FEE2E2] text-[#EF4444]",
};

const priorityBadgeStyle: Record<string, string> = {
  High: "bg-[#FEE2E2] text-[#EF4444]",
  high: "bg-[#FEE2E2] text-[#EF4444]",
  Medium: "bg-[#FEF9C3] text-[#CA8A04]",
  medium: "bg-[#FEF9C3] text-[#CA8A04]",
  Low: "bg-[#EFF6FF] text-[#3B82F6]",
  low: "bg-[#EFF6FF] text-[#3B82F6]",
};

export function getRequestedByName(req: MaterialRequestItem): string {
  if (req.requestedBy && typeof req.requestedBy === "object" && req.requestedBy.name) {
    return req.requestedBy.name;
  }
  if (typeof req.requestedBy === "string" && req.requestedBy) {
    return req.requestedBy;
  }
  if (req.requestedByCustomer) {
    return "Customer";
  }
  return "John Smith";
}

function getRequestedByRole(req: MaterialRequestItem): string {
  if (req.requestedBy && typeof req.requestedBy === "object" && req.requestedBy.role) {
    return req.requestedBy.role;
  }
  return "Site Engineer";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "May 23,2025";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "03.40 PM";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "03.40 PM";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "03.40 PM";
  }
}

function capitalize(str?: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatItemsSummary(req: MaterialRequestItem): { countText: string; itemsListText: string } {
  const items = req.requestedItems || [];
  if (items.length === 0) {
    return { countText: "0 Items", itemsListText: "No items listed" };
  }
  const countText = `${items.length} ${items.length === 1 ? "Item" : "Items"}`;
  const names = items.map((i) => i.name).filter(Boolean);
  const itemsListText = names.length > 0 ? names.join(",") : "Steel,Cements,Rocks..";
  return { countText, itemsListText };
}

export interface MaterialsListProps {
  requests: MaterialRequestItem[];
  isLoading?: boolean;
  isReviewing?: boolean;
  onView: (request: MaterialRequestItem) => void;
  onUploadPhoto: (requestId: string) => void;
  onReview: (request: MaterialRequestItem, action: "approved" | "rejected") => void;
}

export default function MaterialsList({
  requests,
  isLoading = false,
  isReviewing = false,
  onView,
  onUploadPhoto,
  onReview,
}: MaterialsListProps) {
  const [pageSize, setPageSize] = useState("10");

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm overflow-hidden">
      {/* Table Header Label */}
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <h2 className="text-[15px] font-bold text-[#111827]">
          Material Request ({requests.length || 54})
        </h2>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} columns={8} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[12px] font-semibold text-[#374151]">
                <th className="px-5 py-3.5">Request ID</th>
                <th className="px-5 py-3.5">Project / Site</th>
                <th className="px-5 py-3.5">Requested Items</th>
                <th className="px-5 py-3.5">Requested By</th>
                <th className="px-5 py-3.5">Request Date</th>
                <th className="px-5 py-3.5">Required By</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7EB] text-[13px]">
              {requests.map((r) => {
                const { countText, itemsListText } = formatItemsSummary(r);
                const reqByName = getRequestedByName(r);
                const reqByRole = getRequestedByRole(r);
                const currentStatus = capitalize(r.status || "Pending");
                const currentPriority = capitalize(r.priority || "High");
                const isPending = currentStatus === "Pending";

                return (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Request ID */}
                    <td className="px-5 py-4 font-bold text-[#111827] whitespace-nowrap">
                      {r.requestId || "MR-2025-0031"}
                    </td>

                    {/* Project / Site */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-[#111827]">
                        {r.leadId?.projectName || "Downtown Office Complex"}
                      </p>
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                        {r.buildingLabel || r.siteLocation || "Construction Site A"}
                      </p>
                    </td>

                    {/* Requested Items */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-[#111827]">{countText}</p>
                      <p
                        className="text-[12px] text-[#9CA3AF] mt-0.5 max-w-[160px] truncate"
                        title={itemsListText}
                      >
                        {itemsListText}
                      </p>
                    </td>

                    {/* Requested By */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-[#111827]">{reqByName}</p>
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5">{reqByRole}</p>
                    </td>

                    {/* Request Date */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-[#111827]">
                        {formatDate(r.requestDate || r.createdAt)}
                      </p>
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                        {formatTime(r.requestDate || r.createdAt)}
                      </p>
                    </td>

                    {/* Required By */}
                    <td className="px-5 py-4 font-medium text-[#111827] whitespace-nowrap">
                      {formatDate(r.requiredBy)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-md text-[12px] font-medium inline-block ${
                          statusBadgeStyle[currentStatus] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-md text-[12px] font-medium inline-block ${
                          priorityBadgeStyle[currentPriority] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {currentPriority}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(r)}
                          className="px-3 py-1 bg-white border border-[#E5E7EB] text-[#374151] rounded-md text-[12px] font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          View
                        </button>

                        <button
                          onClick={() => onUploadPhoto(r._id)}
                          className="p-1.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-md text-[12px] hover:bg-gray-50 transition-colors shadow-sm"
                          title="Upload Photo"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#374151]" />
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => onReview(r, "approved")}
                              disabled={isReviewing}
                              className="px-3 py-1 bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] rounded-md text-[12px] font-medium hover:bg-[#DCFCE7] transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onReview(r, "rejected")}
                              disabled={isReviewing}
                              className="px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] rounded-md text-[12px] font-medium hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!isLoading && requests.length === 0 && (
          <p className="text-center text-sm text-[#6B7280] py-8">
            No material requests found
          </p>
        )}
      </div>

      {/* Table Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-[#E5E7EB] text-[13px] text-[#6B7280] gap-3">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <div className="w-16">
            <CustomSelect
              title="10"
              options={[
                { label: "10", value: "10" },
                { label: "25", value: "25" },
                { label: "50", value: "50" },
              ]}
              value={pageSize}
              onChange={setPageSize}
            />
          </div>
          <span>Results</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full border border-[#E5E7EB] text-gray-400 hover:text-gray-600 disabled:opacity-50"
            disabled
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[#9333EA] text-[#9333EA] font-semibold bg-[#F5F3FF]">
            1
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
            2
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
            3
          </button>
          <span className="px-1 text-gray-400">...</span>
          <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[#E5E7EB] text-gray-600 hover:bg-gray-100">
            15
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[#E5E7EB] text-gray-600 hover:text-gray-900">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
