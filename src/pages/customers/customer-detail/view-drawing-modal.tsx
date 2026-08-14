import React, { useState } from "react";
import { ArrowDown, Paperclip, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { downloadFile } from "@/lib/utils";

export interface DrawingFile {
  id: string;
  name: string;
  size: string;
  status: "Approved" | "Pending Review" | "Revision Required" | "Rejected";
  imageUrl: string;
  uploadedBy: string;
  receivedDate: string;
  location?: string;
  rejectionReason?: string;
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

export const ViewDrawingModal: React.FC<ViewDrawingModalProps> = ({
  isOpen,
  onClose,
  drawing,
  onUpdateStatus,
}) => {
  const [currentStatus, setCurrentStatus] = useState<DrawingFile["status"]>(drawing?.status || "Pending Review");
  const [commentText, setCommentText] = useState("");
  const [revisionNote, setRevisionNote] = useState(drawing?.rejectionReason || "");

  if (!drawing) return null;

  const isImage = isPhotoFile(drawing.name);

  const handleApprove = () => {
    setCurrentStatus("Approved");
    if (onUpdateStatus) onUpdateStatus(drawing.id, "Approved");
  };

  const handleRequestRevision = () => {
    setCurrentStatus("Revision Required");
    if (onUpdateStatus) onUpdateStatus(drawing.id, "Revision Required", commentText || "Revision requested by review.");
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    setRevisionNote(commentText);
    setCommentText("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden rounded-2xl bg-white shadow-2xl border-0">
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {drawing.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Ref ID: {drawing.id}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Location
                </span>
                <span className="font-semibold text-slate-800">
                  {drawing.location || "Dallas, TX"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Uploaded By
                </span>
                <span className="font-semibold text-slate-800">
                  {drawing.uploadedBy}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Received On
                </span>
                <span className="font-semibold text-slate-800">
                  {drawing.receivedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Body: Preview Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex items-center justify-center min-h-[350px]">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs max-w-full w-full flex items-center justify-center">
              {isImage ? (
                <img
                  src={drawing.imageUrl}
                  alt={drawing.name}
                  className="max-w-full max-h-[55vh] object-contain rounded-lg"
                />
              ) : (
                <iframe
                  src={`${drawing.imageUrl}#toolbar=0`}
                  title={drawing.name}
                  className="w-full h-[55vh] rounded-lg border border-slate-100"
                />
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-white border-t border-slate-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => downloadFile(drawing.imageUrl, drawing.name)}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <ArrowDown className="w-4 h-4" />
                Download
              </Button>

              <div className="flex items-center gap-3 ml-auto flex-wrap">
                {currentStatus === "Approved" ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-1.5 text-sm font-medium rounded-full">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approved
                  </Badge>
                ) : currentStatus === "Revision Required" ? (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-4 py-1.5 text-sm font-medium rounded-full">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> Revision Requested
                  </Badge>
                ) : (
                  <>
                    <Button
                      onClick={handleRequestRevision}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-5 py-1.5 text-sm font-medium"
                    >
                      Revision Required
                    </Button>
                    <Button
                      onClick={handleApprove}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-1.5 text-sm font-medium"
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Revision Notes / Comment Box */}
            {(currentStatus === "Revision Required" || revisionNote) && (
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Revision Message & Notes
                </h4>
                <p className="text-sm text-slate-800">
                  {revisionNote || "Please update drawing parameters and clear dimensions."}
                </p>
              </div>
            )}

            {currentStatus === "Pending Review" && (
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 flex items-center border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-100 bg-slate-50">
                  <Input
                    type="text"
                    placeholder="Type review comment or feedback..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-sm shadow-none"
                  />
                  <button className="p-1.5 text-slate-400 hover:text-slate-600">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleSendComment}
                  className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-xl px-4 py-2 text-sm"
                >
                  Send Comment
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDrawingModal;
