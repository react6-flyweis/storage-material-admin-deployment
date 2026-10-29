import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import EmptyState from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export type StageOverviewItem = {
  stage: string;
  value: number;
};

const chartConfig = {
  stages: { color: "#2B82F6", label: "Leads" },
} as const;

type Period = "Today" | "Week" | "Month";

export default function PipelineStageOverview({
  data = [],
}: {
  period?: Period;
  data?: StageOverviewItem[];
}) {
  return (
    <Card className="h-full border border-slate-100 p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-900">
          Pipeline Stage overview
        </h2>
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="No stage data"
          description="No leads recorded in pipeline stages for this timeframe."
          icon={BarChart3}
        />
      ) : (

      <div className="mt-4">
        <ChartContainer
          config={chartConfig}
          className="h-80 w-full border-0 bg-transparent p-0 shadow-none"
        >
          <BarChart
            data={data}
            margin={{ left: 0, right: 0, top: 0, bottom: 16 }}
            barCategoryGap="28%"
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              interval={0}
              height={56}
              angle={-35}
              textAnchor="end"
              tickMargin={12}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#111827", strokeWidth: 1 }}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              width={56}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <ChartTooltip
              content={<ChartTooltipContent className="rounded-lg" />}
            />
            <Bar
              dataKey="value"
              fill={chartConfig.stages.color}
              barSize={36}
              // radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
      )}
    </Card>
  );
}
