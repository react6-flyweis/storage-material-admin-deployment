import { Card } from "@/components/ui/card";
import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Label, Pie, PieChart, Cell } from "recharts";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import EmptyState from "@/components/ui/empty-state";
import { Scale } from "lucide-react";

export type TonnageItem = {
  id: string;
  label: string;
  value: number;
};

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#f66",
];

const chartConfig = {
  garage: { label: "Garage", color: colors[0] },
  workshop: { label: "Workshop", color: colors[1] },
  roof: { label: "Roof Sheets", color: colors[2] },
  warehouse: { label: "Warehouse", color: colors[3] },
  carports: { label: "Car Ports", color: colors[4] },
  others: { label: "Others", color: colors[5] },
} satisfies ChartConfig;

export default function TonnageSold({
  className,
  data = [],
}: {
  className?: string;
  data?: TonnageItem[];
}) {
  const [timeframe, setTimeframe] = useState<string>("monthly");

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className={"h-full p-4 gap-0" + (className ?? "")}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Tonnage Sold</h2>
        <Select value={timeframe} onValueChange={(v) => setTimeframe(v)}>
          <SelectTrigger
            size="sm"
            className="w-36 bg-blue-100 text-blue-600 border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="No tonnage data"
          description="No tonnage sold data recorded for this timeframe."
          icon={Scale}
        />
      ) : (
        <div className="mt-4 flex flex-col ">
          <div className="mx-auto w-full max-w-[320px]">
            <ChartContainer
              config={chartConfig}
              className="mx-auto h-40 w-full border-0 bg-transparent p-0 shadow-none"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {data.map((d, i) => (
                    <Cell
                      key={d.id}
                      fill={colors[i % colors.length]}
                      stroke={colors[i % colors.length]}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                        return null;
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) - 6}
                            style={{
                              fill: "var(--foreground)",
                              fontSize: 20,
                              fontWeight: 600,
                            }}
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 24}
                            style={{
                              fill: "var(--muted-foreground)",
                              fontSize: 14,
                            }}
                          >
                            Total
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          <div className="flex-1 space-y-3 mt-5">
            {data.map((d, i) => {
              const percent =
                total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0";
              return (
                <div key={d.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                    <p className="font-medium text-muted-foreground">{d.label}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-foreground">
                      {d.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
