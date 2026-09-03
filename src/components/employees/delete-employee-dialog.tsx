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
import { useDeleteAdminEmployeeMutation } from "@/modules/employees/employees.hooks";
import { toast } from "sonner";

type DeleteEmployeeDialogProps = {
  employeeId?: string;
  employeeName?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

export function DeleteEmployeeDialog({
  employeeId,
  employeeName,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const deleteMutation = useDeleteAdminEmployeeMutation();

  const isOpen = externalOpen ?? internalOpen;
  const setIsOpen = externalOnOpenChange ?? setInternalOpen;

  const handleDelete = () => {
    if (!employeeId) return;

    deleteMutation.mutate(employeeId, {
      onSuccess: () => {
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: unknown) => {
        const errorMsg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to delete employee";
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
              Delete Employee
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 mt-2">
            Are you sure you want to delete{" "}
            {employeeName ? (
              <span className="font-semibold text-gray-900">"{employeeName}"</span>
            ) : (
              "this employee"
            )}
            ? This action cannot be undone.
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
                Delete Employee
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteEmployeeDialog;
