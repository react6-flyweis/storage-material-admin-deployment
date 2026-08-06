import React, { useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useUploadLeadDocumentMutation } from "@/modules/leads/leads.hooks";
import { UploadModal } from "@/plant/pages/modals/ProjectUploadModals";

export interface ProjectBuildingDrawing {
  buildingId: string;
  buildingNumber: number;
  hasDrawing?: boolean;
  status?: string;
  latestDrawingStatus?: string;
  latestDrawing?: {
    versionNumber: number;
    fileUrl: string;
    fileName: string;
    status: string;
    uploadedAt: string;
    rejectionReason?: string;
  };
}

export interface UploadDrawingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  onUpload?: (files: File[], buildingId?: string, fileUrl?: string) => void;
  onSubmit?: () => void;
  isUploading?: boolean;
}

const defaultMockBuildingDrawings: ProjectBuildingDrawing[] = [
  {
    buildingId: "bldg-1",
    buildingNumber: 1,
    hasDrawing: true,
    status: "Approved",
    latestDrawingStatus: "Approved",
    latestDrawing: {
      versionNumber: 2,
      fileUrl: "https://placehold.co/400x300/E2E8F0/A1A1AA?text=Building+1",
      fileName: "Building-1-Structural-Plan.pdf",
      status: "Approved",
      uploadedAt: "2025-02-22T10:00:00Z",
    },
  },
  {
    buildingId: "bldg-2",
    buildingNumber: 2,
    hasDrawing: true,
    status: "Pending Review",
    latestDrawingStatus: "Pending Review",
    latestDrawing: {
      versionNumber: 1,
      fileUrl: "https://placehold.co/400x300/E2E8F0/A1A1AA?text=Building+2",
      fileName: "Building-2-Architectural-Plan.dwg",
      status: "Pending Review",
      uploadedAt: "2025-02-18T16:20:00Z",
    },
  },
  {
    buildingId: "bldg-3",
    buildingNumber: 3,
    hasDrawing: false,
    status: "none",
  },
];

const mapDrawingStatusBadge = (status?: string) => {
  if (!status || status === "none") {
    return { text: "No Drawings", classes: "bg-slate-100 text-slate-600 border-slate-200" };
  }
  const lower = status.toLowerCase();
  if (lower.includes("approved")) {
    return { text: "Approved", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  if (lower.includes("reject")) {
    return { text: "Rejected", classes: "bg-rose-50 text-rose-700 border-rose-200" };
  }
  if (lower.includes("revision")) {
    return { text: "Revision Required", classes: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  return { text: "Pending Review", classes: "bg-[#FEFAE2] text-[#B48200] border-amber-200" };
};

export const UploadDrawingsModal: React.FC<UploadDrawingsModalProps> = ({
  isOpen,
  onClose,
  leadId,
  onUpload,
  onSubmit,
}) => {
  const uploadMutation = useUploadLeadDocumentMutation();

  const [buildings, setBuildings] = useState<ProjectBuildingDrawing[]>(defaultMockBuildingDrawings);
  const [selectedBuilding, setSelectedBuilding] = useState<ProjectBuildingDrawing | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");

  const handleUploadComplete = async (file: File, fileUrl: string) => {
    if (!selectedBuilding) return;

    if (leadId) {
      try {
        await uploadMutation.mutateAsync({ leadId, files: [file], type: "drawing" });
      } catch (err) {
        console.error("Failed to update lead document record:", err);
      }
    }

    setBuildings((prev) =>
      prev.map((b) =>
        b.buildingId === selectedBuilding.buildingId
          ? {
              ...b,
              hasDrawing: true,
              status: "Pending Review",
              latestDrawingStatus: "Pending Review",
              latestDrawing: {
                versionNumber: (b.latestDrawing?.versionNumber || 0) + 1,
                fileUrl: fileUrl || "#",
                fileName: file.name,
                status: "Pending Review",
                uploadedAt: new Date().toISOString(),
              },
            }
          : b
      )
    );

    if (onUpload) {
      onUpload([file], selectedBuilding.buildingId, fileUrl);
    }
    if (onSubmit) {
      onSubmit();
    }

    setSuccessTitle(`Drawing for Building ${selectedBuilding.buildingNumber} Uploaded Successfully`);
    setSuccessDialogOpen(true);
    setSelectedBuilding(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[650px] p-6 rounded-2xl bg-white shadow-xl border-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-sans">Building Drawings</h2>
                <p className="text-sm text-slate-500 mt-1">
                  View drawings status per building or upload/replace files.
                </p>
              </div>
            </div>

            {/* List of Buildings */}
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-[#F8FAFC]">
                {buildings.map((b) => {
                  const badge = mapDrawingStatusBadge(b.latestDrawingStatus || b.status);

                  return (
                    <div
                      key={b.buildingId}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-slate-900">
                            Building {b.buildingNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.classes}`}>
                            {badge.text}
                          </span>
                        </div>

                        {b.latestDrawing ? (
                          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                            <FileText className="w-4 h-4 text-[#1D51A4] shrink-0" />
                            <span className="font-medium text-slate-800 truncate max-w-[200px]" title={b.latestDrawing.fileName}>
                              {b.latestDrawing.fileName}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>v{b.latestDrawing.versionNumber}</span>
                            <span className="text-slate-300">|</span>
                            <span>
                              {new Date(b.latestDrawing.uploadedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">No drawings uploaded yet</p>
                        )}

                        {b.latestDrawing?.rejectionReason && (
                          <p className="text-[11px] text-red-600 bg-red-50 p-1.5 rounded border border-red-100 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                            <span>Reason: {b.latestDrawing.rejectionReason}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            b.hasDrawing
                              ? "border-[#1D51A4] text-[#1D51A4] hover:bg-blue-50"
                              : "bg-[#1D51A4] text-white hover:bg-[#1D51A4]/90"
                          }
                          onClick={() => setSelectedBuilding(b)}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          {b.hasDrawing ? "Replace file" : "Upload file"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 px-6"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integrated UploadModal from ProjectUploadModals */}
      {selectedBuilding && (
        <UploadModal
          isOpen={!!selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
          title={`Upload Drawing: Building ${selectedBuilding.buildingNumber}`}
          subtitle="Upload or drop your drawing file (.pdf, .dwg, .png, .jpg, .jpeg, .svg)"
          folder="drawings"
          allowedExtensions={["pdf", "dwg", "png", "jpg", "jpeg", "svg"]}
          onUpload={handleUploadComplete}
        />
      )}

      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successTitle}
      />
    </>
  );
};

export default UploadDrawingsModal;
