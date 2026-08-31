import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateAdminMutation } from "@/modules/admins/admins.hooks";
import type { AdminUser } from "@/modules/admins/admins.types";
import { toast } from "sonner";

const editAdminSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type EditAdminFormData = z.infer<typeof editAdminSchema>;

export interface EditAdminDialogProps {
  admin: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (adminName: string) => void;
}

export function EditAdminDialog({
  admin,
  open,
  onOpenChange,
  onSuccess,
}: EditAdminDialogProps) {
  const updateAdminMutation = useUpdateAdminMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditAdminFormData>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (open && admin) {
      reset({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        status: admin.isActive ? "active" : "inactive",
      });
    }
  }, [open, admin, reset]);

  const onSubmit = async (data: EditAdminFormData) => {
    if (!admin) return;

    try {
      await updateAdminMutation.mutateAsync({
        adminId: admin._id,
        payload: {
          name: data.name.trim(),
          email: data.email?.trim() || undefined,
          phone: data.phone?.trim() || undefined,
          isActive: admin.isMainAdmin ? true : data.status === "active",
        },
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(data.name);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update admin user";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-6">
          <DialogTitle className="text-xl font-semibold">
            Edit Admin
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="admin-edit-name" className={errors.name ? "text-destructive" : ""}>
                Full Name *
              </Label>
              <Input
                id="admin-edit-name"
                {...register("name")}
                placeholder="Enter full name"
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="admin-edit-email" className={errors.email ? "text-destructive" : ""}>
                Email Address
              </Label>
              <Input
                id="admin-edit-email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="admin-edit-phone">Phone Number</Label>
              <Input
                id="admin-edit-phone"
                placeholder="Enter phone number"
                {...register("phone")}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="admin-edit-status">Status</Label>
              {admin?.isMainAdmin ? (
                <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  Main Admin is always active and cannot be deactivated.
                </div>
              ) : (
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val)}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-5 flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button size="lg" type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="lg"
              type="submit"
              disabled={isSubmitting || updateAdminMutation.isPending}
            >
              {updateAdminMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAdminDialog;
