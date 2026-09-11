import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useTransferMainAdminMutation } from "@/modules/admins/admins.hooks";
import type { AdminUser } from "@/modules/admins/admins.types";
import { AlertTriangle, ArrowRightLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TransferMainDialogProps {
  admin: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (adminName: string) => void;
}

export function TransferMainDialog({
  admin,
  open,
  onOpenChange,
  onSuccess,
}: TransferMainDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const transferMutation = useTransferMainAdminMutation();

  if (!admin) return null;

  const handleTransfer = async () => {
    try {
      await transferMutation.mutateAsync(admin._id);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(admin.name);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to transfer main admin privileges";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-6">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-600" />
            Transfer Main Admin Privileges
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm text-gray-600">
            You are transferring the <strong>Main Admin</strong> ownership to{" "}
            <span className="font-semibold text-gray-900">{admin.name}</span> (
            {admin.email}).
          </p>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Important Notice
                </p>
                <p className="text-xs text-red-600 mt-1 leading-relaxed">
                  Upon confirmation, <strong>your account will be demoted</strong> to a
                  regular Admin, and <strong>{admin.name}</strong> will become the
                  sole Main Admin. You will not be able to undo this action yourself.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="confirm-transfer-ownership"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
            />
            <label
              htmlFor="confirm-transfer-ownership"
              className="text-xs text-gray-700 font-medium cursor-pointer"
            >
              I understand and confirm the transfer of Main Admin ownership.
            </label>
          </div>
        </div>

        <DialogFooter className="border-t pt-5 px-6 pb-6 flex items-center justify-end gap-3">
          <DialogClose asChild>
            <Button size="lg" type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="lg"
            type="button"
            disabled={!confirmed || transferMutation.isPending}
            onClick={handleTransfer}
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
          >
            {transferMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                Transfer Ownership
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TransferMainDialog;
