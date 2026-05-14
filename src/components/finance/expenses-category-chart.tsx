import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const categoryChartData = [
  { name: "Vendor", value: 9965, fill: "#10b981" },
  { name: "Operations", value: 996, fill: "#8b5cf6" },
  { name: "Miscell", value: 6562, fill: "#f59e0b" },
  { name: "Salaries", value: 478, fill: "#ef4444" },
];

const chartConfig = {
  vendor: {
    label: "Vendor",
    color: "#10b981",
  },
  operations: {
    label: "Operations",
    color: "#8b5cf6",
  },
  miscell: {
    label: "Miscell",
    color: "#f59e0b",
  },
  salaries: {
    label: "Salaries",
    color: "#ef4444",
  },
};

export function ExpensesCategoryChart() {
  const total = categoryChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 font-semibold text-slate-900">
        Expenses by category
      </h3>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltipContent />} />
            <Pie
              data={categoryChartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-6 grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">Total Expenses</span>
          <span className="font-bold text-slate-900">
            ${total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
