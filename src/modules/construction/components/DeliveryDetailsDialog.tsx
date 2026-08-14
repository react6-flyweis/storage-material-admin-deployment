import React from "react";
import { X, Calendar, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useDeliveryDetailsQuery } from "../construction.hooks";
import type { ApiDeliveryItem } from "../construction.api";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliveryDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId?: string | null;
  delivery?: ApiDeliveryItem | null;
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border border-gray-200",
  carrier_selected: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  rescheduled: "bg-amber-50 text-amber-600 border border-amber-100",
  scheduled: "bg-cyan-50 text-cyan-600 border border-cyan-100",
  in_transit: "bg-blue-50 text-blue-600 border border-blue-100",
  "in transit": "bg-blue-50 text-blue-600 border border-blue-100",
  bidding_sent: "bg-purple-50 text-purple-600 border border-purple-100",
  delivered: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  confirmed: "bg-teal-50 text-teal-600 border border-teal-100",
  delayed: "bg-rose-50 text-rose-600 border border-rose-100",
  cancelled: "bg-red-50 text-red-600 border border-red-100",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  carrier_selected: "Carrier Selected",
  rescheduled: "Rescheduled",
  scheduled: "Scheduled",
  in_transit: "In Transit",
  "in transit": "In Transit",
  bidding_sent: "Bidding Sent",
  delivered: "Delivered",
  confirmed: "Confirmed",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

function formatStatus(status?: string) {
  if (!status) return "Draft";
  const lower = status.toLowerCase();
  if (statusLabels[lower]) return statusLabels[lower];
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(dateStr?: string) {
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

export const DeliveryDetailsDialog: React.FC<DeliveryDetailsDialogProps> = ({
  isOpen,
  onClose,
  deliveryId,
  delivery: initialDelivery,
}) => {
  const targetId = deliveryId || initialDelivery?.deliveryId || null;
  const { data, isLoading } = useDeliveryDetailsQuery(isOpen ? targetId : null);

  if (!isOpen) return null;

  const delivery = data?.data?.delivery || initialDelivery;

  const formattedStatus = formatStatus(delivery?.status);
  const statusClass =
    statusStyles[delivery?.status?.toLowerCase() || ""] ||
    statusStyles[formattedStatus.toLowerCase()] ||
    "bg-blue-50 text-blue-600 border border-blue-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[620px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {isLoading ? (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Top Header Skeleton */}
            <div className="flex items-center gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-32 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>

            {/* Grid 1 Skeleton: Project / Site & Material */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            {/* Delivery Date & Time Skeleton */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>

            {/* Grid 2 Skeleton: Transporter & Driver */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-16 mt-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-16 mt-2" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            {/* Grid 3 Skeleton: Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>

            {/* Footer Close Button Skeleton */}
            <div className="pt-4 border-t border-gray-100 flex justify-center">
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
            {/* Top Identifier & Status */}
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900 leading-none">
                    {delivery?.deliveryNumber || "DEL-2001"}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${statusClass}`}
                  >
                    {formattedStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">
                  PO:{delivery?.poNumber || delivery?.project?.jobId || "PO-4587"}
                </p>
              </div>
            </div>

            {/* Grid 1: Project / Site & Material */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-normal text-gray-500 mb-1">Project / Site</p>
                <p className="font-bold text-gray-900 text-base">
                  {delivery?.project?.projectName || "ABC Construction LLC"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {delivery?.project?.site || delivery?.deliveryLocation || delivery?.project?.jobId || "Construction Site A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-normal text-gray-500 mb-1">Material</p>
                <p className="font-bold text-gray-900 text-base">
                  {delivery?.material || "Primary Frame Steel"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {delivery?.weight || "45,000 lbs"}
                </p>
              </div>
            </div>

            {/* Delivery Date & Time */}
            <div>
              <p className="text-xs font-normal text-gray-500 mb-1.5">Delivery Date & Time</p>
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <Calendar className="w-4 h-4 text-gray-700" />
                <span>
                  {formatDate(delivery?.deliveryDate)}
                  {delivery?.timings ? `, ${delivery.timings}` : ", 03:45 PM"}
                </span>
              </div>
            </div>

            {/* Grid 2: Transporter & Driver */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-normal text-gray-500 mb-1">Transporter</p>
                <p className="font-bold text-gray-900 text-base">
                  {delivery?.transporter || "FastFreight Logistics"}
                </p>
                <p className="text-xs font-normal text-gray-500 mt-3 mb-0.5">Truck No.</p>
                <p className="font-bold text-gray-900 text-sm">
                  {delivery?.truckNo || "TX-4582"}
                </p>
              </div>

              <div>
                <p className="text-xs font-normal text-gray-500 mb-1">Driver</p>
                <p className="font-bold text-gray-900 text-base">
                  {delivery?.driver || "John Miller"}
                </p>
                <p className="text-xs font-normal text-gray-500 mt-3 mb-0.5">Phone</p>
                <p className="font-bold text-gray-900 text-sm">
                  {delivery?.driverPhone || "+1 555-812-9921"}
                </p>
              </div>
            </div>

            {/* Grid 3: Site Contact & Alternate Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-normal text-gray-500 mb-1.5">Site Contact</p>
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Phone className="w-4 h-4 text-gray-700" />
                  <span>{delivery?.siteContact || "+1 555-812-9921"}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 pl-6">
                  {delivery?.siteContactRole || "Site Incharge"}
                </p>
              </div>

              <div>
                <p className="text-xs font-normal text-gray-500 mb-1.5">Alternate Contact</p>
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Phone className="w-4 h-4 text-gray-700" />
                  <span>{delivery?.alternateContact || "+1 555-812-1199"}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 pl-6">
                  {delivery?.alternateContactRole || "Site Manager"}
                </p>
              </div>
            </div>

            {/* Grid 4: Status & Current Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-normal text-gray-500 mb-1.5">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${statusClass}`}
                >
                  {formattedStatus}
                </span>
              </div>

              <div>
                <p className="text-xs font-normal text-gray-500 mb-1.5">Current Location</p>
                <div className="flex items-start gap-2 font-bold text-gray-900">
                  <MapPin className="w-4 h-4 text-gray-700 mt-0.5 shrink-0" />
                  <span>
                    {delivery?.currentLocation || delivery?.deliveryLocation || "On the way to Construction Site A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Received Information */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">Received information</h4>
              <p className="text-xs text-gray-500">
                {delivery?.receivedInfo ||
                  (delivery?.status === "delivered"
                    ? `Received on ${formatDate(delivery?.receivedDate)}`
                    : "Not Received yet")}
              </p>
            </div>

            {/* QR Scan Information */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">QR Scan information</h4>
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-gray-700">Scan Staus</span>
              </div>

              <div className="space-y-2 pl-6 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <span className="text-gray-500 font-normal">Last Scanned</span>
                  <span className="font-bold text-gray-900">
                    {delivery?.qrScanInfo?.lastScanned || "May 19, 2025, 3:40 PM"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <span className="text-gray-500 font-normal">Scanned By</span>
                  <span className="font-bold text-gray-900">
                    {delivery?.qrScanInfo?.scannedBy || "John Miler ( Driver)"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <span className="text-gray-500 font-normal">Scan Location</span>
                  <span className="font-bold text-gray-900">
                    {delivery?.qrScanInfo?.scanLocation || "Near Highway 45, Dallas, TX"}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
                >
                  View Scan History
                </button>
              </div>
            </div>

            {/* Modal Footer Button */}
            <div className="pt-4 border-t border-gray-100 flex justify-center">
              <button
                onClick={onClose}
                className="px-14 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
