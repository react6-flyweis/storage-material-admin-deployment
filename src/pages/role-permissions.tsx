import { SaveIcon, Shield, Users } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddRoleDialog } from "@/components/add-role-dialog";
import SuccessDialog from "@/components/success-dialog";

interface RoleCard {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagClassName: string;
  users: number;
  grantedPermissions: number;
}

interface ModulePermission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PermissionModule {
  id: string;
  title: string;
  permissions: ModulePermission[];
}

interface AddRolePayload {
  roleName: string;
  description: string;
  color: string;
  permissions: Record<string, string[]>;
}

const roleCards: RoleCard[] = [
  {
    id: "system-admin",
    title: "System Administrator",
    description: "Full access to all modules and settings",
    tag: "System",
    tagClassName: "bg-red-100 text-red-600",
    users: 3,
    grantedPermissions: 24,
  },
  {
    id: "operations-manager",
    title: "Operations Manager",
    description: "Manage deliveries, freight, and view reports",
    tag: "Operations",
    tagClassName: "bg-blue-100 text-blue-600",
    users: 8,
    grantedPermissions: 15,
  },
  {
    id: "delivery-coordinator",
    title: "Delivery Coordinator",
    description: "Coordinate deliveries and manage schedules",
    tag: "Delivery",
    tagClassName: "bg-green-100 text-green-700",
    users: 12,
    grantedPermissions: 10,
  },
  {
    id: "freight-specialist",
    title: "Freight Specialist",
    description: "Manage freight bidding and carrier relations",
    tag: "Freight",
    tagClassName: "bg-orange-100 text-orange-600",
    users: 5,
    grantedPermissions: 10,
  },
  {
    id: "viewer",
    title: "Viewer",
    description: "Read-only access to deliveries and reports",
    tag: "Viewer",
    tagClassName: "bg-slate-100 text-slate-600",
    users: 15,
    grantedPermissions: 7,
  },
  {
    id: "construction-user",
    title: "Construction User",
    description: "Site-level delivery management",
    tag: "Construction",
    tagClassName: "bg-purple-100 text-purple-600",
    users: 20,
    grantedPermissions: 6,
  },
];

