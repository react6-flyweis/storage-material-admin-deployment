import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import type { FinancialOverviewIncomeVsExpenseTrendItem } from "@/modules/financials/financials.api";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type IncomeVsExpenseChartProps = {
  data?: FinancialOverviewIncomeVsExpenseTrendItem[];
  isLoading?: boolean;
};

export function IncomeVsExpenseChart({ data = [], isLoading = false }: IncomeVsExpenseChartProps) {
  const chartData = data.map((item) => ({
    month: `${MONTH_NAMES[(item.month - 1) % 12]} ${item.year}`,
    income: item.income,
    expense: item.expense,
  }));

  return (
    <Card className="rounded">
      <CardHeader className="border-b">
        <CardTitle className="text-sm">Income VS Expense</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            <Calendar className="size-3" />
            Monthly
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ede9fe]" /> Income
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6d28d9]" /> Expense
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-[270px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar
                  dataKey="income"
                  fill="#ede9fe"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={18}
                />
                <Bar
                  dataKey="expense"
                  fill="#6d28d9"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

