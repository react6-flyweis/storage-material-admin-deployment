import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  BudgetVsActualCostHeadItem,
  BudgetVsActualSummary,
} from "@/modules/financials/financials.api";

export interface BudgetRowItem {
  head: string;
  status: string;
  tone: "over" | "under";
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

function StatusPill({
  tone,
  children,
}: {
  tone: "over" | "under";
  children: string;
}) {
  const classes =
    tone === "over"
      ? "border-rose-200 bg-rose-50 text-rose-500"
      : "border-emerald-200 bg-emerald-50 text-emerald-500";

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[12px] font-medium ${classes}`}
    >
      {children}
    </span>
  );
}

interface BudgetActualTableProps {
  costHeads?: BudgetVsActualCostHeadItem[];
  summary?: BudgetVsActualSummary;
}

export function BudgetActualTable({ costHeads = [], summary }: BudgetActualTableProps) {
  const totalBudget = summary?.totalBudget ?? 0;
  const totalActual = summary?.totalActual ?? 0;
  const totalVariance = summary?.totalVariance ?? 0;
  const totalVariancePct = summary?.budgetUsedPct ?? 0;
  const totalStatus = summary?.status ?? "Under Budget";
  const totalTone = totalStatus.toLowerCase().includes("over") ? "over" : "under";

  return (
    <Card className="">
      <CardHeader className="border-b ">
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          Budget VS Actual by Cost Head
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table className="min-w-225">
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-100/90 hover:bg-slate-100">
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-slate-600">
                Cost Head
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-slate-600">
                Budget (USD)
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-slate-600">
                Actual (USD)
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-slate-600">
                Variance
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-slate-600">
                Variance %
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-slate-600">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costHeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No cost head data available.
                </TableCell>
              </TableRow>
            ) : (
              costHeads.map((item) => {
                const tone = item.status?.toLowerCase().includes("over") ? "over" : "under";
                return (
                  <TableRow
                    key={item.head}
                    className="border-slate-200 hover:bg-transparent"
                  >
                    <TableCell className="px-4 py-4 text-[12px] font-medium text-slate-700">
                      {item.head}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-[12px] text-slate-500">
                      {formatCurrency(item.budget)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-[12px] text-slate-500">
                      {formatCurrency(item.actual)}
                    </TableCell>
                    <TableCell
                      className={`px-4 py-4 text-[12px] font-medium ${tone === "over" ? "text-rose-500" : "text-emerald-500"
                        }`}
                    >
                      {formatCurrency(item.variance)}
                    </TableCell>
                    <TableCell
                      className={`px-4 py-4 text-[12px] font-medium ${tone === "over" ? "text-rose-500" : "text-emerald-500"
                        }`}
                    >
                      {formatPercent(item.variancePct)}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusPill tone={tone}>{item.status || "Under Budget"}</StatusPill>
                    </TableCell>
                  </TableRow>
                );
              })
            )}

            <TableRow className="border-slate-200 bg-[#fdf1e9] hover:bg-[#fdf1e9]">
              <TableCell className="px-4 py-4 text-[12px] font-semibold text-slate-700">
                Total
              </TableCell>
              <TableCell className="px-4 py-4 text-[12px] text-slate-500">
                {formatCurrency(totalBudget)}
              </TableCell>
              <TableCell className="px-4 py-4 text-[12px] text-slate-500">
                {formatCurrency(totalActual)}
              </TableCell>
              <TableCell className={`px-4 py-4 text-[12px] font-medium ${totalTone === "over" ? "text-rose-500" : "text-emerald-500"}`}>
                {formatCurrency(totalVariance)}
              </TableCell>
              <TableCell className={`px-4 py-4 text-[12px] font-medium ${totalTone === "over" ? "text-rose-500" : "text-emerald-500"}`}>
                {formatPercent(totalVariancePct)}
              </TableCell>
              <TableCell className="px-4 py-4">
                <StatusPill tone={totalTone}>{totalStatus}</StatusPill>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

