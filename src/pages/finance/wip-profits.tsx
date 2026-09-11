import { useState } from "react";
import { Database, Download, Eye, Loader2, PencilLine, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TitleSubtitle from "@/components/TitleSubtitle";
import SuccessDialog from "@/components/success-dialog";
import AddPaymentEntryDialog from "@/components/add-payment-entry-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useWipProfitsQuery,
  useExportWipProfitsMutation,
} from "@/modules/financials/financials.hooks";

type SummaryCardProps = {
  title: string;
  value: string;
  iconTone: string;
  valueTone?: string;
};

function formatCurrency(val: number | undefined | null) {
  if (val === undefined || val === null) return "$0";
  const absVal = Math.abs(val);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(absVal);
  return val < 0 ? `-${formatted}` : formatted;
}

function SummaryCard({
  title,
  value,
  iconTone,
  valueTone = "text-slate-950",
}: SummaryCardProps) {
  return (
    <div className="rounded-md border border-white/80 bg-white px-4 py-4 shadow-[0_4px_16px_rgba(148,163,184,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p
            className={`mt-1 text-[17px] font-semibold tracking-[-0.02em] ${valueTone}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconTone}`}
        >
          <Database className="h-4.5 w-4.5" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    in_progress: "bg-[#e3edff] text-[#4a78d6]",
    "In progress": "bg-[#e3edff] text-[#4a78d6]",
    completed: "bg-[#e6f9ea] text-[#46b865]",
    Completed: "bg-[#e6f9ea] text-[#46b865]",
    started: "bg-[#fff1df] text-[#f0a23a]",
    Started: "bg-[#fff1df] text-[#f0a23a]",
  };

  const displayStatus = status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${
        statusStyles[status] ?? statusStyles[displayStatus] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {displayStatus}
    </span>
  );
}