const basePermissionModules: (Omit<PermissionModule, "permissions"> & {
  permissions: Omit<ModulePermission, "enabled">[];
})[] = [
  {
    id: "delivery-management",
    title: "Delivery Management",
    permissions: [
      {
        id: "view-deliveries",
        name: "View Deliveries",
        description: "View all deliveries and details",
      },
      {
        id: "create-deliveries",
        name: "Create Deliveries",
        description: "Add new delivery records",
      },
      {
        id: "edit-deliveries",
        name: "Edit Deliveries",
        description: "Modify existing deliveries",
      },
      {
        id: "delete-deliveries",
        name: "Delete Deliveries",
        description: "Remove delivery records",
      },
      {
        id: "reschedule-deliveries",
        name: "Reschedule Deliveries",
        description: "Change delivery dates/times",
      },
    ],
  },
  {
    id: "freight-bidding",
    title: "Freight Bidding",
    permissions: [
      {
        id: "view-freight-requests",
        name: "View Freight Requests",
        description: "View all freight requests and bids",
      },
      {
        id: "create-freight-requests",
        name: "Create Freight Requests",
        description: "Create new freight requests",
      },
      {
        id: "submit-bids",
        name: "Submit Bids",
        description: "Submit bids on freight requests",
      },
      {
        id: "award-loads",
        name: "Award Loads",
        description: "Award freight to carriers",
      },
      {
        id: "decline-bids",
        name: "Decline Bids",
        description: "Decline submitted bids",
      },
    ],
  },
  {
    id: "master-data",
    title: "Master Data",
    permissions: [
      {
        id: "view-vendors",
        name: "View Vendors",
        description: "View vendor information",
      },
      {
        id: "manage-vendors",
        name: "Manage Vendors",
        description: "Add/Edit/Delete vendors",
      },
      {
        id: "view-carriers",
        name: "View Carriers",
        description: "View carrier information",
      },
      {
        id: "manage-carriers",
        name: "Manage Carriers",
        description: "Add/Edit/Delete carriers",
      },
      {
        id: "view-delivery-companies",
        name: "View Delivery Companies",
        description: "View delivery company information",
      },
      {
        id: "manage-delivery-companies",
        name: "Manage Delivery Companies",
        description: "Add/Edit/Delete delivery companies",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    permissions: [
      {
        id: "view-notifications",
        name: "View Notifications",
        description: "View notification history",
      },
      {
        id: "send-notifications",
        name: "Send Notifications",
        description: "Send manual notifications",
      },
      {
        id: "manage-templates",
        name: "Manage Templates",
        description: "Create/Edit notification templates",
      },
    ],
  },
  {
    id: "reports",
    title: "Reports",
    permissions: [
      {
        id: "view-reports",
        name: "View Reports",
        description: "View all reports and analytics",
      },
      {
        id: "export-reports",
        name: "Export Reports",
        description: "Export reports to CSV/PDF",
      },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    permissions: [
      {
        id: "manage-users",
        name: "Manage Users",
        description: "Add/Edit/Delete users",
      },
      {
        id: "manage-roles",
        name: "Manage Roles",
        description: "Create/Edit roles and permissions",
      },
      {
        id: "system-settings",
        name: "System Settings",
        description: "Configure system settings",
      },
    ],
  },
];

function buildRolePermissions(enabledCount: number): PermissionModule[] {
  let remaining = enabledCount;

  return basePermissionModules.map((module) => ({
    id: module.id,
    title: module.title,
    permissions: module.permissions.map((permission) => {
      const enabled = remaining > 0;
      if (remaining > 0) {
        remaining -= 1;
      }
      return {
        ...permission,
        enabled,
      };
    }),
  }));
}

function countEnabledPermissions(modules: PermissionModule[]): number {
  return modules.reduce(
    (total, module) =>
      total +
      module.permissions.filter((permission) => permission.enabled).length,
    0,
  );
}

function countTotalPermissions(modules: PermissionModule[]): number {
  return modules.reduce(
    (total, module) => total + module.permissions.length,
    0,
  );
}

const initialPermissionState: Record<string, PermissionModule[]> =
  roleCards.reduce(
    (acc, role) => {
      acc[role.id] = buildRolePermissions(role.grantedPermissions);
      return acc;
    },
    {} as Record<string, PermissionModule[]>,
  );

function buildRolePermissionsFromSelection(
  selectedPermissions: Record<string, string[]>,
): PermissionModule[] {
  return basePermissionModules.map((module) => ({
    id: module.id,
    title: module.title,
    permissions: module.permissions.map((permission) => ({
      ...permission,
      enabled: (selectedPermissions[module.id] ?? []).includes(permission.id),
    })),
  }));
}

function toRoleTagClass(color: string): string {
  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    pink: "bg-pink-100 text-pink-600",
  };

  return colorMap[color] ?? "bg-slate-100 text-slate-600";
}

function createRoleId(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug ? `custom-${slug}-${Date.now()}` : `custom-role-${Date.now()}`;
}

export default function RolePermissions() {
  const [roles, setRoles] = useState<RoleCard[]>(roleCards);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permissionStateByRole, setPermissionStateByRole] = useState<
    Record<string, PermissionModule[]>
  >(initialPermissionState);
  const [showSuccess, setShowSuccess] = useState(false);

  // Keep a snapshot of the saved state to detect unsaved changes
  const savedSnapshot = useRef({
    roles: roleCards,
    permissionState: initialPermissionState,
  });

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const selectedRoleModules = selectedRoleId
    ? (permissionStateByRole[selectedRoleId] ?? [])
    : [];

  const handleTogglePermission = (
    roleId: string,
    moduleId: string,
    permissionId: string,
  ) => {
    setPermissionStateByRole((prev) => ({
      ...prev,
      [roleId]: (prev[roleId] ?? []).map((module) => {
        if (module.id !== moduleId) {
          return module;
        }

        return {
          ...module,
          permissions: module.permissions.map((permission) =>
            permission.id === permissionId
              ? { ...permission, enabled: !permission.enabled }
              : permission,
          ),
        };
      }),
    }));
  };

  const handleDisableModule = (roleId: string, moduleId: string) => {
    setPermissionStateByRole((prev) => ({
      ...prev,
      [roleId]: (prev[roleId] ?? []).map((module) => {
        if (module.id !== moduleId) {
          return module;
        }

        return {
          ...module,
          permissions: module.permissions.map((permission) => ({
            ...permission,
            enabled: false,
          })),
        };
      }),
    }));
  };

  const handleRoleCreated = (roleData: AddRolePayload) => {
    const roleId = createRoleId(roleData.roleName);
    const rolePermissions = buildRolePermissionsFromSelection(
      roleData.permissions,
    );
    const grantedPermissions = countEnabledPermissions(rolePermissions);

    const newRole: RoleCard = {
      id: roleId,
      title: roleData.roleName,
      description: roleData.description,
      tag: roleData.roleName.split(" ")[0] || "Custom",
      tagClassName: toRoleTagClass(roleData.color),
      users: 0,
      grantedPermissions,
    };

    setRoles((prev) => [newRole, ...prev]);
    setPermissionStateByRole((prev) => ({
      ...prev,
      [roleId]: rolePermissions,
    }));
    setSelectedRoleId(roleId);
  };

  const hasChanges = useMemo(() => {
    try {
      const saved = JSON.stringify(savedSnapshot.current);
      const current = JSON.stringify({
        roles,
        permissionState: permissionStateByRole,
      });
      return saved !== current;
    } catch {
      return false;
    }
  }, [roles, permissionStateByRole]);

  const handleSaveChanges = () => {
    // Simulate save: update snapshot and show success dialog
    savedSnapshot.current = { roles, permissionState: permissionStateByRole };
    setShowSuccess(true);
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="xl:text-4xl text-2xl font-bold text-slate-800">
            Permissions & Access Control
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Manage user roles and module permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddRoleDialog onRoleCreated={handleRoleCreated} />
          <Button
            className={cn({ "bg-green-600": hasChanges })}
            disabled={!hasChanges}
            onClick={handleSaveChanges}
          >
            <SaveIcon />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role) => {
          const roleModules = permissionStateByRole[role.id] ?? [];
          const grantedCount = countEnabledPermissions(roleModules);
          const totalCount = countTotalPermissions(roleModules);
          const progress =
            totalCount === 0 ? 0 : (grantedCount / totalCount) * 100;
          const isSelected = selectedRoleId === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={cn(
                "w-full text-left rounded-xl border bg-white p-4 shadow-sm transition-colors",
                "hover:border-blue-300",
                isSelected
                  ? "border-blue-500 ring-1 ring-blue-200"
                  : "border-slate-200",
              )}
            >
              <h2 className="text-lg font-semibold text-slate-800">
                {role.title}
              </h2>
              <p className="text-sm text-slate-500 min-h-10 mt-1">
                {role.description}
              </p>

              <div className="flex items-center justify-between mt-4">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    role.tagClassName,
                  )}
                >
                  {role.tag}
                </span>

                <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{role.users} users</span>
                </span>
              </div>

              <div className="mt-6">
                <p className="text-xs text-slate-500 mb-2">
                  {grantedCount} of {totalCount} permissions
                </p>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedRole ? (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {selectedRole.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedRole.description}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                {countEnabledPermissions(selectedRoleModules)}
              </span>{" "}
              of {countTotalPermissions(selectedRoleModules)} permissions
            </p>
          </div>

          {selectedRoleModules.map((module) => {
            const enabledCount = module.permissions.filter(
              (permission) => permission.enabled,
            ).length;

            return (
              <div
                key={module.id}
                className="rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="bg-slate-100 px-3 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-semibold text-slate-800">
                      {module.title}
                    </h4>
                    <span className="text-sm text-slate-500">
                      {enabledCount} of {module.permissions.length} enabled
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() =>
                      handleDisableModule(selectedRole.id, module.id)
                    }
                  >
                    Disable All
                  </Button>
                </div>

                <div>
                  {module.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={cn(
                        "px-3 py-3 border-t border-slate-200 flex items-center justify-between gap-3",
                        permission.enabled ? "bg-emerald-50" : "bg-white",
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">
                            {permission.name}
                          </p>
                          <span
                            className={cn(
                              "text-[11px] px-2 py-0.5 rounded-full font-medium",
                              permission.enabled
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {permission.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {permission.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-pressed={permission.enabled}
                        onClick={() =>
                          handleTogglePermission(
                            selectedRole.id,
                            module.id,
                            permission.id,
                          )
                        }
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          permission.enabled
                            ? "bg-emerald-500"
                            : "bg-slate-300",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                            permission.enabled
                              ? "translate-x-5"
                              : "translate-x-1",
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="min-h-52 rounded-xl border border-slate-200 bg-white/75 shadow-sm flex flex-col items-center justify-center px-4 text-center">
          <Shield className="w-14 h-14 text-slate-300 mb-5" />
          <h3 className="text-xl font-medium text-slate-500">
            Select a role to manage permissions
          </h3>
          <p className="text-sm text-slate-400 mt-3">
            Click on a role card above to view and edit its permissions
          </p>
        </section>
      )}
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Permission Saved Successfully"
        okLabel="Ok"
      />
    </div>
  );
}
