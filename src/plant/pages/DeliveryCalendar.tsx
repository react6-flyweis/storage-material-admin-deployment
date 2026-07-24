import React, { useRef, useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, isSameMonth, subMonths, addMonths, setMonth, setYear, addDays, subDays, addWeeks, subWeeks } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Truck,
  Clock,
  AlertTriangle
} from "lucide-react";
import {Button} from "@/components/ui/button";
import Modal from "../components/Modal";
import { type Delivery, statusConfig, DeliveryCard } from "./DeliveryComponents";
import DailyDeliveriesModal from "./DailyDeliveriesModal";
import { RescheduleSuccessModal } from "./DeliveryActionModals";
import SuccessModal from "../components/common_component/SuccessModal";
import TitleSubtitle from "../components/common_component/TitleSubtitle";
import DeliveryFilterModal from "./DeliveryFilterModal";
import { useCalendarDeliveriesQuery } from "@/modules/plant/deliveries.hooks";
import { type CalendarDeliveryItem } from "@/modules/plant/deliveries.api";
import { useDeliveryStatusUpdate } from "./useDeliveryStatusUpdate";
import RescheduleDeliveryDialog from "@/plant/components/RescheduleDeliveryDialog";
import MarkDeliveredSuccessDialog from "@/plant/components/MarkDeliveredSuccessDialog";


const getLeadProjectName = (project: any, customer: any) => {
  if (project?.projectName) return project.projectName;
  if (customer?.name) return `${customer.name}'s Project`;
  return "N/A";
};

const mapApiDeliveryToDelivery = (item: CalendarDeliveryItem, dateStr: string): Delivery => {
  const statusMap: Record<string, Delivery["status"]> = {
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    in_transit: "In Transit",
    delivered: "Delivered",
    delayed: "Delayed",
    cancelled: "Cancelled",
    draft: "Draft",
    bidding_sent: "Bidding Sent",
    carrier_selected: "Carrier Selected",
  };
  const uiStatus = statusMap[item.status] || "Scheduled";

  return {
    id: item._id || item.delivery?._id || item.requestId || "",
    title: item.project?.projectName || item.delivery?.description || item.delivery?.loadDescription || "Shipment",
    projectId: item.deliveryNumber || item.delivery?.deliveryNumber || item.requestId || "",
    status: uiStatus,
    badges: [],
    project: getLeadProjectName(item.project, item.customer),
    customer: item.customer?.name || "N/A",
    timeWindow: item.delivery?.timings || item.deliveryTime || item.delivery?.deliveryTime || "N/A",
    receivingContact: item.poc?.receivingPoc || item.delivery?.receivingPoc || item.customer?.name || "N/A",
    vendor: item.carrier?.carrierName || item.shipperVendor?.vendorName || "N/A",
    siteLocation: item.deliveryLocation || item.delivery?.deliveryLocation || "N/A",
    requiredEquipment: item.equipment?.join(", ") || item.delivery?.loadingEquipment?.join(", ") || "None",
    internalOwner: "N/A",
    carrier: item.carrier?.carrierName || "N/A",
    freightLoad: item.requestId || "",
    date: dateStr,
  };
};

const MiniDeliveryCard = ({ delivery, onClick }: { delivery: Delivery; onClick?: () => void }) => {
  const config = statusConfig[delivery.status];
  return (
    <div onClick={onClick} className="bg-white p-3 rounded-xl border-l-4 shadow-sm border border-gray-100 space-y-2 text-left cursor-pointer" style={{ borderLeftColor: config.dotColor }}>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dotColor }} />
        <p className="text-[11px] font-semibold text-[#212B36] truncate">{delivery.project}</p>
      </div>
      <p className="text-[9px] font-medium text-[#637381]">{delivery.customer}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[9px] text-[#637381]"><Truck size={10} /> {delivery.vendor}</div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#637381]"><Clock size={10} /> {delivery.timeWindow}</div>
      </div>
      <p className="text-[9px] font-semibold pt-1" style={{ color: config.dotColor }}>{delivery.status}</p>
    </div>
  );
};

