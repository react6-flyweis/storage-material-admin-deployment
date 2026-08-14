import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
// import { MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type IncomeExpenseTrendItem = {
  name: string;
  income: number;
  expenses: number;
};

interface IncomeVsExpenseTrendChartProps {
  totalRevenue?: number;
  totalExpenses?: number;
  trendData?: { date: string; income: number; expense: number }[];
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
};

const formatNumberDisplay = (val?: number, fallback: string = "-") => {
  if (val === undefined || val === null) return fallback;
  if (val >= 1000) {
    return `${(val / 1000).toFixed(0)}k`;
  }
  return val.toString();
};

export default function IncomeVsExpenseTrendChart({
  totalRevenue,
  totalExpenses,
  trendData = [],
}: IncomeVsExpenseTrendChartProps) {
  const [activeTab, setActiveTab] = useState<"income" | "expenses">("income");

  const activeData: IncomeExpenseTrendItem[] = trendData.map((item) => ({
    name: item.date ? item.date.slice(5) : "",
    income: item.income,
    expenses: item.expense,
  }));

  const computedTotalIncome =
    totalRevenue ??
    (activeData.length > 0
      ? activeData.reduce((acc, curr) => acc + (curr.income || 0), 0)
      : undefined);
  const computedTotalExpenses =
    totalExpenses ??
    (activeData.length > 0
      ? activeData.reduce((acc, curr) => acc + (curr.expenses || 0), 0)
      : undefined);

  return (
    <Card className="">
      {/* Top Header */}
      <CardHeader className="flex items-center justify-between ">
        <h2 className="text-[16px] font-bold text-slate-900">
          Income vs Expense Trend
        </h2>
        {/* <button
          type="button"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button> */}
      </CardHeader>

      <CardContent className="">
        {/* Highlight Tabs */}
        <div className="mb-6 flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`group relative flex flex-col justify-between px-5 py-3 text-left transition-all ${activeTab === "income"
              ? "bg-blue-50/50"
              : "bg-transparent hover:bg-slate-50"
              }`}
          >
            <span
              className={`text-xl font-bold transition-colors ${activeTab === "income" ? "text-blue-600" : "text-slate-900"
                }`}
            >
              {totalRevenue !== undefined
                ? formatCurrency(totalRevenue)
                : formatNumberDisplay(computedTotalIncome, "-")}
            </span>
            <span
              className={`text-xs font-semibold ${activeTab === "income" ? "text-blue-600" : "text-slate-500"
                }`}
            >
              Income
            </span>
            {activeTab === "income" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-blue-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`group relative flex flex-col justify-between px-5 py-3 text-left transition-all ${activeTab === "expenses"
              ? "bg-orange-50/50"
              : "bg-transparent hover:bg-slate-50"
              }`}
          >
            <span
              className={`text-xl font-bold transition-colors ${activeTab === "expenses" ? "text-orange-500" : "text-slate-900"
                }`}
            >
              {totalExpenses !== undefined
                ? formatCurrency(totalExpenses)
                : formatNumberDisplay(computedTotalExpenses, "-")}
            </span>
            <span
              className={`text-xs font-semibold ${activeTab === "expenses" ? "text-orange-500" : "text-slate-500"
                }`}
            >
              Expenses
            </span>
            {activeTab === "expenses" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-orange-500" />
            )}
          </button>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "12px" }}
              tickFormatter={(value) =>
                value >= 1000 ? `${value / 1000}k` : `${value}`
              }
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            />
            <Line
              type="linear"
              dataKey="income"
              stroke={activeTab === "income" ? "#2563eb" : "#ffedd5"}
              strokeWidth={activeTab === "income" ? 3.5 : 2.5}
              dot={false}
              activeDot={
                activeTab === "income" ? { r: 5, fill: "#2563eb" } : false
              }
            />
            <Line
              type="linear"
              dataKey="expenses"
              stroke={activeTab === "expenses" ? "#f97316" : "#ffedd5"}
              strokeWidth={activeTab === "expenses" ? 3.5 : 2.5}
              dot={false}
              activeDot={
                activeTab === "expenses" ? { r: 5, fill: "#f97316" } : false
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
