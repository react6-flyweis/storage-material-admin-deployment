import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/modules/auth/auth.api";
import { importLeadsProvider, type ImportLeadsPayload } from "./leads.api";

type EscalationStatus = "pending" | "assigned" | "resolved";

type EscalationCustomer = {
  _id: string;
  customerId?: string;
  firstName?: string;
};

type EscalationEmployee = {
  _id?: string;
  name?: string;
};

type EscalationLead = {
  _id: string;
  customerId?: EscalationCustomer | string | null;
  buildingType?: string;
  location?: string;
  assignedSales?: string | EscalationEmployee | null;
  lifecycleStatus?: string;
};

type EscalationItem = {
  _id: string;
  leadId?: EscalationLead | null;
  customerId?: EscalationCustomer | null;
  raisedBy?: EscalationEmployee | null;
  note?: string;
  status?: EscalationStatus;
  resolvedAssignedTo?: EscalationEmployee | null;
  resolvedAt?: string | null;
  createdAt: string;
};

type EscalationsResponse = {
  success: boolean;
  message: string;
  data: {
    escalations: EscalationItem[];
  };
};

async function getEscalationsProvider(): Promise<EscalationsResponse> {
  const response = await apiClient.get<EscalationsResponse>(
    "/api/admin/escalations",
  );

  return response.data;
}

export function useEscalatedLeadsQuery() {
  return useQuery({
    queryKey: ["admin", "escalations"],
    queryFn: getEscalationsProvider,
    staleTime: 60 * 1000,
  });
}

export function useImportLeadsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ImportLeadsPayload) => importLeadsProvider(payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["leads", "admin"] });
    },
  });
}
