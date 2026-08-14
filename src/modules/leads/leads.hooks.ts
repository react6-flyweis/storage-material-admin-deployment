import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/utils/socketContextProvider";
import { apiClient } from "@/modules/auth/auth.api";
import {
  getLeadsProvider,
  getCustomerLeadsProvider,
  importLeadsProvider,
  getTerminatedLeadsProvider,
  assignLeadSalesProvider,
  getLeadDetailProvider,
  getChatHistoryProvider,
  getLeadScoringProvider,
  getLeadDocumentsProvider,
  updateLeadTemperatureProvider,
  exportLeadsProvider,
  getActivityLogProvider,
  getLeadBudgetProvider,
  updateLeadBudgetProvider,
  getLeadTimelineProvider,
  type GetActivityLogParams,
  type LeadBudgetPayload,
  terminateLeadProvider,
  type TerminateLeadPayload,
  deleteLeadProvider,
  createLeadProvider,
  type CreateLeadPayload,
  uploadLeadDocumentProvider,
  getAdminLeadsProvider,
  getLeadsStatsProvider,
} from "./leads.api";

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
    leads?: any[];
    escalations?: any[];
    total?: number;
    page?: number;
    limit?: number;
  };
};

async function getEscalationsProvider(status: string = "pending", page: number = 1, limit: number = 20): Promise<EscalationsResponse> {
  const params = new URLSearchParams({
    status,
    page: page.toString(),
    limit: limit.toString()
  });

  const response = await apiClient.get<EscalationsResponse>(
    `/api/admin/escalations?${params.toString()}`,
  );

  return response.data;
}

export async function assignEscalationProvider(escalationId: string, employeeId: string) {
  const response = await apiClient.put(
    `/api/admin/escalations/${escalationId}/assign`,
    { employeeId }
  );
  return response.data;
}

export async function resolveEscalationProvider(escalationId: string, note: string) {
  const response = await apiClient.put(
    `/api/admin/escalations/${escalationId}/resolve`,
    { note }
  );
  return response.data;
}


export function useEscalatedLeadsQuery(status: string = "pending", page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["admin", "escalations", status, page, limit],
    queryFn: () => getEscalationsProvider(status, page, limit),
    staleTime: 60 * 1000,
  });
}

export function useAssignEscalationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ escalationId, employeeId }: { escalationId: string; employeeId: string }) =>
      assignEscalationProvider(escalationId, employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "escalations"] });
    },
  });
}

export function useResolveEscalationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ escalationId, note }: { escalationId: string; note: string }) =>
      resolveEscalationProvider(escalationId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "escalations"] });
    },
  });
}

export function useLeadsQuery(
  page = 1,
  limit = 20,
  filters?: {
    customerId?: string;
    search?: string;
    lifecycleStatus?: string;
  }
) {
  return useQuery({
    queryKey: ["leads", "list", page, limit, filters],
    queryFn: () => getLeadsProvider(page, limit, filters),
    staleTime: 60 * 1000,
  });
}

export function useCustomerLeadsQuery(customerId: string) {
  return useQuery({
    queryKey: ["leads", "customer", customerId],
    queryFn: () => getCustomerLeadsProvider(customerId),
    staleTime: 60 * 1000,
    enabled: Boolean(customerId),
  });
}

export function useImportLeadsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { csv: string }) => importLeadsProvider(data.csv),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useTerminatedLeadsQuery(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ["leads", "terminated", page, limit, search],
    queryFn: () => getTerminatedLeadsProvider(page, limit, search),
    staleTime: 60 * 1000,
  });
}

export function useAssignLeadSalesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, employeeId }: { leadId: string; employeeId: string }) =>
      assignLeadSalesProvider(leadId, employeeId),
    onSuccess: (_, { leadId }) => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useLeadDetailQuery(leadId: string) {
  return useQuery({
    queryKey: ["leads", "detail", leadId],
    queryFn: () => getLeadDetailProvider(leadId),
    enabled: Boolean(leadId),
    staleTime: 60 * 1000,
  });
}

