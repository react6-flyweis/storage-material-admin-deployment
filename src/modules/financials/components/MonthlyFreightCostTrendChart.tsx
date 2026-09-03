import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import type { MonthlyFreightCostTrendItem } from "../financials.api";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

type Props = {
  data?: MonthlyFreightCostTrendItem[];
  isLoading?: boolean;
};

export default function MonthlyFreightCostTrendChart({ data = [], isLoading }: Props) {
  const chartData = data.map((item) => ({
    month: item._id?.month ? MONTH_NAMES[item._id.month - 1] || `M${item._id.month}` : "N/A",
    cost: item.cost ?? 0,
    deliveries: item.deliveries ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Monthly Freight Cost Trend
        </CardTitle>
        <CardDescription className="text-sm text-slate-400">
          Cost and delivery volume over time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-72">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading trend data...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No trend data available
            </div>
          ) : (
            <ChartContainer
              config={{
                cost: { label: "Freight Cost ($)", color: "#2563EB" },
                deliveries: { label: "Deliveries", color: "#10B981" },
              }}
              className="h-full w-full"
            >
              <LineChart
                data={chartData}
                margin={{ left: 12, right: 12, top: 12 }}
              >
                <CartesianGrid
                  strokeDasharray="6 8"
                  stroke="#E2E8F0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tick={{ fill: "#A0AEC0", fontSize: 13, fontWeight: 600 }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  tick={{ fill: "#A0AEC0", fontSize: 12, fontWeight: 600 }}
                  width={72}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
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

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cost"
                  stroke="#2563EB"
                  strokeWidth={4}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="deliveries"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


