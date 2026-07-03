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
import { useUpdateAdminEmployeeMutation } from "@/modules/employees/employees.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const updateMutation = useUpdateAdminEmployeeMutation();

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

  const submitResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!employee) return;

    updateMutation.mutate(
      {
        employeeId: employee.id,
        data: { password: newPassword }
      },
      {
        onSuccess: () => {
          toast.success("Password reset successfully");
          setResetPassOpen(false);
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to reset password");
        }
      }
    );
  };

  return (
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
                  <Select onValueChange={field.onChange} value={field.value}>
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

      {/* Nested Reset Password Dialog */}
      <Dialog open={resetPassOpen} onOpenChange={setResetPassOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password for {employee?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPassOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitResetPassword}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