export default function WipProfitsPage() {
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState(
    "Data exported successfully",
  );
  const [paymentEntryDialogOpen, setPaymentEntryDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useWipProfitsQuery(
    clientId ? { clientId } : undefined
  );
  const exportMutation = useExportWipProfitsMutation();

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(
        clientId ? { clientId } : undefined
      );
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `wip-profits-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessDialogTitle("Data exported successfully");
      setSuccessDialogOpen(true);
    } catch {
      // Handle fallback or notify user if needed
    }
  };

  const stats = data?.data?.stats;
  const wips = data?.data?.wips ?? [];

  const summaryCards: SummaryCardProps[] = [
    {
      title: "Total Order Value",
      value: formatCurrency(stats?.totalOrderValue),
      iconTone: "bg-[#edf4ff] text-[#2f6ee4]",
    },
    {
      title: "Total Received",
      value: formatCurrency(stats?.totalReceived),
      iconTone: "bg-[#eafaf0] text-[#3fb45a]",
    },
    {
      title: "Outstanding",
      value: formatCurrency(stats?.outstanding),
      iconTone: "bg-[#ffe9e8] text-[#f97373]",
      valueTone: (stats?.outstanding ?? 0) > 0 ? "text-[#f24848]" : "text-slate-950",
    },
    {
      title: "Total WIP Profit",
      value: formatCurrency(stats?.wipProfit),
      iconTone: "bg-[#f3eaff] text-[#a46ff0]",
      valueTone: (stats?.wipProfit ?? 0) < 0 ? "text-[#f24848]" : "text-slate-950",
    },
  ];

  return (
    <div className="p-5">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <TitleSubtitle
            title="WIP Profits"
            subtitle="Financial performance tracking and management"
            titleClassName="text-[28px] tracking-[-0.03em] text-slate-900"
            subtitleClassName="text-sm text-slate-500"
          />

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              disabled={exportMutation.isPending}
              onClick={handleExport}
            >
              {exportMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Reports
            </Button>


            <Button
              className="h-10 rounded-lg bg-[#2f6ee4] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#285fd0]"
              onClick={() => setPaymentEntryDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))}
        </div>

        <Card className="gap-0 pb-0 rounded-md">
          <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Orders &amp; Payment Summary
            </h2>

            <Select
              value={clientId ?? "all-clients"}
              onValueChange={(val) =>
                setClientId(val === "all-clients" ? undefined : val)
              }
            >
              <SelectTrigger className="h-9 w-36 rounded-lg border-slate-200 bg-white text-xs text-slate-600 shadow-sm">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-clients">All Clients</SelectItem>
                {wips.map((wip) => {
                  const lead = wip.leadId;
                  const c = lead?.customerId;
                  if (!lead || !c) return null;
                  const fullName = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();
                  return (
                    <SelectItem key={lead._id} value={lead._id}>
                      {fullName || lead.projectName || "Client"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-[#2f6ee4]" />
                  Loading WIP profit data...
                </div>
              ) : isError ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-slate-500">
                  <p>Failed to load WIP profits data.</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              ) : wips.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                  No WIP profit records found.
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
                      <th className="px-4 py-4 text-left">Order Details</th>
                      <th className="px-4 py-4 text-left">Order Value</th>
                      <th className="px-4 py-4 text-left">Payment Breakdown</th>
                      <th className="px-4 py-4 text-left">Outstanding</th>
                      <th className="px-4 py-4 text-left">WIP Profit</th>
                      <th className="px-4 py-4 text-left">Status</th>
                      <th className="px-4 py-4 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {wips.map((item) => {
                      const customer = item.leadId?.customerId;
                      const customerName = customer
                        ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()
                        : "Unknown Customer";
                      const jobId = item.leadId?.jobId ?? "-";
                      const location = item.leadId?.location ?? "";
                      const projectName = item.leadId?.projectName ?? "";
                      const locationInfo = [projectName, location]
                        .filter(Boolean)
                        .join(" • ");

                      const wipProfitColor =
                        item.wipProfit < 0
                          ? "text-[#ff5b5b]"
                          : "text-[#38b66f]";

                      return (
                        <tr
                          key={item._id}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="px-4 py-5 align-top">
                            <div className="space-y-1.5">
                              <p className="text-[13px] font-medium text-slate-900">
                                {customerName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {jobId}
                              </p>
                              {locationInfo && (
                                <p className="text-[11px] text-slate-500">
                                  {locationInfo}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-5 align-top">
                            <div className="space-y-1.5">
                              <p className="text-[13px] font-semibold text-slate-900">
                                {formatCurrency(item.orderValue)}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Current Cost{" "}
                                <span className="text-slate-700">
                                  {formatCurrency(item.currentCost)}
                                </span>
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-5 align-top">
                            <div className="space-y-1 text-[11px] text-slate-500">
                              <div className="flex items-center justify-between gap-4">
                                <span>Deposit:</span>
                                <span className="font-semibold text-slate-900">
                                  {formatCurrency(item.depositPaid)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span>Progress</span>
                                <span className="font-semibold text-slate-900">
                                  {formatCurrency(item.progressPaid)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span>Final</span>
                                <span className="font-semibold text-slate-900">
                                  {formatCurrency(item.finalPaid)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-5 align-top text-[12px] font-medium text-[#ff5b5b]">
                            {formatCurrency(item.outstanding)}
                          </td>

                          <td className="px-4 py-5 align-top">
                            <div className="space-y-1">
                              <p
                                className={`text-[12px] font-medium ${wipProfitColor}`}
                              >
                                {formatCurrency(item.wipProfit)}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {item.marginPct}% margin
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-5 align-top">
                            <StatusPill status={item.status} />
                          </td>

                          <td className="px-4 py-5 align-top">
                            <div className="flex items-center gap-3 text-slate-500">
                              <button type="button" aria-label="View order details">
                                <Eye className="h-4 w-4 text-[#3845d7]" />
                              </button>
                              <button type="button" aria-label="Edit order details">
                                <PencilLine className="h-4 w-4 text-[#48b05f]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successDialogTitle}
      />

      <AddPaymentEntryDialog
        open={paymentEntryDialogOpen}
        onClose={() => setPaymentEntryDialogOpen(false)}
        onSuccess={() => {
          setPaymentEntryDialogOpen(false);
          setSuccessDialogTitle("Entry Added Successfully");
          setSuccessDialogOpen(true);
          refetch();
        }}
      />
    </div>
  );
}

