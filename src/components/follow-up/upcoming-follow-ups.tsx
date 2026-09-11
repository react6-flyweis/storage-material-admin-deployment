import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  List,
  PlusIcon,
  Phone,
  Mail,
  Clock,
  Building,
  Check,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalendarEventsQuery, useUpdateCalendarEventReminderMutation } from "@/modules/calendar/calendar.hooks";
import { useUpcomingFollowUpsQuery } from "@/modules/followups/followups.hooks";
import type { CalendarEventItem } from "@/modules/calendar/calendar.api";
import AddFollowUpDialog from "./add-follow-up-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type ViewMode = "calendar" | "list";

interface FollowUp {
  id: string;
  date: string;
  dateNumber: number;
  fullDate: Date;
  customer: string;
  type: string;
  time?: string;
  company?: string;
  status?: "overdue" | "upcoming" | "normal";
  source?: string;
  reminderMinutes?: number;
  reminderSms?: boolean;
  reminderEmail?: boolean;
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

  if (value.includes("sms")) {
    return "SMS";
  }

  return "Follow-up";
}

export default function UpcomingFollowUps() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Reminder editing dialog state
  const [editingEvent, setEditingEvent] = useState<FollowUp | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState<string>("30");
  const [reminderSms, setReminderSms] = useState<boolean>(true);
  const [reminderEmail, setReminderEmail] = useState<boolean>(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const startDate = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).toISOString();
  }, [currentYear, currentMonth]);

  const endDate = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();
  }, [currentYear, currentMonth]);

  // Query new calendar sync API
  const {
    data: calendarResponse,
    isLoading: isCalendarLoading,
    isError: isCalendarError,
  } = useCalendarEventsQuery({
    startDate,
    endDate,
  });

  // Fallback to legacy upcoming follow-ups
  const {
    data: fallbackUpcomingResponse,
    isLoading: isFallbackLoading,
  } = useUpcomingFollowUpsQuery();

  const { mutate: updateReminder, isPending: isUpdatingReminder } =
    useUpdateCalendarEventReminderMutation();

  const calendarEventsList: CalendarEventItem[] = useMemo(() => {
    if (!calendarResponse) return [];
    if (Array.isArray(calendarResponse.data)) {
      return calendarResponse.data;
    }
    if (Array.isArray(calendarResponse.data?.events)) {
      return calendarResponse.data.events;
    }
    return [];
  }, [calendarResponse]);

  const hasCalendarData = calendarEventsList.length > 0;
  const isLoading = isCalendarLoading && isFallbackLoading;
  const isError = isCalendarError && !fallbackUpcomingResponse;

  const followUps: FollowUp[] = useMemo(() => {
    if (hasCalendarData) {
      return calendarEventsList.map((item) => {
        const rawDate = item.followUpDate || item.meetingTime || item.startTime || item.createdAt || new Date().toISOString();
        const followUpDate = new Date(rawDate);
        const now = new Date();
        const isCompleted = item.status?.toLowerCase() === "completed";
        const isOverdue = !isCompleted && followUpDate.getTime() < now.getTime();

        const status: FollowUp["status"] = isOverdue
          ? "overdue"
          : isCompleted
          ? "normal"
          : "upcoming";

        const lead = item.leadId;
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
          projectText = lead?.location || lead?.buildingType || item.title || "N/A";
        }

        projectText = projectText
          .replace(/\s\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z/g, "")
          .trim();

        const customerName =
          item.customerId?.firstName?.trim() ||
          item.customerId?.name?.trim() ||
          "Unknown Customer";

        return {
          id: item._id,
          date: String(followUpDate.getDate()),
          dateNumber: followUpDate.getDate(),
          fullDate: followUpDate,
          customer: projectText,
          type: item.modeOfContact
            ? item.modeOfContact.charAt(0).toUpperCase() + item.modeOfContact.slice(1)
            : inferTypeFromNotes(item.notes || item.title),
          time: followUpDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          company: customerName,
          status,
          source: item.source,
          reminderMinutes: item.reminderMinutes ?? 30,
          reminderSms: item.reminderSms ?? item.sendSms ?? true,
          reminderEmail: item.reminderEmail ?? item.sendEmail ?? true,
        };
      });
    }

    return (fallbackUpcomingResponse?.data?.followups ?? []).map((item) => {
      const followUpDate = new Date(item.followUpDate);
      const now = new Date();
      const isOverdue =
        item.status !== "completed" && followUpDate.getTime() < now.getTime();

      const status: FollowUp["status"] = isOverdue
        ? "overdue"
        : item.status === "completed"
        ? "normal"
        : "upcoming";

      const lead = item.leadId;
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

      projectText = projectText
        .replace(/\s\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z/g, "")
        .trim();

      const customerName = item.customerId?.firstName?.trim() || "Unknown Customer";

      return {
        id: item._id,
        date: String(followUpDate.getDate()),
        dateNumber: followUpDate.getDate(),
        fullDate: followUpDate,
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
        source: item.source,
        reminderMinutes: item.reminderMinutes ?? 30,
        reminderSms: item.sendSms ?? true,
        reminderEmail: item.sendEmail ?? true,
      };
    });
  }, [hasCalendarData, calendarEventsList, fallbackUpcomingResponse]);

  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getFollowUpForDay = (day: number) => {
    return followUps.filter((f) => f.dateNumber === day);
  };

  const filteredFollowUps = selectedDay
    ? followUps.filter((f) => f.dateNumber === selectedDay)
    : followUps;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const openReminderEditor = (followUp: FollowUp, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(followUp);
    setReminderMinutes(String(followUp.reminderMinutes ?? 30));
    setReminderSms(followUp.reminderSms ?? true);
    setReminderEmail(followUp.reminderEmail ?? true);
  };

  const handleSaveReminder = () => {
    if (!editingEvent) return;

    updateReminder(
      {
        eventId: editingEvent.id,
        payload: {
          reminderMinutes: Number(reminderMinutes) || 30,
          reminderSms,
          reminderEmail,
        },
      },
      {
        onSuccess: () => {
          toast.success("Reminder preferences updated!");
          setEditingEvent(null);
        },
        onError: (err: unknown) => {
          const errorObj = err as { response?: { data?: { message?: string } } };
          toast.error(
            errorObj?.response?.data?.message || "Failed to update reminder preference"
          );
        },
      }
    );
  };

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
              <CalendarIcon className="w-3 h-3 mr-1" />
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

      {/* Month Header Navigation */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-800">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500 hover:text-gray-900"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500 hover:text-gray-900"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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
              const dayFollowUps = getFollowUpForDay(day);
              const hasFollowUp = dayFollowUps.length > 0;
              const isToday =
                day === new Date().getDate() &&
                currentMonth === new Date().getMonth() &&
                currentYear === new Date().getFullYear();

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
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">
                Showing follow-ups for {selectedDay} {monthLabel}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => setSelectedDay(null)}
              >
                Show all
              </Button>
            </div>
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
                    return <CalendarIcon className="w-5 h-5 text-gray-700" />;
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
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {followUp.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" /> {followUp.company}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => openReminderEditor(followUp, e)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/80 hover:bg-white text-gray-600 text-xs shadow-2xs transition-colors"
                      title="Edit reminder"
                    >
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                      <span>{followUp.reminderMinutes}m</span>
                    </button>

                    <div className="text-gray-500">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reminder Preference Edit Dialog */}
      <Dialog
        open={!!editingEvent}
        onOpenChange={(open) => {
          if (!open) setEditingEvent(null);
        }}
      >
        <DialogContent className="max-w-sm p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Reminder Preferences</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Reminder Timing</Label>
              <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="120">2 hours before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Label className="text-xs font-semibold">Delivery Channels</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={reminderSms}
                    onCheckedChange={(checked) => setReminderSms(!!checked)}
                  />
                  <span className="text-xs text-gray-700">SMS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={reminderEmail}
                    onCheckedChange={(checked) => setReminderEmail(!!checked)}
                  />
                  <span className="text-xs text-gray-700">Email</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingEvent(null)}
              disabled={isUpdatingReminder}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSaveReminder}
              disabled={isUpdatingReminder}
            >
              {isUpdatingReminder ? "Saving..." : "Save Preferences"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddFollowUpDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </Card>
  );
}
