import { useRef, useState } from "react";
import cameraicon from "../assets/uploadcameraicon.svg";
import { uploadFileToS3 } from "@/lib/upload";
import { useAttachMaterialRequestAttachmentMutation } from "../construction.hooks";

type IssueReportingModalProps = {
  open: boolean;
  onClose: () => void;
  requestId?: string | null;
  onUpload?: (
    file: File,
    preview: string,
    requestId?: string | null
  ) => void;
  onSuccess?: () => void;
};

export default function PhotoModel({
  open,
  onClose,
  onUpload,
  onSuccess,
  requestId,
}: IssueReportingModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const attachAttachmentMutation = useAttachMaterialRequestAttachmentMutation();

  if (!open) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setError("");
    setUploading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (file: File) => {
    setError("");

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG and PNG files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size should be less than 10MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreview(previewUrl);

    if (onUpload) {
      onUpload(file, previewUrl, requestId);
    }
  };

  const handleSend = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError("");

      // Step 2 & 3: Get presigned URL and PUT binary file to S3
      const fileUrl = await uploadFileToS3(selectedFile, "documents");

      // Step 4: Attach photo to material request if requestId is provided
      if (requestId) {
        await attachAttachmentMutation.mutateAsync({
          requestId,
          payload: {
            name: selectedFile.name,
            url: fileUrl,
          },
        });
      }

      handleReset();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : "Failed to upload photo. Please try again.";
      setError(errorMsg || "Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleClose}
    >
      <div
        className="md:max-w-[640px] w-[96%] bg-white rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lg:px-6 px-3 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#111827]">
            Send Photo
          </h2>
        </div>

        <div className="p-6 space-y-3">
          <p>Upload Photo</p>

          <div
            className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center text-center cursor-pointer"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="max-h-[200px] rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col gap-3 items-center">
                <img src={cameraicon} alt="" className="w-10" />
                <p className="text-sm text-[#6B7280]">
                  Click to upload photos or drag and drop
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  PNG, JPG up to 10MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              hidden
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-6 py-2 rounded-lg bg-[#F3F4F6] text-[#111827] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!preview || uploading}
            className="px-6 py-2 rounded-lg bg-[#2563EB] text-white disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? "Uploading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

