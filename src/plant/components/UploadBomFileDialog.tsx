import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, Upload, FileText, Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  useGetProjectBuildingsQuery,
  useUploadProjectBomsMutation,
  useGetBomJobsStatusBatchMutation,
  useGenerateConsolidatedBOMMutation,
  type ProjectBuilding,
} from "@/modules/plant/bom.hooks";
import { UploadModal } from "@/plant/pages/modals/ProjectUploadModals";

export interface UploadBomFileDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  leadId?: string;
  customerId?: string;
  onUpload?: (files: File[], buildingId?: string) => void;
  isUploading?: boolean;
}

export default function UploadBomFileDialog({
  open,
  onOpenChange,
  isOpen,
  onClose,
  leadId = "",
  customerId,
  onUpload,
  isUploading = false,
}: UploadBomFileDialogProps) {
  const navigate = useNavigate();
  // suppress unused parameter warning if needed
  void isUploading;

  const dialogOpen = isOpen ?? open ?? false;
  const handleDialogClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const { data: buildingsData, isLoading, refetch } = useGetProjectBuildingsQuery(leadId, {
    skip: !leadId || !dialogOpen,
  });

  const { mutateAsync: uploadProjectBoms } = useUploadProjectBomsMutation();
  const { mutateAsync: getBomJobsStatusBatch } = useGetBomJobsStatusBatchMutation();
  const { mutateAsync: generateConsolidatedBOM, isPending: isGenerating } = useGenerateConsolidatedBOMMutation();

  const [uploadingBuilding, setUploadingBuilding] = useState<ProjectBuilding | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedJobIds, setUploadedJobIds] = useState<string[]>([]);

  const buildings = useMemo(() => buildingsData?.buildings || [], [buildingsData]);

  const canConsolidate = useMemo(() => {
    if (buildings.length === 0) return false;
    return buildings.every((b) => b.latestBomJob?.isConfirmed === true);
  }, [buildings]);

  useEffect(() => {
    if (dialogOpen && leadId) {
      refetch();
    }
  }, [dialogOpen, leadId, refetch]);

  const activeJobIds = useMemo(() => {
    const ids: string[] = [];
    buildings.forEach((b) => {
      if (b.latestBomJob) {
        const status = b.latestBomJob.status?.toLowerCase();
        if (status === "queued" || status === "processing") {
          ids.push(b.latestBomJob.bomJobId);
        }
      }
    });
    return ids;
  }, [buildings]);

  const allPollingJobIds = useMemo(() => {
    return Array.from(new Set([...activeJobIds, ...uploadedJobIds]));
  }, [activeJobIds, uploadedJobIds]);

  useEffect(() => {
    if (allPollingJobIds.length === 0) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await getBomJobsStatusBatch({ jobIds: allPollingJobIds });
        const jobs = response.jobs || [];

        const finishedJobIds: string[] = [];
        jobs.forEach((job: { jobId: string; status?: string }) => {
          const status = job.status?.toLowerCase();
          if (status !== "queued" && status !== "processing") {
            finishedJobIds.push(job.jobId);
          }
        });

        if (finishedJobIds.length > 0) {
          refetch();
          setUploadedJobIds((prev) => prev.filter((id) => !finishedJobIds.includes(id)));
        }
      } catch (err) {
        console.error("Error polling job statuses:", err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [allPollingJobIds, getBomJobsStatusBatch, refetch]);

  const handleUploadComplete = async (file: File, fileUrl: string) => {
    if (!uploadingBuilding) return;

    setErrorMessage(null);

    try {
      const fileFormat = file.name.split(".").pop() || "txt";

      const result = await uploadProjectBoms({
        leadId,
        bomFiles: [
          {
            buildingId: uploadingBuilding.buildingId,
            fileUrl,
            fileName: file.name,
            fileFormat,
          },
        ],
      });

      const newJobIds = (result?.jobs || []).map((j: { bomJobId: string }) => j.bomJobId);
      if (newJobIds.length > 0) {
        setUploadedJobIds((prev) => Array.from(new Set([...prev, ...newJobIds])));
      }

      if (onUpload) onUpload([file], uploadingBuilding.buildingId);
      setSuccessTitle(`BOM for Building ${uploadingBuilding.buildingNumber} Uploaded Successfully`);
      setSuccessDialogOpen(true);
      setUploadingBuilding(null);
    } catch (err: unknown) {
      console.error("Failed to upload BOM file:", err);
      const errorObj = err as { data?: { message?: string }; message?: string };
      const errMsg = errorObj?.data?.message || errorObj?.message || "Failed to upload BOM file.";
      setErrorMessage(errMsg);
    }
  };

  const handleConsolidate = async () => {
    try {
      setErrorMessage(null);
      await generateConsolidatedBOM(leadId);
      handleDialogClose();
      if (customerId) {
        navigate(`/customers/${customerId}/project-bom/${leadId}`);
      } else {
        navigate(`/customers/unknown/project-bom/${leadId}`);
      }
    } catch (err: unknown) {
      console.error("Failed to generate consolidated BOM:", err);
      const errorObj = err as { data?: { message?: string }; message?: string };
      const errMsg = errorObj?.data?.message || errorObj?.message || "Failed to generate consolidated BOM.";
      setErrorMessage(errMsg);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={(op) => !op && handleDialogClose()}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col p-6 rounded-2xl bg-white shadow-xl border-0 overflow-hidden">
          <div className="flex flex-col space-y-6 min-h-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-sans">Building BOM Files</h2>
                <p className="text-sm text-slate-500 mt-1">
                  View BOM status per building or upload/replace files.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center justify-between font-sans shrink-0">
                <span className="break-words mr-2">{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600 shrink-0">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Building List */}
            <div className="space-y-3 min-h-0 flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1D51A4]" />
                  <p className="text-sm text-slate-500 font-sans">Loading buildings...</p>
                </div>
              ) : buildings.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-sans text-sm">
                  No buildings found for this project.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-[#F8FAFC]">
                  {buildings.map((b) => {
                    const isCompleted = b.bomJobStatus?.toLowerCase() === "completed";
                    const isConfirmed = b.latestBomJob?.isConfirmed === true;
                    const latestJob = b.latestBomJob;

                    let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
                    let displayStatus = b.bomJobStatus || "No BOM";

                    if (isCompleted) {
                      if (isConfirmed) {
                        badgeStyle = "bg-blue-50 text-[#1D51A4] border-blue-200";
                        displayStatus = "BOM Confirmed";
                      } else {
                        badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        displayStatus = "BOM Extracted";
                      }
                    } else if (b.bomJobStatus?.toLowerCase() === "failed") {
                      badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                    }

                    return (
                      <div
                        key={b.buildingId}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 shrink-0">
                              Building {b.buildingNumber}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize shrink-0 ${badgeStyle}`}
                            >
                              {displayStatus}
                            </span>
                          </div>

                          {latestJob ? (
                            <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0 flex-wrap">
                              <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                                <FileText className="w-4 h-4 text-[#1D51A4] shrink-0" />
                                <span className="font-medium text-slate-800 truncate" title={latestJob.fileName}>
                                  {latestJob.fileName}
                                </span>
                              </div>
                              <span className="text-slate-300 hidden sm:inline">|</span>
                              <span className="shrink-0">{latestJob.totalItems || 0} items</span>
                              {latestJob.uploadedAt && (
                                <>
                                  <span className="text-slate-300 hidden sm:inline">|</span>
                                  <span className="shrink-0">
                                    {new Date(latestJob.uploadedAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">No files uploaded yet</p>
                          )}
                          {latestJob?.errorMessage && (
                            <p className="text-[11px] text-red-500 bg-red-50 p-1.5 rounded border border-red-100 mt-1 break-words">
                              Error: {latestJob.errorMessage}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className={
                              b.hasBomJob
                                ? "border-[#1D51A4] text-[#1D51A4] hover:bg-blue-50"
                                : "bg-[#1D51A4] text-white hover:bg-[#1D51A4]/90"
                            }
                            onClick={() => {
                              setUploadingBuilding(b);
                            }}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                            {b.hasBomJob ? "Replace file" : "Upload file"}
                          </Button>

                          {latestJob && latestJob.status?.toLowerCase() === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900 border border-slate-200"
                              onClick={() => {
                                handleDialogClose();
                                navigate(`/plant/uploaded-bom-files/${latestJob.bomJobId}`);
                              }}
                            >
                              {latestJob.isConfirmed ? "View" : "View and Confirm"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 shrink-0 border-t border-slate-100">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 px-5"
                onClick={handleDialogClose}
              >
                Close
              </Button>
              {canConsolidate && (
                <Button
                  className="rounded-xl bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white px-5 flex items-center gap-2"
                  disabled={isGenerating}
                  onClick={handleConsolidate}
                >
                  {isGenerating ? "Consolidating..." : "Consolidate"} <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload File Sub-Dialog integrated with ProjectUploadModals UploadModal */}
      {uploadingBuilding && (
        <UploadModal
          isOpen={!!uploadingBuilding}
          onClose={() => setUploadingBuilding(null)}
          title={`Upload BOM: Building ${uploadingBuilding.buildingNumber}`}
          subtitle="Upload or drop your BOM file (.out)"
          folder="boms"
          allowedExtensions={["out"]}
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
}

export { UploadBomFileDialog as UploadBOMModal };