export function useChatHistoryQuery(leadId: string, enabled = true) {
  return useQuery({
    queryKey: ["chat", "history", leadId],
    queryFn: () => getChatHistoryProvider(leadId),
    enabled: Boolean(leadId) && enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeadScoringQuery(
  page = 1,
  limit = 20,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    client?: string;
  }
) {
  return useQuery({
    queryKey: ["leads", "scoring", page, limit, filters],
    queryFn: () => getLeadScoringProvider(page, limit, filters),
    staleTime: 60 * 1000,
  });
}

export function useLeadDocumentsQuery(leadId: string) {
  return useQuery({
    queryKey: ["lead", "documents", leadId],
    queryFn: () => getLeadDocumentsProvider(leadId),
    enabled: Boolean(leadId),
    staleTime: 60 * 1000,
  });
}

export function useUpdateLeadTemperatureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, temperature }: { leadId: string; temperature: string }) =>
      updateLeadTemperatureProvider(leadId, temperature),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "scoring"] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
    },
  });
}

export function useExportLeadsMutation() {
  return useMutation({
    mutationFn: () => exportLeadsProvider(),
  });
}

export function useGetActivityLogQuery(params: GetActivityLogParams) {
  return useQuery({
    queryKey: ["leads", "followups", "activityLog", params],
    queryFn: () => getActivityLogProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useGetLeadBudgetQuery(leadId: string) {
  return useQuery({
    queryKey: ["leads", "budget", leadId],
    queryFn: () => getLeadBudgetProvider(leadId),
    enabled: Boolean(leadId),
  });
}

export function useUpdateLeadBudgetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: LeadBudgetPayload }) =>
      updateLeadBudgetProvider(leadId, payload),
    onSuccess: (_, { leadId }) => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "budget", leadId] });
    },
  });
}

export function useGetLeadTimelineQuery(leadId: string, params?: { dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ["leads", "timeline", leadId, params],
    queryFn: () => getLeadTimelineProvider(leadId, params),
    enabled: Boolean(leadId),
  });
}

export function useTerminateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: TerminateLeadPayload }) =>
      terminateLeadProvider(leadId, payload),
    onSuccess: (_, { leadId }) => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "detail", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => deleteLeadProvider(leadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeadPayload) => createLeadProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUploadLeadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      files,
      type,
    }: {
      leadId: string;
      files: File[];
      type: "bom" | "drawing" | "other";
    }) => uploadLeadDocumentProvider(leadId, files, type),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["leads", "documents", variables.leadId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["leads", "detail", variables.leadId],
      });
    },
  });
}


type LeadRecord = {
  _id: string;
  [key: string]: unknown;
};

type LeadsAdminListResponse = {
  data?: {
    leads?: LeadRecord[];
    total?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function useAdminLeadsQuery(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: ["leads", "admin", "list", filters],
    queryFn: () => getAdminLeadsProvider(filters),
    staleTime: 60 * 1000,
  });
}

export function useAdminLeadsStatsQuery(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["leads", "admin", "stats", startDate, endDate],
    queryFn: () => getLeadsStatsProvider(startDate, endDate),
    staleTime: 60 * 1000,
  });
}

export function useLeadsSocketSync() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpsert = ({ lead }: { lead: LeadRecord }) => {
      queryClient.setQueriesData({ queryKey: ["leads", "admin", "list"] }, (oldData: unknown) => {
        const typedData = oldData as LeadsAdminListResponse | undefined;
        if (!typedData?.data?.leads) return oldData;
        const list = typedData.data.leads;
        const idx = list.findIndex((x) => String(x._id) === String(lead._id));

        let nextList = [...list];
        if (idx === -1) {
          nextList = [lead, ...nextList];
        } else {
          nextList[idx] = lead;
        }

        return {
          ...typedData,
          data: {
            ...typedData.data,
            leads: nextList,
          },
        };
      });
    };

    socket.on("lead_list_created", handleUpsert);
    socket.on("lead_list_updated", handleUpsert);

    return () => {
      socket.off("lead_list_created", handleUpsert);
      socket.off("lead_list_updated", handleUpsert);
    };
  }, [socket, queryClient]);
}

