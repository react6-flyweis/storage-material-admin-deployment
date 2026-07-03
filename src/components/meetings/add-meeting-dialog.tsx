import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import LeadSelector from "@/components/leads/lead-selector";
import { useAdminEmployeesQuery } from "@/modules/employees/employees.hooks";
import { useCreateMeetingMutation } from "@/modules/meetings/meetings.hooks";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLeadId?: string;
  defaultEmployeeId?: string;
  disabledLeadId?: boolean;
};

export default function AddMeetingDialog({ open, onOpenChange, defaultLeadId, defaultEmployeeId, disabledLeadId }: Props) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  


  const [formData, setFormData] = useState({
    leadId: defaultLeadId || "",
    title: "",
    employee: defaultEmployeeId || "",
    mode: "online",
    date: "",
    time: "",
    duration: "30",
    meetingLink: "",
    notes: "",
  });

  const { data: leadDetailResponse } = useLeadDetailQuery(formData.leadId || "");
  const customerId = leadDetailResponse?.data?.customer?._id || 
    (typeof leadDetailResponse?.data?.lead?.customerId === 'object' 
      ? leadDetailResponse?.data?.lead?.customerId?._id 
      : leadDetailResponse?.data?.lead?.customerId);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        leadId: defaultLeadId || "",
        title: "",
        employee: defaultEmployeeId || "",
        mode: "online",
        date: "",
        time: "",
        duration: "30",
        meetingLink: "",
        notes: "",
      });
      setErrors({});
    }
  }, [open, defaultLeadId, defaultEmployeeId]);

  const { data: employeesResponse, isLoading: isLoadingEmployees } = useAdminEmployeesQuery({ role: "sales" });
  const employees = employeesResponse?.data?.employees || [];

  const { mutate: createMeeting, isPending: isCreating } = useCreateMeetingMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, boolean> = {};
    if (!formData.leadId) newErrors.leadId = true;
    if (!formData.title) newErrors.title = true;
    if (!formData.employee) newErrors.employee = true;
    if (!formData.date) newErrors.date = true;
    if (!formData.time) newErrors.time = true;

    if (formData.mode === "online") {
      if (!formData.meetingLink.trim()) {
        newErrors.meetingLink = true;
      } else {
        try {
          new URL(formData.meetingLink);
        } catch (_) {
          newErrors.meetingLink = true;
          toast.error("Please enter a valid URL for the meeting link");
          setErrors(newErrors);
          return;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    if (!customerId) {
      toast.error("Customer ID not found for this lead");
      return;
    }

    setErrors({});

    const meetingTime = new Date(`${formData.date}T${formData.time}:00.000Z`).toISOString();

    createMeeting({
      leadId: formData.leadId,
      customerId,
      title: formData.title,
      assignedTo: formData.employee,
      meetingTime,
      duration: parseInt(formData.duration, 10),
      mode: formData.mode as "online" | "in-person",
      meetingLink: formData.meetingLink,
      notes: formData.notes,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setErrors({});
        setShowSuccess(true);
        toast.success("Meeting scheduled successfully!");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to schedule meeting");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 max-w-md"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest('.MuiPopover-root') ||
            target.closest('.MuiPickersPopper-root') ||
            target.closest('.MuiModal-root') ||
            target.closest('.MuiDialog-root') ||
            target.closest('[data-slot="combobox-content"]') ||
            target.closest('[data-slot="combobox-item"]')
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="border-b p-5">
          <DialogTitle className="text-lg">Schedule Meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-1">
              <Label>Lead <span className="text-red-500">*</span></Label>
              <LeadSelector
                value={formData.leadId}
                onValueChange={(v) => {
                  setFormData({ ...formData, leadId: v });
                  if (v) setErrors({ ...errors, leadId: false });
                }}
                error={errors.leadId}
                disabled={disabledLeadId}
              />
            </div>
            
            <div className="space-y-1">
              <Label>Meeting Title <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                className={errors.title ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500" : ""}
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (e.target.value) setErrors({ ...errors, title: false });
                }}
                placeholder="E.g., Project Discovery Call"
              />
            </div>

            <div className="space-y-1">
              <Label>Meeting Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                className={errors.date ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500" : ""}
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (e.target.value) setErrors({ ...errors, date: false });
                }}
                required
                aria-invalid={errors.date}
              />
            </div>

            <div className="space-y-1 flex flex-col">
              <Label>Meeting Time <span className="text-red-500">*</span></Label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  value={formData.time ? dayjs(`2024-01-01T${formData.time}`) : null}
                  onChange={(newValue) => {
                    const timeString = newValue ? newValue.format("HH:mm") : "";
                    setFormData({ ...formData, time: timeString });
                    if (timeString) setErrors({ ...errors, time: false });
                  }}
                  slotProps={{
                    popper: { disablePortal: true },
                    textField: {
                      error: errors.time,
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          height: "36px",
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          backgroundColor: "transparent",
                          "& fieldset": { borderColor: errors.time ? "#ef4444" : "#e5e7eb" },
                          "&:hover fieldset": { borderColor: errors.time ? "#ef4444" : "#d1d5db" },
                          "&.Mui-focused fieldset": { borderColor: errors.time ? "#ef4444" : "#000", borderWidth: "1px" },
                        },
                        "& .MuiInputBase-input": { padding: "0 12px", height: "100%", boxSizing: "border-box" }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="space-y-1">
              <Label>Duration (Minutes)</Label>
              <Select
                value={formData.duration}
                onValueChange={(v) => setFormData({ ...formData, duration: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="15">15 Minutes</SelectItem>
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="45">45 Minutes</SelectItem>
                  <SelectItem value="60">1 Hour</SelectItem>
                  <SelectItem value="90">1.5 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label>Meeting Mode</Label>
              <Select
                value={formData.mode}
                onValueChange={(v) => setFormData({ ...formData, mode: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.mode === "online" && (
              <div className="space-y-1">
                <Label>Meeting Link <span className="text-red-500">*</span></Label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className={errors.meetingLink ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500" : ""}
                  value={formData.meetingLink}
                  onChange={(e) => {
                    setFormData({ ...formData, meetingLink: e.target.value });
                    if (e.target.value) setErrors({ ...errors, meetingLink: false });
                  }}
                  aria-invalid={errors.meetingLink}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Add agenda or context..."
              />
            </div>
          </div>

          <DialogFooter className="border-t p-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Meeting Scheduled Successfully!"
      />
    </Dialog>
  );
}
