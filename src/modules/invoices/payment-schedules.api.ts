import { apiClient } from "@/modules/auth/auth.api";

export type PaymentScheduleStagePayload = {
  stageName: string;
  amount: number;
  amountType: "percentage" | "fixed";
  dueDate?: string;
};

export type CreatePaymentSchedulePayload = {
  leadId: string;
  totalAmount: number;
  stages: PaymentScheduleStagePayload[];
};

export type CreatePaymentScheduleResponse = {
  success: boolean;
  message: string;
  data: any;
};

export async function createPaymentScheduleProvider(payload: CreatePaymentSchedulePayload) {
  const response = await apiClient.post<CreatePaymentScheduleResponse>(
    `/api/payment-schedules`,
    payload
  );
  return response.data;
}

export async function getPaymentScheduleProvider(leadId: string) {
  const response = await apiClient.get<CreatePaymentScheduleResponse>(
    `/api/payment-schedules/lead/${leadId}`
  );
  return response.data;
}
