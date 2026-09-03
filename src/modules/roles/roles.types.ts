export interface ApiPermissionAction {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type ApiRolePermissions = Record<string, ApiPermissionAction>;

export interface ApiRole {
  _id: string;
  name: string;
  description: string;
  color?: string;
  isSystem?: boolean;
  permissions: ApiRolePermissions;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  userCount?: number;
  grantedPermissions?: number;
  totalPermissions?: number;
}

export interface GetRolesResponse {
  success: boolean;
  message: string;
  data: {
    roles: ApiRole[];
  };
}

export interface CreateRolePayload {
  name: string;
  description: string;
  color?: string;
  permissions: ApiRolePermissions;
}

export interface CreateRoleResponse {
  success: boolean;
  message: string;
  data: {
    role: ApiRole;
  };
}

export interface UpdateRolePermissionsPayload {
  permissions: ApiRolePermissions;
}

export interface UpdateRolePermissionsResponse {
  success: boolean;
  message: string;
  data: {
    role: ApiRole;
  };
}

