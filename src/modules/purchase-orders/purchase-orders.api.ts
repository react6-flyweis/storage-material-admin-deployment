import { apiClient } from "@/modules/auth/auth.api";

export type PurchaseOrder = {
  _id: string;
  poNumber?: string;
  status: string;
  leadId?: {
    _id: string;
    projectName?: string;
    location?: string;
    quoteValue?: number;
  };
  customerId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
  } | null;
  raisedBy?: {
    _id: string;
    name: string;
  };
  invoiceId?: {
    _id: string;
    invoiceNumber?: string;
    status?: string;
    totalAmount?: number;
  };
  invoiceAmount?: number;
  invoicePayment?: {
    status?: string;
    isPaid?: boolean;
    amount?: number;
  };
  quotationId?: any;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GetPurchaseOrdersResponse = {
  success: boolean;
  message: string;
  data: {
    orders: PurchaseOrder[];
  };
};

export async function getPurchaseOrdersProvider(status?: string) {
  const params: Record<string, string> = {};
  if (status) {
    params.status = status;
  }
  const response = await apiClient.get<GetPurchaseOrdersResponse>("/api/admin/po-orders", { params });
  // The API response directly has { orders: [...] } based on user notes,
  // or it might be wrapped in { success, data: { orders: [...] } }
  // We'll return the whole response data for hooks to handle
  return response.data;
}

export type UpdatePurchaseOrderStatusResponse = {
  success: boolean;
  message: string;
  order: PurchaseOrder;
};

export async function updatePurchaseOrderStatusProvider(
  poOrderId: string,
  status: string,
  adminNotes?: string
) {
  const response = await apiClient.put<UpdatePurchaseOrderStatusResponse>(
    `/api/admin/po-orders/${encodeURIComponent(poOrderId)}/status`,
    { status, adminNotes }
  );
  return response.data;
}

export type AssignPurchaseOrderResponse = {
  success: boolean;
  message: string;
  order: PurchaseOrder;
};

export async function assignPurchaseOrderProvider(
  poOrderId: string,
  assignedTo: string,
  adminNotes?: string
) {
  const response = await apiClient.put<AssignPurchaseOrderResponse>(
    `/api/admin/po-orders/${encodeURIComponent(poOrderId)}/assign`,
    { assignedTo, adminNotes }
  );
  return response.data;
}

export async function getPurchaseOrderDetailsProvider(poOrderId: string) {
  const response = await apiClient.get(
    `/api/admin/po-orders/${encodeURIComponent(poOrderId)}`
  );
  return response.data;
}

