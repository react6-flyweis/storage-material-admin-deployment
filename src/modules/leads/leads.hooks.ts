import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/utils/socketContextProvider";
import { apiClient } from "@/modules/auth/auth.api";
import {
  getLeadsProvider,
  getCustomerLeadsProvider,
  importLeadsProvider,
  importLeadsFileProvider,
  getLeadImportJobStatusProvider,
  type ImportLeadsFileOptions,
  type LeadImportJobData,
  type ImportLeadsSyncData,
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
  updateLeadBudgetCategoryProvider,
  addLeadBudgetCustomLineProvider,
  updateLeadBudgetCustomLineProvider,
  deleteLeadBudgetCustomLineProvider,
  getLeadTimelineProvider,
  type GetActivityLogParams,
  type LeadBudgetPayload,
  type CustomBudgetLine,
  type PlanningCard,
  type LeadBudgetData,
  type UpdateLeadBudgetCategoryPayload,
  type AddCustomLinePayload,
  type UpdateCustomLinePayload,
  terminateLeadProvider,
  type TerminateLeadPayload,
  deleteLeadProvider,
  createLeadProvider,
  type CreateLeadPayload,
  uploadLeadDocumentProvider,
  getAdminLeadsProvider,
  getLeadsStatsProvider,
  getArchivedLeadsProvider,
  archiveLeadProvider,
  unarchiveLeadProvider,
  type GetArchivedLeadsParams,
} from "./leads.api";

export type {
  CustomBudgetLine,
  LeadBudgetPayload,
  PlanningCard,
  LeadBudgetData,
  UpdateLeadBudgetCategoryPayload,
  AddCustomLinePayload,
  UpdateCustomLinePayload,
};

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
  projectName?: string;
  businessUnit?: string | null;
  businessUnitLabel?: string;
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
    businessUnit?: string;
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

const IMPORT_JOB_STORAGE_KEY = "admin_lead_import_job_id";

export type UseLeadImportState = {
  isUploading: boolean;
  isPolling: boolean;
  jobId: string | null;
  jobData: LeadImportJobData | null;
  syncData: ImportLeadsSyncData | null;
  status: "idle" | "uploading" | "polling" | "completed" | "failed";
  error: string | null;
};

export function useLeadImport() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(IMPORT_JOB_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [jobData, setJobData] = useState<LeadImportJobData | null>(null);
  const [syncData, setSyncData] = useState<ImportLeadsSyncData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePollingRef = useRef<boolean>(false);

  const clearSessionJob = useCallback(() => {
    try {
      sessionStorage.removeItem(IMPORT_JOB_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const saveSessionJob = useCallback((id: string) => {
    try {
      sessionStorage.setItem(IMPORT_JOB_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const refreshLeadsData = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["leads"] });
  }, [queryClient]);

  const pollJob = useCallback(
    async (targetJobId: string) => {
      activePollingRef.current = true;
      while (activePollingRef.current) {
        try {
          const res = await getLeadImportJobStatusProvider(targetJobId);
          if (res.success && res.data) {
            const data = res.data;
            setJobData(data);

            if (data.status === "completed") {
              clearSessionJob();
              activePollingRef.current = false;
              refreshLeadsData();
              return data;
            }

            if (data.status === "failed") {
              clearSessionJob();
              activePollingRef.current = false;
              setError(data.errorMessage || "Lead import job failed.");
              return data;
            }
          }
        } catch (err: unknown) {
          const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
          if (axiosErr.response?.status === 404) {
            clearSessionJob();
            setJobId(null);
            activePollingRef.current = false;
            setError("Previous import job not found or has expired.");
            return null;
          }
        }

        if (!activePollingRef.current) break;
        await new Promise((r) => setTimeout(r, 2500));
      }
      return null;
    },
    [clearSessionJob, refreshLeadsData]
  );

  useEffect(() => {
    if (jobId && !activePollingRef.current) {
      void pollJob(jobId);
    }

    return () => {
      activePollingRef.current = false;
    };
  }, [jobId, pollJob]);

  const startImport = useCallback(
    async (file: File, options?: ImportLeadsFileOptions) => {
      setError(null);
      setSyncData(null);
      setJobData(null);
      setIsUploading(true);

      try {
        const response = await importLeadsFileProvider(file, options);
        setIsUploading(false);

        if (!response.success) {
          throw new Error(response.message || "Failed to start import");
        }

        const data = response.data;

        if (data.async && data.jobId) {
          setJobId(data.jobId);
          saveSessionJob(data.jobId);
          setJobData(data);

          if (data.status === "completed") {
            clearSessionJob();
            refreshLeadsData();
            return { mode: "async" as const, data };
          }

          void pollJob(data.jobId);
          return { mode: "async" as const, data };
        }

        setSyncData(data);
        refreshLeadsData();
        return { mode: "sync" as const, data };
      } catch (err: unknown) {
        setIsUploading(false);
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = axiosErr.response?.data?.message || axiosErr.message || "Failed to import leads.";
        setError(msg);
        throw err;
      }
    },
    [clearSessionJob, pollJob, refreshLeadsData, saveSessionJob]
  );

  const resetImport = useCallback(() => {
    activePollingRef.current = false;
    clearSessionJob();
    setJobId(null);
    setJobData(null);
    setSyncData(null);
    setError(null);
    setIsUploading(false);
  }, [clearSessionJob]);

  let status: "idle" | "uploading" | "polling" | "completed" | "failed" = "idle";
  if (isUploading) {
    status = "uploading";
  } else if (jobData) {
    if (jobData.status === "completed") status = "completed";
    else if (jobData.status === "failed") status = "failed";
    else status = "polling";
  } else if (syncData) {
    status = "completed";
  } else if (error) {
    status = "failed";
  }

  return {
    startImport,
    resetImport,
    status,
    isUploading,
    isPolling: status === "polling",
    jobId,
    jobData,
    syncData,
    error,
  };
}

export function useTerminatedLeadsQuery(
  page = 1,
  limit = 20,
  search?: string,
  businessUnit?: string,
) {
  return useQuery({
    queryKey: ["leads", "terminated", page, limit, search, businessUnit],
    queryFn: () => getTerminatedLeadsProvider(page, limit, search, businessUnit),
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
    businessUnit?: string;
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
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "scoring"] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["followups"] });
      if (variables?.leadId) {
        void queryClient.invalidateQueries({ queryKey: ["leads", "detail", variables.leadId] });
        void queryClient.invalidateQueries({ queryKey: ["lead", "detail", variables.leadId] });
      }
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
      void queryClient.invalidateQueries({ queryKey: ["leads", "detail", leadId] });
    },
  });
}

export function useUpdateLeadBudgetCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      categoryKey,
      payload,
    }: {
      leadId: string;
      categoryKey: string;
      payload: UpdateLeadBudgetCategoryPayload;
    }) => updateLeadBudgetCategoryProvider(leadId, categoryKey, payload),
    onSuccess: (_, { leadId }) => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "budget", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "detail", leadId] });
    },
  });
}

export function useAddLeadBudgetCustomLineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: string;
      payload: AddCustomLinePayload;
    }) => addLeadBudgetCustomLineProvider(leadId, payload),
    onSuccess: (_, { leadId }) => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "budget", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "detail", leadId] });
    },
  });
}

export function useUpdateLeadBudgetCustomLineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      lineKey,
      payload,
    }: {
      leadId: string;
      lineKey: string;
      payload: UpdateCustomLinePayload;
    }) => updateLeadBudgetCustomLineProvider(leadId, lineKey, payload),
    onSuccess: (_, { leadId }) => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "budget", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "detail", leadId] });
    },
  });
}

export function useDeleteLeadBudgetCustomLineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      lineKey,
    }: {
      leadId: string;
      lineKey: string;
    }) => deleteLeadBudgetCustomLineProvider(leadId, lineKey),
    onSuccess: (_, { leadId }) => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "budget", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "detail", leadId] });
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

export function useAdminLeadsQuery(
  filters: Record<string, unknown>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["leads", "admin", "list", filters],
    queryFn: () => getAdminLeadsProvider(filters),
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

// Query hook for archived leads
export function useArchivedLeadsQuery(
  params: GetArchivedLeadsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["leads", "archived", params],
    queryFn: () => getArchivedLeadsProvider(params),
    enabled: options?.enabled ?? true,
  });
}

// Mutation hook to archive lead
export function useArchiveLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, reason }: { leadId: string; reason?: string }) =>
      archiveLeadProvider(leadId, { reason }),
    onSuccess: (response, variables) => {
      if (!response.success) return;

      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["lead"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (variables?.leadId) {
        void queryClient.invalidateQueries({
          queryKey: ["leads", "detail", variables.leadId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["lead", "detail", variables.leadId],
        });
      }
    },
  });
}

// Mutation hook to unarchive/restore lead
export function useUnarchiveLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId }: { leadId: string }) =>
      unarchiveLeadProvider(leadId),
    onSuccess: (response, variables) => {
      if (!response.success) return;

      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["lead"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (variables?.leadId) {
        void queryClient.invalidateQueries({
          queryKey: ["leads", "detail", variables.leadId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["lead", "detail", variables.leadId],
        });
      }
    },
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

