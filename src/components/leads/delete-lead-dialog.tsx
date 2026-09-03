import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useDeleteLeadMutation } from "@/modules/leads/leads.hooks";
import { toast } from "sonner";

type DeleteLeadDialogProps = {
  leadId: string;
  leadName?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function DeleteLeadDialog({
  leadId,
  leadName,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
}: DeleteLeadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const deleteMutation = useDeleteLeadMutation();

  const isOpen = externalOpen ?? internalOpen;
  const setIsOpen = externalOnOpenChange ?? setInternalOpen;

  const handleDelete = () => {
    if (!leadId) return;

    deleteMutation.mutate(leadId, {
      onSuccess: (data) => {
        toast.success(data?.message || "Lead deleted successfully");
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: unknown) => {
        const errorMsg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to delete lead";
        toast.error(errorMsg);
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="sm:text-left">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Delete Lead
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 mt-2">
            Are you sure you want to soft delete{" "}
            {leadName ? (
              <span className="font-semibold text-gray-900">"{leadName}"</span>
            ) : (
              "this lead"
            )}
            ? It will be hidden from all lists and detail views.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex flex-row justify-end gap-2 sm:gap-2">
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Lead
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
