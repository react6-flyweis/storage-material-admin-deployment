import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { ProfitLossExpenseBreakdown } from "../financials.api";

interface ProfitLossExpenseBreakdownChartProps {
  expenseBreakdown?: ProfitLossExpenseBreakdown;
  totalExpenses?: number;
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
};

export default function ProfitLossExpenseBreakdownChart({
  expenseBreakdown,
  totalExpenses,
}: ProfitLossExpenseBreakdownChartProps) {
  const total = expenseBreakdown?.totalExpenses ?? totalExpenses ?? 0;

  const breakdownData = [
    {
      name: "Direct Costs",
      value: expenseBreakdown?.directCosts ?? 0,
      color: "#3b82f6",
      percentage: total ? Number(((expenseBreakdown?.directCosts ?? 0) / total * 100).toFixed(2)) : 0,
    },
    {
      name: "Indirect Costs",
      value: expenseBreakdown?.indirectCosts ?? 0,
      color: "#10b981",
      percentage: total ? Number(((expenseBreakdown?.indirectCosts ?? 0) / total * 100).toFixed(2)) : 0,
    },
    {
      name: "Administrative Expenses",
      value: expenseBreakdown?.administrativeExpenses ?? 0,
      color: "#8b5cf6",
      percentage: total
        ? Number(((expenseBreakdown?.administrativeExpenses ?? 0) / total * 100).toFixed(2))
        : 0,
    },
    {
      name: "Other Expenses",
      value: expenseBreakdown?.otherExpenses ?? 0,
      color: "#f97316",
      percentage: total ? Number(((expenseBreakdown?.otherExpenses ?? 0) / total * 100).toFixed(2)) : 0,
    },
  ];

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          Expense Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-full h-50 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {breakdownData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total</span>
            <span className="text-sm font-bold text-slate-900 leading-tight">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="flex flex-col gap-2 text-xs">
          {breakdownData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600">{item.name}</span>
              <span className="ml-auto font-semibold text-slate-900">
                {formatCurrency(item.value)}
              </span>
              <span className="text-slate-400">({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
