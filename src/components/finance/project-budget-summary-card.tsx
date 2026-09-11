import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetVsActualSummary } from "@/modules/financials/financials.api";

interface ProjectBudgetSummaryCardProps {
  summary?: BudgetVsActualSummary;
}

function formatCurrency(val?: number) {
  if (val === undefined || val === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(val);
}

function formatPercent(val?: number) {
  if (val === undefined || val === null) return "-";
  return `${val.toFixed(2)}%`;
}

export function ProjectBudgetSummaryCard({ summary }: ProjectBudgetSummaryCardProps) {
  const status = summary?.status ?? "Under Budget";
  const isOver = status.toLowerCase().includes("over");

  const summaryRows = [
    ["Total Budget", formatCurrency(summary?.totalBudget), "text-slate-700"],
    ["Total Actual", formatCurrency(summary?.totalActual), "text-slate-700"],
    ["Total Variance", formatCurrency(summary?.totalVariance), isOver ? "text-rose-500" : "text-emerald-500"],
    ["% of Budget Used", formatPercent(summary?.budgetUsedPct), "text-slate-700"],
  ] as const;

  return (
    <Card className="rounded-3xl border-slate-200 p-0 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <CardHeader className="border-b border-slate-200 px-4 py-3">
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          Project Budget Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0 py-0">
        <div className="divide-y divide-slate-200 text-[12px]">
          {summaryRows.map(([label, value, valueTone]) => (
            <div key={label} className="flex items-center justify-between px-4 py-4">
              <span className="text-slate-600">{label}</span>
              <span className={`font-semibold ${valueTone}`}>{value}</span>
            </div>
          ))}

          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-slate-600">Status</span>
            <span
              className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[12px] font-medium ${
                isOver
                  ? "border-rose-200 bg-rose-50 text-rose-500"
                  : "border-emerald-200 bg-emerald-50 text-emerald-500"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}