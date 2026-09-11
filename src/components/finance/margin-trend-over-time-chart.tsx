import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMarginTrendQuery } from "@/modules/financials/financials.hooks";
import type { MarginTrendPeriod, MarginTrendApiItem } from "@/modules/financials/financials.api";

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

function formatPeriodLabel(periodStr: string): string {
  if (!periodStr) return "";
  const parts = periodStr.split("-");
  if (parts.length === 2) {
    const monthNum = parseInt(parts[1], 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      return `${MONTH_NAMES[monthNum - 1]} ${parts[0]}`;
    }
  }
  return periodStr;
}

interface MarginTrendOverTimeChartProps {
  initialPeriod?: MarginTrendPeriod;
  grossMarginPct?: number;
  operatingMarginPct?: number;
  netProfitMarginPct?: number;
  contributionMarginPct?: number;
}

export default function MarginTrendOverTimeChart({
  initialPeriod = "month",
}: MarginTrendOverTimeChartProps) {
  const [period, setPeriod] = useState<MarginTrendPeriod>(initialPeriod);
  const { data, isLoading } = useMarginTrendQuery({ period });

  const trendList: MarginTrendApiItem[] = data?.data?.trend || [];

  const chartData = trendList.map((item) => ({
    period: formatPeriodLabel(item.period),
    revenue: item.revenue ?? 0,
    expense: item.expense ?? 0,
    grossMarginPct: item.grossMarginPct ?? 0,
  }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
          Margin Trend Over Time
        </h3>
        <Select
          value={period}
          onValueChange={(val) => setPeriod(val as MarginTrendPeriod)}
        >
          <SelectTrigger className="h-8 w-32 bg-white text-xs">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="quarter">Quarterly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-3 flex items-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-500 inline-block" />
          Revenue ($)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
          Expense ($)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
          Gross Margin (%)
        </div>
      </div>

      <div className="h-80">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Loading trend data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No trend data available for selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#e2e8f0" vertical={true} />
              <XAxis
                dataKey="period"
                tick={{ fill: "#1e293b", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Gross Margin (%)") return [`${value}%`, name];
                  return [`$${value.toLocaleString()}`, name];
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Revenue ($)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Expense ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="grossMarginPct"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Gross Margin (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}


