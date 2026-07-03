import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Check } from "lucide-react";

type LeadPreview = {
  id?: string;
  name?: string;
  progress?: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: LeadPreview;
};

export default function TrackOrderLifecycleDialog({
  open,
  onOpenChange,
  lead,
}: Props) {
  const steps = [
    "Initial Contact",
    "Requirements Gathered",
    "Proposal Sent",
    "Quotation Sent",
    "Negotiation",
    "Deal Closed",
    "Payment Done",
    "Released to Plant",
    "Delivered",
  ];

  // `progress` represents the current step index (1-based).
  // Completed steps are those with `idx < progress`.
  const progress = lead?.progress ?? 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Leads Details{lead?.name ? ` - ${lead.name}` : ""}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500">
                {lead?.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <h3 className="text-base font-semibold mb-4">Progress Steps</h3>
          <div className="space-y-0">
            {steps.map((s, i) => {
              const idx = i + 1;
              const completed = idx < progress;
              const isCurrent = idx === progress;
              return (
                <div
                  key={s}
                  className="flex items-center justify-between py-3 px-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        completed
                          ? "bg-green-600 text-white"
                          : isCurrent
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-sm font-medium">{idx}</span>
                      )}
                    </div>

                    <div>
                      <div
                        className={`text-sm ${
                          completed
                            ? "text-green-700"
                            : isCurrent
                              ? "text-blue-700 font-semibold"
                              : "text-gray-700"
                        }`}
                      >
                        {s}
                      </div>
                      {isCurrent && (
                        <div className="text-xs text-blue-600">
                          Current Step
                        </div>
                      )}
                    </div>
                  </div>

                  {completed ? (
                    <div className="flex items-center gap-0.5">
                      <Check className="h-5 w-5 text-green-600 stroke-3" />
                      <Check className="h-5 w-5 text-green-600 stroke-3" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <hr className="my-6 border-t border-gray-200" />

          <div className="text-sm text-gray-600">
            Progress: Step {progress} of {steps.length}
          </div>
        </div>

        <DialogFooter className="p-6 border-t flex items-center justify-between gap-4">
          <div>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md">
              Track Project
            </Button>
          </div>

          <div>
            <DialogClose asChild>
              <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400 px-4 py-2 rounded-md">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
