import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import {
  ArrowDownToLine,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleDollarSign,
  Landmark,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

type PaymentSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountPaid?: string;
  filingPeriod?: string;
  paymentMethod?: string;
  confirmationNumber?: string;
  receiptEmail?: string;
  onDownload?: () => void;
};

export default function PaymentSuccessDialog({
  open,
  onOpenChange,
  amountPaid = "$14,550.00",
  filingPeriod = "May 1 - May 31, 2025",
  paymentMethod = "ACH ending in 4851",
  confirmationNumber = "Tx-2025-0619-8421",
  receiptEmail = "accounts@acmeindustries.com",
  onDownload,
}: PaymentSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-0 overflow-hidden border-0 bg-white p-0 shadow-none max-h-[92vh] overflow-y-auto">
        <div className="flex min-h-full flex-col items-center px-6 py-10 text-center sm:px-12">
          <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white ">
            <Check className="size-11" strokeWidth={3} />
          </div>

          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-950 ">
            Payment Submitted Successfully !
          </h2>
          <p className="mt-2 font-semibold text-slate-500">
            your payment is being processed.
          </p>

          <div className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_1px_0_rgba(15,23,42,0.02)] sm:p-8">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="flex items-center gap-4">
                <CircleDollarSign className="size-6 shrink-0 text-slate-700" />
                <p className="">Amount Paid</p>
              </div>
              <div className="text-left text-xl font-semibold text-emerald-700 sm:text-right">
                {amountPaid}
              </div>

              <div className="flex items-center gap-4">
                <CalendarDays className="size-6 shrink-0 text-slate-700" />
                <p className="">Filing Period</p>
              </div>
              <div className="text-base text-slate-900 sm:text-right">
                {filingPeriod}
              </div>

              <div className="flex items-center gap-4">
                <Landmark className="size-6 shrink-0 text-slate-700" />
                <p className="">Payment Method</p>
              </div>
              <div className="text-base text-slate-900 sm:text-right">
                {paymentMethod}
              </div>

              <div className="flex items-center gap-4">
                <BadgeCheck className="size-6 shrink-0 text-slate-700" />
                <p className="">Confirmation Number</p>
              </div>
              <div className="text-base text-slate-900 sm:text-right">
                {confirmationNumber}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-6 items-center justify-center rounded-full border-2 border-slate-700">
                  <div className="h-3 w-3 rounded-full border-2 border-slate-700" />
                </div>
                <p className="">Status</p>
              </div>
              <div className="sm:text-right">
                <Badge className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                  Processing
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <TimerReset className="size-6 shrink-0 text-slate-700" />
                <p className="">Estimated Settlement</p>
              </div>
              <div className="text-base text-slate-900 sm:text-right">
                1-3 business days
              </div>
            </div>
          </div>

          <div className="mt-10 w-full rounded-xl border border-emerald-500 bg-emerald-50/40 p-5 text-left">
            <div className="flex items-start gap-4">
              <ShieldCheck className="size-7 mt-2 shrink-0 text-green-600" />
              <p className="text-base leading-7 text-slate-600">
                we’ll send a confirmation email with your receipt to{" "}
                <span className="block font-semibold text-slate-950">
                  {receiptEmail}
                </span>
                <span className="block">
                  you can view this payment in your activity anytime
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Button type="button" onClick={onDownload} size="lg">
              <ArrowDownToLine className="mr-3 h-5 w-5" />
              Download Receipt
            </Button>

            <DialogClose asChild>
              <Button type="button" variant="ghost">
                <ArrowLeft className="h-5 w-5" />
                Back to Tax Dashboard
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
