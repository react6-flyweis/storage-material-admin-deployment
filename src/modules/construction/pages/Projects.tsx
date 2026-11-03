import { useState } from "react";
import dayjs from "dayjs";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "@/api/projects.api";
import type { Project as ProjectType } from "@/types/projects.types";
import StatsOverview from "../components/cards/StatCard";
import type { StatItem } from "../components/cards/StatCard";
import ProjectsTable from "../components/common/Table";
import type { Project } from "../components/common/Table";
import FolderIcon from "../assets/activeproject.svg";
import MoneyIcon from "../assets/completionicon.svg";
import BoxIcon from "../assets/pendingmaterialicon.svg";
import ShieldIcon from "../assets/safetyscoreicon.svg";
import ProjectCalendarComponent from "../components/projects/ProjectCalendarComponent";
import AddDeliverySheet from "../components/projects/AddDeliverySheet";
import { useProjectsCalendarQuery } from "../construction.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab] = useState<"calendar" | "project">("calendar");
  const [isAddDeliveryOpen, setIsAddDeliveryOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const selectedCalendarProjectId = searchParams.get("projectId") || "";
  const [selectedProjectObj, setSelectedProjectObj] = useState<ProjectType | null>(null);

  // Fetch all projects for the dropdown / project object lookup
  const { data: dropdownData } = useQuery({
    queryKey: ["projects-dropdown"],
    queryFn: () => getProjectsApi({ page: 1, limit: 100 }),
    enabled: activeTab === "calendar",
  });

  const dropdownProjects = dropdownData?.data?.data?.projects || [];
  const selectedProjObj =
    selectedProjectObj ||
    dropdownProjects.find(
      (p: ProjectType) =>
        p._id === selectedCalendarProjectId || p.leadId === selectedCalendarProjectId
    ) ||
    null;

  const leadIdToPass = selectedProjObj?.leadId || selectedCalendarProjectId || "";

  const monthNum = currentMonth.month() + 1;
  const yearNum = currentMonth.year();

  const { data, isLoading } = useProjectsCalendarQuery({
    month: monthNum,
    year: yearNum,
    leadId: leadIdToPass || undefined,
    projectId: selectedCalendarProjectId || undefined,
  });

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
          leadId={leadIdToPass}
          projectId={selectedCalendarProjectId}
          selectedProject={selectedProjObj}
          onProjectChange={(val, proj) => {
            setSelectedProjectObj(proj || null);
            if (val) {
              setSearchParams({ tab: "calendar", projectId: val });
            } else {
              setSearchParams({ tab: "calendar" });
            }
          }}
          projects={apiProjects}
          deliveries={apiDeliveries}
          loading={isLoading}
        />
      )}

      {/* Project Tab Content */}
      {activeTab === "project" &&
        (isLoading ? (
          <div className="space-y-4 bg-white p-6 rounded-[8px] border border-[#F3F4F6]">
            <Skeleton className="h-8 w-48 mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <ProjectsTable projects={tableProjectsData} />
        ))}

      <AddDeliverySheet
        isOpen={isAddDeliveryOpen}
        onOpenChange={setIsAddDeliveryOpen}
        projects={apiProjects}
        defaultDate={selectedDate.format("YYYY-MM-DD")}
      />
    </div>
  );
}
