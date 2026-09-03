import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useMarginByProjectQuery,
  useBudgetVsActualProjectsQuery,
} from "@/modules/financials/financials.hooks";
import type { MarginByProjectApiItem } from "@/modules/financials/financials.api";

interface MarginByProjectsChartProps {
  limit?: number;
  projectId?: string;
  onProjectChange?: (projectId: string) => void;
  grossMarginPct?: number;
  operatingMarginPct?: number;
  netProfitMarginPct?: number;
  contributionMarginPct?: number;
}

export default function MarginByProjectsChart({
  limit = 5,
  projectId: externalProjectId,
  onProjectChange,
}: MarginByProjectsChartProps) {
  const [internalProjectId, setInternalProjectId] = useState<string>("all-projects");

  const selectedProjectId = externalProjectId !== undefined ? externalProjectId : internalProjectId;

  const { data: projectsRes } = useBudgetVsActualProjectsQuery();
  const projectOptions = projectsRes?.data?.projects || [];

  const { data, isLoading } = useMarginByProjectQuery({
    limit,
    projectId: selectedProjectId !== "all-projects" ? selectedProjectId : undefined,
  });

  const handleProjectChange = (value: string) => {
    if (externalProjectId === undefined) {
      setInternalProjectId(value);
    }
    onProjectChange?.(value);
  };

  const projectList: MarginByProjectApiItem[] = data?.data?.projects || [];

  const chartData = projectList.map((item) => ({
    name: item.projectName || item.jobId || "Project",
    revenue: item.revenue ?? 0,
    expenses: item.expenses ?? 0,
    grossProfit: item.grossProfit ?? 0,
    grossMarginPct: item.grossMarginPct ?? 0,
  }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
          Margin by Projects
        </h3>
        <Select
          value={selectedProjectId}
          onValueChange={handleProjectChange}
        >
          <SelectTrigger className="h-8 w-44 bg-white text-xs">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-projects">All Projects</SelectItem>
            {projectOptions.map((proj) => (
              <SelectItem key={proj._id} value={proj._id}>
                {proj.jobId ? `${proj.jobId} - ${proj.projectName}` : proj.projectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-3 flex items-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-blue-500 inline-block" />
          Revenue ($)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-500 inline-block" />
          Expenses ($)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-500 inline-block" />
          Gross Profit ($)
        </div>
      </div>

      <div className="h-80">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Loading project margin data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No project margin data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name,
                ]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue ($)" />
              <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expenses ($)" />
              <Bar dataKey="grossProfit" fill="#10b981" radius={[4, 4, 0, 0]} name="Gross Profit ($)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}



