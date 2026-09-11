import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetVsActualSummary } from "@/modules/financials/financials.api";

interface BudgetActualOverviewCardProps {
  summary?: BudgetVsActualSummary;
}

function formatCurrency(val?: number) {
  if (val === undefined || val === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

export function BudgetActualOverviewCard({ summary }: BudgetActualOverviewCardProps) {
  const actual = summary?.totalActual ?? 0;
  const budget = summary?.totalBudget ?? 0;
  const remaining = Math.max(0, budget - actual);
  const total = budget > 0 ? budget : actual > 0 ? actual : 1;

  const actualPct = Math.min(100, Math.round((actual / total) * 100));
  const remainingPct = 100 - actualPct;

  return (
    <Card className="rounded-3xl border-slate-200 p-0 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <CardHeader className="border-b border-slate-200 px-4 py-3">
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          Budget VS Actual Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-5">
          <div
            className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#f97316 0 ${actualPct}%, #0f4c5c ${actualPct}% 100%)`,
            }}
          >
            <div className="h-20 w-20 rounded-full bg-white" />
          </div>

          <div className="space-y-4 text-[12px] text-slate-700">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#f97316]" />
              <div>
                <div className="font-semibold text-slate-900">Actual (USD)</div>
                <div className="text-slate-500">
                  {formatCurrency(actual)} ({actualPct}%)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0f4c5c]" />
              <div>
                <div className="font-semibold text-slate-900">
                  Remaining (USD)
                </div>
                <div className="text-slate-500">
                  {formatCurrency(remaining)} ({remainingPct}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}