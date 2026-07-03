import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useResolveEscalationMutation } from "@/modules/leads/leads.hooks";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  escalationId: string;
};

export default function ResolveEscalationDialog({ trigger, open, onOpenChange, escalationId }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [note, setNote] = useState("");
  
  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;

  const resolveMutation = useResolveEscalationMutation();

  const onResolve = () => {
    if (!note.trim()) {
      toast.error("Please provide a note");
      return;
    }
    
    resolveMutation.mutate(
      { escalationId, note: note.trim() },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setShowSuccess(true);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to resolve escalation");
        }
      }
    );
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-green-600 hover:bg-green-700">Resolve</Button>
        )}
      </DialogTrigger>

      <DialogContent className=" p-0 gap-0">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="text-lg">Resolve Escalation</DialogTitle>
          <DialogDescription>
            Provide a note detailing how this escalation was resolved.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div>
            <Label>Resolution Note</Label>
            <Textarea
              className="mt-1"
              placeholder="Reviewed and closed..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="p-4">
          <DialogClose asChild>
            <Button size="lg" variant="outline" className="mr-2 w-40">
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={onResolve}
            disabled={resolveMutation.isPending}
            className="w-40 bg-green-600 hover:bg-green-700"
          >
            {resolveMutation.isPending ? "Resolving..." : "Resolve Escalation"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Escalation Resolved Successfully!"
      />
    </Dialog>
  );
}
