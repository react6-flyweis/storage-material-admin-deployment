import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { FieldGroup, FieldLegend, FieldSeparator } from "@/components/ui/field";
import { Plus } from "lucide-react";

const permissionItem = z.object({
  main: z.boolean().optional(),
  view: z.boolean().optional(),
  edit: z.boolean().optional(),
  delete: z.boolean().optional(),
});

const permissionsSchema = z.object({
  lead_access: permissionItem.optional(),
  follow_ups_access: permissionItem.optional(),
  reports_access: permissionItem.optional(),
  ai_support_access: permissionItem.optional(),
  settings_access: permissionItem.optional(),
  employees: permissionItem.optional(),
  tax_report: permissionItem.optional(),
  insights: permissionItem.optional(),
  add_new_lead: permissionItem.optional(),
  schedule_meeting: permissionItem.optional(),
  generate_report: permissionItem.optional(),
});

type PermissionKey = keyof z.infer<typeof permissionsSchema>;

const PERMISSIONS: { key: PermissionKey; label: string }[] = [
  { key: "lead_access", label: "Lead access" },
  { key: "follow_ups_access", label: "Follow-ups Access" },
  { key: "reports_access", label: "Reports Access" },
  { key: "ai_support_access", label: "AI Support Access" },
  { key: "settings_access", label: "Settings Access" },
  { key: "employees", label: "Employees" },
  { key: "tax_report", label: "Tax & Report" },
  { key: "insights", label: "Insights" },
  { key: "add_new_lead", label: "Add new lead" },
  { key: "schedule_meeting", label: "Schedule meeting" },
  { key: "generate_report", label: "Generate Report" },
];

const addEmployeeSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  team: z.string().min(1, "Team is required"),
  status: z.enum(["active", "inactive"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  permissions: permissionsSchema.optional(),
});

type AddEmployeeForm = z.infer<typeof addEmployeeSchema>;

type AddEmployeeDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialValues?: Partial<AddEmployeeForm>;
  hideTrigger?: boolean;
};

const defaultFormValues: AddEmployeeForm = {
  name: "",
  email: "",
  phone: "",
  role: "Employee",
  team: "Sales",
  status: "active",
  password: "",
  permissions: {},
};

export function AddEmployeeDialog({
  open: controlledOpen,
  onOpenChange,
  initialValues,
  hideTrigger = false,
}: AddEmployeeDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [openState, setOpenState] = useState<boolean>(controlledOpen ?? false);
  const [showSuccess, setShowSuccess] = useState(false);
  const open = isControlled ? (controlledOpen as boolean) : openState;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "Employee",
      team: "Sales",
      status: "active",
      password: "",
      permissions: {},
    },
  });

  useEffect(() => {
    if (open && initialValues) {
      reset({ ...defaultFormValues, ...initialValues });
    }
  }, [open, initialValues, reset]);

  const setOpen = (val: boolean) => {
    if (!isControlled) setOpenState(val);
    if (onOpenChange) onOpenChange(val);
  };

  const onSubmit = (data: AddEmployeeForm) => {
    console.log({
      ...data,
      joinedDate: new Date().toLocaleDateString("en-US"),
      leads: 0,
    });
    reset();
    setOpen(false);
    setShowSuccess(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button className="bg-[#3b82f6] hover:bg-[#2563eb]">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialValues && Object.keys(initialValues).length > 0
              ? "Edit Employee Information"
              : "Add New Employee"}
          </DialogTitle>
          <DialogDescription>
            {initialValues && Object.keys(initialValues).length > 0
              ? "Update the employee details below"
              : "Fill in the details below"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
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
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                {...register("phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Department</Label>
              <Controller
                control={control}
                name="team"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <FieldGroup>
              <FieldLegend>Permissions</FieldLegend>
              <FieldSeparator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERMISSIONS.map((p) => (
                  <div key={p.key as string} className="border-b pb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register(`permissions.${p.key}.main`)}
                      />
                      <Label>{p.label}</Label>
                    </div>
                    <div className="flex items-center gap-4 ml-6 mt-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(`permissions.${p.key}.view`)}
                        />
                        <span className="text-muted-foreground">View</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(`permissions.${p.key}.edit`)}
                        />
                        <span className="text-muted-foreground">Edit</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(`permissions.${p.key}.delete`)}
                        />
                        <span className="text-muted-foreground">Delete</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </FieldGroup>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#3b82f6] hover:bg-[#2563eb]"
              disabled={isSubmitting}
            >
              {initialValues && Object.keys(initialValues).length > 0
                ? "Save Changes"
                : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={
          initialValues && Object.keys(initialValues).length > 0
            ? "Employee Updated Successfully!"
            : "Employee Added Successfully!"
        }
      />
    </Dialog>
  );
}
