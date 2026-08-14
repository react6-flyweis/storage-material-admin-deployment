import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldError,
  FieldContent,
  FieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { PlusIcon, Loader2 } from "lucide-react";
import { useCreateRoleMutation } from "@/modules/roles/roles.hooks";
import type { ApiRolePermissions, ApiPermissionAction } from "@/modules/roles/roles.types";

// Zod schema for form validation
const roleFormSchema = z.object({
  roleName: z
    .string()
    .min(1, "Role name is required")
    .min(2, "Role name must be at least 2 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),
  color: z.string(),
  permissions: z.record(z.string(), z.array(z.string())),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

const ROLE_COLORS = [
  { name: "red", bg: "bg-red-500", hex: "#EF4444" },
  { name: "blue", bg: "bg-blue-600", hex: "#2563EB" },
  { name: "green", bg: "bg-green-500", hex: "#22C55E" },
  { name: "purple", bg: "bg-purple-500", hex: "#A855F7" },
  { name: "orange", bg: "bg-orange-500", hex: "#F97316" },
  { name: "pink", bg: "bg-pink-500", hex: "#EC4899" },
];

const MODULE_KEYS = [
  "deliveries",
  "leads",
  "customers",
  "employees",
  "financials",
  "products",
  "invoices",
  "reports",
  "plant",
  "construction",
  "settings",
  "communication",
];

const PERMISSION_MODULES = [
  {
    id: "deliveries",
    title: "Delivery Management",
    permissions: [
      { id: "view", name: "View Deliveries", description: "View all deliveries and details" },
      { id: "create", name: "Create Deliveries", description: "Add new delivery records" },
      { id: "edit", name: "Edit Deliveries", description: "Modify existing deliveries" },
      { id: "delete", name: "Delete Deliveries", description: "Remove delivery records" },
    ],
  },
  {
    id: "leads",
    title: "Leads Management",
    permissions: [
      { id: "view", name: "View Leads", description: "View lead records and details" },
      { id: "create", name: "Create Leads", description: "Add new leads" },
      { id: "edit", name: "Edit Leads", description: "Modify existing leads" },
      { id: "delete", name: "Delete Leads", description: "Remove lead records" },
    ],
  },
  {
    id: "customers",
    title: "Customer Management",
    permissions: [
      { id: "view", name: "View Customers", description: "View customer records" },
      { id: "create", name: "Create Customers", description: "Add new customers" },
      { id: "edit", name: "Edit Customers", description: "Modify existing customer details" },
      { id: "delete", name: "Delete Customers", description: "Remove customer records" },
    ],
  },
];

const QUICK_TEMPLATES = [
  {
    id: "view-only",
    name: "View Only",
    icon: "eye",
    permissions: {
      deliveries: ["view"],
      leads: ["view"],
      customers: ["view"],
    },
  },
  {
    id: "full-access",
    name: "Full Access",
    icon: "check",
    permissions: {
      deliveries: ["view", "create", "edit", "delete"],
      leads: ["view", "create", "edit", "delete"],
      customers: ["view", "create", "edit", "delete"],
    },
  },
];

export function AddRoleDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createRoleMutation = useCreateRoleMutation();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      roleName: "",
      description: "",
      color: "blue",
      permissions: MODULE_KEYS.reduce(
        (acc, moduleKey) => {
          acc[moduleKey] = [];
          return acc;
        },
        {} as Record<string, string[]>,
      ),
    },
  });

  const selectedColor = watch("color");
  const selectedPermissions = watch("permissions") as Record<string, string[]>;

  const handleTogglePermission = (moduleId: string, permissionId: string) => {
    const current = selectedPermissions[moduleId] || [];
    const updated = current.includes(permissionId)
      ? current.filter((id) => id !== permissionId)
      : [...current, permissionId];
    setValue("permissions", {
      ...selectedPermissions,
      [moduleId]: updated,
    });
  };

  const handleSelectAllModule = (moduleId: string) => {
    const module = PERMISSION_MODULES.find((m) => m.id === moduleId);
    if (!module) return;

    const allPermissionIds = module.permissions.map((p) => p.id);
    setValue("permissions", {
      ...selectedPermissions,
      [moduleId]: allPermissionIds,
    });
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = QUICK_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setValue("permissions", template.permissions);
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    setSubmitError(null);

    const formattedPermissions: ApiRolePermissions = {};
    MODULE_KEYS.forEach((moduleKey) => {
      const selectedActions = data.permissions[moduleKey] || [];
      const actions: ApiPermissionAction = {
        view: selectedActions.includes("view"),
        create: selectedActions.includes("create"),
        edit: selectedActions.includes("edit"),
        delete: selectedActions.includes("delete"),
      };
      formattedPermissions[moduleKey] = actions;
    });

    try {
      await createRoleMutation.mutateAsync({
        name: data.roleName,
        description: data.description,
        color: data.color,
        permissions: formattedPermissions,
      });

      reset();
      setIsOpen(false);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create role",
      );
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="border-2 border-blue-500 text-blue-500"
        onClick={() => setIsOpen(true)}
      >
        <PlusIcon />
        Add New Role
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Role</DialogTitle>
          <DialogDescription>
            Define a new user role with specific permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Role Name Field */}
          <FieldGroup>
            <Controller
              name="roleName"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldTitle>
                    Role Name <span className="text-red-500">*</span>
                  </FieldTitle>
                  <FieldContent>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Project Manager"
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder:text-slate-400"
                    />
                  </FieldContent>
                  <FieldError
                    errors={
                      errors.roleName
                        ? [{ message: errors.roleName.message }]
                        : []
                    }
                  />
                </Field>
              )}
            />
          </FieldGroup>

          {/* Description Field */}
          <FieldGroup>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldTitle>
                    Description <span className="text-red-500">*</span>
                  </FieldTitle>
                  <FieldContent>
                    <textarea
                      {...field}
                      placeholder="Describe the role's responsibilities and scope..."
                      rows={4}
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder:text-slate-400 resize-none w-full"
                    />
                  </FieldContent>
                  <FieldError
                    errors={
                      errors.description
                        ? [{ message: errors.description.message }]
                        : []
                    }
                  />
                </Field>
              )}
            />
          </FieldGroup>

          {/* Role Color Field */}
          <FieldGroup>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldTitle>Role Color</FieldTitle>
                  <FieldContent>
                    <div className="flex gap-3">
                      {ROLE_COLORS.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => field.onChange(color.name)}
                          className={cn(
                            "w-10 h-10 rounded-full transition-all",
                            color.bg,
                            selectedColor === color.name
                              ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                              : "hover:scale-105",
                          )}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          {/* Permissions Field */}
          <FieldGroup>
            <FieldTitle>Permissions</FieldTitle>
            <FieldContent>
              <div className="space-y-3">
                {PERMISSION_MODULES.map((module) => (
                  <div
                    key={module.id}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                  >
                    {/* Module Header */}
                    <div className="bg-slate-100 px-4 py-3 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800">
                        {module.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleSelectAllModule(module.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        Select All
                      </button>
                    </div>

                    {/* Module Permissions */}
                    <div className="divide-y divide-slate-200">
                      {module.permissions.map((permission) => {
                        const isChecked = selectedPermissions[
                          module.id
                        ]?.includes(permission.id);
                        return (
                          <label
                            key={permission.id}
                            className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                handleTogglePermission(module.id, permission.id)
                              }
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">
                                {permission.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {permission.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </FieldContent>
          </FieldGroup>

          {/* Quick Templates */}
          <FieldGroup>
            <FieldTitle>
              Quick Templates{" "}
              <span className="text-xs font-normal text-slate-500">
                (Optional)
              </span>
            </FieldTitle>
            <FieldContent>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleApplyTemplate(template.id)}
                    className="px-4 py-3 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    {template.icon === "eye" && (
                      <svg
                        className="w-6 h-6 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                    {template.icon === "focus" && (
                      <svg
                        className="w-6 h-6 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    {template.icon === "check" && (
                      <svg
                        className="w-6 h-6 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      {template.name}
                    </span>
                  </button>
                ))}
              </div>
            </FieldContent>
          </FieldGroup>
          {submitError && (
            <div className="p-3 text-sm rounded bg-red-50 text-red-600 border border-red-200">
              {submitError}
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={createRoleMutation.isPending}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit(onSubmit)}
            disabled={createRoleMutation.isPending}
          >
            {createRoleMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlusIcon className="w-4 h-4 mr-2" />
            )}
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
