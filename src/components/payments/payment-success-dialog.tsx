import { useState } from "react";
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
  Loader2,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { downloadTaxFilingReceiptPdfProvider } from "@/modules/payments/payments.api";

type PaymentSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxId?: string;
  amountPaid?: string;
  filingPeriod?: string;
  paymentMethod?: string;
  confirmationNumber?: string;
  receiptEmail?: string;
  status?: string;
  estimatedSettlement?: string;
  onDownload?: () => void;
};

export default function PaymentSuccessDialog({
  open,
  onOpenChange,
  taxId,
  amountPaid = "$0.00",
  filingPeriod = "-",
  paymentMethod = "Electronic Payment",
  confirmationNumber = "-",
  receiptEmail = "-",
  status = "Completed",
  estimatedSettlement = "1-3 business days",
  onDownload,
}: PaymentSuccessDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (!taxId) return;

    try {
      setIsDownloading(true);
      const blob = await downloadTaxFilingReceiptPdfProvider(taxId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${confirmationNumber || taxId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-0 overflow-hidden border-0 bg-white p-0 shadow-none max-h-[92vh] overflow-y-auto">
        <div className="flex min-h-full flex-col items-center px-6 py-10 text-center sm:px-12">
          <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white ">
            <Check className="size-11" strokeWidth={3} />
          </div>

          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-950">
            Tax Filing & Remittance Approved!
          </h2>
          <p className="mt-2 font-medium text-slate-500">
            Your return and tax remittance have been submitted to Avalara for automated processing.
          </p>

          <div className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_1px_0_rgba(15,23,42,0.02)] sm:p-8">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="flex items-center gap-4">
                <CircleDollarSign className="size-6 shrink-0 text-slate-700" />
                <p className="">Amount Remitted</p>
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
                <p className="">Remittance Method</p>
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
                <Badge className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 capitalize">
                  {status}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <TimerReset className="size-6 shrink-0 text-slate-700" />
                <p className="">Estimated Settlement</p>
              </div>
              <div className="text-base text-slate-900 sm:text-right">
                {estimatedSettlement}
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

          <div className="mt-6 flex flex-col gap-4 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleDownload}
              size="lg"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <ArrowDownToLine className="mr-3 h-5 w-5" />
              )}
              {isDownloading ? "Downloading Receipt..." : "Download Receipt"}
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
