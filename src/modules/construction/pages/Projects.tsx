import { useState } from "react";
import dayjs from "dayjs";
import StatsOverview from "../components/cards/StatCard";
import type { StatItem } from "../components/cards/StatCard";
import ProjectsTable from "../components/common/Table";
import type { Project } from "../components/common/Table";
import FolderIcon from "../assets/activeproject.svg";
import MoneyIcon from "../assets/completionicon.svg";
import BoxIcon from "../assets/pendingmaterialicon.svg";
import ShieldIcon from "../assets/safetyscoreicon.svg";
import ProjectCalendarComponent from "../components/projects/ProjectCalendarComponent";
import { useProjectsCalendarQuery } from "../construction.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function Projects() {
  const [activeTab, setActiveTab] = useState<"calendar" | "project">("calendar");

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const monthNum = currentMonth.month() + 1;
  const yearNum = currentMonth.year();

  const { data, isLoading } = useProjectsCalendarQuery(monthNum, yearNum);

  const apiProjects = data?.data?.projects || [];
  const apiDeliveries = data?.data?.deliveries || [];
  const statsData = data?.data?.stats || {
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0,
  };

  const stats: StatItem[] = [
    {
      key: "activeProjects",
      title: "Total Projects",
      value: statsData.total,
      icon: FolderIcon,
    },
    {
      key: "completionRate",
      title: "Active",
      value: statsData.active,
      icon: MoneyIcon,
    },
    {
      key: "pendingMaterials",
      title: "Upcoming",
      value: statsData.upcoming,
      icon: BoxIcon,
    },
    {
      key: "safetyScore",
      title: "Completed",
      value: statsData.completed,
      icon: ShieldIcon,
    },
  ];

  // Map API projects for the ProjectsTable view if needed
  const tableProjectsData: Project[] = apiProjects.map((p, idx) => ({
    id: p._id || String(idx),
    name: p.projectName || p.jobId || "Project",
    code: p.jobId || "",
    client: p.location || "-",
    startDate: "-",
    endDate: "-",
    progress: 0,
    status: p.lifecycleStatus === "deal_closed" ? "Completed" : "Active",
    team: [],
  }));

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827] lg:text-[30px] text-[24px] font-bold mb-1 leading-[36px]">
            Projects and Calendar
          </h1>
          <p className="text-[#4B5563] lg:text-[16px] text-[14px]">
            Construction Department Performance
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center">
          <div className="bg-[#F3F4F6] p-1 rounded-xl flex border border-gray-100">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "calendar"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("project")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "project"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Project
            </button>
          </div>
        </div>
      </div>

      {/* Top Stats Overview */}
      {isLoading ? (
        <div className="grid md:grid-cols-4 grid-cols-2 md:gap-6 gap-3 md:mb-6 mb-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[106px] w-full rounded-[8px]" />
          ))}
        </div>
      ) : (
        <StatsOverview stats={stats} />
      )}

      {/* Calendar Tab Content */}
      {activeTab === "calendar" && (
        <ProjectCalendarComponent
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          projects={apiProjects}
          deliveries={apiDeliveries}
          loading={isLoading}
        />
      )}

      {/* Project Tab Content */}
      {activeTab === "project" && (
        isLoading ? (
          <div className="space-y-4 bg-white p-6 rounded-[8px] border border-[#F3F4F6]">
            <Skeleton className="h-8 w-48 mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <ProjectsTable projects={tableProjectsData} />
        )
      )}
    </div>
  );
}
