import { useBudgetVsActualTrendQuery } from "@/modules/financials/financials.hooks";
import { Loader2 } from "lucide-react";

export function BudgetVsActualChart() {
  const { data: response, isLoading, isError } = useBudgetVsActualTrendQuery();
  const trendData = response?.data;

  const totalBudget = trendData?.totalBudget ?? 0;
  const variancePct = trendData?.variancePct ?? 0;
  const trend = trendData?.trend || [];

  // Filter/slice to show only this quarter (last 3 months)
  const currentQuarterTrend = trend.slice(-3);

  const maxValue = Math.max(
    1,
    ...currentQuarterTrend.flatMap((item) => [item.budget, item.actual])
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Budget VS Actual</h3>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-violet-600"></div>
              <span className="text-slate-600">Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-purple-400"></div>
              <span className="text-slate-600">Actual</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-600">Total Budget</p>
          <p className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
            ${totalBudget.toLocaleString()}
            <span
              className={`text-sm ${
                variancePct >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {variancePct > 0 ? `+${variancePct}% ↑` : `${variancePct}% ↓`}
            </span>
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-44 w-full items-center justify-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600 mr-2" />
            <span>Loading budget trend...</span>
          </div>
        ) : isError ? (
          <div className="flex h-44 w-full items-center justify-center text-sm text-red-500">
            Failed to load budget vs actual trend
          </div>
        ) : currentQuarterTrend.length === 0 ? (
          <div className="flex h-44 w-full items-center justify-center text-sm text-slate-500">
            No trend data available
          </div>
        ) : (
          /* Bar Chart */
          <div className="flex items-end justify-between gap-2 px-2 pt-4 h-48">
            {currentQuarterTrend.map((item, index) => {
              const budgetHeight = Math.max(4, (item.budget / maxValue) * 140);
              const actualHeight = Math.max(4, (item.actual / maxValue) * 140);

              return (
                <div key={item.month || index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex items-end gap-1 h-36">
                    <div
                      className="w-3 sm:w-4 rounded-sm bg-violet-600 transition-all hover:opacity-80"
                      style={{ height: `${budgetHeight}px` }}
                      title={`Budget: $${item.budget.toLocaleString()}`}
                    ></div>
                    <div
                      className="w-3 sm:w-4 rounded-sm bg-purple-400 transition-all hover:opacity-80"
                      style={{ height: `${actualHeight}px` }}
                      title={`Actual: $${item.actual.toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{item.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
