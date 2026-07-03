import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  //   DialogDescription,
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
import { useCreateFollowUpMutation } from "@/modules/followups/followups.hooks";
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

export default function AddFollowUpDialog({ open, onOpenChange, defaultLeadId, defaultEmployeeId, disabledLeadId }: Props) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    leadId: defaultLeadId || "",
    employee: defaultEmployeeId || "",
    type: "call",
    date: "",
    time: "",
    notes: "",
    priority: "medium",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        leadId: defaultLeadId || "",
        employee: defaultEmployeeId || "",
        type: "call",
        date: "",
        time: "",
        notes: "",
        priority: "medium",
      });
      setErrors({});
    }
  }, [open, defaultLeadId, defaultEmployeeId]);

  const { data: employeesResponse, isLoading: isLoadingEmployees } = useAdminEmployeesQuery({ role: "sales" });
  const employees = employeesResponse?.data?.employees || [];

  const { mutate: createFollowUp, isPending: isCreating } = useCreateFollowUpMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, boolean> = {};
    if (!formData.leadId) newErrors.leadId = true;
    if (!formData.employee) newErrors.employee = true;
    if (!formData.date) newErrors.date = true;
    if (!formData.time) newErrors.time = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    setErrors({});

    const followUpDate = new Date(`${formData.date}T${formData.time}:00.000Z`).toISOString();

    createFollowUp({
      leadId: formData.leadId,
      assignedTo: formData.employee,
      followUpDate,
      notes: formData.notes,
      priority: formData.priority,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setErrors({});
        setFormData({
          leadId: "",
          employee: "",
          type: "call",
          date: "",
          time: "",
          notes: "",
          priority: "medium",
        });
        setShowSuccess(true);
        toast.success("Follow-up added successfully!");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to add follow-up");
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
          <DialogTitle className="text-lg">Add Follow-up</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-4 space-y-4">
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
              <Label>Assigned Employee <span className="text-red-500">*</span></Label>
              <Select
                value={formData.employee}
                onValueChange={(v) => {
                  setFormData({ ...formData, employee: v });
                  if (v) setErrors({ ...errors, employee: false });
                }}
                disabled={!!defaultEmployeeId}
              >
                <SelectTrigger className={cn("w-full", errors.employee ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500" : "", defaultEmployeeId ? "bg-gray-100 opacity-100" : "")} aria-invalid={errors.employee}>
                  <SelectValue placeholder={isLoadingEmployees ? "Loading employees..." : "Select an employee"} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Follow-up Date <span className="text-red-500">*</span></Label>
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
              <Label>Follow-up Time <span className="text-red-500">*</span></Label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  value={formData.time ? dayjs(`2024-01-01T${formData.time}`) : null}
                  onChange={(newValue) => {
                    const timeString = newValue ? newValue.format("HH:mm") : "";
                    setFormData({ ...formData, time: timeString });
                    if (timeString) setErrors({ ...errors, time: false });
                  }}
                  slotProps={{
                    popper: {
                      disablePortal: true,
                    },
                    textField: {
                      error: errors.time,
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          height: "36px",
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          fontFamily: "inherit",
                          backgroundColor: "transparent",
                          "& fieldset": {
                            borderColor: errors.time ? "#ef4444" : "#e5e7eb",
                          },
                          "&:hover fieldset": {
                            borderColor: errors.time ? "#ef4444" : "#d1d5db",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: errors.time ? "#ef4444" : "#000",
                            borderWidth: "1px",
                          },
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 12px",
                          height: "100%",
                          boxSizing: "border-box",
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="space-y-1">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
                maxLength={500}
                placeholder="Add any additional notes or context..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.notes.length}/500 characters
              </div>
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
              {isCreating ? "Adding..." : "Add Follow up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Follow-up Added Successfully!"
      />
    </Dialog>
  );
}