const SelectDateModal = ({ isOpen, onClose, onSelect, initialDate, activeView }: { isOpen: boolean; onClose: () => void; onSelect: (date: Date) => void; initialDate: Date; activeView: string }) => {
  const [viewDate, setViewDate] = useState(initialDate);
  const [tempDate, setTempDate] = useState(initialDate);

  useEffect(() => {
    if (isOpen) {
      setViewDate(initialDate);
      setTempDate(initialDate);
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const currentMonthStart = startOfMonth(today);
  const canGoPrev = viewDate > currentMonthStart;

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setViewDate(subMonths(viewDate, 1));
    }
  };
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const viewYear = viewDate.getFullYear();

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: format(new Date(2000, i, 1), "MMM"),
    value: (i + 1).toString()
  })).filter((_, i) => {
    if (viewYear === currentYear) {
      return i >= currentMonthIndex;
    }
    return true;
  });

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    return { label: year.toString(), value: year.toString() };
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader width="max-w-[440px]">
      <div className="p-4 space-y-4 font-inter">
        <h2 className="text-base md:text-xl font-semibold text-[#212B36]">
          {activeView === "Day" ? "Select Date" : activeView === "Week" ? "Select Week" : "Select Month"}
        </h2>
        <div className="border border-gray-300 rounded-2xl p-4 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              className={`p-2 hover:bg-gray-50 rounded-full transition-colors ${!canGoPrev ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <ChevronLeft size={20} className="text-[#212B36]" />
            </button>
            <div className="flex gap-2 text-sm font-semibold">
              <select
                value={format(viewDate, "M")}
                onChange={(e) => setViewDate(setMonth(viewDate, parseInt(e.target.value) - 1))}
                className="border border-gray-200 rounded-lg px-2.5 py-1 outline-none text-[#051321] font-medium bg-white focus:border-blue-400 transition-all cursor-pointer text-sm"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={format(viewDate, "yyyy")}
                onChange={(e) => {
                  const nextYear = parseInt(e.target.value);
                  let nextDate = setYear(viewDate, nextYear);
                  if (nextYear === currentYear && nextDate.getMonth() < currentMonthIndex) {
                    nextDate = setMonth(nextDate, currentMonthIndex);
                  }
                  setViewDate(nextDate);
                }}
                className="border border-gray-200 rounded-lg px-2.5 py-1 outline-none text-[#051321] font-medium bg-white focus:border-blue-400 transition-all cursor-pointer text-sm"
              >
                {yearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ChevronRight size={20} className="text-[#212B36]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
              <span key={day} className="text-xs font-medium text-[#919EAB] pb-2 uppercase tracking-wider">{day}</span>
            ))}
            {days.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, viewDate);
              const isPast = day < today;

              let isSelected = false;
              let isRangeStart = false;
              let isRangeEnd = false;
              let isInRange = false;

              if (!isPast) {
                if (activeView === "Week") {
                  const weekStart = startOfWeek(tempDate, { weekStartsOn: 0 });
                  const weekEnd = endOfWeek(tempDate, { weekStartsOn: 0 });
                  isSelected = isSameDay(day, tempDate);
                  isInRange = day >= weekStart && day <= weekEnd;
                  isRangeStart = isSameDay(day, weekStart);
                  isRangeEnd = isSameDay(day, weekEnd);
                } else if (activeView === "Month") {
                  const monthS = startOfMonth(tempDate);
                  const monthE = endOfMonth(tempDate);
                  isSelected = isSameDay(day, tempDate);
                  isInRange = isCurrentMonth && day >= monthS && day <= monthE;
                  isRangeStart = isCurrentMonth && isSameDay(day, monthS);
                  isRangeEnd = isCurrentMonth && isSameDay(day, monthE);
                } else {
                  isSelected = isSameDay(day, tempDate);
                }
              }

              let bgClass = "";
              if (isPast) {
                bgClass = "text-[#919EAB] opacity-30 cursor-not-allowed";
              } else if (isSelected) {
                bgClass = "bg-[#1E51A4] text-white shadow-lg z-10 rounded-md";
              } else if (isInRange) {
                bgClass = "bg-[#1E51A4]/10 text-[#1E51A4] hover:bg-[#1E51A4]/20";
                if (isRangeStart) bgClass += " rounded-l-md";
                if (isRangeEnd) bgClass += " rounded-r-md";
              } else if (isCurrentMonth) {
                bgClass = "text-[#212B36] hover:bg-gray-50 rounded-md";
              } else {
                bgClass = "text-[#919EAB] opacity-40 hover:bg-gray-50 rounded-md";
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isPast && setTempDate(day)}
                  disabled={isPast}
                  className={`h-11 w-11 flex items-center justify-center text-sm font-medium transition-all relative ${bgClass}`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 pt-2">
          <Button onClick={onClose} variant="white">Cancel</Button>
          <Button onClick={() => { if (tempDate >= today) { onSelect(tempDate); } onClose(); }}
            variant="purpleFilled">Save</Button>
        </div>
      </div>
    </Modal>
  );
};

