import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import TaxPaymentDialog from "./tax-payment-dialog";
import TaxStatusBadge from "./tax-status-badge";
import { Button } from "@/components/ui/button";
import { format, isValid } from "date-fns";
import type {
  TaxFilingItem,
  TaxStatusObject,
} from "@/modules/payments/payments.api";
import { useTaxFilingDetailQuery } from "@/modules/payments/payments.hooks";

interface TaxDetailsSheetProps {
  state?: string;
  status?: TaxStatusObject | string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taxRecordId?: string;
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

export default function TaxDetailsSheet({
  state = "",
  status = "Pending",
  isOpen,
  onOpenChange,
  taxRecordId,
  item,
}: TaxDetailsSheetProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const effectiveId = taxRecordId || item?._id;
  const { data: detailRes, isLoading: isDetailLoading } = useTaxFilingDetailQuery(
    effectiveId,
    isOpen
  );

  const detail = detailRes?.data?.detail;

  const displayState = detail?.state || state || item?.state || "";
  const displayStateLabel =
    detail?.stateLabel || (displayState ? `${displayState} Tax Details` : "Tax Details");
  const currentStatus = detail?.uiStatus || item?.status || status;

  const filingPeriodDisplay =
    detail?.filingPeriod ||
    (item?.dueDate || item?.paidAt
      ? formatPeriod(item.dueDate || item.paidAt)
      : "-");

  const filingFrequencyDisplay =
    detail?.filingFrequency || item?.filingFrequency || "Monthly";

  const dueDateStr = detail?.filingDueDate || item?.dueDate;
  const daysUntilDueVal = detail?.daysUntilDue ?? item?.daysUntilDue;

  const breakdown = detail?.breakdown || {
    taxCollected: item?.taxDue || item?.amount || 0,
    taxPaid: item?.paidAt ? item?.amount || 0 : 0,
    penalty: 0,
    interest: 0,
    totalPayable: item?.payable || item?.amount || 0,
  };

  const totalPayable = breakdown.totalPayable ?? 0;
  const payNowConfig = detail?.payNow;
  const isPayEnabled = payNowConfig?.enabled ?? totalPayable > 0;
  const payAmount = payNowConfig?.amount ?? totalPayable;
  const partnerLabel =
    payNowConfig?.providerLabel || "Tax Partner: Avalara CERTIFIED PARTNER";

  const recentActivity = detail?.recentActivity || [];

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
              {displayState === "Texas" || displayState === "TX" ? (
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
                displayState?.charAt(0) || "-"
              )}
            </div>
            <SheetTitle className="text-lg font-bold flex items-center gap-3 text-slate-900 m-0 flex-wrap">
              {displayStateLabel}
              <TaxStatusBadge status={currentStatus} />
            </SheetTitle>
          </SheetHeader>

          {isDetailLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-sm">Loading tax details...</span>
            </div>
          ) : (
            <div className="p-6 pt-4 flex flex-col gap-4 bg-white">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Filing Period</span>
                  <span className="text-slate-800 font-medium">
                    {filingPeriodDisplay}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Filing Frequency</span>
                  <span className="text-slate-800 font-medium capitalize">
                    {filingFrequencyDisplay}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Filing Due Date</span>
                  <span className="text-slate-800 font-medium">
                    {dueDateStr ? formatDate(dueDateStr) : "-"}
                    {daysUntilDueVal !== undefined
                      ? ` (${daysUntilDueVal > 0 ? `In ${daysUntilDueVal} Days` : "Due"})`
                      : ""}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200" />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Tax Collected</span>
                  <span className="text-slate-800 font-medium">
                    {formatCurrency(breakdown.taxCollected)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Less: Tax Paid</span>
                  <span className="text-slate-800 font-medium">
                    {formatCurrency(breakdown.taxPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Penalty</span>
                  <span className="text-slate-800 font-medium">
                    {formatCurrency(breakdown.penalty)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Interest</span>
                  <span className="text-slate-800 font-medium">
                    {formatCurrency(breakdown.interest)}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200" />

              <div className="flex justify-between items-center pt-1 pb-1">
                <span className="font-bold text-slate-800 text-lg">
                  Total Payable
                </span>
                <span className="font-bold text-red-600 text-lg">
                  {formatCurrency(totalPayable)}
                </span>
              </div>

              {isPayEnabled && payAmount > 0 && (
                <Button
                  type="button"
                  onClick={handlePayClick}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Pay {formatCurrency(payAmount)} Now
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
                    {partnerLabel}
                  </span>
                </div>
              </div>

              <div className="mt-2 pb-6">
                <h4 className="font-bold text-[#1e1b4b] text-base mb-4">
                  Recent Activity
                </h4>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((act, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-slate-500">
                          {formatDate(act.at)}
                        </span>
                        <span className="text-slate-700 font-medium">
                          {act.label || `${formatCurrency(act.amount)} Paid`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : item?.paidAt ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">
                        {formatDate(item.paidAt)}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatCurrency(item.amount)} Paid
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-1">
                    No recent activity recorded.
                  </div>
                )}
                <div className="border-t border-slate-200 mt-4" />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <TaxPaymentDialog
        state={displayState}
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        taxId={effectiveId}
        amount={payAmount}
        filingPeriod={filingPeriodDisplay}
        dueDate={dueDateStr}
        daysUntilDue={daysUntilDueVal}
      />
    </>
  );
}

