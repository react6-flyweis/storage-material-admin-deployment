import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateExpenseCategoryMutation } from "@/modules/financials/financials.hooks";
import type { ExpenseCategoryApiItem } from "@/modules/financials/financials.api";

const editExpenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  default: z.string().optional(),
  status: z.string().optional(),
});

export type EditExpenseCategoryFormValues = z.infer<
  typeof editExpenseCategorySchema
>;

type EditExpenseCategoryDialogProps = {
  category: ExpenseCategoryApiItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const typeOptions = ["System", "Custom"];
const defaultOptions = ["Yes", "No"];
const statusOptions = ["Active", "Inactive"];

export function EditExpenseCategoryDialog({
  category,
  open,
  onClose,
  onSuccess,
}: EditExpenseCategoryDialogProps) {
  const updateCategoryMutation = useUpdateExpenseCategoryMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditExpenseCategoryFormValues>({
    resolver: zodResolver(editExpenseCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      type: "System",
      default: "No",
      status: "Active",
    },
  });

  useEffect(() => {
    if (category && open) {
      setFormError(null);
      reset({
        name: category.name || "",
        description: category.description || "",
        type: category.type || "System",
        default: category.default || "No",
        status: category.isActive ? "Active" : "Inactive",
      });
    }
  }, [category, open, reset]);

  const handleCancel = () => {
    setFormError(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: EditExpenseCategoryFormValues) => {
    if (!category) return;
    setFormError(null);

    try {
      await updateCategoryMutation.mutateAsync({
        id: category._id,
        payload: {
          name: data.name.trim(),
          description: data.description?.trim(),
          type: data.type,
          default: data.default,
          isActive: data.status === "Active",
        },
      });
      setFormError(null);
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setFormError(
        err?.response?.data?.message || "Failed to update expense category"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleCancel()}>
      <DialogContent className="sm:max-w-lg gap-0 p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="text-2xl font-bold text-blue-600">
            Edit Category
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
              {formError}
            </div>
          )}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-semibold">
                Category Name
              </Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="Enter category name"
                className="w-full"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="font-semibold">
                Category Description
              </Label>
              <Input
                id="edit-description"
                type="text"
                placeholder="Enter description"
                className="w-full"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type" className="font-semibold">
                Type
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-default" className="font-semibold">
                Default
              </Label>
              <Controller
                control={control}
                name="default"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select default" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status" className="font-semibold">
                Status
              </Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCancel}
              disabled={updateCategoryMutation.isPending}
              className="border-slate-300 px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={updateCategoryMutation.isPending}
              className="bg-violet-600 px-8 hover:bg-violet-700"
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

