import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";

import EmptyState from "@/components/ui/empty-state";
import { PieChart as PieChartIcon } from "lucide-react";

export type PlantSalesDistributionItem = {
  name: string;
  value: number;
  color: string;
  amount?: number;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const value = `${Math.round(percent * 100)}%`;

  return (
    <g key={`label-${index}`}>
      <circle
        cx={x}
        cy={y}
        r={22}
        fill="#f3e8ff"
        stroke="#eef2f7"
        style={{ filter: "drop-shadow(0 4px 8px rgba(16,24,40,0.08))" }}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#111827"
        fontSize={12}
        fontWeight={700}
      >
        {value}
      </text>
    </g>
  );
};

export default function PlantSalesChart({
  data = [],
}: {
  data?: PlantSalesDistributionItem[];
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const monthName = currentDate.toLocaleString(undefined, { month: "long" });
  const year = currentDate.getFullYear();

  const salesDistributionData = data;

  // total used to compute example currency values in the legend
  const TOTAL_AMOUNT = 1300;

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const prevMonth = () =>
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setMonth(d.getMonth() - 1);
      return nd;
    });
  const nextMonth = () =>
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setMonth(d.getMonth() + 1);
      return nd;
    });
  const prevYear = () =>
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setFullYear(d.getFullYear() - 1);
      return nd;
    });
  const nextYear = () =>
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setFullYear(d.getFullYear() + 1);
      return nd;
    });

  return (
    <Card className="p-6">
      {/* Header: left month selector, centered title, right year selector */}
      <div className="grid grid-cols-3 items-end gap-4 ">
        <div className="flex items-center gap-2 justify-start  px-3 py-1.5 rounded-lg">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="hover:bg-gray-200 rounded p-0.5"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700">{monthName}</span>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="hover:bg-gray-200 rounded p-0.5"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <h3 className="text-xl font-semibold text-center">Sales</h3>

        <div className="flex items-center gap-2 justify-end  px-3 py-1.5 rounded-lg">
          <button
            onClick={prevYear}
            aria-label="Previous year"
            className="hover:bg-gray-200 rounded p-0.5"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700">{year}</span>
          <button
            onClick={nextYear}
            aria-label="Next year"
            className="hover:bg-gray-200 rounded p-0.5"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Donut Chart or Empty State */}
      {salesDistributionData.length === 0 ? (
        <EmptyState
          title="No plant sales data"
          description="No sales breakdown recorded for this month."
          icon={PieChartIcon}
        />
      ) : (
        <>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {salesDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                {salesDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-600">
                      {item.name}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-right">
                {salesDistributionData.map((item) => {
                  const amt = item.amount ?? (item.value / 100) * TOTAL_AMOUNT;
                  return (
                    <div
                      key={item.name}
                      className="text-sm font-semibold text-gray-900"
                    >
                      {formatCurrency(amt)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