const DeliveryCalendarView: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [activeView, setActiveView] = useState("Day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // New modal states
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isMarkDeliveredModalOpen, setIsMarkDeliveredModalOpen] = useState(false);
  const [isRescheduleSuccessOpen, setIsRescheduleSuccessOpen] = useState(false);
  const [isReminderSuccessOpen, setIsReminderSuccessOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string>("");
  const [selectedDeliveryForModal, setSelectedDeliveryForModal] = useState<Delivery | null>(null);
  const [rescheduleData, setRescheduleData] = useState<{ date: string; timeWindowStart: string; timeWindowEnd: string } | null>(null);

  const { updateDeliveryStatus, toastMessage } = useDeliveryStatusUpdate();

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    if (activeView === "Day") calendarApi.changeView("dayGridDay");
    else if (activeView === "Week") calendarApi.changeView("dayGridWeek");
    else if (activeView === "Month") calendarApi.changeView("dayGridMonth");

    calendarApi.gotoDate(currentDate);
  }, [activeView, currentDate]);

  const dateRange = useMemo(() => {
    let fromDate: Date;
    let toDate: Date;

    if (activeView === "Day") {
      fromDate = currentDate;
      toDate = currentDate;
    } else if (activeView === "Week") {
      fromDate = startOfWeek(currentDate, { weekStartsOn: 0 });
      toDate = endOfWeek(currentDate, { weekStartsOn: 0 });
    } else {
      fromDate = startOfMonth(currentDate);
      toDate = endOfMonth(currentDate);
    }

    return {
      fromDate: format(fromDate, "yyyy-MM-dd"),
      toDate: format(toDate, "yyyy-MM-dd"),
    };
  }, [currentDate, activeView]);

  const { data: calendarResponse } = useCalendarDeliveriesQuery({
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    projectId: filters.project || undefined,
    customerId: filters.customer || undefined,
  });

  const calendarData = calendarResponse?.data;

  const deliveries: Delivery[] = useMemo(() => {
    if (!calendarData?.dates) return [];
    return calendarData.dates.flatMap((dateGroup) =>
      (dateGroup.deliveries || []).map((d) => mapApiDeliveryToDelivery(d, dateGroup.date))
    );
  }, [calendarData]);

  const todaysDeliveriesCount = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayGroup = calendarData?.dates?.find((d) => d.date === todayStr);
    return todayGroup ? todayGroup.totalDeliveries : 0;
  }, [calendarData]);

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setIsDatePickerOpen(false);
  };

  const canGoPrevMain = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeView === "Day") {
      const currentDayStart = new Date(currentDate);
      currentDayStart.setHours(0, 0, 0, 0);
      return currentDayStart > today;
    } else if (activeView === "Week") {
      const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const todayWeekStart = startOfWeek(today, { weekStartsOn: 0 });
      return currentWeekStart > todayWeekStart;
    } else {
      const currentMonthStart = startOfMonth(currentDate);
      const todayMonthStart = startOfMonth(today);
      return currentMonthStart > todayMonthStart;
    }
  }, [currentDate, activeView]);

  const handlePrev = () => {
    if (!canGoPrevMain) return;
    if (activeView === "Day") {
      setCurrentDate(prev => subDays(prev, 1));
    } else if (activeView === "Week") {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (activeView === "Day") {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (activeView === "Week") {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const dateLabel = useMemo(() => {
    if (activeView === "Day") {
      return format(currentDate, "dd MMM yyyy");
    } else if (activeView === "Week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (start.getFullYear() !== end.getFullYear()) {
        return `${format(start, "dd MMM yyyy")} - ${format(end, "dd MMM yyyy")}`;
      } else if (start.getMonth() !== end.getMonth()) {
        return `${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy")}`;
      } else {
        return `${format(start, "dd")} - ${format(end, "dd MMM yyyy")}`;
      }
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  }, [currentDate, activeView]);

  const handleDateClick = (arg: { date: Date }) => {
    if (activeView === "Month") {
      setSelectedDay(arg.date);
      setIsDailyModalOpen(true);
    }
  };

  const handleReschedule = (id: string) => {
    setActiveDeliveryId(id);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = (data: { date: string; timeWindowStart: string; timeWindowEnd: string }) => {
    setRescheduleData(data);
    setIsRescheduleModalOpen(false);
    setIsRescheduleSuccessOpen(true);
  };

  const handleMarkInTransit = (id: string) => {
    setActiveDeliveryId(id);
    updateDeliveryStatus(id, "in_transit");
  };

  const handleMarkDelivered = (id: string) => {
    setActiveDeliveryId(id);
    updateDeliveryStatus(id, "delivered", () => {
      setIsMarkDeliveredModalOpen(true);
    });
  };

  const handleSendReminder = (id: string) => {
    setIsReminderSuccessOpen(!!id);
  };

  const renderEventContent = (eventInfo: { event: { extendedProps: Delivery } }) => {
    const delivery = eventInfo.event.extendedProps;

    if (activeView === "Day") {
      return (
        <DeliveryCard
          delivery={delivery}
          onReschedule={handleReschedule}
          onMarkInTransit={handleMarkInTransit}
          onMarkDelivered={handleMarkDelivered}
          onSendReminder={handleSendReminder}
        />
      );
    } else if (activeView === "Week") {
      return <MiniDeliveryCard delivery={delivery} onClick={() => setSelectedDeliveryForModal(delivery)} />;
    } else {
      // Month view summary
      return (
        <div className="mt-1 space-y-1 w-full px-1">
          <div className="h-1 bg-[#2B7FFF] rounded-full w-full" />
          <p className="text-[10px] font-bold text-[#212B36] truncate">{delivery.title}</p>
        </div>
      );
    }
  };

  const filteredDeliveries = selectedDay
    ? deliveries.filter(d => isSameDay(new Date(d.date), selectedDay))
    : [];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce ${toastMessage.includes("Error:") ? "bg-red-500" : "bg-[#10B981]"
          }`}>
          <AlertTriangle size={18} strokeWidth={3} />
          {toastMessage}
        </div>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <TitleSubtitle title="Delivery Calendar" subtitle="Schedule and track deliveries in calendar view" />

        <div className="flex  items-center gap-4">
          <Button variant="primary" size="sm" onClick={() => setIsFilterModalOpen(true)}>Filters</Button>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={handlePrev}
              disabled={!canGoPrevMain}
              className={`p-1.5 hover:bg-gray-50 rounded-md transition-colors text-[#637381] hover:text-[#212B36] ${!canGoPrevMain ? "opacity-30 cursor-not-allowed" : ""}`}
              aria-label="Previous range"
            >
              <ChevronLeft size={18} />
            </button>
            <div
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center gap-2 h-8 px-3 rounded-md text-sm font-semibold text-[#212B36] cursor-pointer hover:bg-gray-50"
            >
              <span>{dateLabel}</span>
              <CalendarDays size={16} className="text-[#637381]" />
            </div>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-gray-50 rounded-md transition-colors text-[#637381] hover:text-[#212B36]"
              aria-label="Next range"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex p-1 bg-white border border-gray-200 rounded-lg">
            {["Day", "Week", "Month"].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-6 py-1.5 text-sm font-bold rounded-md transition-all ${activeView === view ? "bg-[#1E51A4] text-white shadow-sm" : "text-[#637381]"}`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-[14px] border border-gray-100 overflow-auto max-h-[750px] p-4 calendar-custom custom-scrollbar calendar-view-${activeView.toLowerCase()}`}>
        <div className="flex flex-wrap gap-4 mb-8 mt-2">
          <div className="px-5 py-2.5 bg-[#4169B830] text-[#02318C] rounded-[8px] text-sm font-normal">Total Deliveries: {todaysDeliveriesCount} deliveries</div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridDay"
          initialDate={currentDate}
          headerToolbar={false}
          dayHeaderFormat={
            activeView === "Week"
              ? { weekday: "short", day: "numeric", month: "short" }
              : activeView === "Month"
                ? { weekday: "long" }
                : { weekday: "long", month: "long", day: "numeric", year: "numeric" }
          }
          events={deliveries.map(d => ({
            id: d.id,
            title: d.title,
            start: d.date,
            extendedProps: d
          }))}
          eventContent={renderEventContent}
          dateClick={handleDateClick}
          dayCellClassNames={() => "calendar-day-cell cursor-pointer"}
          eventClassNames={() => "calendar-event-item cursor-pointer"}
          height="auto"
        />
      </div>

      <SelectDateModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleDateSelect}
        initialDate={currentDate}
        activeView={activeView}
      />

      <DeliveryFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setIsFilterModalOpen(false);
        }}
      />

      <DailyDeliveriesModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        date={selectedDay}
        deliveries={filteredDeliveries}
        onReschedule={handleReschedule}
        onMarkInTransit={handleMarkInTransit}
        onMarkDelivered={handleMarkDelivered}
        onSendReminder={handleSendReminder}
      />

      {(() => {
        const matchedDelivery = deliveries.find(d => d.id === activeDeliveryId);
        const [timeStart = "", timeEnd = ""] = matchedDelivery ? (matchedDelivery.timeWindow || "").split(/\s*[-–]\s*/) : [];
        return (
          <RescheduleDeliveryDialog
            open={isRescheduleModalOpen}
            onOpenChange={setIsRescheduleModalOpen}
            deliveryId={activeDeliveryId}
            initialDate={matchedDelivery?.date}
            initialTimeWindowStart={timeStart}
            initialTimeWindowEnd={timeEnd}
            onSubmit={handleRescheduleSubmit}
          />
        );
      })()}

      <Modal isOpen={!!selectedDeliveryForModal} onClose={() => setSelectedDeliveryForModal(null)} hideHeader width="max-w-[1000px]">
        <div className="p-4 md:p-6 space-y-6">
          {selectedDeliveryForModal && (
            <DeliveryCard
              delivery={selectedDeliveryForModal}
              onReschedule={(id) => {
                setSelectedDeliveryForModal(null);
                handleReschedule(id);
              }}
              onMarkInTransit={(id) => {
                setSelectedDeliveryForModal(null);
                handleMarkInTransit(id);
              }}
              onMarkDelivered={(id) => {
                setSelectedDeliveryForModal(null);
                handleMarkDelivered(id);
              }}
              onSendReminder={(id) => {
                handleSendReminder(id);
              }}
              onViewDetails={() => {
                setSelectedDeliveryForModal(null);
              }}
            />
          )}
        </div>
      </Modal>

      <MarkDeliveredSuccessDialog
        open={isMarkDeliveredModalOpen}
        onOpenChange={setIsMarkDeliveredModalOpen}
        deliveryTime="11:00 AM"
        receiverName="Receiver Name"
        deliveryNotes="NA"
      />

      {(() => {
        const matchedDelivery = deliveries.find(d => d.id === activeDeliveryId);
        return (
          <RescheduleSuccessModal
            isOpen={isRescheduleSuccessOpen}
            onClose={() => setIsRescheduleSuccessOpen(false)}
            projectName={matchedDelivery?.title || "Delivery"}
            newDate={rescheduleData ? new Date(rescheduleData.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric" }) : undefined}
            timeWindow={rescheduleData ? `${rescheduleData.timeWindowStart} – ${rescheduleData.timeWindowEnd}` : undefined}
            contact={matchedDelivery?.receivingContact || "Site Manager"}
          />
        );
      })()}

      <SuccessModal
        isLogoBottom={false}
        isOpen={isReminderSuccessOpen}
        onClose={() => setIsReminderSuccessOpen(false)}
        title="Reminder Sent Successfully"
        buttonText="Ok"
      />

      <style>{`
        .calendar-custom .fc { font-family: 'Inter', sans-serif; border: none; }
        .calendar-custom .fc-theme-standard td, .calendar-custom .fc-theme-standard th { border: 1px solid #F4F6F8; }
        .calendar-custom .fc-col-header-cell { background: white; padding: 16px 0; }
        .calendar-custom .fc-col-header-cell-cushion { font-size: 14px; font-weight: 700; color: #212B36; text-transform: uppercase; }
        .calendar-custom .fc-daygrid-day-number { font-weight: 700; color: #212B36; padding: 12px; }
        .calendar-custom .fc-event { background: transparent; border: none; padding: 0; }
        .fc-h-event { background-color: transparent !important; border: none !important; }
        .calendar-custom .fc-daygrid-day-frame { min-height: 120px; }
        .calendar-custom.calendar-view-week .fc,
        .calendar-custom.calendar-view-month .fc {
          min-width: 1400px;
        }
        .calendar-custom.calendar-view-week .fc-col-header-cell,
        .calendar-custom.calendar-view-week .fc-daygrid-day,
        .calendar-custom.calendar-view-month .fc-col-header-cell,
        .calendar-custom.calendar-view-month .fc-daygrid-day {
          min-width: 200px;
        }
        .calendar-custom .fc-day-today { background: #F4F6F8 !important; }
        .calendar-custom .fc-day-today .fc-col-header-cell-cushion { color: #2B7FFF; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E4E6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DeliveryCalendarView;
