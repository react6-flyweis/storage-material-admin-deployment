export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isMainAdmin: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  assignedLeadCount?: number;
}

export interface AdminsSummary {
  total: number;
  active: number;
  mainAdminId: string | null;
}

export interface GetAdminsResponse {
  success: boolean;
  message: string;
  data: {
    admins: AdminUser[];
    summary?: AdminsSummary;
    total?: number;
  };
}

export interface SetMainSelfResponse {
  success: boolean;
  message: string;
  data: {
    admin: AdminUser;
  };
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  data: {
    admin: AdminUser;
  };
}

export interface UpdateAdminPayload {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateAdminResponse {
  success: boolean;
  message: string;
  data: {
    admin: AdminUser;
  };
}

export interface ToggleAdminStatusResponse {
  success: boolean;
  message: string;
  data?: {
    admin?: AdminUser;
  };
}

export interface DeleteAdminResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface TransferMainAdminResponse {
  success: boolean;
  message: string;
  data?: {
    caller?: AdminUser;
    target?: AdminUser;
  };
}
