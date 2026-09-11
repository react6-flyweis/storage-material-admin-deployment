import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { useCreateExpenseCategoryMutation } from "@/modules/financials/financials.hooks";

const addExpenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  default: z.string().optional(),
  status: z.string().optional(),
});

export type AddExpenseCategoryFormValues = z.infer<
  typeof addExpenseCategorySchema
>;

type AddExpenseCategoryDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const typeOptions = ["System", "Custom"];
const defaultOptions = ["Yes", "No"];
const statusOptions = ["Active", "Inactive"];

export function AddExpenseCategoryDialog({
  open,
  onClose,
  onSuccess,
}: AddExpenseCategoryDialogProps) {
  const createCategoryMutation = useCreateExpenseCategoryMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddExpenseCategoryFormValues>({
    resolver: zodResolver(addExpenseCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      type: "System",
      default: "No",
      status: "Active",
    },
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: AddExpenseCategoryFormValues) => {
    try {
      await createCategoryMutation.mutateAsync({
        name: data.name.trim(),
      });
      toast.success("Expense category created successfully");
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Failed to create expense category"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleCancel()}>
      <DialogContent className="sm:max-w-lg gap-0 p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="text-2xl font-bold text-blue-600">
            Add Category
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">
                Category Name
              </Label>
              <Input
                id="name"
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
              <Label htmlFor="description" className="font-semibold">
                Category Description
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter description"
                className="w-full"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="font-semibold">
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
              <Label htmlFor="default" className="font-semibold">
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
              <Label htmlFor="status" className="font-semibold">
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
              disabled={createCategoryMutation.isPending}
              className="border-slate-300 px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={createCategoryMutation.isPending}
              className="bg-violet-600 px-8 hover:bg-violet-700"
            >
              {createCategoryMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


