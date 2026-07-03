import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  List,
  PlusIcon,
  Phone,
  Mail,
  Clock,
  Building,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpcomingFollowUpsQuery } from "@/modules/followups/followups.hooks";
import AddFollowUpDialog from "./add-follow-up-dialog";

type ViewMode = "schedule" | "calendar" | "list";

interface FollowUp {
  id: string;
  date: string;
  customer: string;
  type: string;
  time?: string;
  company?: string;
  status?: "overdue" | "upcoming" | "normal";
}

function inferTypeFromNotes(notes?: string) {
  const value = notes?.toLowerCase() ?? "";

  if (value.includes("email")) {
    return "Email";
  }

  if (value.includes("call")) {
    return "Call";
  }

  if (value.includes("meeting")) {
    return "Meeting";
  }

  return "Follow-up";
}

export default function UpcomingFollowUps() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const {
    data: upcomingResponse,
    isLoading,
    isError,
  } = useUpcomingFollowUpsQuery();

  const followUps: FollowUp[] = (upcomingResponse?.data.followups ?? []).map(
    (item) => {
      const followUpDate = new Date(item.followUpDate);
      const now = new Date();
      const isOverdue =
        item.status !== "completed" && followUpDate.getTime() < now.getTime();

      const status: FollowUp["status"] = isOverdue
        ? "overdue"
        : item.status === "completed"
          ? "normal"
          : "upcoming";

      const lead = item.leadId as any;
      const pId = lead?.jobId || lead?.projectId;
      const pName = lead?.projectName;
      
      let projectText = "";
      if (pId && pName) {
        projectText = `${pId} - ${pName}`;
      } else if (pName) {
        projectText = pName;
      } else if (pId) {
        projectText = pId;
      } else {
        projectText = lead?.location || lead?.buildingType || "N/A";
      }

      // Strip timestamps that might be appended to project names
      projectText = projectText
        .replace(/\s\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z/g, "")
        .trim();

      const customerName = item.customerId?.firstName?.trim() || "Unknown Customer";

      return {
        id: item._id,
        date: String(followUpDate.getDate()),
        customer: projectText,
        type: item.modeOfContact
          ? item.modeOfContact.charAt(0).toUpperCase() + item.modeOfContact.slice(1)
          : inferTypeFromNotes(item.notes),
        time: followUpDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        company: customerName,
        status,
      };
    },
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getFollowUpForDay = (day: number) => {
    return followUps.filter((f) => Number(f.date) === day);
  };

  const filteredFollowUps = selectedDay
    ? followUps.filter((f) => Number(f.date) === selectedDay)
    : followUps;

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
        <div>
          <div className="flex gap-2 items-center mb-1">
            <span className="text-xl">📅</span>
            <h2 className="text-lg font-bold text-gray-900">Upcoming Follow-Ups</h2>
          </div>
          <p className="text-sm text-gray-500">
            Quick view of scheduled activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9 px-4 rounded-md"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Schedule
          </Button>
          <div className="flex gap-1 bg-slate-100/80 p-1 rounded-lg">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setViewMode("calendar");
                setSelectedDay(null);
              }}
              className={cn(
                "px-3 h-7 text-xs rounded-md",
                viewMode === "calendar"
                  ? "bg-white shadow-sm text-gray-900 hover:bg-white"
                  : "bg-transparent text-gray-500 hover:text-gray-900",
              )}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Calendar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setViewMode("list");
                setSelectedDay(null);
              }}
              className={cn(
                "px-3 h-7 text-xs rounded-md",
                viewMode === "calendar"
                  ? "bg-transparent text-gray-500 hover:text-gray-900"
                  : "bg-white shadow-sm text-gray-900 hover:bg-white",
              )}
            >
              <List className="w-3 h-3 mr-1" />
              List
            </Button>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 mb-6" />

      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading upcoming follow-ups...
        </div>
      )}

      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Failed to load upcoming follow-ups.
        </div>
      )}

      {!isLoading && !isError && viewMode === "calendar" && (
        <div className="space-y-6">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-x-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-[13px] font-medium text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-x-2 gap-y-3">
            {blankDays.map((_, i) => (
              <div key={`blank-${i}`} className="h-10"></div>
            ))}
            {daysInMonth.map((day) => {
              const followUps = getFollowUpForDay(day);
              const hasFollowUp = followUps.length > 0;
              const isToday = day === new Date().getDate();

              return (
                <div
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setViewMode("list");
                  }}
                  className={cn(
                    "h-10 flex items-center justify-center rounded-lg text-[13px] cursor-pointer mx-1",
                    isToday ? "bg-blue-600 text-white font-medium" :
                    hasFollowUp ? "bg-red-50 text-red-500 font-medium hover:bg-red-100" :
                    "text-slate-600 hover:bg-slate-50 font-medium",
                    selectedDay === day && !isToday && "ring-2 ring-blue-400 ring-offset-1"
                  )}
                >
                  <span className="flex items-center gap-1">
                    {day}
                    {hasFollowUp && !isToday && (
                      <span className="text-[18px] leading-none">•</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && !isError && viewMode === "list" && (
        <div className="space-y-2">
          {selectedDay && (
            <p className="text-sm text-gray-600">
              Showing follow-ups for {selectedDay}
            </p>
          )}

          {filteredFollowUps.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No follow-ups for this date
            </div>
          ) : (
            filteredFollowUps.map((followUp) => {
              const isOverdue = followUp.status === "overdue";
              const isUpcoming = followUp.status === "upcoming";

              const bgClass = isOverdue
                ? "bg-rose-100 border-rose-200"
                : isUpcoming
                  ? "bg-amber-100 border-amber-200"
                  : "bg-rose-50 border-rose-100";

              const Icon = (() => {
                switch (followUp.type) {
                  case "Call":
                    return <Phone className="w-5 h-5 text-gray-700" />;
                  case "Email":
                    return <Mail className="w-5 h-5 text-gray-700" />;
                  case "Meeting":
                  default:
                    return <Calendar className="w-5 h-5 text-gray-700" />;
                }
              })();

              return (
                <div
                  key={followUp.id}
                  className={cn(
                    "w-full p-4 rounded-md flex items-center justify-between",
                    "border",
                    "hover:shadow-sm",
                    bgClass,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-white/70">{Icon}</div>
                    <div>
                      <p className="font-semibold text-sm">
                        {followUp.customer}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {followUp.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" /> {followUp.company}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-500">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {viewMode === "schedule" && (
        <div className="text-center py-8 text-gray-500">
          Schedule view coming soon
        </div>
      )}

      <AddFollowUpDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </Card>
  );
}
