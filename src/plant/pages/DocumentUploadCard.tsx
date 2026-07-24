import React, { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFileToS3 } from "@/lib/upload";

type Doc = { name: string; url: string; size?: number };

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  error?: string;
}

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "zip", "pdf"];

const formatSize = (size?: number) => {
  if (!size && size !== 0) return "";
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const fileTypeLabel = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "PDF";
  if (["jpg", "jpeg", "png", "svg"].includes(ext)) return ext.toUpperCase();
  return ext.toUpperCase() || "FILE";
};

export default function DocumentUploadCard({
  documents,
  onDocumentsChange,
}: {
  documents: Doc[];
  onDocumentsChange: (docs: Doc[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileRefs = useRef<Map<string, File>>(new Map());
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleBrowseClick = () => fileInputRef.current?.click();

  const uploadSingleFile = async (file: File, tempId: string) => {
    try {
      // Simulate progress steps since Axios / Fetch without XHR doesn't track upload progress incrementally easily,
      // but we can simulate a nice visual loading progress
      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) => {
            if (f.id === tempId) {
              const nextProgress = f.progress + 15;
              return { ...f, progress: nextProgress > 90 ? 90 : nextProgress };
            }
            return f;
          })
        );
      }, 200);

      // Perform S3 upload
      const fileUrl = await uploadFileToS3(file, "logistics");
      
      clearInterval(progressInterval);

      // Remove from uploading files list
      setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
      fileRefs.current.delete(tempId);

      // Add to documents list
      const newDoc = { name: file.name, url: fileUrl, size: file.size };
      onDocumentsChange([...(documents || []), newDoc]);
    } catch (err: unknown) {
      console.error("Upload error for file", file.name, err);
      const errMsg = err instanceof Error ? err.message : "Upload failed";
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, error: errMsg, progress: 0 } : f
        )
      );
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        alert(
          `Invalid file type: ${file.name}. Only ${ALLOWED_EXTENSIONS.join(", ")} are supported.`
        );
        return;
      }

      const tempId = `${file.name}-${Date.now()}-${Math.random()}`;
      fileRefs.current.set(tempId, file);

      setUploadingFiles((prev) => [
        ...prev,
        { id: tempId, name: file.name, size: file.size, progress: 0 },
      ]);

      uploadSingleFile(file, tempId);
    });
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleFiles(files);
    e.currentTarget.value = "";
  };

  const removeDocument = (index: number) => {
    const next = (documents || []).filter((_: Doc, i: number) => i !== index);
    onDocumentsChange(next);
  };

  const dismissUploadingFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
    fileRefs.current.delete(id);
  };

  const retryUpload = (upFile: UploadingFile) => {
    const file = fileRefs.current.get(upFile.id);
    if (!file) return;

    setUploadingFiles((prev) =>
      prev.map((f) =>
        f.id === upFile.id ? { ...f, error: undefined, progress: 0 } : f
      )
    );
    uploadSingleFile(file, upFile.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-[#0f172a] mb-4 text-base">
        Upload Documents (Optional)
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Drag & Drop Box */}
        <div className="w-full md:w-[400px]">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-white cursor-pointer transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50/20" : "border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              className="hidden"
              multiple
              accept=".jpg,.jpeg,.png,.svg,.zip,.pdf"
            />
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-blue-500 text-blue-600 bg-white hover:bg-blue-50 font-semibold rounded-full px-6 h-10 shadow-xs mb-3"
            >
              Browse files
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Only supports .jpg, .png, .svg, .zip and .pdf files
            </p>
          </div>
        </div>

        {/* Right Uploaded & Uploading File list */}
        <div className="flex-1 space-y-3">
          
          {/* Uploading Files list */}
          {uploadingFiles.map((upFile) => (
            <div
              key={upFile.id}
              className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-xs max-w-md w-full"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate pr-2">
                    {upFile.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {formatSize(upFile.size)}
                    </span>
                    {upFile.error ? (
                      <span className="text-xs text-red-500 font-medium">
                        {upFile.error}
                      </span>
                    ) : (
                      <span className="text-xs text-blue-500 font-medium">
                        Uploading... {upFile.progress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {upFile.error && (
                  <button
                    type="button"
                    onClick={() => retryUpload(upFile)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 px-2 py-1 rounded"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismissUploadingFile(upFile.id)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Uploaded Documents List */}
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-xs max-w-md w-full"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-xs shrink-0 select-none">
                  {fileTypeLabel(doc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate pr-2">
                    {doc.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatSize(doc.size)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeDocument(idx)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Empty State */}
          {uploadingFiles.length === 0 && documents.length === 0 && (
            <div className="h-32 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400 italic bg-gray-50/20 max-w-md">
              No files uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export { DocumentUploadCard };
