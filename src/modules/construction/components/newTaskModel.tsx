import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomSelect from "./common/CustomSelect";
import ProjectSelector from "./common/ProjectSelector";
import EmployeeSelector from "./common/EmployeeSelector";
import { useCreateTaskMutation } from "../construction.hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type NewTaskModelProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: TaskFormData) => void;
};

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  leadId: z.string().min(1, "Project selection is required"),
  assignedTo: z.string().min(1, "Assignee selection is required"),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "inProgress", "done"]).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().min(1, "Description is required"),
});

type TaskFormData = z.infer<typeof taskSchema>;

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const statusOptions = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "inProgress" },
  { label: "Done", value: "done" },
];

export default function NewTaskModel({
  open,
  onClose,
  onSubmit,
}: NewTaskModelProps) {
  const createTaskMutation = useCreateTaskMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      leadId: "",
      assignedTo: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        leadId: "",
        assignedTo: "",
        priority: "medium",
        status: "todo",
        dueDate: "",
        description: "",
      });
    }
  }, [open, reset]);

  if (!open) return null;

  const onFormSubmit = (data: TaskFormData) => {
    const apiPayload = {
      title: data.title,
      leadId: data.leadId,
      assignedTo: data.assignedTo,
      priority: data.priority,
      dueDate: data.dueDate,
      description: data.description,
      ...(data.status ? { status: data.status } : {}),
    };

    createTaskMutation.mutate(apiPayload, {
      onSuccess: (res) => {
        toast.success(res?.message || "Task created successfully!");
        if (onSubmit) {
          onSubmit(data);
        }
        onClose();
        reset();
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || "Failed to create task");
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
          <h2 className="text-lg font-semibold text-[#111827]">New Task</h2>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#111827]">Task Name</label>
              <input
                {...register("title")}
                placeholder="Enter"
                className="mt-2 w-full h-[40px] rounded-[8px] border px-4 outline-none text-sm"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
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
                Assigned To
              </label>
              <Controller
                name="assignedTo"
                control={control}
                render={({ field }) => (
                  <EmployeeSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select Assignee"
                    error={!!errors.assignedTo}
                  />
                )}
              />
              {errors.assignedTo && (
                <p className="text-xs text-red-500 mt-1">{errors.assignedTo.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-[#111827]">Deadline</label>
              <input
                type="date"
                {...register("dueDate")}
                placeholder="dd - mm - yyyy"
                className="mt-2 w-full h-[40px] rounded-[8px] border px-4 outline-none text-sm"
              />
              {errors.dueDate && (
                <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#111827] inline-block mb-2">
                Priority
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    title="Select Priority"
                    options={priorityOptions}
                    value={field.value}
                    onChange={field.onChange}
                    width="100%"
                  />
                )}
              />
              {errors.priority && (
                <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-[#111827] inline-block mb-2">
                Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    title="Select Status"
                    options={statusOptions}
                    value={field.value || "todo"}
                    onChange={field.onChange}
                    width="100%"
                  />
                )}
              />
              {errors.status && (
                <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-[#111827]">Description</label>
            <textarea
              {...register("description")}
              placeholder="Describe the work"
              rows={4}
              className="mt-2 w-full rounded-[8px] border px-4 py-3 outline-none resize-none text-sm"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="pt-3 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={createTaskMutation.isPending}
              className="px-6 py-2 rounded-lg bg-[#F3F4F6] text-[#111827] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="px-6 py-2 rounded-lg bg-[#2563EB] text-white flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createTaskMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
