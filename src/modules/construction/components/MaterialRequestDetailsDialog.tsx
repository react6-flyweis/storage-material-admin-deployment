import { useState } from "react";
import {
  useMaterialRequestDetailsQuery,
  useReviewMaterialRequestMutation,
  useDownloadMaterialRequestAttachmentMutation,
} from "../construction.hooks";
import type { MaterialRequestItem } from "../construction.api";
import { Skeleton } from "@/components/ui/skeleton";

// pdf icon 
// excel icon



interface MaterialRequestDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  request?: MaterialRequestItem | null;
  requestId?: string | null;
  onApprove?: (req: MaterialRequestItem) => void;
  onReject?: (req: MaterialRequestItem) => void;
}

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

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "May 19, 2025";
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
  if (!dateStr) return "04:30 PM";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "04:30 PM";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "04:30 PM";
  }
}

function capitalize(str?: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getRequestedByName(req: MaterialRequestItem): string {
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

export default function MaterialRequestDetailsDialog({
  open,
  onClose,
  request: initialRequest,
  requestId,
  onApprove,
  onReject,
}: MaterialRequestDetailsDialogProps) {
  const targetId = requestId || initialRequest?.requestId || initialRequest?._id || null;
  const { data, isLoading } = useMaterialRequestDetailsQuery(open ? targetId : null);
  const reviewMutation = useReviewMaterialRequestMutation();
  const downloadAttachmentMutation = useDownloadMaterialRequestAttachmentMutation();

  const [submittingAction, setSubmittingAction] = useState<"approved" | "rejected" | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  if (!open) return null;

  const request = data?.data?.request || initialRequest;

  const handleDownloadAttachment = async (index: number, fileName?: string) => {
    const idToUse = request?._id || request?.requestId || targetId;
    if (!idToUse) return;

    setDownloadingIndex(index);
    try {
      const blob = await downloadAttachmentMutation.mutateAsync({
        requestId: idToUse,
        index,
      });

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || `attachment-${index + 1}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download attachment:", error);
    } finally {
      setDownloadingIndex(null);
    }
  };

  const currentStatus = capitalize(request?.status || "Pending");
  const currentPriority = capitalize(request?.priority || "High");
  const isPending = currentStatus === "Pending";

  const items = request?.requestedItems && request.requestedItems.length > 0
    ? request.requestedItems
    : [];

  const handleReview = async (action: "approved" | "rejected") => {
    const idToUse = request?._id || request?.requestId || targetId;
    if (!idToUse) return;

    setSubmittingAction(action);
    try {
      await reviewMutation.mutateAsync({
        requestId: idToUse,
        payload: {
          action,
          reviewNotes: action === "approved" ? "Approved" : "Rejected",
        },
      });
      if (action === "approved") {
        onApprove?.(request!);
      } else {
        onReject?.(request!);
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-[620px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-[#111827]">
            Material Request Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Scrollable Body */}
        {isLoading ? (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Top Status Badge Pill Skeleton */}
            <Skeleton className="h-6 w-24 rounded-md" />

            {/* Request ID & Priority Skeleton */}
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-1.5 flex flex-col items-end">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </div>

            {/* Project / Site & Status Skeleton */}
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="space-y-1.5 flex flex-col items-end">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </div>

            {/* Requested By, Request Date, Required By Skeleton */}
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Requested Items Table Skeleton */}
            <div className="pt-2 space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>

            {/* Request Notes Skeleton */}
            <div className="pt-2 space-y-1.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
          </div>
        ) : !request ? (
          <div className="p-6 text-center text-gray-500 text-[13px]">
            Material request details not found.
          </div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto text-[13px] text-[#374151]">
            {/* Top Status Badge Pill */}
            <div>
              <span
                className={`px-3 py-1 rounded-md text-[12px] font-semibold inline-block ${statusBadgeStyle[currentStatus] || "bg-[#FEF9C3] text-[#CA8A04]"
                  }`}
              >
                {currentStatus}
              </span>
            </div>

            {/* Request ID & Priority */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#9CA3AF] font-medium">Request ID</p>
                <p className="text-[18px] font-bold text-[#111827] mt-0.5">
                  {request.requestId || "MR-2025-0031"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#9CA3AF] font-medium">Priority</p>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-md text-[12px] font-semibold inline-block ${priorityBadgeStyle[currentPriority] || "bg-[#FEE2E2] text-[#EF4444]"
                      }`}
                  >
                    {currentPriority}
                  </span>
                </div>
              </div>
            </div>

            {/* Project / Site & Status */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#9CA3AF] font-medium">Project / Site</p>
                <p className="text-[14px] font-bold text-[#111827] mt-0.5">
                  {request.leadId?.projectName || "Downtown Office Complex"}
                </p>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  {request.buildingLabel || request.siteLocation || "Construction Site A"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#9CA3AF] font-medium">Status</p>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-md text-[12px] font-semibold inline-block ${statusBadgeStyle[currentStatus] || "bg-[#FEF9C3] text-[#CA8A04]"
                      }`}
                  >
                    {currentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Requested By, Request Date, Required By */}
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div>
                <p className="text-[12px] text-[#9CA3AF] font-medium">Requested By</p>
                <p className="font-bold text-[#111827] mt-0.5">
                  {getRequestedByName(request)}
                </p>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  {getRequestedByRole(request)}
                </p>
              </div>

              <div>
                <p className="text-[12px] text-[#9CA3AF] font-medium">Request Date</p>
                <p className="font-bold text-[#111827] mt-0.5">
                  {formatDate(request.requestDate || request.createdAt)}
                </p>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  {formatTime(request.requestDate || request.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-[12px] text-[#9CA3AF] font-medium">Required By</p>
                <p className="font-bold text-[#111827] mt-0.5">
                  {formatDate(request.requiredBy)}
                </p>
              </div>
            </div>

            {/* Requested Items Table */}
            <div className="pt-2">
              <h3 className="text-[14px] font-bold text-[#111827] mb-3">
                Requested Items ({items.length})
              </h3>
              {items.length === 0 ? (
                <p className="text-[12px] text-gray-400 italic">No items listed in request.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[12px] font-semibold text-[#111827] border-b border-gray-100">
                        <th className="py-2.5 pr-3 w-8">#</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3 text-start">Requested Qty</th>
                        <th className="py-2.5 pl-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[13px] text-[#4B5563]">
                      {items.map((item, index) => (
                        <tr key={item._id || index}>
                          <td className="py-2.5 pr-3 text-gray-400 font-normal">{index + 1}</td>
                          <td className="py-2.5 px-3 font-medium text-[#111827]">
                            {item.name}
                            {item.color ? ` (${item.color})` : ""}
                            {item.lengthFeet ? ` - ${item.lengthFeet}ft` : ""}
                          </td>
                          <td className="py-2.5 px-3">{item.unit || "-"}</td>
                          <td className="py-2.5 px-3 text-start font-medium text-[#111827]">
                            {item.quantity ? item.quantity.toLocaleString() : "-"}
                          </td>
                          <td className="py-2.5 pl-3 text-gray-500">{item.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Request Notes */}
            <div className="pt-2">
              <h3 className="text-[14px] font-bold text-[#111827] mb-1">
                Request Notes
              </h3>
              <p className="text-[13px] text-[#6B7280]">
                {request.specialInstructions || request.reviewNotes || "No notes provided."}
              </p>
            </div>

            {/* Attachment Section */}
            {request.attachments && request.attachments.length > 0 && (
              <div className="pt-2">
                <h3 className="text-[14px] font-bold text-[#111827] mb-3">
                  Attachment ({request.attachments.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {request.attachments.map((file, idx) => {
                    const fileName = file.name || `Attachment ${idx + 1}`;
                    const fileUrl = file.fileUrl || file.url;
                    const typeStr = (file.type || file.fileType || "").toLowerCase();

                    const isImage =
                      typeStr.startsWith("image/") ||
                      typeStr === "image" ||
                      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName) ||
                      (fileUrl && /\.(jpg|jpeg|png|gif|webp|svg)/i.test(fileUrl));

                    const isPdf =
                      typeStr === "pdf" ||
                      typeStr.includes("pdf") ||
                      fileName.toLowerCase().endsWith(".pdf");

                    return (
                      <div
                        key={file._id || idx}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white overflow-hidden"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {isImage && fileUrl ? (
                            <img
                              src={fileUrl}
                              alt={fileName}
                              className="w-8 h-8 shrink-0 object-cover rounded border border-gray-200"
                            />
                          ) : isPdf ? (
                            /* PDF Icon */
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded bg-red-50 text-[#EF4444]">
                              <svg
                                className="w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3zm3.5-3.5H16v1.5h1.5V13H16v2h-1.5V9H18v1.5zM7 10.5h1v1H7v-1zm4.5 0h1v3h-1v-3z" />
                              </svg>
                            </div>
                          ) : (
                            /* Generic / Document Icon */
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded bg-emerald-50 text-[#16A34A]">
                              <svg
                                className="w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6.4 12l-1.6-2.7-1.6 2.7H7.8l2.5-4-2.4-3.9h1.7l1.5 2.6 1.5-2.6h1.7L11.9 11l2.5 4h-1.8z" />
                              </svg>
                            </div>
                          )}

                          <div className="min-w-0">
                            <p
                              className="text-[13px] font-medium text-gray-700 truncate"
                              title={fileName}
                            >
                              {fileName}
                            </p>
                            {(file.size || file.fileSize) && (
                              <p className="text-[11px] text-gray-400">
                                {file.size || file.fileSize}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleDownloadAttachment(idx, fileName)}
                          disabled={downloadingIndex === idx}
                          className="p-1.5 border border-gray-200 rounded text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shrink-0 disabled:opacity-50"
                          title="Download Attachment"
                        >
                          {downloadingIndex === idx ? (
                            <svg
                              className="w-4 h-4 animate-spin text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons: Reject / Approve */}
            {isPending && (
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => void handleReview("rejected")}
                  disabled={submittingAction !== null}
                  className="flex-1 py-2.5 px-4 bg-white border border-[#EF4444] text-[#EF4444] rounded-lg font-semibold hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
                >
                  {submittingAction === "rejected" ? "Rejecting..." : "Reject"}
                </button>
                <button
                  onClick={() => void handleReview("approved")}
                  disabled={submittingAction !== null}
                  className="flex-1 py-2.5 px-4 bg-[#22C55E] text-white rounded-lg font-semibold hover:bg-[#16A34A] transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingAction === "approved" ? "Approving..." : "Approve Request"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

