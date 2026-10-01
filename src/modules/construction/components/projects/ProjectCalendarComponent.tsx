import { useState, useMemo, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { Plus, PackageX } from "lucide-react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  getDeliveries,
  type ProjectCalendarItem,
  type ProjectCalendarDelivery,
  type ApiDeliveryItem,
} from "../../construction.api";
import type { Project } from "@/types/projects.types";
import AddDeliverySheet from "./AddDeliverySheet";
import ProjectSelector from "../common/ProjectSelector";
import { DeliveryDetailsDialog } from "../DeliveryDetailsDialog";
import { useLeadsQuery } from "@/modules/leads/leads.hooks";
import type { Lead } from "@/modules/leads/leads.api";

const statusColors: Record<string, string> = {
  bidding_sent: "#3B82F6",
  carrier_selected: "#F59E0B",
  confirmed: "#10B981",
  in_transit: "#8B5CF6",
  scheduled: "#EC4899",
  delivered: "#10B981",
  initial_contact: "#6B7280",
  requirements_gathered: "#3B82F6",
  proposal_sent: "#F59E0B",
  negotiation: "#8B5CF6",
  deal_closed: "#10B981",
  released_to_plant: "#059669",
};

const formatStatus = (status?: string) => {
  if (!status) return "-";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

function getDeliveryProjectInfo(
  delivery?: ProjectCalendarDelivery | ApiDeliveryItem | null,
  projectsList: ProjectCalendarItem[] = [],
  leadsList: Lead[] = []
): {
  projectName: string;
  jobId: string;
  location: string;
  id?: string;
} {
  if (!delivery) {
    return { projectName: "", jobId: "", location: "" };
  }

  // 1. Helper to extract project data from an object
  const extractFromObj = (obj: unknown) => {
    if (obj && typeof obj === "object") {
      const o = obj as Record<string, unknown>;
      const name =
        (typeof o.projectName === "string" && o.projectName.trim()) ||
        (typeof o.name === "string" && o.name.trim()) ||
        (typeof o.title === "string" && o.title.trim()) ||
        "";
      const jobId =
        (typeof o.jobId === "string" && o.jobId.trim()) ||
        (typeof o.code === "string" && o.code.trim()) ||
        "";
      const location =
        (typeof o.location === "string" && o.location.trim()) ||
        (typeof o.site === "string" && o.site.trim()) ||
        (typeof o.sectionLocation === "string" && o.sectionLocation.trim()) ||
        "";
      const id =
        (typeof o._id === "string" && o._id) ||
        (typeof o.id === "string" && o.id) ||
        (typeof o.leadId === "string" && o.leadId) ||
        undefined;

      if (name || jobId) {
        return { projectName: name || jobId, jobId, location, id };
      }
    }
    return null;
  };

  // 2. Check delivery.project if object
  if (delivery.project && typeof delivery.project === "object") {
    const fromProj = extractFromObj(delivery.project);
    if (fromProj?.projectName) return fromProj;
  }

  // 3. Check delivery.leadId if object
  if ("leadId" in delivery && delivery.leadId && typeof delivery.leadId === "object") {
    const fromLead = extractFromObj(delivery.leadId);
    if (fromLead?.projectName) return fromLead;
  }

  // 4. Check delivery.projectId if object
  if ("projectId" in delivery && delivery.projectId && typeof delivery.projectId === "object") {
    const fromProjId = extractFromObj(delivery.projectId);
    if (fromProjId?.projectName) return fromProjId;
  }

  // 5. Check direct fields on delivery
  if (
    ("projectName" in delivery && delivery.projectName) ||
    ("jobId" in delivery && delivery.jobId)
  ) {
    return {
      projectName:
        ("projectName" in delivery && (delivery.projectName as string)) ||
        ("jobId" in delivery && (delivery.jobId as string)) ||
        "",
      jobId: ("jobId" in delivery && (delivery.jobId as string)) || "",
      location:
        ("sectionLocation" in delivery && (delivery.sectionLocation as string)) ||
        ("location" in delivery && (delivery.location as string)) ||
        "",
      id: undefined,
    };
  }

  // 6. Look for ID string to match from projectsList or leadsList
  const targetId =
    ("leadId" in delivery && typeof delivery.leadId === "string"
      ? delivery.leadId
      : undefined) ||
    ("projectId" in delivery && typeof delivery.projectId === "string"
      ? delivery.projectId
      : undefined) ||
    (typeof delivery.project === "string" ? delivery.project : undefined) ||
    (typeof delivery.project === "object" && delivery.project !== null
      ? (delivery.project as { _id?: string; leadId?: string })._id ||
        (delivery.project as { _id?: string; leadId?: string }).leadId
      : undefined) ||
    ("leadId" in delivery && typeof delivery.leadId === "object" && delivery.leadId !== null
      ? (delivery.leadId as { _id?: string })._id
      : undefined);

  if (targetId) {
    // 6a. Match in projectsList (from API projects)
    const matchedProject = projectsList.find(
      (p) => p._id === targetId || p.jobId === targetId
    );
    if (matchedProject) {
      return {
        projectName:
          matchedProject.projectName ||
          matchedProject.jobId ||
          `Project ${matchedProject.jobId || ""}`.trim(),
        jobId: matchedProject.jobId || "",
        location:
          matchedProject.location ||
          ("sectionLocation" in delivery && (delivery.sectionLocation as string)) ||
          ("location" in delivery && (delivery.location as string)) ||
          "",
        id: matchedProject._id,
      };
    }

    // 6b. Match in leadsList (from useLeadsQuery)
    const matchedLead = leadsList.find((l) => l._id === targetId);
    if (matchedLead) {
      return {
        projectName:
          matchedLead.projectName ||
          matchedLead.buildingType ||
          `Lead ${matchedLead._id.slice(0, 6)}`,
        jobId: "",
        location:
          matchedLead.location ||
          ("sectionLocation" in delivery && (delivery.sectionLocation as string)) ||
          ("location" in delivery && (delivery.location as string)) ||
          "",
        id: matchedLead._id,
      };
    }
  }

  const projObj =
    delivery.project && typeof delivery.project === "object"
      ? (delivery.project as Record<string, unknown>)
      : null;

  return {
    projectName: "",
    jobId:
      ("jobId" in delivery && typeof delivery.jobId === "string" ? delivery.jobId : "") ||
      (typeof projObj?.jobId === "string" ? projObj.jobId : ""),
    location:
      ("sectionLocation" in delivery && (delivery.sectionLocation as string)) ||
      ("location" in delivery && (delivery.location as string)) ||
      (typeof projObj?.location === "string" ? projObj.location : "") ||
      "",
    id: targetId,
  };
}

export interface ProjectCalendarComponentProps {
  leadId?: string;
  projectId?: string;
  selectedProject?: Project | null;
  onProjectChange?: (projectId: string, project?: Project | null) => void;
  currentMonth?: dayjs.Dayjs;
  setCurrentMonth?: (month: dayjs.Dayjs) => void;
  selectedDate?: dayjs.Dayjs;
  setSelectedDate?: (date: dayjs.Dayjs) => void;
  projects?: ProjectCalendarItem[];
  deliveries?: ProjectCalendarDelivery[];
  loading?: boolean;
}

export default function ProjectCalendarComponent({
  leadId,
  projectId,
  selectedProject,
  onProjectChange,
  currentMonth: propCurrentMonth,
  setCurrentMonth: propSetCurrentMonth,
  selectedDate: propSelectedDate,
  setSelectedDate: propSetSelectedDate,
  projects = [],
  deliveries = [],
  loading = false,
}: ProjectCalendarComponentProps) {
  const navigate = useNavigate();
  const [internalCurrentMonth, setInternalCurrentMonth] = useState(dayjs());
  const [internalSelectedDate, setInternalSelectedDate] = useState(dayjs());
  const [internalProjectId, setInternalProjectId] = useState<string>(projectId || "");
  const [internalSelectedProject, setInternalSelectedProject] = useState<Project | null>(
    selectedProject || null
  );

  const currentMonth = propCurrentMonth ?? internalCurrentMonth;
  const setCurrentMonth = propSetCurrentMonth ?? setInternalCurrentMonth;
  const selectedDate = propSelectedDate ?? internalSelectedDate;
  const setSelectedDate = propSetSelectedDate ?? setInternalSelectedDate;

  const effectiveProjectId = projectId !== undefined ? projectId : internalProjectId;
  const effectiveSelectedProject =
    selectedProject !== undefined ? selectedProject : internalSelectedProject;
  const isProjectSelected = Boolean(effectiveProjectId || leadId);

  const handleProjectChange = (val: string, proj?: Project) => {
    setInternalProjectId(val);
    setInternalSelectedProject(proj || null);
    if (onProjectChange) {
      onProjectChange(val, proj || null);
    }
  };

  const [isAddDeliveryOpen, setIsAddDeliveryOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<
    ProjectCalendarDelivery | ApiDeliveryItem | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: leadsData } = useLeadsQuery(1, 100);
  const leadsList = leadsData?.data?.leads || [];

  // Fetch deliveries specifically for this project
  const {
    data: projectDeliveriesRes,
    isLoading: isLoadingProjectDeliveries,
    isFetched: isDeliveriesFetched,
  } = useQuery({
    queryKey: ["calendar-project-deliveries", effectiveProjectId, leadId],
    queryFn: () =>
      getDeliveries({
        projectId: effectiveProjectId || undefined,
        leadId: leadId || undefined,
        limit: 100,
        sortBy: "DeliveryDate",
      }),
    enabled: isProjectSelected,
  });

  const projectDeliveries: ApiDeliveryItem[] = useMemo(() => {
    const raw = projectDeliveriesRes as unknown as {
      data?: {
        data?: { deliveries?: ApiDeliveryItem[] };
        deliveries?: ApiDeliveryItem[];
      };
      deliveries?: ApiDeliveryItem[];
    };
    return (
      raw?.data?.data?.deliveries ||
      raw?.data?.deliveries ||
      raw?.deliveries ||
      []
    );
  }, [projectDeliveriesRes]);

  // Extract all valid delivery dates (YYYY-MM-DD) sorted chronologically
  const validDeliveryDates = useMemo(() => {
    const dates = projectDeliveries
      .map((d) => (d as { schedule?: { deliveryDate?: string } }).schedule?.deliveryDate || d.deliveryDate)
      .filter((d): d is string => Boolean(d && dayjs(d).isValid()))
      .map((d) => dayjs(d).format("YYYY-MM-DD"));
    return Array.from(new Set(dates)).sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
  }, [projectDeliveries]);

  // Target delivery date: Earliest upcoming date; fallback to most recent past date
  const targetDeliveryDate = useMemo(() => {
    if (validDeliveryDates.length === 0) return null;
    const todayStr = dayjs().format("YYYY-MM-DD");
    const upcoming = validDeliveryDates.find((d) => d >= todayStr);
    return upcoming || validDeliveryDates[validDeliveryDates.length - 1];
  }, [validDeliveryDates]);

  // Auto-Jump Effect with Project Selection Tracking
  const autoJumpedProjectRef = useRef<string | null>(null);

  useEffect(() => {
    const currentKey = effectiveProjectId || leadId || null;

    if (!currentKey) {
      if (autoJumpedProjectRef.current !== null) {
        autoJumpedProjectRef.current = null;
        // User switched back to "All Projects"
        const today = dayjs();
        setTimeout(() => {
          setCurrentMonth(today.startOf("month"));
          setSelectedDate(today);
        }, 0);
      }
      return;
    }

    // A project is selected: auto-jump once data has loaded
    if (autoJumpedProjectRef.current !== currentKey && isDeliveriesFetched) {
      autoJumpedProjectRef.current = currentKey;
      if (targetDeliveryDate) {
        const targetDay = dayjs(targetDeliveryDate);
        setTimeout(() => {
          setCurrentMonth(targetDay.startOf("month"));
          setSelectedDate(targetDay);
        }, 0);
      }
    }
  }, [
    effectiveProjectId,
    leadId,
    isDeliveriesFetched,
    targetDeliveryDate,
    setCurrentMonth,
    setSelectedDate,
  ]);

  const hasNoDeliveries =
    isProjectSelected &&
    isDeliveriesFetched &&
    !isLoadingProjectDeliveries &&
    projectDeliveries.length === 0;

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf("month").day();

  const days = [];
  // Previous month padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevDate = currentMonth.subtract(1, "month").date(
      currentMonth.subtract(1, "month").daysInMonth() - firstDayOfMonth + i + 1
    );
    days.push({
      day: prevDate.date(),
      current: false,
      dateStr: prevDate.format("YYYY-MM-DD"),
    });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const curDate = currentMonth.date(i);
    days.push({
      day: i,
      current: true,
      dateStr: curDate.format("YYYY-MM-DD"),
    });
  }

  // Filter deliveries for selected date
  const deliveriesForSelectedDate = useMemo(() => {
    const selectedDateStr = selectedDate.format("YYYY-MM-DD");
    if (isProjectSelected) {
      return projectDeliveries.filter((d) => {
        const dDate =
          (d as { schedule?: { deliveryDate?: string } }).schedule?.deliveryDate ||
          d.deliveryDate;
        return dDate && dayjs(dDate).format("YYYY-MM-DD") === selectedDateStr;
      });
    }
    return deliveries.filter((d) => {
      const dDate =
        (d as { schedule?: { deliveryDate?: string } }).schedule?.deliveryDate ||
        d.deliveryDate;
      return dDate && dayjs(dDate).format("YYYY-MM-DD") === selectedDateStr;
    });
  }, [isProjectSelected, projectDeliveries, deliveries, selectedDate]);

  return (
    <div className="space-y-4">
      {/* Controls bar: Project Selector & Add Delivery */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">Project</span>
          <div className="w-64">
            <ProjectSelector
              value={effectiveProjectId}
              onChange={handleProjectChange}
              placeholder="All Projects"
              showAllOption
            />
          </div>
        </div>
        <button
          onClick={() => setIsAddDeliveryOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Delivery
        </button>
      </div>

      {/* Calendar Grid + Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-w-0 bg-white">
          <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => {
                const today = dayjs();
                setCurrentMonth(today.startOf("month"));
                setSelectedDate(today);
              }}
              className="bg-gray-50 px-4 py-1.5 rounded-lg text-sm font-bold text-gray-700 border border-gray-200 w-full sm:w-auto hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Today
            </button>

            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap min-w-[150px] text-center">
                {currentMonth.format("MMMM YYYY")}
              </h2>
              <button
                onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="relative w-full sm:w-auto">
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500 font-medium">
              Loading calendar data...
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-7 overflow-x-auto bg-white min-w-[600px] sm:min-w-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-3 text-center text-sm font-medium text-gray-400 border-b border-gray-50">
                  {day}
                </div>
              ))}

              {days.map((item, idx) => {
                const isSelected =
                  item.current &&
                  currentMonth.date(item.day).isSame(selectedDate, "day");
                const dateStr = item.dateStr;
                const dayDeliveries: ProjectCalendarDelivery[] = item.current
                  ? deliveries.filter((d) => {
                      const dDate =
                        (d as { schedule?: { deliveryDate?: string } }).schedule
                          ?.deliveryDate || d.deliveryDate;
                      return dDate && dayjs(dDate).format("YYYY-MM-DD") === dateStr;
                    })
                  : [];

                const projectDeliveriesOnDay = isProjectSelected
                  ? projectDeliveries.filter((d) => {
                      const dDate =
                        (d as { schedule?: { deliveryDate?: string } }).schedule
                          ?.deliveryDate || d.deliveryDate;
                      return dDate && dayjs(dDate).format("YYYY-MM-DD") === dateStr;
                    })
                  : [];

                const hasAnyDeliveries =
                  dayDeliveries.length > 0 || projectDeliveriesOnDay.length > 0;
                const isTargetDay =
                  isProjectSelected &&
                  targetDeliveryDate &&
                  dayjs(targetDeliveryDate).format("YYYY-MM-DD") === dateStr;

                const displayDayDeliveries = isProjectSelected
                  ? projectDeliveriesOnDay
                  : dayDeliveries;

                return (
                  <div
                    key={idx}
                    onClick={() => item.current && setSelectedDate(currentMonth.date(item.day))}
                    className={`min-h-[105px] sm:min-h-[115px] p-2 border-r border-b border-gray-200/60 last:border-r-0 cursor-pointer relative transition-all ${
                      isSelected
                        ? "ring-2 ring-blue-600 ring-inset z-10 bg-blue-50/40"
                        : isTargetDay
                        ? "bg-blue-50/50 ring-2 ring-blue-400/80 ring-dashed ring-inset z-10 hover:bg-blue-50/70"
                        : hasAnyDeliveries && isProjectSelected
                        ? "bg-blue-50/20 hover:bg-blue-50/40"
                        : item.current
                        ? "bg-white hover:bg-gray-50/50"
                        : "bg-gray-50/30"
                    }`}
                  >
                    <div className="flex justify-center mb-1 sm:mb-2">
                      <span
                        className={`text-xs sm:text-sm font-semibold transition-colors ${
                          !item.current
                            ? "text-gray-300 font-normal"
                            : isSelected
                            ? "bg-blue-600 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold shadow-xs"
                            : isTargetDay
                            ? "bg-blue-100 text-blue-800 border border-blue-400 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold shadow-2xs"
                            : hasAnyDeliveries && isProjectSelected
                            ? "text-blue-700 font-bold bg-blue-100/70 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center"
                            : "text-gray-800"
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {item.current &&
                        displayDayDeliveries
                          .slice(0, 3)
                          .map((delivery: ProjectCalendarDelivery | ApiDeliveryItem, dIdx: number) => {
                            const projInfo = getDeliveryProjectInfo(delivery, projects, leadsList);
                            const deliveryTitle =
                              delivery.title ||
                              ("material" in delivery && delivery.material) ||
                              delivery.description ||
                              delivery.deliveryNumber ||
                              projInfo.projectName ||
                              "Delivery";

                          return (
                            <div
                              key={delivery._id || delivery.deliveryId || dIdx}
                              className="flex items-center gap-1 px-1 py-0.5 rounded transition-colors hover:bg-white/50"
                              title={`${deliveryTitle} — ${projInfo.projectName || "No Project"}`}
                            >
                              <div
                                className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: statusColors[delivery.status || ""] || "#3B82F6",
                                }}
                              />
                              <span className="text-[8px] sm:text-[10px] font-bold text-gray-700 truncate">
                                {deliveryTitle}
                              </span>
                            </div>
                          );
                        })}
                      {item.current && displayDayDeliveries.length > 3 && (
                        <div className="text-[8px] sm:text-[10px] font-medium text-gray-400 pl-1">
                          +{displayDayDeliveries.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Details Panel */}
        <div className="w-full lg:w-[380px] space-y-6 overflow-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedDate.format("dddd, MMMM D, YYYY")}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
              <p className="text-sm font-medium text-gray-500">Deliveries on this date</p>
              <button
                onClick={() => setIsAddDeliveryOpen(true)}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Delivery
              </button>
            </div>

            <div className="space-y-4">
              {loading || isLoadingProjectDeliveries ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500 font-medium">Loading deliveries...</p>
                </div>
              ) : hasNoDeliveries ? (
                <div className="py-10 px-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/60 my-2">
                  <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500 mb-3">
                    <PackageX className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">No Deliveries Found</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                    No deliveries are currently scheduled for{" "}
                    <span className="font-semibold text-gray-700">
                      {effectiveSelectedProject?.projectName || "this project"}
                    </span>.
                  </p>
                  <button
                    onClick={() => setIsAddDeliveryOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Delivery</span>
                  </button>
                </div>
              ) : deliveriesForSelectedDate.length === 0 ? (
                <div className="py-8 px-3 text-center">
                  <p className="text-xs text-gray-400 font-medium">No deliveries on this date</p>
                  {isProjectSelected && validDeliveryDates.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-600 mb-2">Jump to project deliveries:</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {validDeliveryDates.slice(0, 4).map((dStr) => (
                          <button
                            key={dStr}
                            onClick={() => {
                              const dDay = dayjs(dStr);
                              setCurrentMonth(dDay.startOf("month"));
                              setSelectedDate(dDay);
                            }}
                            className="text-[11px] px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors cursor-pointer border border-blue-200/60"
                          >
                            {dayjs(dStr).format("MMM D, YYYY")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                deliveriesForSelectedDate.map(
                  (delivery: ProjectCalendarDelivery | ApiDeliveryItem, dIdx: number) => {
                    const projInfo = getDeliveryProjectInfo(delivery, projects, leadsList);
                    const displayProjectName =
                      effectiveSelectedProject?.projectName ||
                      projInfo.projectName ||
                      projInfo.jobId ||
                      "No Project";
                    const displayLocation =
                      delivery.sectionLocation ||
                      ("deliveryLocation" in delivery && delivery.deliveryLocation) ||
                      delivery.location ||
                      projInfo.location;

                  return (
                    <div
                      key={delivery._id || delivery.deliveryId || dIdx}
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setIsDetailsOpen(true);
                      }}
                      className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-full">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {delivery.title ||
                              delivery.material ||
                              delivery.description ||
                              delivery.deliveryNumber ||
                              "Delivery Item"}
                          </p>
                          {delivery.title &&
                            delivery.description &&
                            delivery.description !== delivery.title && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {delivery.description}
                              </p>
                            )}
                          <div className="mt-3 pt-2.5 border-t border-gray-50">
                            <p className="text-[11px] text-gray-400 font-medium mb-0.5">
                              Project / Job ID
                            </p>
                            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5 flex-wrap">
                              <span>{displayProjectName}</span>
                              {projInfo.jobId && projInfo.jobId !== displayProjectName && (
                                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                                  #{projInfo.jobId}
                                </span>
                              )}
                            </p>
                          </div>
                          {displayLocation && (
                            <div className="mt-2">
                              <p className="text-[11px] text-gray-400 font-medium mb-0.5">
                                Location / Section
                              </p>
                              <p className="text-xs font-medium text-gray-700">
                                {displayLocation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                        <div>
                          <p className="text-[11px] text-gray-400 font-medium">Delivery Date</p>
                          <p className="text-xs font-bold text-gray-900">
                            {selectedDate.format("MMM D, YYYY")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-gray-400 font-medium mb-0.5">Status</p>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{
                              color: statusColors[delivery.status || ""] || "#3B82F6",
                              backgroundColor: `${
                                statusColors[delivery.status || ""] || "#3B82F6"
                              }15`,
                            }}
                          >
                            {formatStatus(delivery.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => navigate("/construction/all-deliveries")}
              className="w-full mt-6 py-3 text-sm font-bold text-blue-600 flex items-center justify-center gap-2 border-t border-gray-50 hover:text-blue-700 transition-colors cursor-pointer"
            >
              View All Deliveries
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AddDeliverySheet
        isOpen={isAddDeliveryOpen}
        onOpenChange={setIsAddDeliveryOpen}
        projects={projects}
        defaultDate={selectedDate.format("YYYY-MM-DD")}
      />

      {selectedDelivery && (
        <DeliveryDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedDelivery(null);
          }}
          deliveryId={selectedDelivery.deliveryId || selectedDelivery._id || null}
          delivery={{
            deliveryId: selectedDelivery.deliveryId || selectedDelivery._id || "",
            deliveryNumber: selectedDelivery.deliveryNumber || "DEL",
            status: selectedDelivery.status || "draft",
            deliveryDate: selectedDelivery.deliveryDate,
            material:
              selectedDelivery.title ||
              selectedDelivery.material ||
              selectedDelivery.description,
            project: {
              projectName:
                effectiveSelectedProject?.projectName ||
                getDeliveryProjectInfo(selectedDelivery, projects, leadsList).projectName,
              jobId:
                (effectiveSelectedProject?.jobId as string) ||
                getDeliveryProjectInfo(selectedDelivery, projects, leadsList).jobId,
              site:
                (effectiveSelectedProject?.location as string) ||
                getDeliveryProjectInfo(selectedDelivery, projects, leadsList).location,
            },
          }}
        />
      )}
    </div>
  );
}

export { ProjectCalendarComponent as Calendar };
