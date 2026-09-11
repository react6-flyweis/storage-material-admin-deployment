import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useDeleteAdminMutation } from "@/modules/admins/admins.hooks";
import type { AdminUser } from "@/modules/admins/admins.types";
import { toast } from "sonner";

interface DeleteAdminDialogProps {
  admin: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteAdminDialog({
  admin,
  open,
  onOpenChange,
  onSuccess,
}: DeleteAdminDialogProps) {
  const deleteMutation = useDeleteAdminMutation();

  if (!admin) return null;

  const handleDelete = () => {
    deleteMutation.mutate(admin._id, {
      onSuccess: () => {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: unknown) => {
        const errorMsg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to delete admin user";
        toast.error(errorMsg);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="sm:text-left">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Delete Admin
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 mt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{admin.name}"</span>?
            This action cannot be undone.
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
                Delete Admin
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAdminDialog;
