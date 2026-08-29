import React from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowDown, FileText } from "lucide-react";
import { downloadFile } from "@/lib/utils";

export interface DrawingCommentUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface DrawingComment {
  _id: string;
  text: string;
  commentedBy?: string | DrawingCommentUser | null;
  commentedByCustomer?: DrawingCommentUser | null;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DrawingFile {
  id: string;
  name: string;
  size: string;
  status: "Approved" | "Pending Review" | "Revision Required" | "Rejected" | string;
  imageUrl: string;
  uploadedBy: string;
  receivedDate: string;
  location?: string;
  rejectionReason?: string;
  customerSuggestions?: string;
  comments?: DrawingComment[];
  comment?: string;
}

export interface ViewDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: DrawingFile | null;
  onUpdateStatus?: (id: string, newStatus: DrawingFile["status"], comment?: string) => void;
}

const isPhotoFile = (fileName: string) => {
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
  return status || "Pending Review";
};

export const ViewDrawingModal: React.FC<ViewDrawingModalProps> = ({
  isOpen,
  onClose,
  drawing,
}) => {
  if (!drawing) return null;

  const isImage = isPhotoFile(drawing.name);

  const latestCommentFromList =
    drawing.comments && drawing.comments.length > 0
      ? [...drawing.comments].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })[0]?.text
      : undefined;

  const customerSuggestionText = drawing.customerSuggestions || latestCommentFromList;

  const hasRevision =
    Boolean(
      (drawing.status &&
        (drawing.status.toLowerCase().includes("revision") ||
          drawing.status.toLowerCase().includes("required") ||
          drawing.status.toLowerCase().includes("rejected"))) ||
        drawing.rejectionReason ||
        customerSuggestionText ||
        (drawing.comments && drawing.comments.length > 0)
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border-0 gap-0">
        <DialogTitle className="sr-only">{drawing.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Drawing preview and details for {drawing.name}
        </DialogDescription>

        {/* Fixed Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white shrink-0 pr-12">
          <div className="min-w-0 pr-2">
            <h2 className="text-base md:text-lg font-bold text-slate-900 leading-tight truncate" title={drawing.name}>
              {drawing.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {drawing.id}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-xs md:text-sm text-slate-700 shrink-0">
            {drawing.location && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Location
                </span>
                <span className="font-semibold text-slate-900">
                  {drawing.location}
                </span>
              </div>
            )}
            {drawing.uploadedBy && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Uploaded By
                </span>
                <span className="font-semibold text-slate-900">
                  {drawing.uploadedBy}
                </span>
              </div>
            )}
            {drawing.receivedDate && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Received on
                </span>
                <span className="font-semibold text-slate-700">
                  {drawing.receivedDate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-white">
          {/* Preview Area */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-xs max-w-full w-full flex items-center justify-center overflow-hidden">
            {isImage ? (
              <img
                src={drawing.imageUrl}
                alt={drawing.name}
                className="max-w-full max-h-[58vh] object-contain"
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
                  <span className="text-slate-700 text-xs md:text-sm font-normal">
                    {drawing.receivedDate}
                  </span>
                )}
                <Badge
                  className={`px-5 md:px-6 py-1.5 rounded-full text-xs md:text-sm font-medium border ${getStatusBadgeStyle(
                    drawing.status
                  )}`}
                >
                  {getDisplayStatusText(drawing.status)}
                </Badge>
              </div>
            )}
          </div>

          {/* Revision Messages Section */}
          {hasRevision && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-2 pb-2">
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-slate-900">
                  Revision Message
                </h3>
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed break-words">
                  {drawing.rejectionReason || drawing.comment || "No revision message provided."}
                </p>
              </div>
              <div className="space-y-2 border-l-0 md:border-l border-slate-200 md:pl-8">
                <h3 className="text-sm md:text-base font-bold text-slate-900">
                  Customer Suggestions
                </h3>
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed break-words">
                  {customerSuggestionText || "No customer suggestions provided."}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDrawingModal;
