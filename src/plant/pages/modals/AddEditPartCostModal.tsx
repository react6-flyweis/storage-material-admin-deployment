
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateSmdtItemMutation, useUpdateSmdtItemMutation } from "@/modules/plant/smdt.hooks";
import type { SmdtItem } from "@/modules/plant/smdt.api";
import { CATEGORY_OPTIONS, COST_UNIT_OPTIONS } from "../../constants/costing";

interface AddEditPartCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SmdtItem | null;
}

const smdtSchema = z.object({
  category: z.string().min(1, "Category is required"),
  partName: z.string().min(1, "Part Name is required"),
  partColor: z.string().optional(),
  costUnit: z.string().min(1, "Cost Unit is required"),
  mbsCost: z.coerce.number().positive("MBS Cost must be greater than 0"),
  currentMarketCost: z.coerce.number().positive("Current Market Cost must be greater than 0"),
  laborCost: z.coerce.number().nonnegative("Labor Cost must be 0 or greater"),
  additionalCost: z.coerce.number().nonnegative("Additional Cost must be 0 or greater"),
  materialCost: z.coerce.number().nonnegative("Material Cost must be 0 or greater"),
  description: z.string().min(1, "Description is required"),
});

type SmdtSchemaType = z.infer<typeof smdtSchema>;

export default function AddEditPartCostModal({
  isOpen,
  onClose,
  initialData,
}: AddEditPartCostModalProps) {
  const isEditing = !!initialData;
  const { mutateAsync: createItem, isPending: isCreating } = useCreateSmdtItemMutation();
  const { mutateAsync: updateItem, isPending: isUpdating } = useUpdateSmdtItemMutation();
  const isSaving = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(smdtSchema),
    defaultValues: {
      category: initialData?.category || "",
      partName: initialData?.partName || "",
      partColor: initialData?.partColor || "",
      costUnit: initialData?.costUnit || "",
      description: initialData?.description || "",
      mbsCost: initialData?.mbsCost || "",
      currentMarketCost: initialData?.currentMarketCost || "",
      laborCost: initialData?.laborCost || "",
      additionalCost: initialData?.additionalCost || "",
      materialCost: initialData?.materialCost || "",
    },
  });

  const categoryValue = useWatch({ control, name: "category" });


  const onSubmit = async (data: SmdtSchemaType) => {
    const payload = {
      category: data.category,
      partName: data.partName.trim(),
      partColor: data.category === "frames" ? "" : (data.partColor?.trim() || "--"),
      costUnit: data.costUnit,
      mbsCost: data.mbsCost,
      currentMarketCost: data.currentMarketCost,
      laborCost: data.laborCost,
      additionalCost: data.additionalCost,
      materialCost: data.materialCost,
      description: data.description.trim(),
    };

    try {
      if (isEditing) {
        if (initialData?._id) {
          await updateItem({ itemId: initialData._id, body: payload });
          toast.success("Part cost updated successfully!");
          onClose();
        }
      } else {
        await createItem(payload);
        toast.success("Part cost added successfully!");
        onClose();
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save part cost. Please try again."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 border-none bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-8 pt-8 pb-4 shrink-0">          <DialogTitle className="text-xl font-bold text-slate-900">
          {isEditing ? "Edit Part Cost" : "Add New Part Cost"}
        </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-8 pb-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Category */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                Category <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200 h-11 shadow-sm">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Part Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                Part Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("partName")}
                placeholder="e.g. CUSTOM_PART_01"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
              {errors.partName && (
                <p className="text-xs text-red-500">{errors.partName.message}</p>
              )}
            </div>

            {/* Part Color */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">Part Color</label>
              <Input
                {...register("partColor")}
                placeholder={
                  categoryValue === "frames" ? "Disabled for frames" : "e.g. M (Defaults to '--')"
                }
                disabled={categoryValue === "frames"}
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
              {errors.partColor && (
                <p className="text-xs text-red-500">{errors.partColor.message}</p>
              )}
            </div>

            {/* Cost Unit */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                Cost Unit <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="costUnit"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200 h-11 shadow-sm">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_UNIT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.costUnit && (
                <p className="text-xs text-red-500">{errors.costUnit.message}</p>
              )}
            </div>

            {/* MBS Cost */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                MBS Cost <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="any"
                {...register("mbsCost")}
                placeholder="e.g. 3.50"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
              {errors.mbsCost && (
                <p className="text-xs text-red-500">{errors.mbsCost.message}</p>
              )}
            </div>

            {/* Current Market Cost */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                Current Market Cost <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="any"
                {...register("currentMarketCost")}
                placeholder="e.g. 4.20"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
              {errors.currentMarketCost && (
                <p className="text-xs text-red-500">{errors.currentMarketCost.message}</p>
              )}
            </div>

            {/* Labor Cost */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                Labor Cost <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="any"
                {...register("laborCost")}
                placeholder="0"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
              {errors.laborCost && (
                <p className="text-xs text-red-500">{errors.laborCost.message}</p>
              )}
            </div>

            {/* Additional Cost */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                Additional Cost <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="any"
                {...register("additionalCost")}
                placeholder="0"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
              {errors.additionalCost && (
                <p className="text-xs text-red-500">{errors.additionalCost.message}</p>
              )}
            </div>

            {/* Material Cost */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                Material Cost <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="any"
                {...register("materialCost")}
                placeholder="0"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
              {errors.materialCost && (
                <p className="text-xs text-red-500">{errors.materialCost.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">
                Description <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("description")}
                placeholder="e.g. Custom trim piece"
                className="bg-[#FAFAFA] border-gray-200 h-11 shadow-sm"
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 px-8 rounded-lg border-gray-200 text-gray-700 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 px-10 rounded-lg bg-[#7C3AED] hover:bg-purple-700 text-white font-medium"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
