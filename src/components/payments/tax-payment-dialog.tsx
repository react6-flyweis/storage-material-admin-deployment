import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
} from "lucide-react";
import PaymentSuccessDialog from "./payment-success-dialog";
import { useSubmitTaxPaymentMutation } from "@/modules/payments/payments.hooks";
import type { TaxPaymentResult } from "@/modules/payments/payments.api";
import { format, isValid } from "date-fns";

interface TaxPaymentDialogProps {
  state?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taxId?: string;
  amount?: number;
  filingPeriod?: string;
  dueDate?: string;
  daysUntilDue?: number;
  onSuccess?: () => void;
}

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
}

function formatDate(dateStr?: string | null, pattern: string = "MMM dd, yyyy") {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, pattern);
  } catch {
    return dateStr;
  }
}

export default function TaxPaymentDialog({
  state = "",
  isOpen,
  onOpenChange,
  taxId,
  amount = 0,
  filingPeriod = "",
  dueDate,
  daysUntilDue,
  onSuccess,
}: TaxPaymentDialogProps) {
  const [email, setEmail] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<TaxPaymentResult | null>(
    null,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = useSubmitTaxPaymentMutation();

  const formattedAmount = formatCurrency(amount);

  const renderStateBadge = () => {
    if (state !== "Texas" && state !== "TX") {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-blue-900 text-xs font-bold text-white">
          {state?.charAt(0) || "T"}
        </div>
      );
    }

    return (
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-900 text-xs font-bold text-white">
        <div className="absolute inset-0 flex">
          <div className="h-full w-1/3 bg-blue-900" />
          <div className="flex h-full w-2/3 flex-col">
            <div className="h-1/2 bg-white" />
            <div className="h-1/2 bg-red-600" />
          </div>
        </div>
        <span className="absolute left-1 top-1/2 z-10 -translate-y-1/2 text-[10px] leading-none text-white">
          ⭑
        </span>
      </div>
    );
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!taxId) {
      setErrorMsg("A valid tax filing record ID is required to approve remittance.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide a valid notification email for the Avalara filing confirmation.");
      return;
    }

    if (!isAuthorized) {
      setErrorMsg("Please authorize the Avalara electronic tax filing and remittance to proceed.");
      return;
    }

    try {
      const res = await submitMutation.mutateAsync({
        id: taxId,
        payload: {
          paymentMethod: "Avalara Managed Remittance (EFT)",
          notificationEmail: email.trim(),
        },
      });

      if (res?.data?.payment) {
        const paymentData = res.data.payment;
        const effectiveAmount =
          paymentData.amountPaid && paymentData.amountPaid > 0
            ? paymentData.amountPaid
            : (res.data.tax?.amount || res.data.tax?.payable || amount || 0);

        setPaymentResult({
          ...paymentData,
          amountPaid: effectiveAmount,
        });
        setIsSubmitted(true);
        onSuccess?.();
      } else if (res?.data?.tax) {
        setPaymentResult({
          amountPaid: res.data.tax.amount || res.data.tax.payable || amount || 0,
          filingPeriod: filingPeriod || "-",
          paymentMethod:
            res.data.tax.providerMethod || "Avalara Managed Remittance (EFT)",
          confirmationNumber:
            res.data.tax.confirmationNumber || res.data.tax._id,
          status:
            res.data.tax.paymentStatus || res.data.tax.status || "Approved",
          estimatedSettlement: "Processed by state tax authority",
          notificationEmail: email.trim(),
        });
        setIsSubmitted(true);
        onSuccess?.();
      } else {
        throw new Error(
          res?.message || "Remittance approval succeeded, but no payment confirmation was returned.",
        );
      }
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setErrorMsg(
        errorResponse?.response?.data?.message ||
          errorResponse?.message ||
          "Avalara tax approval failed. Please verify provider credentials and filing eligibility.",
      );
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsSubmitted(false);
      setPaymentResult(null);
      setErrorMsg(null);
      setIsAuthorized(true);
    }

    onOpenChange(open);
  };

  if (isSubmitted && paymentResult) {
    const rawPeriod = paymentResult.filingPeriod;
    const formattedFilingPeriod =
      rawPeriod && typeof rawPeriod === "object"
        ? `${formatDate(rawPeriod.start)} - ${formatDate(rawPeriod.end)}`
        : typeof rawPeriod === "string" && rawPeriod.trim()
          ? rawPeriod
          : filingPeriod || "-";

    return (
      <PaymentSuccessDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        taxId={taxId}
        amountPaid={formatCurrency(paymentResult.amountPaid || amount)}
        filingPeriod={formattedFilingPeriod}
        paymentMethod={paymentResult.paymentMethod || "Avalara Managed Remittance (EFT)"}
        confirmationNumber={
          paymentResult.confirmationNumber || taxId || "Confirmed"
        }
        receiptEmail={paymentResult.notificationEmail || email}
        status={paymentResult.status || "Approved"}
        estimatedSettlement={
          paymentResult.estimatedSettlement || "Processed by state tax authority"
        }
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-5 flex flex-row items-center justify-between border-b sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 m-0 text-slate-900">
            Approve Tax Filing & Remittance
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium text-xs px-2.5 py-0.5 border-0 ml-2">
              Avalara Automated
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          {!taxId && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg">
              Notice: No filing record ID is associated with this item. Remittance approval requires an active tax record.
            </div>
          )}

          {/* Tax Amount Details Box */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <div className="bg-[#fcfdfd] px-5 py-4 border-b border-slate-200 flex items-center gap-3">
              {renderStateBadge()}
              <div>
                <span className="font-semibold text-slate-900 block">
                  {state ? `${state} Sales Tax Remittance` : "State Sales Tax Remittance"}
                </span>
                <span className="text-xs text-slate-500">
                  Electronic submission to State Department of Revenue
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-3 bg-white">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Filing Period</span>
                <span className="font-semibold text-slate-900">
                  {filingPeriod || "Current Period"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Filing Due Date</span>
                <span className="font-semibold text-slate-900">
                  {dueDate ? formatDate(dueDate) : "-"}{" "}
                  {daysUntilDue !== undefined && daysUntilDue !== null
                    ? `(${daysUntilDue} days left)`
                    : ""}
                </span>
              </div>

              <div className="border-t border-slate-200 my-1" />

              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 text-base block">
                    Total Amount to Remit
                  </span>
                  <span className="text-xs text-slate-500">
                    Calculated sales tax collected
                  </span>
                </div>
                <span className="font-bold text-emerald-600 text-xl">
                  {formattedAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Avalara Managed Returns Card */}
          <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">
                    Avalara Automated Remittance
                  </h4>
                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-white text-[10px] font-semibold py-0">
                    Certified Partner
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Avalara handles electronic filing and tax draft directly via your organization&apos;s registered electronic funds transfer (EFT) account. No manual credit cards or bank details are needed.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200/60 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>State ACH / EFT Draft</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Encrypted Authority Filing</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitPayment} className="flex flex-col gap-6">
            {/* Email Notification */}
            <div className="space-y-2">
              <Label htmlFor="notificationEmail" className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                <span>Confirmation & Receipt Email</span>
                <span className="text-xs text-slate-400 font-normal">Required</span>
              </Label>
              <Input
                id="notificationEmail"
                type="email"
                placeholder="accounting@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-slate-200 shadow-none h-11"
                required
              />
              <p className="text-xs text-slate-500">
                Avalara filing confirmation number, submission timestamps, and PDF receipts will be delivered here.
              </p>
            </div>

            {/* Authorization Checkbox */}
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <input
                type="checkbox"
                id="authorizeAvalara"
                checked={isAuthorized}
                onChange={(e) => setIsAuthorized(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
              <label htmlFor="authorizeAvalara" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                I authorize Avalara to electronically submit this return and remit{" "}
                <span className="font-semibold text-slate-900">{formattedAmount}</span> to the{" "}
                <span className="font-semibold text-slate-900">{state || "state"} Department of Revenue</span> on behalf of the company.
              </label>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="lg" className="border-slate-200">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size="lg"
                disabled={!taxId || !email || !isAuthorized || submitMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting to Avalara...
                  </>
                ) : !taxId ? (
                  "Record ID Missing"
                ) : (
                  `Approve & Remit ${formattedAmount}`
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
