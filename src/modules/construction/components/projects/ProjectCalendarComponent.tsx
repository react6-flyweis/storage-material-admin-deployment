import { useState } from "react";
import dayjs from "dayjs";
import { ChevronDown, Plus } from "lucide-react";
import type { ProjectCalendarItem, ProjectCalendarDelivery } from "../construction.api";

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

interface ProjectCalendarComponentProps {
  currentMonth: dayjs.Dayjs;
  setCurrentMonth: (month: dayjs.Dayjs) => void;
  selectedDate: dayjs.Dayjs;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  projects: ProjectCalendarItem[];
  deliveries: ProjectCalendarDelivery[];
  loading?: boolean;
}

export default function ProjectCalendarComponent({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  projects,
  deliveries,
  loading = false,
}: ProjectCalendarComponentProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf("month").day();

  const days = [];
  // Previous month padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({
      day: currentMonth.subtract(1, "month").daysInMonth() - firstDayOfMonth + i + 1,
      current: false,
    });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, current: true });
  }

  // Filter deliveries for selected date
  const selectedDateStr = selectedDate.format("YYYY-MM-DD");

  const deliveriesForSelectedDate = deliveries.filter((d) => {
    if (!d.deliveryDate) return false;
    const matchesDate = dayjs(d.deliveryDate).format("YYYY-MM-DD") === selectedDateStr;
    const matchesProject = !selectedProjectId || d.project?.jobId === selectedProjectId;
    return matchesDate && matchesProject;
  });

  return (
    <div className="space-y-4">
      {/* Controls bar: Project Selector & Add Delivery */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">Project</span>
          <div className="relative w-64">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="">All Projects ({projects.length})</option>
              {projects.map((project) => (
                <option key={project._id} value={project.jobId || project._id}>
                  {project.projectName || project.jobId || "Unnamed Project"}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 self-start sm:self-auto">
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
                setCurrentMonth(today);
                setSelectedDate(today);
              }}
              className="bg-gray-50 px-4 py-1.5 rounded-lg text-sm font-bold text-gray-700 border border-gray-200 w-full sm:w-auto hover:bg-gray-100 transition-colors"
            >
              Today
            </button>

            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                const isSelected = item.current && currentMonth.date(item.day).isSame(selectedDate, "day");
                const dateStr = item.current ? currentMonth.date(item.day).format("YYYY-MM-DD") : "";
                
                const dayDeliveries = dateStr
                  ? deliveries.filter((d) => {
                      if (!d.deliveryDate) return false;
                      const matchesDate = dayjs(d.deliveryDate).format("YYYY-MM-DD") === dateStr;
                      const matchesProject = !selectedProjectId || d.project?.jobId === selectedProjectId;
                      return matchesDate && matchesProject;
                    })
                  : [];

                return (
                  <div
                    key={idx}
                    onClick={() => item.current && setSelectedDate(currentMonth.date(item.day))}
                    className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-gray-50 last:border-r-0 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50 ring-2 ring-blue-600 ring-inset z-10" : ""
                    }`}
                  >
                    <div className="flex justify-center mb-1 sm:mb-2">
                      <span
                        className={`text-[10px] sm:text-sm font-bold ${
                          !item.current
                            ? "text-gray-300"
                            : isSelected
                            ? "bg-blue-600 text-white w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center"
                            : "text-gray-900"
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {item.current &&
                        dayDeliveries.slice(0, 3).map((delivery, dIdx) => (
                          <div
                            key={delivery._id || delivery.deliveryId || dIdx}
                            className="flex items-center gap-1 px-1 py-0.5 rounded transition-colors hover:bg-white/50"
                          >
                            <div
                              className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: statusColors[delivery.status || ""] || "#3B82F6" }}
                            />
                            <span className="text-[8px] sm:text-[10px] font-bold text-gray-700 truncate">
                              {delivery.description || delivery.deliveryNumber || "Delivery"}
                            </span>
                          </div>
                        ))}
                      {item.current && dayDeliveries.length > 3 && (
                        <div className="text-[8px] sm:text-[10px] font-medium text-gray-400 pl-1">
                          +{dayDeliveries.length - 3} more
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
              <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Delivery
              </button>
            </div>

            <div className="space-y-4">
              {deliveriesForSelectedDate.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No deliveries on this date</p>
              ) : (
                deliveriesForSelectedDate.map((delivery, dIdx) => (
                  <div
                    key={delivery._id || delivery.deliveryId || dIdx}
                    className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {delivery.description || delivery.deliveryNumber || "Delivery Item"}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">
                          Project / Job ID
                        </p>
                        <p className="text-xs font-bold text-gray-700">
                          {delivery.project?.projectName || delivery.project?.jobId || "No Project"}
                        </p>
                        {delivery.project?.location && (
                          <>
                            <p className="text-[11px] text-gray-400 font-medium mt-1">Location</p>
                            <p className="text-xs font-bold text-gray-700">{delivery.project.location}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">Delivery Date</p>
                        <p className="text-xs font-bold text-gray-900">{selectedDate.format("MMM D, YYYY")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5">Status</p>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            color: statusColors[delivery.status || ""] || "#3B82F6",
                            backgroundColor: `${statusColors[delivery.status || ""] || "#3B82F6"}15`,
                          }}
                        >
                          {formatStatus(delivery.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="w-full mt-6 py-3 text-sm font-bold text-blue-600 flex items-center justify-center gap-2 border-t border-gray-50 hover:text-blue-700 transition-colors">
              View All Deliveries
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
