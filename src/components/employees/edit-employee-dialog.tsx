import { useEffect } from "react";
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
  team: z.string().min(1, "Department is required"),
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
    team: string;
    status: "active" | "inactive";
  };
  onSave?: (employee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    team: string;
    status: "active" | "inactive";
  }) => void;
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSave,
}: EditEmployeeDialogProps) {
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
      team: "Sales",
      status: "active",
    },
  });

  useEffect(() => {
    if (open && employee) {
      reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone ?? "",
        team: employee.team ?? "Sales",
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
      role: employee.role,
      team: data.team,
      status: data.status,
    });

    onOpenChange(false);
  };

  const handleResetPassword = () => {
    console.log(`Reset password request for ${employee?.name ?? "employee"}`);
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
              <Label htmlFor="employee-team">Department</Label>
              <Controller
                name="team"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Plant">Plant</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.team && (
                <p className="text-destructive text-sm">
                  {errors.team.message}
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
  );
}
