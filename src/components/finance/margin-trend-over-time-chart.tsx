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
import { Skeleton } from "@/components/ui/skeleton";
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

function formatPeriodLabel(periodStr: string, labelStr?: string): string {
  const str = labelStr || periodStr;
  if (!str) return "";
  const parts = str.split("-");
  if (parts.length === 2) {
    if (parts[1].toUpperCase().startsWith("Q")) {
      return `${parts[1].toUpperCase()} ${parts[0]}`;
    }
    const monthNum = parseInt(parts[1], 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      return `${MONTH_NAMES[monthNum - 1]} ${parts[0]}`;
    }
  }
  return str;
}

interface MarginTrendOverTimeChartProps {
  initialPeriod?: MarginTrendPeriod;
  projectId?: string;
  leadId?: string;
  businessUnit?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
}

export default function MarginTrendOverTimeChart({
  initialPeriod = "month",
  projectId,
  leadId,
  businessUnit,
  company,
  startDate,
  endDate,
}: MarginTrendOverTimeChartProps) {
  const [period, setPeriod] = useState<MarginTrendPeriod>(initialPeriod);
  const { data, isLoading } = useMarginTrendQuery({
    period,
    projectId,
    leadId,
    businessUnit,
    company,
    startDate,
    endDate,
  });

  const trendList: MarginTrendApiItem[] = data?.data?.trend || [];

  const chartData = trendList.map((item) => ({
    period: formatPeriodLabel(item.period, item.label),
    revenue: item.revenue ?? 0,
    expense: item.expense ?? item.cogs ?? 0,
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
          <div className="flex h-full flex-col justify-between py-2">
            <div className="flex items-center justify-between px-1 text-xs text-slate-400">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="relative flex flex-1 items-end justify-between gap-2 px-2 pb-6 pt-4">
              <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100" />
              <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100" />
              <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100" />

              {[35, 60, 45, 80, 55, 70, 40, 85, 65, 75, 50, 68].map((h, i) => (
                <div
                  key={i}
                  className="z-10 flex flex-1 flex-col items-center justify-end gap-2 h-full"
                >
                  <div className="relative flex w-full justify-center">
                    <Skeleton
                      className="w-1.5 rounded-full bg-slate-200"
                      style={{ height: `${h * 1.8}px` }}
                    />
                    <div className="absolute -top-1 h-2.5 w-2.5 rounded-full bg-slate-300 animate-pulse" />
                  </div>
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>
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


