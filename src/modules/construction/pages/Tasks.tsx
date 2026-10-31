import { useSearchParams } from "react-router";
import type { StatItem } from "../components/cards/StatCard";
import StatsOverview from "../components/cards/StatCard";
import TaskBoard from "../components/common/TaskBoard";
import DailyWorkLogsView from "../components/worklogs/DailyWorkLogsView";
import FolderIcon from "../assets/activeproject.svg";
import MoneyIcon from "../assets/righttick.svg";
import BoxIcon from "../assets/clockicon.svg";
import ShieldIcon from "../assets/safetyscoreicon.svg";
import { useTasksQuery } from "../construction.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab =
    searchParams.get("tab") === "work-logs"
      ? "Daily Work Logs"
      : "Task Board";

  const handleTabChange = (tab: "Task Board" | "Daily Work Logs") => {
    if (tab === "Daily Work Logs") {
      searchParams.set("tab", "work-logs");
    } else {
      searchParams.delete("tab");
    }
    setSearchParams(searchParams, { replace: true });
  };

  const { data: response, isLoading: loading } = useTasksQuery();

  const statsData = response?.data?.stats || {
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  };

  const boardData = response?.data?.board || {
    todo: [],
    in_progress: [],
    done: [],
  };

  const stats: StatItem[] = [
    {
      key: "activeProjects",
      title: "Total Tasks",
      value: statsData.total,
      icon: FolderIcon,
    },
    {
      key: "completionRate",
      title: "Completed",
      value: statsData.completed,
      icon: MoneyIcon,
    },
    {
      key: "pendingMaterials",
      title: "In Progress",
      value: statsData.inProgress,
      icon: BoxIcon,
    },
    {
      key: "safetyScore",
      title: "Overdue",
      value: statsData.overdue,
      icon: ShieldIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-6 flex md:flex-row flex-col gap-4 md:items-center justify-between">
          <div>
            <h1 className="text-[#111827] lg:text-[30px] text-[24px] font-bold leading-[36px]">
              Tasks & Progress
            </h1>
            <p className="text-gray-500 font-medium mt-0.5 text-xs sm:text-[13px]">
              {currentTab === "Daily Work Logs"
                ? "Daily site diary entries tracking progress, field activities, issues, and photos."
                : "Manage construction tasks, Kanban board, schedules, and job progress."}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Tasks and Work Logs"
            className="flex bg-[#F3F4F6] w-fit rounded-[10px] p-1 h-11 border border-[#E5E7EB] shrink-0"
          >
            <button
              role="tab"
              aria-selected={currentTab === "Task Board"}
              type="button"
              onClick={() => handleTabChange("Task Board")}
              className={`px-4 py-1.5 rounded-[8px] text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === "Task Board"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Task Board
            </button>
            <button
              role="tab"
              aria-selected={currentTab === "Daily Work Logs"}
              type="button"
              onClick={() => handleTabChange("Daily Work Logs")}
              className={`px-4 py-1.5 rounded-[8px] text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === "Daily Work Logs"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Daily Work Logs
            </button>
          </div>
        </div>

        {currentTab === "Task Board" && (
          <>
            {loading ? (
              <div className="grid md:grid-cols-4 grid-cols-2 md:gap-6 gap-3 md:mb-6 mb-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-[8px] min-h-[106px] py-3 lg:px-6 px-3 flex items-center justify-between gap-1 bg-gray-100 animate-pulse"
                  >
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-7 w-12" />
                    </div>
                    <Skeleton className="w-[48px] h-[48px] rounded-[10px]" />
                  </div>
                ))}
              </div>
            ) : (
              <StatsOverview stats={stats} />
            )}
          </>
        )}
      </div>

      {currentTab === "Task Board" ? (
        <TaskBoard boardData={boardData} loading={loading} />
      ) : (
        <DailyWorkLogsView hideHeaderButton />
      )}
    </div>
  );
}

