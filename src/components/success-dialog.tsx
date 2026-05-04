import checkCircleImage from "@/assets/images/check-circle.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

type SuccessDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  okLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function SuccessDialog({
  open,
  onClose,
  title = "Success!",
  okLabel = "Ok",
  actionLabel,
  onAction,
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-full max-w-md rounded-2xl p-8 text-center shadow-lg">
        <DialogHeader>
          <DialogTitle className="mx-auto mb-6 max-w-xs text-2xl font-semibold leading-tight text-slate-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mx-auto mb-7 flex h-28 w-28 items-center justify-center">
          <img
            src={checkCircleImage}
            alt="success"
            className="size-44 rounded-full object-cover"
          />
        </div>

        <DialogFooter className="flex sm:justify-center gap-3 items-center">
          {actionLabel && onAction ? (
            <Button onClick={onAction} className="w-1/2" variant="secondary">
              {actionLabel}
            </Button>
          ) : null}
          <DialogClose asChild>
            <Button onClick={onClose} className="w-1/2">
              {okLabel}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
