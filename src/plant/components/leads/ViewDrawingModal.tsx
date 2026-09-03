import React from "react";
import Modal from "../Modal";
import { ArrowDown, X, FileText } from "lucide-react";
import { downloadFile } from "@/lib/utils";

interface ViewDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: {
    name: string;
    id: string;
    location: string;
    uploadedBy: string;
    receivedDate: string;
    imageUrl: string;
    status: string;
    rejectionReason?: string;
    customerSuggestions?: string;
  } | null;
}

const ViewDrawingModal: React.FC<ViewDrawingModalProps> = ({
  isOpen,
  onClose,
  drawing,
}) => {
  if (!drawing) return null;

  const isImage = (fileName?: string) => {
    const ext = fileName ? fileName.split(".").pop()?.toLowerCase() : "";
    return ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "");
  };

  const getStatusBadgeStyle = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("approved")) {
      return "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]";
    }
    if (s.includes("revision") || s.includes("required") || s.includes("rejected")) {
      return "bg-[#FFF4E6] text-[#FF9409] border-[#FFE2C2]";
    }
    if (s.includes("pending")) {
      return "bg-[#FEFAE2] text-[#F0CC16] border-[#FEFAE2]";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getDisplayStatusText = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("rejected")) {
      return "Revision Requested";
    }
    return status || "Pending";
  };

  const hasRevision =
    drawing.status &&
    (drawing.status.toLowerCase().includes("revision") ||
      drawing.status.toLowerCase().includes("required") ||
      drawing.status.toLowerCase().includes("rejected") ||
      Boolean(drawing.rejectionReason) ||
      Boolean(drawing.customerSuggestions));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" width="max-w-5xl" height="max-h-[90vh]">
      <div className="flex flex-col max-h-[85vh]">
        {/* Fixed Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-gray-100 gap-3 relative shrink-0">
          <div className="pr-8 md:pr-0">
            <h2 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
              {drawing.name}
            </h2>
            <p className="text-gray-500 font-medium text-xs mt-0.5">
              {drawing.id}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-xs md:text-sm font-inter text-gray-800 md:ml-auto mr-8 md:mr-0">
            {drawing.location && (
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Location
                </p>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">
                  {drawing.location}
                </p>
              </div>
            )}
            {drawing.uploadedBy && (
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Uploaded By
                </p>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">
                  {drawing.uploadedBy}
                </p>
              </div>
            )}
            {drawing.receivedDate && (
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Received on
                </p>
                <p className="font-semibold text-gray-700 text-xs md:text-sm">
                  {drawing.receivedDate}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full hover:bg-gray-100 p-1.5 text-gray-500 hover:text-gray-900 transition-colors absolute top-0 right-0 md:static"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pt-3 pr-1">
          {/* File Preview */}
          <div className="bg-gray-50/70 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden w-full">
            {isImage(drawing.name) ? (
              <img
                src={drawing.imageUrl}
                alt={drawing.name}
                className="w-full h-full max-h-[58vh] object-contain"
              />
            ) : drawing.imageUrl ? (
              <iframe
                src={`${drawing.imageUrl}#toolbar=0`}
                title={drawing.name}
                className="w-full h-[58vh] border-0 bg-white"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <FileText className="w-10 h-10 text-gray-300" />
                <p className="text-xs font-medium">Preview not available</p>
              </div>
            )}
          </div>

          {/* Action & Status Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => downloadFile(drawing.imageUrl, drawing.name)}
              className="flex items-center gap-2 px-5 py-2 bg-[#8C98A9] hover:bg-[#7A8798] text-white rounded-full text-xs md:text-sm font-medium transition-colors cursor-pointer shadow-xs"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Download</span>
            </button>

            {drawing.status && (
              <div className="flex items-center gap-3 ml-auto flex-wrap">
                {drawing.receivedDate && (
                  <span className="text-gray-700 text-xs md:text-sm font-normal">
                    {drawing.receivedDate}
                  </span>
                )}
                <span
                  className={`px-5 md:px-6 py-1.5 rounded-full text-xs md:text-sm font-medium border ${getStatusBadgeStyle(
                    drawing.status
                  )}`}
                >
                  {getDisplayStatusText(drawing.status)}
                </span>
              </div>
            )}
          </div>

          {/* Revision Messages Section */}
          {hasRevision && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-2 pb-2">
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">
                  Revision Message
                </h3>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed break-words">
                  {drawing.rejectionReason || "No revision message provided."}
                </p>
              </div>
              <div className="space-y-2 border-l-0 md:border-l border-gray-200 md:pl-8">
                <h3 className="text-sm md:text-base font-bold text-gray-900">
                  Customer Suggestions
                </h3>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed break-words">
                  {drawing.customerSuggestions || "No customer suggestions provided."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewDrawingModal;
