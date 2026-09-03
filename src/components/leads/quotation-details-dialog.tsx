import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Ruler,
  DollarSign,
  Calendar,
  FileText,
  Send,
  Layers,
  Package,
  DoorClosed,
  Flame,
  Info,
  ShieldAlert,
} from "lucide-react";
import type { Quotation } from "@/modules/quotations/quotations.api";
import dayjs from "dayjs";

interface QuotationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: Quotation | null;
  onApprove?: (quotation: Quotation) => void;
  onReject?: (quotation: Quotation) => void;
  onSend?: (quotation: Quotation) => void;
}

function getWorkflowBadge(quotation: Quotation) {
  const status =
    quotation.workflowStatus ||
    quotation.approval?.status ||
    quotation.status ||
    "draft";

  switch (status) {
    case "approved":
      return (
        <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-none px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
          Approved
        </Badge>
      );
    case "pending_approval":
      return (
        <Badge className="bg-[#fef3c7] text-[#d97706] hover:bg-[#fef3c7] border-none px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
          Pending Approval
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-[#fee2e2] text-[#dc2626] hover:bg-[#fee2e2] border-none px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
          Rejected
        </Badge>
      );
    case "sent":
      return (
        <Badge className="bg-[#dbeafe] text-[#2563eb] hover:bg-[#dbeafe] border-none px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
          Quote Sent
        </Badge>
      );
    case "draft":
    case "not_submitted":
    default:
      return (
        <Badge className="bg-[#f1f5f9] text-[#475569] hover:bg-[#f1f5f9] border-none px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
          Draft
        </Badge>
      );
  }
}

export default function QuotationDetailsDialog({
  open,
  onOpenChange,
  quotation,
  onApprove,
  onReject,
  onSend,
}: QuotationDetailsDialogProps) {
  if (!quotation) return null;

  const effectiveStatus =
    quotation.workflowStatus ||
    quotation.approval?.status ||
    quotation.status ||
    "draft";

  const isPending = effectiveStatus === "pending_approval";
  const isApproved = effectiveStatus === "approved";
  const isRejected = effectiveStatus === "rejected";

  const price = quotation.finalPrice || quotation.basePrice || 0;
  const dimensionsStr =
    quotation.width && quotation.length && quotation.height
      ? `${quotation.width}' × ${quotation.length}' × ${quotation.height}'`
      : quotation.sqft
      ? `${quotation.sqft} sq ft`
      : "N/A";

  const calculatedSqft =
    quotation.width && quotation.length
      ? quotation.width * quotation.length
      : null;
  const displaySqft = quotation.sqft
    ? `${quotation.sqft} sq ft`
    : calculatedSqft
    ? `${calculatedSqft.toLocaleString()} sq ft`
    : null;

  const psfValue =
    quotation.psf ||
    (calculatedSqft && price ? (price / calculatedSqft).toFixed(2) : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden bg-white max-h-[90vh] flex flex-col border-none shadow-xl">
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                  Quotation #{quotation.quoteNumber}
                </DialogTitle>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  v{quotation.versionNumber}
                </span>
                {getWorkflowBadge(quotation)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Created {dayjs(quotation.createdAt).format("MMM DD, YYYY")}</span>
                {quotation.buildingType && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{quotation.buildingType} Building</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 flex-1 thin-scrollbar">
          {/* Rejection Alert Banner if Rejected */}
          {isRejected && (quotation.approval?.rejectionReason || quotation.specialNote) && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">
                  Rejection Details
                </h4>
                <p className="text-xs text-red-700 mt-0.5">
                  {quotation.approval?.rejectionReason || quotation.specialNote || "No rejection reason specified."}
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Total Price
              </div>
              <p className="text-base font-bold text-slate-900">
                ${price.toLocaleString()}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Ruler className="w-3.5 h-3.5 text-slate-400" /> Dimensions
              </div>
              <p className="text-sm font-semibold text-slate-900 truncate" title={dimensionsStr}>
                {dimensionsStr}
              </p>
              {displaySqft && (
                <span className="text-[11px] text-slate-500 block font-normal">
                  {displaySqft}
                </span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Building Type
              </div>
              <p className="text-sm font-semibold text-slate-900 capitalize truncate">
                {quotation.buildingType || "—"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Valid Until
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {quotation.validTill
                  ? dayjs(quotation.validTill).format("MMM DD, YYYY")
                  : quotation.validity || "—"}
              </p>
            </div>
          </div>

          {/* Detailed Building & Structural Specs */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" /> Building Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Roof Style</span>
                <span className="text-xs font-semibold text-slate-800 capitalize">
                  {quotation.roofStyle || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Roof Slope</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.roofSlope || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Location</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {quotation.location || "—"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Left Eave Height</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.leftEaveHeight ? `${quotation.leftEaveHeight}'` : "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Right Eave Height</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.rightEaveHeight ? `${quotation.rightEaveHeight}'` : "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Price / Sq Ft</span>
                <span className="text-xs font-semibold text-slate-800">
                  {psfValue ? `$${psfValue}` : "—"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Wind Load</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.windLoad || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Snow Load</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.snowLoad || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Payment Terms</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.paymentTerms || "Standard"}
                </span>
              </div>
            </div>
          </div>

          {/* Framing & Materials Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-500" /> Framing & Panels
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block">Frame Type</span>
                <span className="text-xs font-semibold text-slate-800 capitalize">
                  {quotation.frameType || "Rigid Frame"}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block">Endwall Type</span>
                <span className="text-xs font-semibold text-slate-800 capitalize">
                  {quotation.endwallType || "Standard"}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block">Purlin / Girt</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.purlinType || quotation.girtType || "Standard"}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block">Bracing Type</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.bracingType || "Standard"}
                </span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block">Roof Panel</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.roofPanel || "—"} {quotation.roofColor ? `(${quotation.roofColor})` : ""}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block">Wall Panel</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.wallPanelType || "—"} {quotation.wallColor ? `(${quotation.wallColor})` : ""}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block">Trim Color</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.trimColor || "—"}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block">Base Angle</span>
                <span className="text-xs font-semibold text-slate-800">
                  {quotation.baseAngle || "Included"}
                </span>
              </div>
            </div>
          </div>

          {/* Doors & Insulation (if present) */}
          {((quotation.doors && quotation.doors.length > 0) ||
            (quotation.insulation && quotation.insulation.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quotation.doors && quotation.doors.length > 0 && (
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DoorClosed className="w-3.5 h-3.5 text-blue-500" /> Doors Specification
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {quotation.doors.map((door, idx) => (
                      <li key={idx} className="flex justify-between border-b border-slate-200/50 pb-1 last:border-0">
                        <span className="capitalize font-medium">{door.doorCategory} Door ({door.doorType || "Standard"})</span>
                        <span className="text-slate-500">{door.size ? `${door.size} ` : ""}{door.qty ? `x${door.qty}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {quotation.insulation && quotation.insulation.length > 0 && (
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> Insulation
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {quotation.insulation.map((ins, idx) => (
                      <li key={idx} className="flex justify-between border-b border-slate-200/50 pb-1 last:border-0">
                        <span className="capitalize font-medium">{ins.insulationType} Insulation</span>
                        <span className="text-slate-500">{ins.thickness || ins.material || "Included"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Notes Section */}
          {(quotation.specialNote || quotation.clientNotes || quotation.internalNotes) && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" /> Notes & Information
              </h4>
              {quotation.specialNote && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Special Note:</span>
                  <p className="text-xs text-slate-700">{quotation.specialNote}</p>
                </div>
              )}
              {quotation.clientNotes && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Client Notes:</span>
                  <p className="text-xs text-slate-700">{quotation.clientNotes}</p>
                </div>
              )}
              {quotation.internalNotes && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Internal Notes:</span>
                  <p className="text-xs text-slate-700">{quotation.internalNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          {isPending && onApprove && (
            <Button
              size="sm"
              className="bg-[#16a34a] hover:bg-green-700 text-white text-xs h-8 px-3 rounded-lg"
              onClick={() => onApprove(quotation)}
            >
              Approve
            </Button>
          )}
          {isPending && onReject && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8 px-3 rounded-lg"
              onClick={() => onReject(quotation)}
            >
              Reject
            </Button>
          )}
          {isApproved && onSend && (
            <Button
              size="sm"
              className="bg-[#3b82f6] hover:bg-blue-600 text-white text-xs h-8 px-3 rounded-lg flex items-center gap-1"
              onClick={() => onSend(quotation)}
            >
              <Send className="w-3 h-3" /> Send
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 rounded-lg border-slate-300"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
