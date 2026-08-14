import { useState } from "react";
import StatsOverview from "../components/cards/StatCard";
import ExportIcon from "../assets/exportIcon.svg";
import type { StatItem } from "../components/cards/StatCard";
import CustomSelect from "../components/common/CustomSelect";
import ProjectSelector from "../components/common/ProjectSelector";
import FolderIcon from "../assets/growthicon.svg";
import BoxIcon from "../assets/resourcicon.svg";
import ClockIcon from "../assets/ClockIcon";
import ShieldCheckIcon from "../assets/SieldIcon";
import SuccessModal from "../components/common/SuccessModal";
import {
  useConstructionReportsQuery,
  useExportConstructionReportMutation,
} from "../construction.hooks";
import { Skeleton, StatCardSkeleton } from "@/components/ui/skeleton";

const statusStyles: Record<string, string> = {
  "On Track": "bg-[#DCFCE7] text-[#16A34A]",
  Passed: "bg-[#DCFCE7] text-[#16A34A]",
  Warning: "bg-[#FEF9C3] text-[#8C6A00]",
  Delayed: "bg-red-100 text-red-600",
  "Not Started": "bg-gray-200 text-gray-600",
  Completed: "bg-blue-100 text-blue-700",
};

const timeFilterOptions = [
  { label: "All", value: "all" },
  { label: "This week", value: "this_week" },
  { label: "Last 3 weeks", value: "last_3_weeks" },
  { label: "This month", value: "this_month" },
  { label: "Last 6 months", value: "last_6_months" },
  { label: "This year", value: "this_year" },
];

