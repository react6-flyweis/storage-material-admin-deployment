import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CloudUpload,
  CircleX,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { uploadFileToS3 } from "@/lib/upload";

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  fileLabel?: string;
  onUpload: (file: File, fileUrl: string) => void;
  folder?: string;
  allowedExtensions?: string[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  onUpload,
  folder = "boms",
  allowedExtensions,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);


  const validateFile = useCallback(
    (file: File): boolean => {
      if (allowedExtensions && allowedExtensions.length > 0) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const validExts = allowedExtensions.map((e) =>
          e.toLowerCase().replace(/^\./, "")
        );
        if (!ext || !validExts.includes(ext)) {
          setUploadError(
            `Invalid file type. Only ${validExts
              .map((e) => `.${e}`)
              .join(", ")} files are supported.`
          );
          return false;
        }
      }
      return true;
    },
    [allowedExtensions]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadError(null);
      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadError(null);
      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      dragCounter.current = 0;
      setSelectedFile(null);
      setUploadError(null);
      return;
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) {
        dragCounter.current++;
        setIsDraggingActive(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) {
        dragCounter.current--;
        if (dragCounter.current <= 0) {
          setIsDraggingActive(false);
          dragCounter.current = 0;
        }
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingActive(false);
      dragCounter.current = 0;

      if (isUploading) return;

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        setUploadError(null);
        if (validateFile(file)) {
          setSelectedFile(file);
        } else {
          setSelectedFile(null);
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [isOpen, isUploading, validateFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const fileUrl = await uploadFileToS3(selectedFile, folder, (progress) => {
        setUploadProgress(progress);
      });
      setUploadProgress(100);
      onUpload(selectedFile, fileUrl);
      
      // Short delay so the user can visually see 100% progress completed before closing
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSelectedFile(null);
      onClose();
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "Failed to upload file. Please try again.";
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };



  const renderFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "xls" || ext === "xlsx" || ext === "csv" || ext === "ods") {
      return <FileSpreadsheet className="size-8 text-emerald-600" />;
    }
    return <FileText className="size-8 text-[#919EAB]" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(op) => !op && !isUploading && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-6 rounded-2xl bg-white shadow-xl border-0">
        {isDraggingActive && (
          <div className="fixed inset-0 z-[9999] bg-[#1849D6]/10 backdrop-blur-md flex items-center justify-center pointer-events-none">
            <div className="absolute inset-6 border-4 border-dashed border-[#1849D6] rounded-2xl flex flex-col items-center justify-center bg-white/90 space-y-4">
              <CloudUpload className="size-16 text-[#1849D6] animate-bounce" />
              <p className="text-xl font-sans font-semibold text-[#1849D6]">
                Drop your file anywhere to upload
              </p>
              <p className="text-sm text-slate-500 font-sans">
                {allowedExtensions && allowedExtensions.length > 0
                  ? `Supporting only ${allowedExtensions
                      .map((e) => `.${e.toLowerCase().replace(/^\./, "")}`)
                      .join(", ")} files`
                  : "Release to upload your file"}
              </p>
            </div>
          </div>
        )}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 font-sans">{title}</h3>
              <p className="text-sm text-slate-500 font-sans">{subtitle}</p>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed border-[#1849D6]/40 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center space-y-4 bg-slate-50/50 transition-opacity ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <CloudUpload className="size-8 text-[#1849D6]" />
            <p className="text-sm font-sans text-slate-800 font-medium">
              Drag & drop your file to start uploading
            </p>
            <div className="flex items-center gap-4 w-full max-w-[200px]">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-slate-400 font-sans uppercase">
                OR
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept={
                allowedExtensions && allowedExtensions.length > 0
                  ? allowedExtensions.map((e) => `.${e.toLowerCase().replace(/^\./, "")}`).join(",")
                  : undefined
              }
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse files
            </Button>
          </div>

          <p className="text-xs text-slate-400 font-sans">
            {allowedExtensions && allowedExtensions.length > 0
              ? `Only support ${allowedExtensions
                  .map((e) => `.${e.toLowerCase().replace(/^\./, "")}`)
                  .join(", ")} files`
              : "Only support .txt, .out, .xlsx, .xls files"}
          </p>

          {/* Selected File Item */}
          {selectedFile && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              {renderFileIcon(selectedFile.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-medium text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 font-sans">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <CircleX size={18} />
                </button>
              )}
            </div>
          )}

          {/* Uploading Status / Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-3 bg-blue-50/60 rounded-xl">
              <div className="flex items-center justify-between text-xs font-sans font-medium text-[#1D51A4]">
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  <span>Uploading to S3...</span>
                </span>
                {uploadProgress !== null && <span>{uploadProgress}%</span>}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#1D51A4] h-full transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-red-500 font-sans font-medium">
              {uploadError}
            </p>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 px-5"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white px-6"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </span>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onButtonClick?: () => void;
  title: string;
  buttonLabel: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onButtonClick,
  title,
  buttonLabel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(op) => !op && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-6 rounded-2xl bg-white shadow-xl border-0">
        <div className="p-4 flex flex-col items-center text-center space-y-6">
          <h2 className="text-lg font-sans font-bold text-slate-900 max-w-[280px]">
            {title}
          </h2>

          <div className="relative">
            <CheckCircle2 className="size-20 text-emerald-500" />
          </div>

          <Button
            className="w-full rounded-xl bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white py-2.5 font-medium"
            onClick={onButtonClick || onClose}
          >
            {buttonLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
