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
import { format, isValid } from "date-fns";
import type { TaxFilingItem } from "@/modules/payments/payments.api";

interface TaxDetailsSheetProps {
  state: string;
  status: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item?: TaxFilingItem | null;
}

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "-";
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
    if (!isValid(d)) return "-";
    return format(d, pattern);
  } catch {
    return "-";
  }
}

function formatPeriod(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return "-";
    return format(d, "MMM yyyy");
  } catch {
    return "-";
  }
}

function getDueInText(dueDateStr?: string | null) {
  if (!dueDateStr) return "";
  try {
    const due = new Date(dueDateStr);
    if (!isValid(due)) return "";
    const now = new Date();
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return ` (${diffDays} days left)`;
    if (diffDays === 1) return " (1 day left)";
    if (diffDays === 0) return " (Due today)";
    return ` (Overdue by ${Math.abs(diffDays)} days)`;
  } catch {
    return "";
  }
}

export default function TaxDetailsSheet({
  state,
  status,
  isOpen,
  onOpenChange,
  item,
}: TaxDetailsSheetProps) {
  const currentStatus = item?.status || status || "-";
  const isPaymentDue =
    currentStatus.toLowerCase() === "pending" ||
    currentStatus.toLowerCase() === "due soon" ||
    currentStatus.toLowerCase() === "payment due";

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

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
                state?.charAt(0) || "-"
              )}
            </div>
            <SheetTitle className="text-lg font-bold flex items-center gap-3 text-slate-900 m-0">
              {state || "-"} Tax Details
              {isPaymentDue && (
                <Badge className="bg-[#f9923b] hover:bg-[#eb842d] text-white rounded-md font-medium text-xs px-2.5 py-0.5 border-0 capitalize">
                  {currentStatus}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="p-6 pt-0 flex flex-col gap-4 bg-white">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Filing Period</span>
                <span className="text-slate-600 font-medium">
                  {item?.dueDate || item?.paidAt
                    ? formatPeriod(item.dueDate || item.paidAt)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Filing Frequency</span>
                <span className="text-slate-600 font-medium capitalize">
                  {item?.filingFrequency || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Filing Due Date</span>
                <span className="text-slate-600 font-medium">
                  {item?.dueDate
                    ? `${formatDate(item.dueDate)}${getDueInText(item.dueDate)}`
                    : "-"}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200" />

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tax Collected</span>
                <span className="text-slate-600 font-medium">
                  {formatCurrency(item?.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Less: Tax Paid</span>
                <span className="text-slate-600 font-medium">
                  {item?.paidAt ? formatCurrency(item.amount) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Penalty</span>
                <span className="text-slate-600 font-medium">-</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Interest</span>
                <span className="text-slate-600 font-medium">-</span>
              </div>
            </div>

            <div className="border-t border-slate-200" />

            <div className="flex justify-between items-center pt-2 pb-2">
              <span className="font-bold text-slate-800 text-lg">
                Total Payable
              </span>
              <span className="font-bold text-red-600 text-lg">
                {formatCurrency(item?.amount)}
              </span>
            </div>

            {isPaymentDue && item?.amount ? (
              <Button
                type="button"
                onClick={handlePayClick}
                size="lg"
                className="w-full"
              >
                Pay {formatCurrency(item.amount)} Now
              </Button>
            ) : null}

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
                  <span className="text-slate-500">
                    {item?.paidAt
                      ? formatDate(item.paidAt)
                      : item?.updatedAt
                      ? formatDate(item.updatedAt)
                      : "-"}
                  </span>
                  <span className="text-slate-600 font-medium">
                    {item?.paidAt
                      ? `${formatCurrency(item.amount)} Paid`
                      : item?.status
                      ? `Status: ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">
                    {item?.createdAt ? formatDate(item.createdAt) : "-"}
                  </span>
                  <span className="text-slate-600 font-medium">
                    {item?.createdAt ? "Record Created" : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">
                    {item?.updatedAt && item.updatedAt !== item.createdAt ? formatDate(item.updatedAt) : "-"}
                  </span>
                  <span className="text-slate-600 font-medium">
                    {item?.updatedAt && item.updatedAt !== item.createdAt ? "Last Updated" : "-"}
                  </span>
                </div>
              </div>
              <div className="border-t border-slate-200 mt-6" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <TaxPaymentDialog
        state={state}
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
      />
    </>
  );
}

