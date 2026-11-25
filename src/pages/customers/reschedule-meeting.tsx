import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppBack } from "@/modules/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import LeadSelector from "@/components/leads/lead-selector";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useMeetingDetailQuery,
  useUpdateMeetingMutation,
} from "@/modules/meetings/meetings.hooks";
import SuccessDialog from "@/components/success-dialog";
import MeetingLinkSection from "@/components/meetings/meeting-link-section";
import type { UpdateMeetingPayload } from "@/modules/meetings/meetings.api";
import {
  getMeetingLinkError,
  getMeetingMinimums,
  getPastMeetingError,
  getZoomDurationError,
  hasZoomLink,
  isOnlineMeeting,
  resolveMeetingLink,
  toMeetingTimeIso,
} from "@/modules/meetings/meetings.utils";

type FormSnapshot = {
  leadId: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  mode: "online" | "in-person";
  notes: string;
  reminderMinutes: string;
};

export default function RescheduleMeeting() {
  const navigate = useNavigate();
  const { goBack } = useAppBack("/customers/meetings");
  const { meetingId } = useParams<{ meetingId: string }>();

  const { data: meetingResponse, isLoading: isLoadingMeeting } =
    useMeetingDetailQuery(meetingId ?? "");

  const updateMeetingMutation = useUpdateMeetingMutation();

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [implicitCustomerId, setImplicitCustomerId] = useState("");
  
  const [selectedLead, setSelectedLead] = useState("");
  const [leadName, setLeadName] = useState("");
  
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [link, setLink] = useState("");
  const [useOwnLink, setUseOwnLink] = useState(false);
  const [linkError, setLinkError] = useState<string | undefined>();
  const [notes, setNotes] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("30");
  /** Values as loaded, so the PUT only carries changed fields. */
  const [original, setOriginal] = useState<FormSnapshot | null>(null);

  const loadedMeeting = meetingResponse?.data?.meeting;
  const existingLink = loadedMeeting?.meetingLink?.trim() ?? "";
  const existingIsZoom = loadedMeeting ? hasZoomLink(loadedMeeting) : false;

  // Pre-fill form once meeting data loads
  useEffect(() => {
    const meeting = meetingResponse?.data?.meeting;
    if (!meeting) return;

    // Customer
    if (meeting.customerId) {
      if (typeof meeting.customerId === "string") {
        setImplicitCustomerId(meeting.customerId);
      } else {
        setImplicitCustomerId(meeting.customerId._id ?? "");
      }
    }

    // Lead
    if (meeting.leadId) {
      if (typeof meeting.leadId === "string") {
        setSelectedLead(meeting.leadId);
      } else {
        const leadObj = meeting.leadId as { _id?: string; projectName?: string; buildingType?: string };
        setSelectedLead(leadObj._id ?? "");
        setLeadName(leadObj.projectName || leadObj.buildingType || `Lead ${(leadObj._id || "").substring(0,6)}`);
      }
    }

    // Other fields
    const loadedMode = isOnlineMeeting(meeting.mode) ? "online" : "in-person";
    const isManualLink = Boolean(meeting.meetingLink?.trim()) && !hasZoomLink(meeting);
    setTitle(meeting.title ?? "");
    setDuration(meeting.duration ? String(meeting.duration) : "");
    setMode(loadedMode);
    // Zoom links are shown read-only; only a manual link is editable.
    setUseOwnLink(isManualLink);
    setLink(isManualLink ? meeting.meetingLink ?? "" : "");
    setNotes(meeting.notes ?? "");
    const loadedReminder =
      meeting.reminderMinutes !== undefined ? String(meeting.reminderMinutes) : "30";
    setReminderMinutes(loadedReminder);

    // Parse meetingTime → date and time
    let loadedDate = "";
    let loadedTime = "";
    if (meeting.meetingTime) {
      const dt = new Date(meeting.meetingTime);
      if (!Number.isNaN(dt.getTime())) {
        loadedDate = dt.toLocaleDateString("en-CA"); // local YYYY-MM-DD
        loadedTime = dt.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }); // HH:mm
      }
    }
    setDate(loadedDate);
    setTime(loadedTime);

    const loadedLeadId =
      typeof meeting.leadId === "string"
        ? meeting.leadId
        : ((meeting.leadId as { _id?: string } | undefined)?._id ?? "");
    setOriginal({
      leadId: loadedLeadId,
      title: meeting.title ?? "",
      date: loadedDate,
      time: loadedTime,
      duration: meeting.duration ? String(meeting.duration) : "",
      mode: loadedMode,
      notes: meeting.notes ?? "",
      reminderMinutes: loadedReminder,
    });
  }, [meetingResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedLead) {
      setErrorMessage("Please select a lead.");
      return;
    }
    if (!date || !time) {
      setErrorMessage("Please set a meeting date and time.");
      return;
    }
    // A meeting that has already passed can still have its other fields edited.
    const timeChanged =
      !original || date !== original.date || time !== original.time;
    const pastError = timeChanged ? getPastMeetingError(date, time) : undefined;
    if (pastError) {
      setErrorMessage(pastError.message);
      return;
    }
    const durationNumber = duration ? Number.parseInt(duration, 10) : NaN;
    if (durationNumber < 1) {
      setErrorMessage("Duration must be at least 1 minute.");
      return;
    }
    const durationError = getZoomDurationError(mode, useOwnLink, durationNumber);
    if (durationError) {
      setErrorMessage(durationError);
      return;
    }
    const nextLinkError = getMeetingLinkError(mode, useOwnLink, link);
    setLinkError(nextLinkError);
    if (nextLinkError) return;

    // Send only changed fields: rescheduling an online Zoom meeting updates
    // the same Zoom meeting and keeps the customer's join link.
    const payload: UpdateMeetingPayload = {};
    const o = original;
    if (!o || selectedLead !== o.leadId) {
      payload.leadId = selectedLead;
      if (implicitCustomerId) payload.customerId = implicitCustomerId;
    }
    if (!o || title !== o.title) payload.title = title;
    if (timeChanged) {
      payload.meetingTime = toMeetingTimeIso(date, time);
    }
    if ((!o || duration !== o.duration) && Number.isFinite(durationNumber)) {
      payload.duration = durationNumber;
    }
    if (!o || mode !== o.mode) payload.mode = mode;
    if (!o || notes !== o.notes) payload.notes = notes.trim();
    if (!o || reminderMinutes !== o.reminderMinutes) {
      payload.reminderMinutes = Number.parseInt(reminderMinutes, 10) || 30;
    }
    const meetingLink = resolveMeetingLink(mode, useOwnLink, link);
    if (meetingLink && meetingLink !== existingLink) {
      payload.meetingLink = meetingLink;
    }

    if (Object.keys(payload).length === 0) {
      navigate("/customers/meetings", { replace: true });
      return;
    }

    try {
      await updateMeetingMutation.mutateAsync({
        meetingId: meetingId!,
        payload,
      });

      setSuccessOpen(true);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to update meeting."));
    }
  };

  const { minDate, minTime } = getMeetingMinimums(date);

  if (isLoadingMeeting) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goBack("/customers/meetings")}
          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white h-9 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">
          Reschedule Meeting
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6 w-full">
        {errorMessage && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow space-y-5">
          <h3 className="text-base font-semibold text-gray-900">
            Meeting Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Lead — uses the custom searchable LeadSelector from @/components/leads */}
            <div className="space-y-2">
              <Label>
                Select a lead <span className="text-red-500">*</span>
              </Label>
              <LeadSelector
                value={selectedLead}
                initialName={leadName}
                onValueChange={(value, custId) => {
                  setSelectedLead(value ?? "");
                  if (custId) setImplicitCustomerId(custId);
                }}
                placeholder="Search leads..."
              />
            </div>

            {/* Meeting Title */}
            <div className="space-y-2">
              <Label>Meeting title <span className="text-red-500">*</span></Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Project Review, Site survey discussion"
              />
            </div>

            {/* Meeting Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Meeting Date <span className="text-red-500">*</span></Label>
              <Input
                id="date"
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Meeting Time */}
            <div className="space-y-2">
              <Label htmlFor="time">Meeting Time <span className="text-red-500">*</span></Label>
              <Input
                id="time"
                type="time"
                min={minTime}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) <span className="text-red-500">*</span></Label>
              <Input
                id="duration"
                type="number"
                min={1}
                step={1}
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <Label>Meeting mode <span className="text-red-500">*</span></Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="online"
                    checked={mode === "online"}
                    onChange={() => setMode("online")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="in-person"
                    checked={mode === "in-person"}
                    onChange={() => setMode("in-person")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">In Person</span>
                </label>
              </div>
            </div>

            {/* Reminder Timing */}
            <div className="space-y-2">
              <Label>Reminder Timing</Label>
              <Select
                value={reminderMinutes}
                onValueChange={setReminderMinutes}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select reminder" />
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
          </div>

          {/* Meeting Link */}
          {mode === "online" && (
            <MeetingLinkSection
              useOwnLink={useOwnLink}
              onUseOwnLinkChange={(value) => {
                setUseOwnLink(value);
                setLinkError(undefined);
              }}
              link={link}
              onLinkChange={(value) => {
                setLink(value);
                setLinkError(undefined);
              }}
              error={linkError}
              existingLink={existingLink}
              existingStartUrl={loadedMeeting?.zoomStartUrl}
              existingIsZoom={existingIsZoom}
            />
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Add Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or agenda items"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => goBack("/customers/meetings")}
            className="w-full sm:w-auto px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateMeetingMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-6"
          >
            {updateMeetingMutation.isPending ? "Saving..." : "Update Meeting"}
          </Button>
        </div>
      </form>

      <SuccessDialog
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate("/customers/meetings", { replace: true });
        }}
        title="Meeting Updated Successfully!"
        okLabel="Go to meetings"
      />
    </div>
  );
}
