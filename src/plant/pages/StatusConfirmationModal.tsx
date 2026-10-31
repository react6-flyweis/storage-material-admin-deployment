import React, { useState } from "react";
import Modal from "../components/Modal";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatStatusLabel,
  STATUS_DEFINITIONS,
  DELIVERY_STATUS_SEQUENCE,
  normalizeStatusKey,
  getNextStatus,
  getStatusIndex,
  isFinalStatus,
  type DeliveryStatusType,
} from "./deliveryStatusConstants";
import StatusBadge from "./StatusBadge";

interface StatusConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetStatus: DeliveryStatusType) => void;
  projectName?: string;
  deliveryId?: string;
  currentStatus: string;
  isLoading?: boolean;
}

const StatusConfirmationModal: React.FC<StatusConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName = "Delivery",
  deliveryId = "",
  currentStatus,
  isLoading = false,
}) => {
  const currentNorm = normalizeStatusKey(currentStatus) as DeliveryStatusType;
  const currentIndex = getStatusIndex(currentNorm);
  const isComplete = isFinalStatus(currentStatus);

  const defaultNext = getNextStatus(currentStatus);
  const [overrideStatus, setOverrideStatus] = useState<DeliveryStatusType | null>(null);

  const selectedTargetStatus = overrideStatus ?? defaultNext;

  const currentDef = STATUS_DEFINITIONS[currentNorm];
  const targetNorm = selectedTargetStatus ? (normalizeStatusKey(selectedTargetStatus) as DeliveryStatusType) : null;
  const targetDef = targetNorm ? STATUS_DEFINITIONS[targetNorm] : null;

  const handleClose = () => {
    if (!isLoading) {
      setOverrideStatus(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Delivery Status"
      width="max-w-xl"
    >
      <div className="space-y-5 font-inter">
        {/* Project & Current Status Header */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#6A7282] uppercase tracking-wider">
              Project / Delivery
            </span>
            {deliveryId && (
              <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                ID: {deliveryId.slice(-8)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#212B36] truncate">{projectName}</h3>
            <StatusBadge status={currentStatus} />
          </div>
        </div>

        {isComplete ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-emerald-800">
              Delivery Workflow Completed
            </p>
            <p className="text-xs text-emerald-600">
              This delivery has reached its final status ({formatStatusLabel(currentStatus)}). No further status updates can be made.
            </p>
          </div>
        ) : (
          <>
            {/* Status Selector Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#212B36] uppercase tracking-wider block">
                Select New Status
              </label>
              <Select
                value={selectedTargetStatus || ""}
                onValueChange={(val) => setOverrideStatus(val as DeliveryStatusType)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-white border border-[#E2E4E6] rounded-lg px-3.5 py-2.5 h-11 text-sm font-medium text-[#212B36] focus-visible:ring-2 focus-visible:ring-blue-600/20">
                  <SelectValue placeholder="-- Select Next Status --" />
                </SelectTrigger>
                <SelectContent className="z-50 max-h-60 bg-white shadow-lg border border-gray-200">
                  {DELIVERY_STATUS_SEQUENCE.map((statusKey, index) => {
                    const def = STATUS_DEFINITIONS[statusKey];
                    const isPast = currentIndex !== -1 && index < currentIndex;
                    const isCurrent = currentIndex !== -1 && index === currentIndex;
                    const isNext =
                      (currentIndex === -1 && index === 0) || index === currentIndex + 1;
                    const isFuture =
                      (currentIndex === -1 && index > 0) || index > currentIndex + 1;

                    // Cannot go backward or pick current
                    const isDisabled = isPast || isCurrent || isFuture;

                    return (
                      <SelectItem
                        key={statusKey}
                        value={statusKey}
                        disabled={isDisabled}
                        className={isDisabled ? "opacity-50 cursor-not-allowed text-gray-400" : "cursor-pointer"}
                      >
                        <span className="flex items-center justify-between w-full gap-2">
                          <span>{def.label}</span>
                          <span className="text-xs text-gray-400 font-normal">
                            {isPast
                              ? "(Completed)"
                              : isCurrent
                                ? "(Current)"
                                : isNext
                                  ? "(Next Step)"
                                  : "(Locked)"}
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Status Transition Preview */}
            {selectedTargetStatus && (
              <div className="p-4 rounded-xl border border-blue-100 bg-[#F8FAFC] space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Status Transition
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                      currentDef
                        ? `${currentDef.badgeBg} ${currentDef.badgeText} ${currentDef.badgeBorder}`
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {formatStatusLabel(currentStatus)}
                  </div>

                  <div className="flex items-center text-blue-600">
                    <ArrowRight size={18} />
                  </div>

                  <div
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-xs ${
                      targetDef
                        ? `${targetDef.badgeBg} ${targetDef.badgeText} ${targetDef.badgeBorder}`
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {formatStatusLabel(selectedTargetStatus)}
                  </div>
                </div>
              </div>
            )}

            {/* Irreversible Notice */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-sm">
              <AlertCircle size={17} className="shrink-0 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed text-left">
                Advancing the status is a forward-only update. You will not be able to revert to previous statuses once confirmed.
              </p>
            </div>
          </>
        )}

        {/* Modal Actions */}
        <div className="flex w-full gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 font-semibold"
          >
            {isComplete ? "Close" : "Cancel"}
          </Button>
          {!isComplete && (
            <Button
              className="flex-1 h-10 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (selectedTargetStatus) {
                  onConfirm(selectedTargetStatus);
                }
              }}
              disabled={isLoading || !selectedTargetStatus}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </span>
              ) : (
                "Confirm & Advance"
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StatusConfirmationModal;
