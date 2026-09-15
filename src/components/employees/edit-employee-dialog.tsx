import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useResetEmployeePasswordMutation } from "@/modules/employees/employees.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import SuccessDialog from "@/components/success-dialog";

const editEmployeeSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["active", "inactive"]),
});

type EditEmployeeForm = z.infer<typeof editEmployeeSchema>;

export interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: "active" | "inactive";
  };
  onSave?: (employee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: "active" | "inactive";
  }) => void;
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSave,
}: EditEmployeeDialogProps) {
  const [resetPassOpen, setResetPassOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passError, setPassError] = useState("");

  const resetPasswordMutation = useResetEmployeePasswordMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditEmployeeForm>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "sales",
      status: "active",
    },
  });

  useEffect(() => {
    if (open && employee) {
      reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone ?? "",
        role: employee.role ?? "sales",
        status: employee.status ?? "active",
      });
    }
  }, [open, employee, reset]);

  const onSubmit = (data: EditEmployeeForm) => {
    if (!employee) {
      onOpenChange(false);
      return;
    }

    onSave?.({
      id: employee.id,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() ?? "",
      role: data.role,
      status: data.status,
    });

    onOpenChange(false);
  };

  const handleResetPassword = () => {
    setResetPassOpen(true);
  };

  const handleResetPassOpenChange = (openState: boolean) => {
    setResetPassOpen(openState);
    if (!openState) {
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setPassError("");
    }
  };

  const submitResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      setPassError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    if (!employee) return;

    setPassError("");
    resetPasswordMutation.mutate(
      {
        employeeId: employee.id,
        newPassword,
      },
      {
        onSuccess: (data) => {
          handleResetPassOpenChange(false);
          toast.success(
            data?.message || "Employee password updated and emailed successfully",
          );
          if (data?.data?.passwordEmailWarning) {
            toast.warning(data.data.passwordEmailWarning);
          }
          setShowSuccess(true);
        },
        onError: (err) => {
          const errorMessage = getApiErrorMessage(
            err,
            "Failed to reset password",
          );
          setPassError(errorMessage);
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-6">
          <DialogTitle className="text-xl font-semibold">
            Edit Employee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="employee-name">Full Name *</Label>
              <Input
                id="employee-name"
                placeholder="Enter full name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee-email">Email Address *</Label>
              <Input
                id="employee-email"
                type="email"
                placeholder="Enter email address"
                disabled
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee-role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="plant">Plant</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-destructive text-sm">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee-phone">Phone Number</Label>
              <Input
                id="employee-phone"
                placeholder="Enter phone number"
                {...register("phone")}
              />
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="employee-status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value)}
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
            </div>
          </div>

          <DialogFooter className="border-t pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <DialogClose asChild>
                <Button size="lg" type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="lg" type="submit">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Reset Password Dialog */}
    <Dialog open={resetPassOpen} onOpenChange={handleResetPassOpenChange}>
      <DialogContent className="w-full sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-lg font-semibold">
            Reset Password {employee?.name ? `for ${employee.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitResetPassword();
          }}
        >
          <div className="space-y-4 px-6 py-5">
            <p className="text-sm text-gray-500">
              Set a new password for this employee. The password will be updated and emailed to{" "}
              <span className="font-medium text-gray-700">{employee?.email}</span>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reset-new-password">New Password *</Label>
                <div className="relative">
                  <Input
                    id="reset-new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passError) setPassError("");
                    }}
                    className={`pr-10 ${
                      passError ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Min 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passError) setPassError("");
                    }}
                    className={`pr-10 ${
                      passError ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {passError && (
              <p className="text-destructive text-sm font-medium">{passError}</p>
            )}
          </div>

          <DialogFooter className="border-t px-6 py-4 flex flex-row items-center justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleResetPassOpenChange(false)}
              disabled={resetPasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Saving..." : "Save Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <SuccessDialog
      open={showSuccess}
      onClose={() => setShowSuccess(false)}
      title="Password Reset Successfully!"
    />
  </>
);
}
