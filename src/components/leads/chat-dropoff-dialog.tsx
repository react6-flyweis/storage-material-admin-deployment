import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useSendChatDropOffMutation } from "@/modules/automation/automation.hooks";
import {
  useFollowUpTemplatesQuery,
  useDeleteFollowUpTemplateMutation,
} from "@/modules/followups/followups.hooks";
import type { FollowUpTemplateItem } from "@/modules/followups/followups.api";
import FollowUpTemplateDialog from "./followup-template-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  customerName?: string;
};

export default function ChatDropOffDialog({
  open,
  onOpenChange,
  leadId,
}: Props) {
  const { data: templatesData, isLoading: isTemplatesLoading } =
    useFollowUpTemplatesQuery({ isActive: true, limit: 100 }, open);

  const templates: FollowUpTemplateItem[] =
    templatesData?.data?.templates || [];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  // Template add / edit dialog state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<FollowUpTemplateItem | null>(null);

  // Mutations
  const { mutateAsync: sendDropOff, isPending } = useSendChatDropOffMutation();
  const { mutateAsync: deleteTemplate, isPending: isDeletingTemplate } =
    useDeleteFollowUpTemplateMutation();

  // Active template is selectedTemplateId or defaults to the first available template
  const activeTemplate =
    templates.find((t) => t._id === selectedTemplateId) || templates[0];
  const selectedId = activeTemplate?._id || "";
  const message =
    customMessage !== null ? customMessage : activeTemplate?.message || "";

  const handleCardClick = (tpl: FollowUpTemplateItem) => {
    setSelectedTemplateId(tpl._id);
    setCustomMessage(tpl.message);
  };

  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateDialogOpen(true);
  };

  const handleOpenEditTemplate = (
    e: React.MouseEvent,
    tpl: FollowUpTemplateItem,
  ) => {
    e.stopPropagation();
    setEditingTemplate(tpl);
    setTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = async (
    e: React.MouseEvent,
    tpl: FollowUpTemplateItem,
  ) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${tpl.title}"?`)) {
      return;
    }

    try {
      await deleteTemplate(tpl._id);
      toast.success("Template deleted successfully");
      if (selectedTemplateId === tpl._id) {
        setSelectedTemplateId(null);
        setCustomMessage(null);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorObj?.response?.data?.message || "Failed to delete template",
      );
    }
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      toast.error("Please enter a message");
      return;
    }

    if (!leadId) {
      toast.error("Lead ID is missing");
      return;
    }

    try {
      await sendDropOff({ leadId, message: trimmedMessage });
      toast.success("Follow-up sent successfully!");
      onOpenChange(false);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        errorObj?.response?.data?.message ||
          "Failed to send follow-up message",
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg w-full p-0 gap-0 overflow-hidden flex flex-col">
          <DialogHeader className="border-b px-5 py-4 shrink-0">
            <DialogTitle className="text-base font-semibold">
              Send Follow-Up
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-4 w-full min-w-0 overflow-hidden">
            {/* Quick templates horizontal carousel */}
            <div className="w-full min-w-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-500">Quick Templates</Label>
                {isTemplatesLoading && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Loading...</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 w-full min-w-0 max-w-full">
                {templates.map((tpl) => {
                  const isSelected = selectedId === tpl._id;
                  return (
                    <div
                      key={tpl._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCardClick(tpl)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCardClick(tpl);
                        }
                      }}
                      className={cn(
                        "group relative w-52 shrink-0 text-left p-2.5 rounded-lg border transition-all cursor-pointer select-none",
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 shadow-xs"
                          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p
                          className={cn(
                            "text-xs font-semibold truncate flex-1",
                            isSelected ? "text-blue-700" : "text-gray-800",
                          )}
                          title={tpl.title}
                        >
                          {tpl.title}
                        </p>
                        {/* Top edit and delete actions */}
                        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Edit template"
                            onClick={(e) => handleOpenEditTemplate(e, tpl)}
                            className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            title="Delete template"
                            disabled={isDeletingTemplate}
                            onClick={(e) => handleDeleteTemplate(e, tpl)}
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {tpl.message}
                      </p>
                    </div>
                  );
                })}

                {/* Card at the end to trigger adding a new template */}
                <button
                  type="button"
                  onClick={handleOpenAddTemplate}
                  className="w-44 shrink-0 flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 text-gray-500 hover:text-blue-600 transition-all cursor-pointer group min-h-19"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center mb-1 text-gray-500 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium">Add Template</span>
                </button>
              </div>
            </div>

            {/* Message input */}
            <div className="space-y-1.5 w-full min-w-0">
              <Label className="text-xs">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                placeholder="Type your message..."
                className="text-xs resize-none w-full"
              />
            </div>
          </div>

          <DialogFooter className="border-t px-5 py-3 flex gap-2 justify-end bg-gray-50/50 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSend}
              disabled={isPending}
            >
              {isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Send Follow-Up
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extracted Add / Edit Template Dialog */}
      <FollowUpTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={editingTemplate}
        onSuccess={(saved) => {
          setSelectedTemplateId(saved._id);
          setCustomMessage(saved.message);
        }}
      />
    </>
  );
}