export default function Reports() {
  const [time, setTime] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [successOpen, setSuccessOpen] = useState(false);

  const { data: reportsResponse, isLoading } = useConstructionReportsQuery();
  const exportReportMutation = useExportConstructionReportMutation();
  const reportsData = reportsResponse?.data;

  const handleExportReport = () => {
    exportReportMutation.mutate(
      {
        period: time,
        projectId: projectId,
      },
      {
        onSuccess: (data) => {
          const blob = new Blob([data as unknown as BlobPart], {
            type: "application/octet-stream",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `construction-report-${time}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setSuccessOpen(true);
        },
        onError: (error) => {
          console.error("Failed to export report:", error);
        },
      }
    );
  };

  const stats: StatItem[] = [
    {
      key: "activeProjects",
      title: "Project Completion Rate",
      value:
        reportsData?.kpis.projectCompletionRate != null
          ? `${reportsData.kpis.projectCompletionRate}%`
          : "N/A",
      icon: FolderIcon,
      bg: "#EAB308",
    },
    {
      key: "completionRate",
      title: "Average Delay Time",
      value:
        reportsData?.kpis.avgDelayTimeDays != null
          ? `${reportsData.kpis.avgDelayTimeDays} days`
          : "N/A",
      iconsvg: <ClockIcon color="#9333EA" />,
      bg: "#9333EA",
    },
    {
      key: "pendingMaterials",
      title: "Resource Utilization",
      value:
        reportsData?.kpis.resourceUtilization != null
          ? `${reportsData.kpis.resourceUtilization}%`
          : "N/A",
      icon: BoxIcon,
      bg: "#1D51A4",
    },
    {
      key: "safetyScore",
      title: "Safety Compliance",
      value:
        reportsData?.kpis.safetyCompliance != null
          ? `${reportsData.kpis.safetyCompliance}%`
          : "N/A",
      iconsvg: <ShieldCheckIcon color="#3AB449" />,
      bg: "#3AB449",
    },
  ];

  const progressRows = [...(reportsData?.projectProgressVsPlan || [])]
    .filter((row) => {
      if (projectId === "all") return true;
      return true;
    })
    .sort((a, b) => (b.actualProgress || 0) - (a.actualProgress || 0));

  const materialEfficiency = [...(reportsData?.materialUsageEfficiency || [])].sort(
    (a, b) => (b.usedPct || 0) - (a.usedPct || 0)
  );
  const safetyReports = (reportsData?.safetyCompliance || []) as Array<{
    title?: string;
    project?: string;
    date?: string;
    status?: string;
    score?: string | number;
  }>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex md:flex-row flex-col gap-6 md:items-center justify-between mb-8">
          <div>
            <h1 className="text-[#111827] lg:text-[30px] text-[24px] font-bold leading-[36px]">
              KPIs & Reports
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CustomSelect
              title="This Week"
              options={timeFilterOptions}
              value={time}
              onChange={setTime}
            />

            <div className="w-[220px]">
              <ProjectSelector
                value={projectId}
                onValueChange={setProjectId}
                placeholder="All Projects"
                includeAllOption
              />
            </div>

            <button
              onClick={handleExportReport}
              disabled={exportReportMutation.isPending}
              className="bg-[#2563EB] h-[38px] gap-2 text-[14px] flex justify-center items-center text-white px-4 rounded-[8px] disabled:opacity-50"
            >
              <img src={ExportIcon} alt="" />
              {exportReportMutation.isPending ? "Exporting..." : "Export Report"}
            </button>

            <SuccessModal
              open={successOpen}
              title="Report Exported Successfully"
              onClose={() => setSuccessOpen(false)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-4 grid-cols-2 md:gap-6 gap-3 md:mb-6 mb-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <StatCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <StatsOverview stats={stats} showProgress />
        )}

        <div className="rounded-[8px] bg-white border border-[#F3F4F6] shadow overflow-hidden mt-6">
          <div className="lg:px-6 px-3 py-5 border-b">
            <h2 className="text-[20px] font-medium text-[#111827]">
              Project Progress vs Plan
            </h2>
          </div>

          <div className="overflow-x-auto scroll-hide w-[calc(100vw-26px)] lg:w-[calc(100vw-324px)]">
            <table className="min-w-[900px] w-full border-collapse rounded-[8px]">
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="border-b last:border-b-0 even:bg-[#F9FAFB]">
                      <td className="lg:px-6 px-3 lg:py-6 py-3">
                        <Skeleton className="h-4 w-44" />
                      </td>
                      <td className="lg:px-6 px-3 lg:py-6 py-3">
                        <Skeleton className="h-4 w-52" />
                      </td>
                      <td className="lg:px-6 px-3 lg:py-6 py-3">
                        <Skeleton className="h-4 w-52" />
                      </td>
                      <td className="lg:px-6 px-3 lg:py-6 py-3">
                        <Skeleton className="h-7 w-24 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : (
                  progressRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b last:border-b-0 even:bg-[#F9FAFB]"
                    >
                      <td className="lg:px-6 px-3 lg:py-6 py-3 text-[13px] text-[#111827]">
                        {row.project || "Unnamed Project"}
                      </td>
                      <td className="lg:px-6 px-3 lg:py-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-[160px] lg:w-[260px] h-2 bg-[#D9D9D9] rounded-full">
                            <div
                              className="h-2 bg-[#2563EB] rounded-full"
                              style={{ width: `${Math.min(row.actualProgress, 100)}%` }}
                            />
                          </div>
                          <span className="text-[13px]">{row.actualProgress}%</span>
                        </div>
                      </td>
                      <td className="lg:px-6 px-3 lg:py-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-[160px] lg:w-[260px] h-2 bg-[#D9D9D9] rounded-full">
                            <div
                              className="h-2 bg-[#9CA3AF] rounded-full"
                              style={{ width: `100%` }}
                            />
                          </div>
                          <span className="text-[13px]">100%</span>
                        </div>
                      </td>
                      <td className="lg:px-6 px-3 lg:py-6 py-3">
                        <span
                          className={`px-4 py-2 rounded-full text-[13px] ${
                            statusStyles[row.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {!isLoading && progressRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-sm text-[#6B7280] py-8">
                      No projects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex md:flex-row flex-col gap-6 mt-6">
          <div className="flex-1 rounded-[8px] lg:p-6 p-3 border bg-white">
            <h2 className="text-[20px] font-medium mb-6">
              Material Usage Efficiency
            </h2>

            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              materialEfficiency.map((m, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-[13px] font-medium">{m.material}</span>
                    <span className="text-[13px] font-medium">{m.usedPct}%</span>
                  </div>
                  <div className="h-[8px] bg-[#E5E7EB] rounded-full">
                    <div
                      className="h-full rounded-full bg-[#16A34A]"
                      style={{ width: `${Math.min(m.usedPct, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
            {!isLoading && materialEfficiency.length === 0 && (
              <p className="text-center text-sm text-[#6B7280] py-8">
                No materials found
              </p>
            )}
          </div>

          <div className="flex-1 rounded-[8px] lg:p-6 p-3 border bg-white">
            <h2 className="text-[20px] font-medium mb-6">
              Safety & Compliance Report
            </h2>

            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              safetyReports.map((item, idx) => (
                <div key={idx} className="flex justify-between mb-6 last:mb-0">
                  <div>
                    <p className="text-[13px] font-semibold">{item.title}</p>
                    <p className="text-[12px] text-[#6B7280]">
                      {item.project}, {item.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-4 py-1 rounded-full text-[13px] ${
                        statusStyles[item.status || ""] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.score && (
                      <p className="text-[12px] text-[#6B7280] mt-1">
                        Score-{item.score}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            {!isLoading && safetyReports.length === 0 && (
              <p className="text-center text-sm text-[#6B7280] py-8">
                No reports found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
