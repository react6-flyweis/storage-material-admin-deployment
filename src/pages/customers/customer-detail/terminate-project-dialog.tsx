import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTerminateLeadMutation } from "@/modules/leads/leads.hooks";
import { toast } from "sonner";

interface TerminateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  onSuccess: () => void;
}

export default function TerminateProjectDialog({ open, onOpenChange, leadId, onSuccess }: TerminateProjectDialogProps) {
  const [reason, setReason] = useState("");
  const terminateMutation = useTerminateLeadMutation();

  const handleTerminate = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for termination");
      return;
    }
    try {
      await terminateMutation.mutateAsync({ leadId, payload: { reason: reason.trim() } });
      toast.success("Project terminated successfully");
      onSuccess();
      onOpenChange(false);
      setReason("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to terminate project");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Terminate Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Termination</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={terminateMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleTerminate} disabled={terminateMutation.isPending}>
            {terminateMutation.isPending ? "Terminating..." : "Terminate Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
