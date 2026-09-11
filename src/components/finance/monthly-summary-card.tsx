import { Loader2 } from "lucide-react";
import { useMonthlyExpensesSummaryQuery } from "@/modules/financials/financials.hooks";

export function MonthlySummaryCard() {
  const { data, isLoading, isError } = useMonthlyExpensesSummaryQuery();

  const summary = data?.data;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">Monthly Summary</h3>
        {isLoading ? (
          <div className="mt-1 h-5 w-24 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="mt-1 text-sm font-medium text-slate-600">
            {summary?.month || "-"}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
        </div>
      ) : isError ? (
        <div className="py-6 text-center text-sm text-red-500">
          Failed to load monthly summary data.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-sm font-medium text-slate-700">Total Expenses</span>
            <span className="font-semibold text-slate-900">
              ${(summary?.totalExpenses ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {summary?.categories?.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between border-b border-slate-100 pb-2"
            >
              <span className="text-sm text-slate-600">{item.category}</span>
              <span className="font-semibold text-slate-900">
                ${item.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

