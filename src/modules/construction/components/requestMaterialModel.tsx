import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import CustomSelect from "./common/CustomSelect";
import ProjectSelector from "./common/ProjectSelector";
import { inputStyle } from "./projects/RecentProjects";
import { useCreateMaterialRequestMutation } from "../construction.hooks";

type RequestMaterialModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate?: (data: any) => void;
};

const requestedItemSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit: z.string().optional(),
});

const materialRequestSchema = z.object({
  leadId: z.string().min(1, "Project selection is required"),
  siteLocation: z.string().optional(),
  department: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  requiredBy: z.string().min(1, "Required by date is required"),
  requestedItems: z
    .array(requestedItemSchema)
    .min(1, "At least one item is required"),
});

export type MaterialRequestFormData = z.infer<typeof materialRequestSchema>;

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export default function RequestMaterialModel({
  open,
  onClose,
  onCreate,
}: RequestMaterialModalProps) {
  const createMaterialRequestMutation = useCreateMaterialRequestMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MaterialRequestFormData>({
    resolver: zodResolver(materialRequestSchema),
    defaultValues: {
      leadId: "",
      siteLocation: "Construction Site A",
      department: "Engineering",
      priority: "high",
      requiredBy: dayjs().add(7, "day").format("YYYY-MM-DD"),
      requestedItems: [
        {
          name: "",
          quantity: 100,
          unit: "tons",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requestedItems",
  });

  useEffect(() => {
    if (open) {
      reset({
        leadId: "",
        siteLocation: "Construction Site A",
        department: "Engineering",
        priority: "high",
        requiredBy: dayjs().add(7, "day").format("YYYY-MM-DD"),
        requestedItems: [
          {
            name: "",
            quantity: 100,
            unit: "tons",
          },
        ],
      });
    }
  }, [open, reset]);

  if (!open) return null;

  const onFormSubmit = (data: MaterialRequestFormData) => {
    const apiPayload = {
      leadId: data.leadId,
      siteLocation: data.siteLocation || "Construction Site A",
      department: data.department || "Engineering",
      priority: data.priority,
      requiredBy: data.requiredBy,
      requestedItems: data.requestedItems.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit || "units",
      })),
    };

    createMaterialRequestMutation.mutate(apiPayload, {
      onSuccess: (res) => {
        toast.success(res?.message || "Material request submitted successfully!");
        if (onCreate) {
          onCreate(data);
        }
        onClose();
        reset();
      },
      onError: (err: any) => {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to submit material request";
        toast.error(errorMsg);
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div
          className="md:max-w-[640px] w-[96%] max-h-[90vh] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="lg:px-6 px-3 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#111827]">
              Request Material
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              &times;
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Project & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#111827] mb-1.5 block">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="leadId"
                    control={control}
                    render={({ field }) => (
                      <ProjectSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select Project"
                      />
                    )}
                  />
                  {errors.leadId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.leadId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-[#111827] mb-1.5 block">
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
                    <p className="text-xs text-red-500 mt-1">
                      {errors.priority.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Site Location & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#111827] mb-1 block">
                    Site Location
                  </label>
                  <input
                    placeholder="e.g. Construction Site A"
                    className="w-full h-[40px] rounded-[8px] border px-4 outline-none text-sm text-gray-800"
                    {...register("siteLocation")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#111827] mb-1 block">
                    Department
                  </label>
                  <input
                    placeholder="e.g. Engineering"
                    className="w-full h-[40px] rounded-[8px] border px-4 outline-none text-sm text-gray-800"
                    {...register("department")}
                  />
                </div>
              </div>

              {/* Required By Date */}
              <div>
                <label className="text-sm font-medium text-[#111827] mb-1.5 block">
                  Required By <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="requiredBy"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue: Dayjs | null) => {
                        field.onChange(
                          newValue ? newValue.format("YYYY-MM-DD") : ""
                        );
                      }}
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: inputStyle,
                        },
                      }}
                    />
                  )}
                />
                {errors.requiredBy && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.requiredBy.message}
                  </p>
                )}
              </div>

              {/* Requested Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#111827]">
                    Requested Items <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ name: "", quantity: 1, unit: "tons" })}
                    className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                {errors.requestedItems?.root && (
                  <p className="text-xs text-red-500 mb-2">
                    {errors.requestedItems.root.message}
                  </p>
                )}

                <div className="space-y-3">
                  {fields.map((fieldItem, index) => (
                    <div
                      key={fieldItem.id}
                      className="grid grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100"
                    >
                      <div className="col-span-5">
                        <input
                          placeholder="Item name (e.g. Steel)"
                          className="w-full h-[38px] rounded-[6px] border px-3 outline-none text-sm bg-white"
                          {...register(`requestedItems.${index}.name`)}
                        />
                        {errors.requestedItems?.[index]?.name && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.requestedItems[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Qty"
                          className="w-full h-[38px] rounded-[6px] border px-3 outline-none text-sm bg-white"
                          {...register(`requestedItems.${index}.quantity`)}
                        />
                        {errors.requestedItems?.[index]?.quantity && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.requestedItems[index]?.quantity?.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-3">
                        <input
                          placeholder="Unit (e.g. tons)"
                          className="w-full h-[38px] rounded-[6px] border px-3 outline-none text-sm bg-white"
                          {...register(`requestedItems.${index}.unit`)}
                        />
                      </div>

                      <div className="col-span-1 flex items-center justify-center pt-1.5">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={createMaterialRequestMutation.isPending}
                className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-[#111827] text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMaterialRequestMutation.isPending}
                className="px-6 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createMaterialRequestMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </LocalizationProvider>
    </div>
  );
}
