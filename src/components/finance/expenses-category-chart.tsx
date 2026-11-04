import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useExpensesByCategoryQuery } from "@/modules/financials/financials.hooks";
import { Loader2 } from "lucide-react";

// Predefined palette for categories
const CATEGORY_COLORS = [
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#f97316", // Orange
  "#84cc16", // Lime
  "#a855f7", // Purple
];

export function ExpensesCategoryChart() {
  const { data: response, isLoading, isError } = useExpensesByCategoryQuery();
  const categoryData = response?.data;

  const totalExpenses = categoryData?.totalExpenses ?? 0;
  const categories = categoryData?.categories || [];

  const chartData = categories.map((cat, index) => ({
    name: cat.category,
    value: cat.total,
    percentage: cat.percentage,
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const chartConfig = categories.reduce<Record<string, { label: string; color: string }>>(
    (acc, cat, index) => {
      const key = cat.category.toLowerCase().replace(/[^a-z0-9]/g, "_");
      acc[key] = {
        label: cat.category,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      };
      return acc;
    },
    {}
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="mb-4 font-semibold text-slate-900">
          Expenses by category
        </h3>
        {isLoading ? (
          <div className="flex h-80 w-full items-center justify-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600 mr-2" />
            <span>Loading category chart...</span>
          </div>
        ) : isError ? (
          <div className="flex h-80 w-full items-center justify-center text-sm text-red-500">
            Failed to load category chart data
          </div>
        ) : categories.length === 0 ? (
          <div className="flex h-80 w-full items-center justify-center text-sm text-slate-500">
            No category expenses found
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Custom scrollable Legend */}
            <div className="max-h-28 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                {chartData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-1.5 min-w-0"
                    title={`${item.name} (${item.percentage}%)`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="truncate text-slate-700 font-medium">
                      {item.name}
                    </span>
                    <span className="text-slate-400 text-[11px] shrink-0 ml-auto">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">Total Expenses</span>
          <span className="font-bold text-slate-900">
            ${totalExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
