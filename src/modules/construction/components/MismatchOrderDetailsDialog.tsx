import React from "react";
import {
  X,
  Calendar,
  ExternalLink,
} from "lucide-react";

export interface MismatchOrderItemDetail {
  itemId: string;
  expectedQty: number;
  receivedQty: number;
  status: string;
  materialName?: string;
}

export interface MismatchOrderPhoto {
  name: string;
  url: string;
}

export interface MismatchOrderReportedBy {
  _id?: string;
  name?: string;
  email?: string;
}

export interface MismatchOrderItem {
  id: string;
  orderId: string;
  project: string;
  jobId?: string;
  siteLocation?: string;
  materialName: string;
  specification?: string;
  quantity: number;
  receivedQuantity: number;
  unit?: string;
  orderDate: string;
  deliveryDate?: string;
  status: "open" | "in_review" | "resolved" | "closed" | "cancelled" | "Mismatch" | "Pending" | string;
  transporter?: string;
  driverName?: string;
  driverPhone?: string;
  truckNo?: string;
  mismatchReason?: string;
  remarks?: string;
  // Fields from GET /api/admin/plant/projects/{leadId}/mismatch-orders
  mismatchId?: string;
  reason?: string;
  notes?: string;
  actionNotes?: string;
  bundleId?: string;
  bundleNo?: string;
  items?: MismatchOrderItemDetail[];
  photos?: MismatchOrderPhoto[];
  reportedBy?: MismatchOrderReportedBy;
  createdAt?: string;
}

interface MismatchOrderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: MismatchOrderItem | null;
  onStatusChange?: (id: string, newStatus: string) => void;
}

const statusBadgeStyle: Record<string, string> = {
  open: "bg-[#FEE2E2] text-[#EF4444]",
  mismatch: "bg-[#FEE2E2] text-[#EF4444]",
  in_review: "bg-[#FEF9C3] text-[#CA8A04]",
  resolved: "bg-[#DCFCE7] text-[#16A34A]",
  closed: "bg-gray-100 text-gray-700",
  cancelled: "bg-gray-100 text-gray-500",
  pending: "bg-[#FEF9C3] text-[#CA8A04]",
};

