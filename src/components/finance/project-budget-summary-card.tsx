import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const summaryRows = [
  ["Total Budget", "$1,245,360.00", "text-slate-700"],
  ["Total Actual", "$1,245,360.00", "text-slate-700"],
  ["Total Variance", "$1,245,360.00", "text-rose-500"],
  ["% of Budget Used", "$1,245,360.00", "text-slate-700"],
] as const;

export function ProjectBudgetSummaryCard() {
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
            <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[12px] font-medium text-rose-500">
              Over Budget
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}