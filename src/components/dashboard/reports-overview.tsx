import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useState } from "react";

const overviewChartConfig = {
  customers: {
    label: "Customers",
    color: "#2563EB",
  },
  revenue: {
    label: "Revenue",
    color: "#F97316",
  },
  income: {
    label: "Income",
    color: "#10B981",
  },
  expense: {
    label: "Expense",
    color: "#EF4444",
  },
} satisfies ChartConfig;

type Period = "Today" | "Week" | "Month";

import EmptyState from "@/components/ui/empty-state";
import { TrendingUp } from "lucide-react";

type OverviewDataPoint = {
  day: string;
  customers: number;
  revenue: number;
  income: number;
  expense: number;
};

type SummaryStat = {
  label: string;
  value: number;
  emphasis: string;
  accentClass: string;
  highlight: boolean;
  accentBorder: string;
};

type Props = {
  period?: Period;
  data?: OverviewDataPoint[];
  summaryStats?: SummaryStat[];
};

const defaultSummaryStats: SummaryStat[] = [
  {
    label: "Customers",
    value: 0,
    emphasis: "Customers",
    accentClass: "text-blue-600",
    highlight: true,
    accentBorder: "bg-gradient-to-r from-blue-500 to-sky-400",
  },
  {
    label: "Revenue",
    value: 0,
    emphasis: "Revenue",
    accentClass: "text-orange-500",
    highlight: false,
    accentBorder: "bg-orange-200/80",
  },
  {
    label: "Income",
    value: 0,
    emphasis: "Income",
    accentClass: "text-emerald-600",
    highlight: false,
    accentBorder: "bg-emerald-200/80",
  },
  {
    label: "Expense",
    value: 0,
    emphasis: "Expense",
    accentClass: "text-rose-500",
    highlight: false,
    accentBorder: "bg-rose-200/80",
  },
];

export default function ReportsOverview({
  data = [],
  summaryStats = defaultSummaryStats,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const overviewData = data;

  const handleToggle = (key: string) => {
    setSelected((s) => (s === key ? null : key));
  };

  return (
    <Card className="h-full border border-slate-100 p-6 shadow-sm gap-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-900">
          Reports & Overview
        </h2>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400">Overview</p>
          </div>
        </div>
      </div>

      <div className="mt-1 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => {
          const key = stat.label.toLowerCase();
          const isSelected =
            selected === null ? stat.highlight : selected === key;
          return (
            <div
              key={stat.label}
              role="button"
              tabIndex={0}
              onClick={() => handleToggle(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle(key);
                }
              }}
              className={cn(
                "bg-white/80 p-2 shadow-[0_10px_40px_rgba(15,23,42,0.05)] cursor-pointer transition-all",
                isSelected
                  ? "border-blue-100 bg-linear-to-br from-white to-blue-50"
                  : "border-slate-100 hover:border-slate-200 opacity-70"
              )}
            >
              <div className="mt-1 flex flex-col gap-1">
                <span
                  className={cn(
                    "text-2xl font-semibold leading-none",
                    stat.accentClass
                  )}
                >
                  {stat.value}
                </span>
                <span className={cn("text-sm font-semibold", stat.accentClass)}>
                  {stat.emphasis}
                </span>
              </div>
              <div
                className={cn(
                  "mt-2 h-1 rounded-full",
                  isSelected ? stat.accentBorder : "bg-slate-100"
                )}
              />
            </div>
          );
        })}
      </div>

      {overviewData.length === 0 ? (
        <EmptyState
          title="No overview data"
          description="No financial or customer trends recorded for this period."
          icon={TrendingUp}
        />
      ) : (

      <div className="mt-2">
        <ChartContainer
          config={overviewChartConfig}
          className="h-52 w-full border-0 bg-transparent p-0 shadow-none"
        >
          <LineChart
            data={overviewData}
            margin={{ left: 12, right: 12, top: 12 }}
          >
            <CartesianGrid
              strokeDasharray="6 8"
              stroke="#E2E8F0"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#A0AEC0", fontSize: 13, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}k`}
              tickMargin={12}
              tick={{ fill: "#A0AEC0", fontSize: 12, fontWeight: 600 }}
              width={48}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  className="rounded-2xl border border-slate-200 bg-white/95"
                />
              }
              cursor={{ stroke: "#BFDBFE", strokeDasharray: "4 6" }}
            />
            {/* Customers (primary) */}

            <Line
              dataKey="customers"
              stroke="var(--color-customers)"
              strokeWidth={4}
              strokeOpacity={
                selected === "customers" || selected === null ? 1 : 0.12
              }
              dot={false}
            />

            <Line
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={3}
              strokeOpacity={selected === "revenue" ? 1 : 0.12}
              dot={false}
            />

            <Line
              dataKey="income"
              stroke="var(--color-income)"
              strokeWidth={3}
              strokeOpacity={selected === "income" ? 1 : 0.12}
              dot={false}
            />

            <Line
              dataKey="expense"
              stroke="var(--color-expense)"
              strokeWidth={3}
              strokeOpacity={selected === "expense" ? 1 : 0.12}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      )}
    </Card>
  );
}
