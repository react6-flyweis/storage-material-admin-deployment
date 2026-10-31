import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Label, Pie, PieChart, Cell } from "recharts";

import EmptyState from "@/components/ui/empty-state";
import { PieChart as PieChartIcon } from "lucide-react";

type Period = "Today" | "Week" | "Month";

export type LeadSourceItem = {
  id: string;
  label: string;
  value: number;
};

const chartConfig = {
  website: {
    label: "Website",
    color: "var(--chart-1)",
  },
  social: {
    label: "Social Media",
    color: "var(--chart-2)",
  },
  email: {
    label: "Email Campaign",
    color: "var(--chart-3)",
  },
  referrals: {
    label: "Referrals",
    color: "var(--chart-4)",
  },
  direct: {
    label: "Direct",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function LeadSourcesChart({
  data = [],
}: {
  period?: Period;
  data?: LeadSourceItem[];
}) {
  const leadSourcesData = data;
  const totalLeads = leadSourcesData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="h-full p-4 gap-0 rounded-2xl shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Lead Sources</h2>
      {leadSourcesData.length === 0 ? (
        <EmptyState
          title="No lead sources"
          description="No lead source distribution data available for this period."
          icon={PieChartIcon}
        />
      ) : (
        <div className="mt-6 flex flex-col ">
          <div className="mx-auto w-full max-w-[320px]">
            <ChartContainer
              config={chartConfig}
              className="mx-auto h-40 w-full border-0 bg-transparent p-0 shadow-none"
            >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={leadSourcesData}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={75}
                strokeWidth={5}
                paddingAngle={2}
              >
                {leadSourcesData.map((item) => {
                  const cfg = chartConfig[
                    item.id as keyof typeof chartConfig
                  ] as { color?: string } | undefined;
                  const color = cfg?.color ?? `var(--color-${item.id})`;

                  return <Cell key={item.id} fill={color} stroke={color} />;
                })}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                      return null;
                    }

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
                          {totalLeads.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          style={{
                            fill: "var(--muted-foreground)",
                            fontSize: 14,
                          }}
                        >
                          Total Leads
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="flex-1 space-y-4 md:pl-8">
          {leadSourcesData.map((item) => {
            const cfg = chartConfig[item.id as keyof typeof chartConfig] as
              | { color?: string }
              | undefined;
            const color = cfg?.color ?? `var(--color-${item.id})`;
            const percent =
              totalLeads > 0 ? (item.value / totalLeads) * 100 : 0;

            return (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <p className="font-medium text-muted-foreground">
                    {item.label}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-foreground">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({percent.toFixed(1)}%)
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
