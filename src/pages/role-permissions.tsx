import { SaveIcon, Shield, Users, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddRoleDialog } from "@/components/add-role-dialog";
import SuccessDialog from "@/components/success-dialog";
import { useRolesQuery, useUpdateRolePermissionsMutation } from "@/modules/roles/roles.hooks";
import type { ApiRole, ApiRolePermissions, ApiPermissionAction } from "@/modules/roles/roles.types";

interface RoleCard {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagClassName: string;
  users: number;
  grantedPermissions: number;
  totalPermissions: number;
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

const MODULE_TITLE_MAP: Record<string, string> = {
  deliveries: "Delivery Management",
  leads: "Leads Management",
  customers: "Customer Management",
  employees: "Employee Management",
  financials: "Financials",
  products: "Product Catalog",
  invoices: "Invoices",
  reports: "Reports & Analytics",
  plant: "Plant Operations",
  construction: "Construction Site",
  settings: "System Settings",
  communication: "Communication",
};

const ACTION_TITLE_MAP: Record<string, { name: string; description: string }> = {
  view: { name: "View Access", description: "View module records and details" },
  create: { name: "Create Access", description: "Add new module records" },
  edit: { name: "Edit Access", description: "Modify existing module records" },
  delete: { name: "Delete Access", description: "Remove module records" },
};

function toRoleTagClass(color?: string): string {
  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    pink: "bg-pink-100 text-pink-600",
  };

  return (color && colorMap[color]) || "bg-slate-100 text-slate-600";
}

function transformApiRoleToModules(apiPermissions: ApiRolePermissions): PermissionModule[] {
  return Object.entries(apiPermissions).map(([moduleKey, actions]) => {
    const moduleTitle = MODULE_TITLE_MAP[moduleKey] || moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
    
    const permissions: ModulePermission[] = Object.entries(actions).map(([actionKey, isEnabled]) => {
      const actionMeta = ACTION_TITLE_MAP[actionKey] || {
        name: `${actionKey.charAt(0).toUpperCase()}${actionKey.slice(1)} Access`,
        description: `Allow ${actionKey} action for ${moduleTitle}`,
      };

      return {
        id: `${moduleKey}:${actionKey}`,
        name: actionMeta.name,
        description: actionMeta.description,
        enabled: Boolean(isEnabled),
      };
    });

    return {
      id: moduleKey,
      title: moduleTitle,
      permissions,
    };
  });
}

function transformModulesToApiPermissions(modules: PermissionModule[]): ApiRolePermissions {
  const apiPermissions: ApiRolePermissions = {};

  modules.forEach((module) => {
    const actions: ApiPermissionAction = {
      view: false,
      create: false,
      edit: false,
      delete: false,
    };

    module.permissions.forEach((permission) => {
      const actionKey = permission.id.split(":")[1] as keyof ApiPermissionAction;
      if (actionKey in actions) {
        actions[actionKey] = permission.enabled;
      }
    });

    apiPermissions[module.id] = actions;
  });

  return apiPermissions;
}

function countEnabledPermissions(modules: PermissionModule[]): number {
  return modules.reduce(
    (total, module) =>
      total + module.permissions.filter((permission) => permission.enabled).length,
    0,
  );
}

function countTotalPermissions(modules: PermissionModule[]): number {
  return modules.reduce(
    (total, module) => total + module.permissions.length,
    0,
  );
}

export default function RolePermissions() {
  const { data: rolesResponse, isLoading, isError, error, refetch } = useRolesQuery();
  const updatePermissionsMutation = useUpdateRolePermissionsMutation();

  const [roles, setRoles] = useState<RoleCard[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permissionStateByRole, setPermissionStateByRole] = useState<
    Record<string, PermissionModule[]>
  >({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [savedSnapshot, setSavedSnapshot] = useState<{
    roles: RoleCard[];
    permissionState: Record<string, PermissionModule[]>;
  }>({
    roles: [],
    permissionState: {},
  });

  useEffect(() => {
    if (rolesResponse?.data?.roles) {
      const fetchedApiRoles = rolesResponse.data.roles;

      const formattedRoleCards: RoleCard[] = fetchedApiRoles.map((apiRole: ApiRole) => {
        const modules = transformApiRoleToModules(apiRole.permissions || {});
        const calculatedGranted = countEnabledPermissions(modules);
        const calculatedTotal = countTotalPermissions(modules);

        return {
          id: apiRole._id,
          title: apiRole.name,
          description: apiRole.description || "",
          tag: apiRole.isSystem ? "System" : apiRole.name.split(" ")[0] || "Role",
          tagClassName: toRoleTagClass(apiRole.color),
          users: apiRole.userCount ?? 0,
          grantedPermissions: apiRole.grantedPermissions ?? calculatedGranted,
          totalPermissions: apiRole.totalPermissions ?? calculatedTotal,
        };
      });

      const initialPermissions: Record<string, PermissionModule[]> = {};
      fetchedApiRoles.forEach((apiRole: ApiRole) => {
        initialPermissions[apiRole._id] = transformApiRoleToModules(apiRole.permissions || {});
      });

      setRoles(formattedRoleCards);
      setPermissionStateByRole(initialPermissions);

      setSelectedRoleId((current) => current || (formattedRoleCards.length > 0 ? formattedRoleCards[0].id : null));

      setSavedSnapshot({
        roles: formattedRoleCards,
        permissionState: initialPermissions,
      });
    }
  }, [rolesResponse]);

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

  const hasChanges = useMemo(() => {
    try {
      const saved = JSON.stringify(savedSnapshot);
      const current = JSON.stringify({
        roles,
        permissionState: permissionStateByRole,
      });
      return saved !== current;
    } catch {
      return false;
    }
  }, [roles, permissionStateByRole, savedSnapshot]);

  const handleSaveChanges = async () => {
    if (!selectedRoleId) return;
    setSaveError(null);

    const currentModules = permissionStateByRole[selectedRoleId] ?? [];
    const payloadPermissions = transformModulesToApiPermissions(currentModules);

    try {
      await updatePermissionsMutation.mutateAsync({
        roleId: selectedRoleId,
        payload: { permissions: payloadPermissions },
      });

      setSavedSnapshot({ roles, permissionState: permissionStateByRole });
      setShowSuccess(true);
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update role permissions",
      );
    }
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
          <AddRoleDialog />
          <Button
            className={cn({ "bg-green-600 hover:bg-green-700 text-white": hasChanges })}
            disabled={!hasChanges || updatePermissionsMutation.isPending}
            onClick={handleSaveChanges}
          >
            {updatePermissionsMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <SaveIcon className="w-4 h-4 mr-1" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-slate-200 rounded-full w-16" />
                <div className="h-4 bg-slate-100 rounded w-20" />
              </div>
              <div className="h-2 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-semibold">Failed to load roles</p>
              <p className="text-sm text-red-600">
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching roles."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => void refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
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
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

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
                        "px-3 py-3 border-t border-slate-200 flex items-center justify-between gap-3 transition-colors",
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
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
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

