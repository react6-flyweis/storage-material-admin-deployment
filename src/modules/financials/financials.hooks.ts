import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWipProfitsProvider,
  exportWipProfitsProvider,
  getExpensesFiltersProvider,
  getExpensesProvider,
  getExpenseCategoriesProvider,
  createExpenseCategoryProvider,
  getMonthlyExpensesSummaryProvider,
  getExpensesByCategoryProvider,
  getBudgetVsActualTrendProvider,
  createExpenseProvider,
  addWipPaymentProvider,
  getProfitLossProvider,
  getFreightCostTrackingProvider,
  getMarginAnalysisProvider,
  type GetWipProfitsParams,
  type CreateExpenseCategoryPayload,
  type CreateExpensePayload,
  type AddWipPaymentPayload,
} from "./financials.api";




export function useWipProfitsQuery(params?: GetWipProfitsParams) {
  return useQuery({
    queryKey: ["financials", "wip-profits", params],
    queryFn: () => getWipProfitsProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useExportWipProfitsMutation() {
  return useMutation({
    mutationFn: (params?: { clientId?: string }) => exportWipProfitsProvider(params),
  });
}

export function useExpensesFiltersQuery() {
  return useQuery({
    queryKey: ["financials", "expenses-filters"],
    queryFn: getExpensesFiltersProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesQuery(params?: import("./financials.api").GetExpensesParams) {
  return useQuery({
    queryKey: ["financials", "expenses", params],
    queryFn: () => getExpensesProvider(params),
    staleTime: 60 * 1000,
  });
}

export function useExpenseCategoriesQuery() {
  return useQuery({
    queryKey: ["financials", "expense-categories"],
    queryFn: getExpenseCategoriesProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateExpenseCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) =>
      createExpenseCategoryProvider(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financials", "expense-categories"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "expenses-filters"] });
    },
  });
}

export function useMonthlyExpensesSummaryQuery() {
  return useQuery({
    queryKey: ["financials", "monthly-expenses-summary"],
    queryFn: getMonthlyExpensesSummaryProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesByCategoryQuery() {
  return useQuery({
    queryKey: ["financials", "expenses-by-category"],
    queryFn: getExpensesByCategoryProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBudgetVsActualTrendQuery() {
  return useQuery({
    queryKey: ["financials", "budget-vs-actual-trend"],
    queryFn: getBudgetVsActualTrendProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpenseProvider(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financials", "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "expenses-filters"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "monthly-expenses-summary"] });
      queryClient.invalidateQueries({ queryKey: ["financials", "expenses-by-category"] });
    },
  });
}

export function useAddWipPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: string;
      payload: AddWipPaymentPayload;
    }) => addWipPaymentProvider(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financials", "wip-profits"] });
    },
  });
}

export function useProfitLossQuery() {
  return useQuery({
    queryKey: ["financials", "profit-loss"],
    queryFn: getProfitLossProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFreightCostTrackingQuery() {
  return useQuery({
    queryKey: ["financials", "freight-cost-tracking"],
    queryFn: getFreightCostTrackingProvider,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarginAnalysisQuery() {
  return useQuery({
    queryKey: ["financials", "margin-analysis"],
    queryFn: getMarginAnalysisProvider,
    staleTime: 5 * 60 * 1000,
  });
}










