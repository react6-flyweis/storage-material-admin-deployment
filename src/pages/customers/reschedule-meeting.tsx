import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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
import { toast } from "sonner";

export default function RescheduleMeeting() {
  const navigate = useNavigate();
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
  const [notes, setNotes] = useState("");

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
        setSelectedLead(meeting.leadId._id ?? "");
        setLeadName(meeting.leadId.projectName || meeting.leadId.buildingType || `Lead ${meeting.leadId._id.substring(0,6)}`);
      }
    }

    // Other fields
    if (meeting.title) setTitle(meeting.title);
    if (meeting.duration) setDuration(String(meeting.duration));
    if (meeting.mode) setMode(meeting.mode);
    if (meeting.meetingLink) setLink(meeting.meetingLink);
    if (meeting.notes) setNotes(meeting.notes);

    // Parse meetingTime → date and time
    if (meeting.meetingTime) {
      const dt = new Date(meeting.meetingTime);
      if (!Number.isNaN(dt.getTime())) {
        setDate(dt.toISOString().slice(0, 10)); // YYYY-MM-DD
        setTime(
          dt.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        ); // HH:mm
      }
    }
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
    if (mode === "online" && !link.trim()) {
      setErrorMessage("Meeting link is required for online meetings.");
      return;
    }

    const meetingTime = new Date(`${date}T${time}:00.000Z`).toISOString();

    try {
      await updateMeetingMutation.mutateAsync({
        meetingId: meetingId!,
        payload: {
          title: title || undefined,
          meetingTime,
          duration: duration ? Number.parseInt(duration, 10) : undefined,
          mode,
          meetingLink: link.trim() || undefined,
          notes: notes.trim() || undefined,
          customerId: implicitCustomerId,
          leadId: selectedLead,
        },
      });

      toast.success("Meeting updated successfully!");
      setSuccessOpen(true);
      setTimeout(() => navigate("/customers/meetings"), 500);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to update meeting."));
    }
  };

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
          onClick={() => navigate('/customers/meetings')}
          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white h-9 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">
          Reschedule Meeting
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
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
          </div>

          {/* Meeting Link */}
          {mode === "online" && (
            <div className="space-y-2">
              <Label htmlFor="link">
                Meeting Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="link"
                placeholder="Zoom Meeting link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
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
            onClick={() => navigate("/customers/meetings")}
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
          navigate("/customers/meetings");
        }}
        title="Meeting Updated Successfully!"
        okLabel="Go to meetings"
      />
    </div>
  );
}
