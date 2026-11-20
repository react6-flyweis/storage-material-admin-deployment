import { type ReactNode } from "react";
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

export type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  variant?: "destructive" | "default";
  icon?: ReactNode;
};

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  error,
  variant = "destructive",
  icon,
}: ConfirmationDialogProps) {
  const isDestructive = variant === "destructive";

  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="sm:text-left">
          <div className="flex items-center gap-3 mb-1">
            {icon ? (
              icon
            ) : (
              <div
                className={`p-2 rounded-full ${
                  isDestructive
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              {title}
            </AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              {description}
            </AlertDialogDescription>
          )}

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex flex-row justify-end gap-2 sm:gap-2">
          <AlertDialogCancel disabled={isLoading} onClick={onClose}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-violet-600 hover:bg-violet-700 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {isDestructive && <Trash2 className="w-4 h-4" />}
                {confirmLabel}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

