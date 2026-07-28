import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Upload, CalendarIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ProjectCalendarItem } from "../../construction.api";
import { useCreateDeliveryMutation } from "../../construction.hooks";
import ProjectSelector from "../common/ProjectSelector";

interface AddDeliveryFormValues {
  title: string;
  leadId: string;
  sectionLocation: string;
  deliveryDate: string;
  description: string;
  notes: string;
}

interface AddDeliverySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projects?: ProjectCalendarItem[];
  defaultDate?: string;
  onSave?: (deliveryData: AddDeliveryFormValues) => void;
}

export default function AddDeliverySheet({
  isOpen,
  onOpenChange,
  defaultDate = "2026-08-15",
  onSave,
}: AddDeliverySheetProps) {
  const [title, setTitle] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [sectionLocation, setSectionLocation] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(defaultDate);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const createDeliveryMutation = useCreateDeliveryMutation();

  const resetForm = () => {
    setTitle("");
    setSelectedLeadId("");
    setSectionLocation("");
    setDeliveryDate(defaultDate || "2026-08-15");
    setDescription("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!selectedLeadId) {
      toast.error("Please select a project");
      return;
    }
    if (!sectionLocation.trim()) {
      toast.error("Section/Location is required");
      return;
    }
    if (!deliveryDate) {
      toast.error("Delivery date is required");
      return;
    }

    const payload = {
      title: title.trim(),
      leadId: selectedLeadId,
      sectionLocation: sectionLocation.trim(),
      deliveryDate,
      description: description.trim(),
      notes: notes.trim(),
    };

    createDeliveryMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res?.message || "Delivery added successfully!");
        if (onSave) {
          onSave(payload);
        }
        resetForm();
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const errorMsg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          "Failed to add delivery";
        toast.error(errorMsg);
      },
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[480px] p-0 flex flex-col bg-white border-l shadow-2xl z-50 overflow-hidden"
      >
        {/* Custom Header matching visual design with close icon */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <SheetTitle className="text-xl font-bold text-gray-900">
            Add Delivery
          </SheetTitle>
          <button
            type="button"
            onClick={handleClose}
            disabled={createDeliveryMutation.isPending}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <h3 className="text-base font-bold text-gray-800">
            Delivery Information
          </h3>

          <form id="add-delivery-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter delivery title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Project Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Project <span className="text-red-500">*</span>
              </label>
              <ProjectSelector
                value={selectedLeadId}
                onValueChange={setSelectedLeadId}
                placeholder="Select Project"
              />
            </div>

            {/* Section/Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Section/Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Building A - Front Elevation"
                value={sectionLocation}
                onChange={(e) => setSectionLocation(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Delivery Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
                />
                <CalendarIcon className="w-4 h-4 text-gray-700 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Description (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Description (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Enter delivery description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 transition-colors resize-none"
              />
            </div>

            {/* Notes (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Enter any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 transition-colors resize-none"
              />
            </div>

            {/* Attachments (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Attachments (optional)
              </label>
              <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50/50 transition-colors">
                <Upload className="w-6 h-6 text-gray-700 mb-2" />
                <p className="text-xs font-semibold text-gray-700">
                  Click to Upload{" "}
                  <span className="font-normal text-gray-400">or drag and drop</span>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={createDeliveryMutation.isPending}
            className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-delivery-form"
            disabled={createDeliveryMutation.isPending}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors text-center disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createDeliveryMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save Delivery
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
