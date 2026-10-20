import React from "react";
import {
  X,
  Building2,
  Truck,
  AlertTriangle,
  Package,
  CheckCircle2,
  FileText,
  ImageIcon,
  User,
  Layers,
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

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "open" || s === "mismatch") {
    return { bg: "bg-[#EF4444] text-white", label: "Mismatch" };
  }
  if (s === "in_review") {
    return { bg: "bg-amber-500 text-white", label: "In Review" };
  }
  if (s === "resolved") {
    return { bg: "bg-emerald-500 text-white", label: "Resolved" };
  }
  if (s === "closed") {
    return { bg: "bg-gray-600 text-white", label: "Closed" };
  }
  if (s === "cancelled") {
    return { bg: "bg-gray-400 text-white", label: "Cancelled" };
  }
  return { bg: "bg-blue-600 text-white", label: status };
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
  const badge = getStatusBadge(order.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-155 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{order.orderId}</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">Order Mismatch Discrepancy Ticket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quantity Discrepancy Banner */}
          <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                  Discrepancy Summary
                </p>
                <p className="text-sm text-red-900 mt-1 font-medium">
                  {difference < 0
                    ? `Short-delivered by ${Math.abs(difference)} ${order.unit || "units"}`
                    : difference > 0
                    ? `Over-delivered by ${difference} ${order.unit || "units"}`
                    : "Quantities match record"}
                </p>
                {order.reason && (
                  <p className="text-xs text-red-800/80 mt-1">
                    <span className="font-semibold">Reason:</span> {order.reason}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-red-600">
                  {difference > 0 ? `+${difference}` : difference}
                </span>
                <span className="text-xs text-red-600 block">Variance</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Project Info */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                <Building2 className="w-3.5 h-3.5" />
                Project Info
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{order.project}</p>
                {order.jobId && (
                  <p className="text-xs text-gray-500 mt-0.5">Job ID: {order.jobId}</p>
                )}
                {order.siteLocation && (
                  <p className="text-xs text-gray-500">Site: {order.siteLocation}</p>
                )}
              </div>
            </div>

            {/* Material / Bundle Info */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                <Package className="w-3.5 h-3.5" />
                Material / Bundle
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{order.materialName}</p>
                {order.bundleNo && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    <span>Bundle No: <strong className="text-gray-800">{order.bundleNo}</strong></span>
                  </div>
                )}
                {order.specification && (
                  <p className="text-xs text-gray-500 mt-0.5">{order.specification}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white text-center">
              <p className="text-xs text-gray-500">Ordered Qty</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{order.quantity}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white text-center">
              <p className="text-xs text-gray-500">Received Qty</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{order.receivedQuantity}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/40 text-center">
              <p className="text-xs text-red-600 font-medium">Difference</p>
              <p className="text-xl font-bold text-red-600 mt-1">{difference}</p>
            </div>
          </div>

          {/* Line Items List (from API response) */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Item Details ({order.items.length})
              </label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Item ID</th>
                      <th className="py-2.5 px-3 text-right">Expected</th>
                      <th className="py-2.5 px-3 text-right">Received</th>
                      <th className="py-2.5 px-3 text-right">Diff</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((it, idx) => {
                      const itDiff = (it.receivedQty || 0) - (it.expectedQty || 0);
                      return (
                        <tr key={it.itemId || idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-medium text-gray-900 truncate max-w-[140px]">
                            {it.materialName || it.itemId}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-gray-700">
                            {it.expectedQty}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-gray-700">
                            {it.receivedQty}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-red-600">
                            {itDiff}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              {it.status}
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

          {/* Logistics & Reporter Details */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
              <Truck className="w-3.5 h-3.5" />
              Delivery & Report Details
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block">Reported Date:</span>
                <span className="font-semibold text-gray-800">{order.orderDate}</span>
              </div>
              {order.reportedBy && (
                <div>
                  <span className="text-gray-500 block">Reported By:</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    {order.reportedBy.name}{" "}
                    {order.reportedBy.email && (
                      <span className="text-gray-400 font-normal">
                        ({order.reportedBy.email})
                      </span>
                    )}
                  </span>
                </div>
              )}
              {order.transporter && (
                <div>
                  <span className="text-gray-500 block">Transporter:</span>
                  <span className="font-semibold text-gray-800">{order.transporter}</span>
                </div>
              )}
              {order.truckNo && (
                <div>
                  <span className="text-gray-500 block">Truck / Vehicle:</span>
                  <span className="font-semibold text-gray-800">{order.truckNo}</span>
                </div>
              )}
              {order.driverName && (
                <div className="col-span-2">
                  <span className="text-gray-500 block">Driver:</span>
                  <span className="font-semibold text-gray-800">
                    {order.driverName}{" "}
                    {order.driverPhone ? `(${order.driverPhone})` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes & Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Notes & Observations
            </label>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed">
              {order.notes ||
                order.mismatchReason ||
                `Physical inspection confirmed ${order.receivedQuantity} items received out of ${order.quantity} expected.`}
            </div>
          </div>

          {/* Action Notes (if any) */}
          {order.actionNotes && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Action Notes
              </label>
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                {order.actionNotes}
              </div>
            </div>
          )}

          {/* Photos (if attached in API) */}
          {order.photos && order.photos.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Attached Photos ({order.photos.length})
              </label>
              <div className="grid grid-cols-2 gap-3">
                {order.photos.map((photo, pIdx) => (
                  <a
                    key={pIdx}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-xs font-medium text-gray-800 truncate">
                        {photo.name || `photo-${pIdx + 1}.jpg`}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div>
            {isMismatch && onStatusChange && (
              <button
                type="button"
                onClick={() => {
                  onStatusChange(order.id, "resolved");
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Resolved
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
