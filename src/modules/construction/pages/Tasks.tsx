import { useState } from "react";
import type { StatItem } from "../components/cards/StatCard";
import StatsOverview from "../components/cards/StatCard";
import TaskBoard from "../components/common/TaskBoard";
import ProgressTracker from "../components/common/ProgressTracker";
import FolderIcon from "../assets/activeproject.svg";
import MoneyIcon from "../assets/righttick.svg";
import BoxIcon from "../assets/clockicon.svg";
import ShieldIcon from "../assets/safetyscoreicon.svg";
import { useTasksQuery } from "../construction.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tasks() {
  const [activeTab] = useState<"Task Management" | "Progress Tracker">(
    "Task Management"
  );
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
        <div className="mb-8 flex md:flex-row flex-col gap-3 md:items-center justify-between">
          <h1 className="text-[#111827] lg:text-[30px] text-[24px] font-bold leading-[36px]">
            Tasks & Progress
          </h1>
        </div>

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
      </div>

      {activeTab === "Task Management" && (
        <TaskBoard boardData={boardData} loading={loading} />
      )}
      {activeTab === "Progress Tracker" && <ProgressTracker />}
    </div>
  );
}

