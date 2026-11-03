import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import UploadCameraIcon from "../assets/uploadcameraicon.svg";
import ProjectSelector from "./common/ProjectSelector";
import TaskSelector from "./common/TaskSelector";
import { useCreateWorkLogMutation } from "../construction.hooks";
import { uploadFileToS3 } from "@/lib/upload";
import { Loader2, X } from "lucide-react";

type DailyLogModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: DailyLogFormData) => void;
  defaultLeadId?: string;
};

const dailyLogSchema = z.object({
  leadId: z.string().min(1, "Project selection is required"),
  taskId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  progress: z
    .number()
    .min(0, "Progress must be at least 0")
    .max(100, "Progress cannot exceed 100"),
  description: z.string().min(1, "Work description is required"),
  issues: z.string().optional(),
});

export type DailyLogFormData = z.infer<typeof dailyLogSchema>;

export default function DailyLogModel({
  open,
  onClose,
  onSubmit,
  defaultLeadId,
}: DailyLogModalProps) {
  const createWorkLogMutation = useCreateWorkLogMutation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DailyLogFormData>({
    resolver: zodResolver(dailyLogSchema),
    defaultValues: {
      leadId: defaultLeadId || "",
      taskId: "",
      date: new Date().toISOString().split("T")[0],
      progress: 0,
      description: "",
      issues: "None",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        leadId: defaultLeadId || "",
        taskId: "",
        date: new Date().toISOString().split("T")[0],
        progress: 0,
        description: "",
        issues: "None",
      });
      setPhotos([]);
    }
  }, [open, defaultLeadId, reset]);

  if (!open) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingPhoto(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadFileToS3(file, "documents");
        if (url) newUrls.push(url);
      }
      setPhotos((prev) => [...prev, ...newUrls]);
    } catch (err) {
      console.error("Failed to upload photo:", err);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onFormSubmit = (data: DailyLogFormData) => {
    const apiPayload = {
      leadId: data.leadId,
      taskId: data.taskId || null,
      date: data.date,
      progress: Number(data.progress || 0),
      description: data.description,
      photos,
      issues: data.issues || "None",
    };

    createWorkLogMutation.mutate(apiPayload, {
      onSuccess: () => {
        if (onSubmit) {
          onSubmit(data);
        }
        onClose();
        reset();
        setPhotos([]);
      },
      onError: (err: unknown) => {
        console.error("Failed to create daily work log:", err);
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[96%] max-h-[98vh] max-w-[550px] bg-white rounded-xl shadow-lg overflow-auto scroll-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lg:px-6 px-3 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#111827]">
            Daily Work Log
          </h2>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#111827]">Date</label>
              <input
                type="date"
                {...register("date")}
                className="mt-2 w-full h-[40px] rounded-[8px] border px-4 outline-none text-sm"
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-[#111827] inline-block mb-2">
                Project
              </label>
              <Controller
                name="leadId"
                control={control}
                render={({ field }) => (
                  <ProjectSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select Project"
                    error={!!errors.leadId}
                  />
                )}
              />
              {errors.leadId && (
                <p className="text-xs text-red-500 mt-1">{errors.leadId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#111827] inline-block mb-2">
                Task (Optional)
              </label>
              <Controller
                name="taskId"
                control={control}
                render={({ field }) => (
                  <TaskSelector
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Select Task (Optional)"
                    error={!!errors.taskId}
                  />
                )}
              />
              {errors.taskId && (
                <p className="text-xs text-red-500 mt-1">{errors.taskId.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-[#111827]">Progress (%)</label>
              <input
                type="number"
                {...register("progress")}
                max={100}
                min={0}
                placeholder="Enter"
                className="mt-2 w-full h-[40px] rounded-[8px] border px-4 outline-none text-sm"
              />
              {errors.progress && (
                <p className="text-xs text-red-500 mt-1">{errors.progress.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-[#111827]">Work Description</label>
            <textarea
              {...register("description")}
              placeholder="Describe the work completed today..."
              rows={4}
              className="mt-2 w-full rounded-[8px] border px-4 py-3 outline-none resize-none text-sm"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-[#111827]">Upload Photos</label>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <div
              onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg mt-2 p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-gray-50 transition"
            >
              {isUploadingPhoto ? (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading photos to S3...</span>
                </div>
              ) : (
                <>
                  <img
                    src={UploadCameraIcon}
                    alt=""
                    className="text-2xl mb-1"
                  />
                  <p className="text-sm text-[#6B7280]">
                    Click to upload photos or drag and drop
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    PNG, JPG up to 10MB each
                  </p>
                </>
              )}
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden aspect-video border border-gray-200">
                    <img src={url} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-[#111827]">Issues/Notes</label>
            <textarea
              {...register("issues")}
              placeholder="Any issues, delays, or important notes..."
              rows={3}
              className="mt-2 w-full rounded-[8px] border px-4 py-3 outline-none resize-none text-sm"
            />
          </div>

          <div className="px-6 py-3 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={createWorkLogMutation.isPending || isUploadingPhoto}
              className="px-6 py-2 rounded-lg bg-[#F3F4F6] text-[#111827] disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWorkLogMutation.isPending || isUploadingPhoto}
              className="px-6 py-2 rounded-lg bg-[#2563EB] text-white flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {createWorkLogMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
