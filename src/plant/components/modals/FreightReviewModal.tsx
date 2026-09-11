import React from "react";
import Modal from "../Modal";
import Button from "../common_component/Button";
import { Mail } from "lucide-react";

export interface FreightFormData {
  loadDescription: string;
  weight: number;
  weightUnit?: string;
  dimensionsInput?: string;
  metalType: string;
  packageCount?: number;
  loadingEquipment?: string[];
  bidDeadline: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  pickupTime?: string;
  deliveryDate: string;
  deliveryTime?: string;
  receivingPoc: string;
  pickupContactPhone: string;
  specialRequirements?: string;
  additionalNotes?: string;
  documentUrl?: string;
}

interface FreightReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: FreightFormData | null;
  projectName?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

const FreightReviewModal: React.FC<FreightReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  projectName = "Logistics Request",
  isSubmitting = false,
  error = null,
}) => {
  const formatTime = (time?: string) => {
    if (!time) return "";
    return ` at ${time}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const displayedError = error;
  const isSubmitDisabled = isSubmitting;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-3xl" title="Email Review">
      <div className="p-1 font-inter text-[#212B36]">
        {/* Header with Mail Icon */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <Mail size={24} />
          </div>
          <h2 className="text-base md:text-2xl font-semibold leading-tight">
            Freight Request – {projectName} | Pickup & Delivery Details
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p>
              <span className="font-bold text-base md:text-lg">Project:</span> {projectName}
            </p>
            <p>
              <span className="font-bold text-base md:text-lg">Pickup Date:</span> {formatDate(formData?.pickupDate)}{formatTime(formData?.pickupTime)}
            </p>
            <p>
              <span className="font-bold text-base md:text-lg">Delivery Date:</span> {formatDate(formData?.deliveryDate)}{formatTime(formData?.deliveryTime)}
            </p>
            <p>
              <span className="font-bold text-base md:text-lg">POC:</span> {formData?.receivingPoc || "N/A"}
            </p>
            <p>
              <span className="font-bold text-base md:text-lg">Delivery Location:</span> {formData?.deliveryLocation || "N/A"}
            </p>
          </div>

          <div className="h-px bg-[#E2E4E6]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            <div className="space-y-1">
              <h3 className="font-bold text-base md:text-xl">Load Details:</h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-sm md:text-lg">
                <li>Total Weight: {formData?.weight ? `${formData.weight.toLocaleString()} ${formData.weightUnit || "Lbs"}` : "N/A"}</li>
                <li>Bundles: {formData?.packageCount || "N/A"}</li>
                <li>Material: {formData?.metalType || "N/A"}</li>
                <li>Equipment: {formData?.loadingEquipment?.join(", ") || "Crane"}</li>
              </ul>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base md:text-xl">Site Details:</h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-sm md:text-lg">
                <li>Pickup: {formData?.pickupLocation || "N/A"}</li>
                <li>Deadline: {formData?.bidDeadline ? formatDate(formData.bidDeadline) + formatTime(formData.bidDeadline.split("T")[1]?.slice(0, 5)) : "N/A"}</li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-[#E2E4E6]" />

          {formData?.specialRequirements && (
            <div className="space-y-1">
              <h3 className="font-bold text-base md:text-xl">Site Requirements:</h3>
              <p className="text-sm md:text-lg pl-2">{formData.specialRequirements}</p>
            </div>
          )}

          {formData?.additionalNotes && (
            <div className="space-y-1">
              <h3 className="font-bold text-base md:text-xl">Additional Notes:</h3>
              <p className="text-sm md:text-lg pl-2">{formData.additionalNotes}</p>
            </div>
          )}
        </div>

        {displayedError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium text-center">
            {displayedError}
          </div>
        )}

        <div className="flex justify-center mt-6 mb-4">
          <Button
            variant="gradient"
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? "Submitting..." : "Submit your quote to Carriers"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FreightReviewModal;
