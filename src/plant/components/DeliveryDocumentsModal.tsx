import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileCode,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useDeliveryDocumentsQuery } from "@/modules/plant/deliveries.hooks";
import {
  downloadDeliveryDocumentPdf,
  triggerBlobDownload,
  getApiErrorMessage,
  type DeliveryDocumentItem,
} from "@/modules/plant/deliveries.api";
import { Skeleton } from "@/components/ui/skeleton";

export interface DeliveryDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryId: string;
  deliveryNumber?: string;
  title?: string;
}

export default function DeliveryDocumentsModal({
  open,
  onOpenChange,
  deliveryId,
  deliveryNumber,
  title,
}: DeliveryDocumentsModalProps) {
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDeliveryDocumentsQuery(deliveryId, {
    enabled: open && Boolean(deliveryId),
  });

  const documents = data?.data?.documents || [];

  const handleDownloadPdf = async (doc: DeliveryDocumentItem) => {
    if (!doc.url) {
      toast.error("Document URL is missing");
      return;
    }

    setDownloadingUrl(doc.url);
    const toastId = toast.loading(`Downloading ${doc.name}...`);
    try {
      const fallbackName = doc.name.toLowerCase().endsWith(".pdf")
        ? doc.name
        : `${doc.name}.pdf`;
      const { blob, filename } = await downloadDeliveryDocumentPdf(
        doc.url,
        fallbackName
      );
      triggerBlobDownload(blob, filename);
      toast.success(`${doc.name} downloaded`, { id: toastId });
    } catch (err: unknown) {
      const msg = await getApiErrorMessage(err);
      toast.error(msg, { id: toastId });
    } finally {
      setDownloadingUrl(null);
    }
  };

  const handleOpenFile = (doc: DeliveryDocumentItem) => {
    if (!doc.url) {
      toast.error("File URL is missing");
      return;
    }
    window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl font-inter">
        <div className="p-6 md:p-7 space-y-5">
          <DialogHeader className="flex flex-row items-center gap-3.5 text-left border-b border-gray-100 pb-4">
            <div className="bg-red-50 text-red-600 p-2.5 rounded-full shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#212B36]">
                Delivery Documents
              </DialogTitle>
              <p className="text-xs text-[#637381] mt-0.5">
                Download generated PDFs or view uploaded attachments for{" "}
                <span className="font-semibold text-gray-800">
                  #{deliveryNumber || deliveryId}
                </span>
                {title ? ` (${title})` : ""}
              </p>
            </div>
          </DialogHeader>

          {/* Body Content */}
          {isLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <div className="p-6 text-center space-y-3 bg-red-50/70 border border-red-200 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-800">
                  Failed to load documents
                </p>
                <p className="text-xs text-red-600 max-w-md mx-auto">
                  {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    (error as Error)?.message ||
                    "Access denied or documents could not be retrieved."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2 text-xs border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
              <FolderOpen className="w-10 h-10 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#212B36]">
                  No documents found
                </p>
                <p className="text-xs text-[#637381]">
                  There are no PDF reports or uploaded attachments for this delivery yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {documents.map((doc, idx) => {
                const isPdf = doc.type === "pdf";
                const isDownloadingThis = downloadingUrl === doc.url;

                return (
                  <div
                    key={`${doc.name}-${idx}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-[#FBFCFD] hover:bg-[#F4F6F8] transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-lg shrink-0 ${
                          isPdf
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {isPdf ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <FileCode className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#212B36] truncate">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              isPdf
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {isPdf ? "Generated PDF" : "File Attachment"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isPdf ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPdf(doc)}
                          disabled={isDownloadingThis}
                          className="h-8 px-3 rounded-lg text-xs font-medium border-gray-200 hover:bg-white text-gray-700 gap-1.5"
                        >
                          {isDownloadingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenFile(doc)}
                          className="h-8 px-3 rounded-lg text-xs font-medium border-gray-200 hover:bg-white text-gray-700 gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="flex items-center justify-end pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-lg text-xs font-medium border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
