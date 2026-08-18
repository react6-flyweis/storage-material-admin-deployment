import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import TaxPaymentDialog from "./tax-payment-dialog";
import { Button } from "@/components/ui/button";

interface TaxDetailsSheetProps {
  state: string;
  status: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaxDetailsSheet({
  state,
  status,
  isOpen,
  onOpenChange,
}: TaxDetailsSheetProps) {
  const isPaymentDue = status === "Payment Due";
  const [isPaymentDialogOPen, setIsPaymentDialogOpen] = useState(false);

  const handlePayClick = () => {
    onOpenChange(false);
    setIsPaymentDialogOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="sm:max-w-md w-full p-0 overflow-y-auto bg-white border-l z-60"
        >
          <SheetHeader className="p-6 border-b flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="w-8 h-8 rounded-full bg-blue-900 border text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden relative">
              {state === "Texas" ? (
                <>
                  <div className="absolute inset-0 flex">
                    <div className="w-1/3 bg-blue-900 h-full" />
                    <div className="w-2/3 flex flex-col h-full">
                      <div className="h-1/2 bg-white" />
                      <div className="h-1/2 bg-red-600" />
                    </div>
                  </div>
                  <div
                    className="absolute top-[46%] -translate-y-1/2 text-[10px] leading-none text-white z-10"
                    style={{ left: "3px" }}
                  >
                    ⭑
                  </div>
                </>
              ) : (
                state.charAt(0)
              )}
            </div>
            <SheetTitle className="text-lg font-bold flex items-center gap-3 text-slate-900 m-0">
              {state} Tax Details
              {isPaymentDue && (
                <Badge className="bg-[#f9923b] hover:bg-[#eb842d] text-white rounded-md font-medium text-xs px-2.5 py-0.5 border-0">
                  Payment Due
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="p-6 pt-0 flex flex-col gap-4 bg-white">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Filing Period</span>
                <span className="text-slate-600">May 1 - May 31 2025</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Filing Frequency</span>
                <span className="text-slate-600">Monthly</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Filing Due Date</span>
                <span className="text-slate-600">
                  Jun 20, 2025 (32 days left)
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200" />

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tax Collected</span>
                <span className="text-slate-600">$46,013.25</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Less: Tax Paid</span>
                <span className="text-slate-600">$46,013.25</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Penalty</span>
                <span className="text-slate-600">$0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Interest</span>
                <span className="text-slate-600">$0</span>
              </div>
            </div>

            <div className="border-t border-slate-200" />

            <div className="flex justify-between items-center pt-2 pb-2">
              <span className="font-bold text-slate-800 text-lg">
                Total Payable
              </span>
              <span className="font-bold text-red-600 text-lg">$14,650.00</span>
            </div>

            {isPaymentDue && (
              <Button
                type="button"
                onClick={handlePayClick}
                size="lg"
                className="w-full"
              >
                Pay $14,650.00 Now
              </Button>
            )}

            <div className="mt-2 border border-emerald-500 rounded-xl p-4 bg-emerald-50/40">
              <div className="flex gap-3">
                <ShieldCheck
                  className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Secure Payment
                  </h4>
                  <p className="text-xs text-slate-600">
                    Payments are processed securely via our tax partner.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">
                  Tax Partner:
                </span>
                <span className="text-[14px] font-bold text-[#ff6600] tracking-tight">
                  Avalara
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                  CERTIFIED PARTNER
                </span>
              </div>
            </div>

            <div className="mt-4 pb-6">
              <h4 className="font-bold text-[#1e1b4b] text-base mb-5">
                Recent Activity
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">May 19, 2026</span>
                  <span className="text-slate-500">$46,013.25 Paid</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">May 19, 2026</span>
                  <span className="text-slate-500">Return Filed</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Apr 20, 2026</span>
                  <span className="text-slate-500">$46,013.25 Paid</span>
                </div>
              </div>
              <div className="border-t border-slate-200 mt-6" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <TaxPaymentDialog
        state={state}
        isOpen={isPaymentDialogOPen}
        onOpenChange={setIsPaymentDialogOpen}
      />
    </>
  );
}
