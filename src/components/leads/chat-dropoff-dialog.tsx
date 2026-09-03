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
import { Send } from "lucide-react";
import { useSendChatDropOffMutation } from "@/modules/automation/automation.hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  customerName?: string;
};

const TEMPLATES = [
  {
    id: "quote-pending",
    title: "Quote Details Pending",
    text: "Hi, just checking in. Share your pending details and we can finalize your quote.",
  },
  {
    id: "pricing-estimate",
    title: "Pricing Estimate",
    text: "Hello! We have preliminary pricing benchmarks ready for your building size. Would you like us to share the estimate?",
  },
  {
    id: "engineering-ready",
    title: "Engineering Review",
    text: "Hi there, our engineering team is ready to review your project specifications whenever you're ready.",
  },
  {
    id: "specs-timeline",
    title: "Timeline & Specs",
    text: "Hi, let us know if you have any questions regarding your building size, location, or delivery timeline.",
  },
  {
    id: "re-engagement",
    title: "General Re-engagement",
    text: "Hello! Are you still exploring steel building options? Feel free to reply here anytime and we can assist.",
  },
];

export default function ChatDropOffDialog({
  open,
  onOpenChange,
  leadId,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0].id);
  const [message, setMessage] = useState<string>(TEMPLATES[0].text);

  const { mutate: sendDropOff, isPending } = useSendChatDropOffMutation();

  const handleCardClick = (tpl: (typeof TEMPLATES)[number]) => {
    setSelectedId(tpl.id);
    setMessage(tpl.text);
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!leadId) {
      toast.error("Lead ID is missing");
      return;
    }

    sendDropOff(
      { leadId, message: message.trim() },
      {
        onSuccess: () => {
          toast.success("Follow-up sent successfully!");
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const errorObj = err as { response?: { data?: { message?: string } } };
          toast.error(
            errorObj?.response?.data?.message || "Failed to send follow-up message"
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="border-b px-5 py-4 shrink-0">
          <DialogTitle className="text-base font-semibold">
            Send Follow-Up
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4 w-full min-w-0 overflow-hidden">
          {/* Simple horizontal template cards constrained with min-w-0 */}
          <div className="w-full min-w-0 space-y-1.5">
            <Label className="text-xs text-gray-500">Quick Templates</Label>
            <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 w-full min-w-0 max-w-full">
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleCardClick(tpl)}
                    className={cn(
                      "w-52 shrink-0 text-left p-2.5 rounded-lg border transition-colors cursor-pointer",
                      isSelected
                        ? "border-blue-600 bg-blue-50/40"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-semibold mb-1 truncate",
                        isSelected ? "text-blue-700" : "text-gray-800"
                      )}
                    >
                      {tpl.title}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {tpl.text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message input */}
          <div className="space-y-1.5 w-full min-w-0">
            <Label className="text-xs">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
  );
}
