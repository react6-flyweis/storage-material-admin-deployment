import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import EmptyState from "@/components/ui/empty-state";
import { MessageSquareCode } from "lucide-react";

export type QueryHandlingItem = {
  name: string;
  value: number;
  key: string;
};

const chartConfig = {
  ai: { color: "#7C3AED", label: "AI Handled" },
  employee: { color: "#06B981", label: "Employee handled" },
} as const;

type Period = "Today" | "Week" | "Month";

export default function QueryHandlingDistribution({
  data = [],
}: {
  period?: Period;
  data?: QueryHandlingItem[];
}) {
  return (
    <Card className="h-full bg-white rounded-2xl p-4 gap-0 shadow-lg">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-slate-900">
          Query Handling Distribution
        </h2>
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="No query data"
          description="No AI or employee query handling records for this period."
          icon={MessageSquareCode}
        />
      ) : (
        <div className="flex flex-col  items-center gap-6">
          <div className="w-full relative">
            <ChartContainer
              config={chartConfig}
              className="h-68 w-full aspect-square border-0 bg-transparent p-0 shadow-none"
            >
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  label={(entry) => {
                    const total = data.reduce((sum, item) => sum + item.value, 0);
                    const percent = Math.round((entry.value / total) * 100);
                    return `${entry.name.split(" ")[0]} ${percent}%`;
                  }}
                  labelLine={(props) => {
                    const { points } = props;
                    const [start, end] = points;
                    const arrowSize = 6;
                    const angle = Math.atan2(end.y - start.y, end.x - start.x);

                    return (
                      <g>
                        <path
                          d={`M ${start.x},${start.y} L ${end.x},${end.y}`}
                          stroke="#94A3B8"
                          strokeWidth={1}
                          fill="none"
                        />
                        <path
                          d={`M ${end.x},${end.y} 
                              L ${
                                end.x - arrowSize * Math.cos(angle - Math.PI / 6)
                              },${
                            end.y - arrowSize * Math.sin(angle - Math.PI / 6)
                          }
                              M ${end.x},${end.y}
                              L ${
                                end.x - arrowSize * Math.cos(angle + Math.PI / 6)
                              },${
                            end.y - arrowSize * Math.sin(angle + Math.PI / 6)
                          }`}
                          stroke="#94A3B8"
                          strokeWidth={1}
                          fill="none"
                        />
                      </g>
                    );
                  }}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={`var(--color-${entry.key})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          <div className="w-full ">
            <div className="space-y-4">
              {data.map((d) => (
                <div key={d.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor:
                          chartConfig[d.key as keyof typeof chartConfig]?.color ??
                          "#94a3b8",
                      }}
                    />
                    <div className="text-sm text-slate-700">{d.name}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {d.value.toLocaleString()} Queries
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
