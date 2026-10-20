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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarginByProjectQuery,
  useBudgetVsActualProjectsQuery,
} from "@/modules/financials/financials.hooks";
import type { MarginByProjectApiItem } from "@/modules/financials/financials.api";

interface MarginByProjectsChartProps {
  limit?: number;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  businessUnit?: string;
  company?: string;
  onProjectChange?: (projectId: string) => void;
}

export default function MarginByProjectsChart({
  limit = 10,
  projectId: externalProjectId,
  startDate,
  endDate,
  businessUnit,
  company,
  onProjectChange,
}: MarginByProjectsChartProps) {
  const [internalProjectId, setInternalProjectId] = useState<string>("all-projects");

  const selectedProjectId = externalProjectId !== undefined ? externalProjectId : internalProjectId;

  const { data: projectsRes } = useBudgetVsActualProjectsQuery();
  const projectOptions = projectsRes?.data?.projects || [];

  const { data, isLoading } = useMarginByProjectQuery({
    limit,
    projectId: selectedProjectId !== "all-projects" ? selectedProjectId : undefined,
    startDate,
    endDate,
    businessUnit,
    company,
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
    revenue: item.revenue ?? item.salesUSD ?? 0,
    expenses: item.expenses ?? item.cogs ?? 0,
    grossProfit: item.grossProfit ?? item.grossProfitUSD ?? 0,
    grossMarginPct: item.grossMarginPct ?? item.marginFromQuotation ?? 0,
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
          <div className="flex h-full flex-col justify-between py-2">
            <div className="relative flex flex-1 items-end justify-between gap-6 px-4 pb-6 pt-4">
              <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100" />
              <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100" />
              <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100" />

              {[75, 45, 90, 60, 80].map((h, i) => (
                <div
                  key={i}
                  className="z-10 flex flex-1 items-end justify-center gap-1.5 h-full"
                >
                  <Skeleton
                    className="w-1/3 max-w-6 rounded-t-sm bg-blue-200"
                    style={{ height: `${h}%` }}
                  />
                  <Skeleton
                    className="w-1/3 max-w-6 rounded-t-sm bg-amber-200"
                    style={{ height: `${Math.max(25, h - 25)}%` }}
                  />
                  <Skeleton
                    className="w-1/3 max-w-6 rounded-t-sm bg-emerald-200"
                    style={{ height: `${Math.max(15, h - 45)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16" />
              ))}
            </div>
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



