import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { StatusDistributionItem } from "@/modules/payments/payments.api";

interface PaymentStatusDistributionProps {
  className?: string;
  data?: StatusDistributionItem[];
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { name: string; color: string }> = {
  paid: { name: "Paid", color: "#22c55e" },
  sent: { name: "Sent", color: "#3b82f6" },
  partial: { name: "Partial", color: "#eab308" },
  overdue: { name: "Overdue", color: "#ef4444" },
  pending: { name: "Pending", color: "#6b7280" },
};

const DEFAULT_DATA = [
  { name: "Paid", value: 15, amount: 240000, color: "#22c55e" },
  { name: "Partial", value: 8, amount: 85000, color: "#eab308" },
  { name: "Overdue", value: 5, amount: 130000, color: "#ef4444" },
];

export default function PaymentStatusDistribution({
  className,
  data,
  isLoading,
}: PaymentStatusDistributionProps) {
  const chartData = data && data.length > 0
    ? data.map((item) => {
        const config = STATUS_CONFIG[item._id.toLowerCase()] || {
          name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
          color: "#8b5cf6",
        };
        return {
          name: config.name,
          value: item.count,
          amount: item.amount,
          color: config.color,
        };
      })
    : DEFAULT_DATA;

  const totalClients = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      className={cn("w-full gap-0 py-4 bg-[#FAFBFF] rounded-sm", className)}
    >
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          Payment status Distribution
        </h2>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-sm text-gray-500">
            Loading...
          </div>
        ) : (
          <>
            {/* Donut Chart */}
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900">
                  {totalClients}
                </div>
                <div className="text-sm text-gray-500">Total Payments</div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 w-full">
              {chartData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{item.value} count</div>
                  <div className="text-sm font-semibold text-gray-900">
                    ${item.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

