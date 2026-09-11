import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAdminMutation } from "@/modules/admins/admins.hooks";
import { Eye, EyeOff, Plus } from "lucide-react";
import { toast } from "sonner";
import SuccessDialog from "@/components/success-dialog";

const addAdminSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AddAdminFormData = z.infer<typeof addAdminSchema>;

interface AddAdminDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function AddAdminDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  hideTrigger = false,
  disabled = false,
  onSuccess,
}: AddAdminDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdAdminName, setCreatedAdminName] = useState("");

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen! : setUncontrolledOpen;

  const createAdminMutation = useCreateAdminMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: AddAdminFormData) => {
    try {
      await createAdminMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
      });

      setCreatedAdminName(data.name);
      reset();
      setOpen(false);
      setIsSuccessOpen(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create admin user";
      toast.error(msg);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        {!hideTrigger && (
          <DialogTrigger asChild>
            <Button
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Admin
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="border-b px-6 py-6">
            <DialogTitle className="text-xl font-semibold">
              Add New Admin
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="admin-name" className={errors.name ? "text-destructive" : ""}>
                  Full Name *
                </Label>
                <Input
                  id="admin-name"
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
                <Label htmlFor="admin-email" className={errors.email ? "text-destructive" : ""}>
                  Email Address *
                </Label>
                <Input
                  id="admin-email"
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
                <Label htmlFor="admin-phone">Phone Number</Label>
                <Input
                  id="admin-phone"
                  {...register("phone")}
                  placeholder="Enter phone number"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="admin-password" className={errors.password ? "text-destructive" : ""}>
                  Temporary Password *
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter temporary password"
                    className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password.message}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
              A credentials onboarding email will be automatically dispatched to this email address upon creation.
            </p>

            <DialogFooter className="border-t pt-5 flex items-center justify-end gap-3">
              <DialogClose asChild>
                <Button size="lg" type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size="lg"
                type="submit"
                disabled={isSubmitting || createAdminMutation.isPending}
              >
                {createAdminMutation.isPending
                  ? "Adding Admin..."
                  : "Add Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={
          createdAdminName
            ? `${createdAdminName} Added Successfully`
            : "Admin Created Successfully"
        }
        okLabel="OK"
      />
    </>
  );
}

export default AddAdminDialog;
