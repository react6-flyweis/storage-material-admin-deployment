import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { RevenueTrendItem } from "@/modules/payments/payments.api";

interface RevenueTrendProps {
  className?: string;
  data?: RevenueTrendItem[];
  isLoading?: boolean;
}

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

const DEFAULT_DATA = [
  { month: "Jul", received: 190000, projected: 240000 },
  { month: "Aug", received: 230000, projected: 180000 },
  { month: "Sep", received: 190000, projected: 220000 },
  { month: "Oct", received: 240000, projected: 260000 },
  { month: "Nov", received: 180000, projected: 240000 },
  { month: "Dec", received: 250000, projected: 220000 },
];

export default function RevenueTrend({ className, data, isLoading }: RevenueTrendProps) {
  let chartData = DEFAULT_DATA;

  if (data && data.length > 0) {
    const monthMap = new Map<string, { month: string; received: number; projected: number }>();

    data.forEach((item) => {
      const monthLabel = MONTH_NAMES[item._id.month - 1] || `M${item._id.month}`;
      const existing = monthMap.get(monthLabel) || { month: monthLabel, received: 0, projected: 0 };

      if (item._id.status === "paid") {
        existing.received += item.amount;
      } else {
        existing.projected += item.amount;
      }
      monthMap.set(monthLabel, existing);
    });

    chartData = Array.from(monthMap.values());
  }

  return (
    <Card className={cn("w-full py-4 rounded-sm bg-[#FAFBFF]", className)}>
      <CardHeader className="flex px-4 justify-between items-center flex-row">
        <CardTitle className="text-lg font-semibold">Revenue trend</CardTitle>
        {/* legend */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="size-2 bg-blue-500 rounded-full mr-1"></div>
            <span className="text-xs text-gray-600">Received</span>
          </div>
          <div className="flex items-center">
            <div className="size-2 bg-purple-500 rounded-full mr-1"></div>
            <span className="text-xs text-gray-600">Projected</span>
          </div>
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="h-60 flex items-center justify-center text-sm text-gray-500">
          Loading...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240} className="mt-auto">
          <BarChart data={chartData} barGap={8}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar
              dataKey="received"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="Received"
              barSize={18}
            />
            <Bar
              dataKey="projected"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              name="Projected"
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

