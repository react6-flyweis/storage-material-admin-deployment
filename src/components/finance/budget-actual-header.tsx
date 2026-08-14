import { BadgeCheck, MapPin, ChevronDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard, type MetricItem } from "./budget-actual-metric-card";
import type { BudgetVsActualProjectDetailInfo } from "@/modules/financials/financials.api";

interface BudgetActualHeaderProps {
  topMetrics: readonly MetricItem[];
  projectInfo?: BudgetVsActualProjectDetailInfo;
  allProjects?: { _id: string; jobId: string; projectName: string }[];
  onSelectProject?: (id: string) => void;
}

export function BudgetActualHeader({
  topMetrics,
  projectInfo,
  allProjects = [],
  onSelectProject,
}: BudgetActualHeaderProps) {
  const code = projectInfo?.projectCode || "-";
  const name = projectInfo?.projectName?.trim() || "-";
  const location = projectInfo?.location || "-";
  const manager = projectInfo?.projectManager || "-";

  return (
    <Card className="rounded-[18px] border-slate-200 bg-white/95 p-0 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardContent className="p-0">
        <div className="grid gap-6 p-4 lg:grid-cols-2 xl:p-5">
          <div className="rounded-3xl bg-white p-0">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 ring-4 ring-slate-100 shrink-0">
                <Building2 className="h-7 w-7 text-slate-400" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[12px] font-medium text-[#6d5cff]">
                    {code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[18px] font-semibold leading-none text-slate-900">
                    {name}
                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{location}</span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[12px] text-slate-500">
                      Project Code
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-slate-900">
                      {code}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500">Start Date</p>
                    <p className="mt-1 text-[13px] font-semibold text-slate-900">
                      -
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500">
                      Project Manager
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-slate-900">
                      {manager}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500">
                      Target End Date
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-slate-900">
                      -
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-slate-700">
                Project
              </span>
              <div className="relative flex-1">
                {allProjects.length > 0 ? (
                  <select
                    value={projectInfo?._id || ""}
                    onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
                    className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-[13px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
                  >
                    <option value="" disabled>Select Project</option>
                    {allProjects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.projectName ? `${p.projectName} (${p.jobId})` : p.jobId}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between gap-3 rounded-md border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    <span className="truncate">
                      {name !== "-" ? `${name} (${code})` : code}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Button>
                )}
                {allProjects.length > 0 && (
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {topMetrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

