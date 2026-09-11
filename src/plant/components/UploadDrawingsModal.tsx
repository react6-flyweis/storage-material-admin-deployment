import React, { useState, useMemo } from "react";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  useGetProjectDrawingsQuery,
  useUploadProjectDrawingsMutation,
} from "@/modules/plant/bom.hooks";
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
  projectId?: string;
  onUpload?: (files: File[], buildingId?: string, fileUrl?: string) => void;
  onSubmit?: () => void;
  isUploading?: boolean;
}

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
  projectId,
  onUpload,
  onSubmit,
}) => {
  const activeProjectId = projectId || leadId || "";

  const { data: drawingsData, isLoading } = useGetProjectDrawingsQuery(
    activeProjectId,
    Boolean(activeProjectId) && isOpen
  );

  const { mutateAsync: uploadProjectDrawings, isPending: isUploadingDrawings } =
    useUploadProjectDrawingsMutation();

  const [selectedBuilding, setSelectedBuilding] = useState<ProjectBuildingDrawing | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const buildings: ProjectBuildingDrawing[] = useMemo(() => {
    if (drawingsData?.buildings && drawingsData.buildings.length > 0) {
      return drawingsData.buildings.map((b) => {
        const latestDwg = b.drawings && b.drawings.length > 0 ? b.drawings[0] : undefined;
        return {
          buildingId: b.buildingId,
          buildingNumber: b.buildingNumber,
          hasDrawing: Boolean(latestDwg),
          status: b.latestDrawingStatus || (latestDwg ? latestDwg.status : "none"),
          latestDrawingStatus: b.latestDrawingStatus,
          latestDrawing: latestDwg
            ? {
                versionNumber: latestDwg.versionNumber || 1,
                fileUrl: latestDwg.fileUrl || "",
                fileName: latestDwg.fileName || "",
                status: latestDwg.status || "Pending Review",
                uploadedAt: latestDwg.uploadedAt || new Date().toISOString(),
                rejectionReason: latestDwg.rejectionReason,
              }
            : undefined,
        };
      });
    }
    return [];
  }, [drawingsData]);

  const handleUploadComplete = async (file: File, fileUrl: string) => {
    if (!selectedBuilding) return;
    setErrorMessage(null);

    if (activeProjectId) {
      try {
        await uploadProjectDrawings({
          projectId: activeProjectId,
          drawings: [
            {
              buildingId: selectedBuilding.buildingId,
              fileUrl,
              fileName: file.name,
            },
          ],
        });
      } catch (err: unknown) {
        console.error("Failed to upload project drawing:", err);
        const errorObj = err as { data?: { message?: string }; message?: string };
        const errMsg = errorObj?.data?.message || errorObj?.message || "Failed to upload drawing.";
        setErrorMessage(errMsg);
        return;
      }
    }

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

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center justify-between font-sans">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                  ×
                </button>
              </div>
            )}

            {/* List of Buildings */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1D51A4]" />
                  <p className="text-sm text-slate-500 font-sans">Loading building drawings...</p>
                </div>
              ) : buildings.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-sans text-sm border border-slate-200 rounded-xl">
                  No buildings found for this project.
                </div>
              ) : (
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
                            disabled={isUploadingDrawings}
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
              )}
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
