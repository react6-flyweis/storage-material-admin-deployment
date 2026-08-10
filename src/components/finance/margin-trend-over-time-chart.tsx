import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MarginChartLegend from "@/components/finance/margin-chart-legend";
import type { MarginTrendItem } from "@/modules/financials/financials.api";

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

interface MarginTrendOverTimeChartProps {
  data?: MarginTrendItem[];
  grossMarginPct?: number;
  operatingMarginPct?: number;
  netProfitMarginPct?: number;
  contributionMarginPct?: number;
}

export default function MarginTrendOverTimeChart({
  data = [],
  grossMarginPct = 0,
  operatingMarginPct = 0,
  netProfitMarginPct = 0,
  contributionMarginPct = 0,
}: MarginTrendOverTimeChartProps) {
  const chartData =
    data.length > 0
      ? data.map((item) => ({
          month: `${MONTH_NAMES[(item._id.month - 1) % 12]} ${item._id.year}`,
          revenue: item.revenue,
          gross: grossMarginPct,
          operating: operatingMarginPct,
          net: netProfitMarginPct,
          contribution: contributionMarginPct,
        }))
      : [];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[26px] font-semibold text-slate-900 md:text-2xl">
          Margin Trend Over Time
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-slate-200 bg-white text-xs"
        >
          <CalendarIcon className="mr-1 h-3.5 w-3.5" />
          Monthly
        </Button>
      </div>

      <MarginChartLegend />

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#e2e8f0" vertical={true} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#1e293b", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="gross"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              name="Gross Margin"
            />
            <Line
              type="monotone"
              dataKey="operating"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              name="Operating Margin"
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={false}
              name="Net Profit Margin"
            />
            <Line
              type="monotone"
              dataKey="contribution"
              stroke="#d4a917"
              strokeWidth={3}
              dot={false}
              name="Contribution Margin"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