function formatStatus(status?: string) {
  if (!status) return "Mismatch";
  const lower = status.toLowerCase();
  if (lower === "open" || lower === "mismatch") return "Mismatch";
  if (lower === "in_review") return "In Review";
  if (lower === "resolved") return "Resolved";
  if (lower === "closed") return "Closed";
  if (lower === "cancelled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const MismatchOrderDetailsDialog: React.FC<MismatchOrderDetailsDialogProps> = ({
  isOpen,
  onClose,
  order,
  onStatusChange,
}) => {
  if (!isOpen || !order) return null;

  const difference = order.receivedQuantity - order.quantity;
  const isMismatch =
    order.status.toLowerCase() === "open" || order.status.toLowerCase() === "mismatch";
  const formattedStatus = formatStatus(order.status);
  const badgeClass =
    statusBadgeStyle[order.status.toLowerCase()] ||
    statusBadgeStyle[formattedStatus.toLowerCase()] ||
    "bg-[#FEE2E2] text-[#EF4444]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-155 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Mismatch Order Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
          {/* Top Identifier & Status */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900 leading-none">
                  {order.orderId}
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${badgeClass}`}
                >
                  {formattedStatus}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">
                {order.bundleNo ? `Bundle: ${order.bundleNo}` : ""}
                {order.bundleNo && (order.jobId || order.mismatchId) ? " • " : ""}
                {order.jobId
                  ? `Job ID: ${order.jobId}`
                  : order.mismatchId
                  ? `ID: ${order.mismatchId}`
                  : ""}
              </p>
            </div>
          </div>

          {/* Grid 1: Project / Site & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-normal text-gray-500 mb-1">Project / Site</p>
              <p className="font-bold text-gray-900 text-base">{order.project}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {order.siteLocation || order.jobId || "Construction Site"}
              </p>
            </div>

            <div>
              <p className="text-xs font-normal text-gray-500 mb-1">Material</p>
              <p className="font-bold text-gray-900 text-base">{order.materialName}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {order.specification || `${order.quantity} ${order.unit || "Units"}`}
              </p>
            </div>
          </div>

          {/* Quantity & Discrepancy Breakdown */}
          <div className="grid grid-cols-3 gap-6 pt-1">
            <div>
              <p className="text-xs font-normal text-gray-500 mb-1">Ordered Qty</p>
              <p className="font-bold text-gray-900 text-base">
                {order.quantity}{" "}
                <span className="text-xs font-normal text-gray-500">
                  {order.unit || "Units"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-normal text-gray-500 mb-1">Received Qty</p>
              <p className="font-bold text-gray-900 text-base">
                {order.receivedQuantity}{" "}
                <span className="text-xs font-normal text-gray-500">
                  {order.unit || "Units"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-normal text-gray-500 mb-1">Difference</p>
              <p
                className={`font-bold text-base ${
                  difference < 0
                    ? "text-[#EF4444]"
                    : difference > 0
                    ? "text-emerald-600"
                    : "text-gray-900"
                }`}
              >
                {difference > 0 ? `+${difference}` : difference}{" "}
                <span className="text-xs font-normal text-gray-500">
                  {order.unit || "Units"}
                </span>
              </p>
              {difference !== 0 && (
                <p className="text-xs text-[#EF4444] font-medium mt-0.5">
                  {difference < 0
                    ? `Short by ${Math.abs(difference)}`
                    : `Over by ${difference}`}
                </p>
              )}
            </div>
          </div>

          {/* Delivery & Logistics Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-normal text-gray-500 mb-1.5">
                Order / Reported Date
              </p>
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <Calendar className="w-4 h-4 text-gray-700" />
                <span>{order.orderDate}</span>
              </div>
            </div>

            {order.deliveryDate && (
              <div>
                <p className="text-xs font-normal text-gray-500 mb-1.5">Delivery Date</p>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <Calendar className="w-4 h-4 text-gray-700" />
                  <span>{order.deliveryDate}</span>
                </div>
              </div>
            )}

            {order.reportedBy && (
              <div>
                <p className="text-xs font-normal text-gray-500 mb-1">Reported By</p>
                <p className="font-bold text-gray-900 text-sm">
                  {order.reportedBy.name || "Site Lead"}
                </p>
                {order.reportedBy.email && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.reportedBy.email}
                  </p>
                )}
              </div>
            )}

            {order.transporter && (
              <div>
                <p className="text-xs font-normal text-gray-500 mb-1">Transporter</p>
                <p className="font-bold text-gray-900 text-base">
                  {order.transporter}
                </p>
                {order.truckNo && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Truck: {order.truckNo}
                  </p>
                )}
              </div>
            )}

            {order.driverName && (
              <div>
                <p className="text-xs font-normal text-gray-500 mb-1">Driver</p>
                <p className="font-bold text-gray-900 text-base">
                  {order.driverName}
                </p>
                {order.driverPhone && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.driverPhone}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Line Items Table (if any) */}
          {order.items && order.items.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-[14px] font-bold text-[#111827] mb-3">
                Discrepancy Line Items ({order.items.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[12px] font-semibold text-[#111827] border-b border-gray-100">
                      <th className="py-2.5 pr-3 w-8">#</th>
                      <th className="py-2.5 px-3">Item / Description</th>
                      <th className="py-2.5 px-3 text-right">Expected</th>
                      <th className="py-2.5 px-3 text-right">Received</th>
                      <th className="py-2.5 px-3 text-right">Difference</th>
                      <th className="py-2.5 pl-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[13px] text-[#4B5563]">
                    {order.items.map((item, index) => {
                      const itemDiff =
                        (item.receivedQty || 0) - (item.expectedQty || 0);
                      return (
                        <tr key={item.itemId || index}>
                          <td className="py-2.5 pr-3 text-gray-400 font-normal">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#111827]">
                            {item.materialName || item.itemId}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                            {item.expectedQty}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                            {item.receivedQty}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-bold ${
                              itemDiff < 0
                                ? "text-[#EF4444]"
                                : itemDiff > 0
                                ? "text-emerald-600"
                                : "text-gray-900"
                            }`}
                          >
                            {itemDiff > 0 ? `+${itemDiff}` : itemDiff}
                          </td>
                          <td className="py-2.5 pl-3 text-center">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FEF9C3] text-[#CA8A04] inline-block">
                              {item.status || "Mismatch"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reason / Notes Section */}
          {(order.reason || order.mismatchReason) && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                Discrepancy Reason
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {order.reason || order.mismatchReason}
              </p>
            </div>
          )}

          {order.notes && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                Notes & Observations
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}

          {order.actionNotes && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                Action Notes
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                {order.actionNotes}
              </p>
            </div>
          )}

          {/* Attached Photos */}
          {order.photos && order.photos.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-3">
                Attached Photos ({order.photos.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.photos.map((photo, pIdx) => {
                  const photoName = photo.name || `photo-${pIdx + 1}.jpg`;
                  return (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white overflow-hidden"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <img
                          src={photo.url}
                          alt={photoName}
                          className="w-9 h-9 shrink-0 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="truncate">
                          <p className="text-xs font-medium text-[#111827] truncate">
                            {photoName}
                          </p>
                          <p className="text-[11px] text-[#9CA3AF]">
                            Attached Photo
                          </p>
                        </div>
                      </div>
                      <a
                        href={photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors shrink-0"
                        title="View photo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer Button */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-3">
            {isMismatch && onStatusChange && (
              <button
                type="button"
                onClick={() => {
                  onStatusChange(order.id, "resolved");
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#22C55E] text-white rounded-lg text-sm font-semibold hover:bg-[#16A34A] transition-colors shadow-sm cursor-pointer"
              >
                Mark as Resolved
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-14 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

