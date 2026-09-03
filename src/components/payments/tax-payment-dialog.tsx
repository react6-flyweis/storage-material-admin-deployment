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
import { Building2, CreditCard } from "lucide-react";
import PaymentSuccessDialog from "./payment-success-dialog";

interface TaxPaymentDialogProps {
  state: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaxPaymentDialog({
  state,
  isOpen,
  onOpenChange,
}: TaxPaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"ach" | "card" | "new">(
    "ach",
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filingPeriod = "May 1 - May 31, 2025";
  const amountPaid = "$14,550.00";
  const receiptEmail = "accounts@acmeindustries.com";

  const renderStateBadge = () => {
    if (state !== "Texas") {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-blue-900 text-xs font-bold text-white">
          {state.charAt(0)}
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

  const handleSubmitPayment = () => {
    setIsSubmitted(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsSubmitted(false);
      setPaymentMethod("ach");
    }

    onOpenChange(open);
  };

  if (isSubmitted) {
    return (
      <PaymentSuccessDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        amountPaid={amountPaid}
        filingPeriod={filingPeriod}
        paymentMethod={"ACH ending in 4851"}
        confirmationNumber={"Tx-2025-0619-8421"}
        receiptEmail={receiptEmail}
        onDownload={() => {
          /* implement download handler if needed */
        }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-5 flex flex-row items-center justify-between border-b sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 m-0 text-slate-900">
            Review & Pay Tax
            <Badge className="bg-[#f9923b] hover:bg-[#eb842d] text-white rounded-md font-medium text-xs px-2.5 py-0.5 border-0 ml-2">
              Payment Due
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Tax Amount Details Box */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            <div className="bg-[#fcfdfd] px-5 py-4 border-b border-slate-200 flex items-center gap-3">
              {renderStateBadge()}
              <span className="font-semibold text-slate-900">
                {state} Tax Payment
              </span>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-900">
                  Filing Period
                </span>
                <span className="font-medium text-slate-900">
                  May 1-May 31, 2025
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-900">
                  Filing Due Date
                </span>
                <span className="font-medium text-slate-900">
                  Jun 20, 2025 (32 days left)
                </span>
              </div>

              <div className="border-t border-slate-200 my-1" />

              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-900">
                  Total Payable
                </span>
                <span className="font-medium text-red-600 text-base">
                  $14,650.00
                </span>
              </div>
            </div>
          </div>

          <form className="flex flex-col gap-8">
            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-900">
                1. Choose Payment Method
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("ach")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm border transition-colors ${paymentMethod === "ach"
                    ? "bg-violet-50 text-violet-700 border-violet-300"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <Building2 className="w-4 h-4" />
                  Bank Account (ACH)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm border transition-colors ${paymentMethod === "card"
                    ? "bg-violet-50 text-violet-700 border-violet-300"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("new")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm border transition-colors ${paymentMethod === "new"
                    ? "bg-violet-50 text-violet-700 border-violet-300"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  + New Payment Method
                </button>
              </div>

              {/* ACH Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    className="bg-white border-slate-200 shadow-none h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    type="password"
                    className="bg-white border-slate-200 shadow-none h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="password"
                    className="bg-white border-slate-200 shadow-none h-11"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="confirmAccountNumber">
                    Confirm Account Number
                  </Label>
                  <Input
                    id="confirmAccountNumber"
                    type="password"
                    className="bg-white border-slate-200 shadow-none h-11 max-w-[calc(50%-0.5rem)]"
                  />
                </div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-900">
                2.Billing/Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    className="bg-white border-slate-200 shadow-none h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    className="bg-white border-slate-200 shadow-none h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Receipt to</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-white border-slate-200 shadow-none h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-white border-slate-200 shadow-none h-11"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSubmitPayment} size="lg">
                Submit Payment $14,650.00
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
