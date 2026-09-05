import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Calendar as CalendarIcon,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import { useFollowUpActivityDetailQuery } from "@/modules/followups/followups.hooks";
import type {
  FollowUpKind,
  FollowUpHistoryItem,
} from "@/modules/followups/followups.api";
import Pagination from "@/components/Pagination";
import StatCard from "@/components/ui/stat-card";

interface LeadFollowUpDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
  leadName?: string;
  kind?: FollowUpKind;
}

export default function LeadFollowUpDetailDialog({
  open,
  onOpenChange,
  leadId,
  leadName,
  kind,
}: LeadFollowUpDetailDialogProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: response, isLoading } = useFollowUpActivityDetailQuery(
    leadId || "",
    kind,
    page,
    limit,
    open && Boolean(leadId)
  );

  const detailData = response?.data;
  const lead = detailData?.lead;
  const totals = detailData?.totals;
  const history = detailData?.history || [];
  const totalHistory = detailData?.pagination?.totalHistory || history.length;

  const renderDeliveryCell = (
    channel: "sms" | "email",
    item: FollowUpHistoryItem
  ) => {
    const custDelivery = item.deliveryStatus?.customer?.[channel];
    const repDelivery = item.deliveryStatus?.salesEmployee?.[channel];

    // Determine customer channel state
    const hasCustRecord = custDelivery !== undefined;
    const isCustEnabled = hasCustRecord
      ? custDelivery.enabled
      : (channel === "sms" ? item.sendSms : item.sendEmail) ?? (item.modeOfContact === channel);

    const custStatus = hasCustRecord
      ? custDelivery.status
      : !isCustEnabled
      ? "disabled"
      : item.completedAt
      ? "sent"
      : "pending";

    const custSentAt = hasCustRecord
      ? custDelivery.sentAt
      : custStatus === "sent"
      ? item.completedAt
      : null;

    const custError = custDelivery?.error;

    // Determine rep channel state
    const isRepEnabled = repDelivery?.enabled ?? false;
    const repStatus = repDelivery?.status;
    const repSentAt = repDelivery?.sentAt;
    const repError = repDelivery?.error;

    if (!isCustEnabled && !isRepEnabled) {
      return <span className="text-gray-400 text-xs font-normal">Disabled</span>;
    }

    const renderStatusBadge = (
      status?: string,
      sentAt?: string | null
    ) => {
      switch (status?.toLowerCase()) {
        case "sent":
          return (
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                Sent
              </span>
              {sentAt && (
                <div className="text-[11px] text-gray-600 font-medium mt-0.5 whitespace-nowrap">
                  {dayjs(sentAt).format("MMM DD, h:mm A")}
                </div>
              )}
            </div>
          );
        case "failed":
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded">
              <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
              Failed
            </span>
          );
        case "pending":
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              Pending
            </span>
          );
        case "disabled":
        default:
          return <span className="text-gray-400 text-xs font-normal">Disabled</span>;
      }
    };

    return (
      <div className="space-y-1">
        {isCustEnabled ? (
          renderStatusBadge(custStatus, custSentAt)
        ) : (
          <span className="text-gray-400 text-xs font-normal">Disabled</span>
        )}

        {isRepEnabled && (
          <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-100 flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <span className="text-gray-400 font-medium">Rep:</span>
              <span
                className={`font-semibold capitalize ${
                  repStatus === "sent"
                    ? "text-emerald-600"
                    : repStatus === "failed"
                    ? "text-red-600"
                    : "text-amber-600"
                }`}
              >
                {repStatus}
              </span>
            </div>
            {repStatus === "sent" && repSentAt && (
              <span className="text-gray-500 text-[9px] whitespace-nowrap">
                {dayjs(repSentAt).format("MMM DD, h:mm A")}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "overdue":
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-medium">
            Overdue
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2 py-0.5 text-xs font-medium">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 text-xs font-medium">
            Pending
          </Badge>
        );
    }
  };

  const formatSource = (source?: string) => {
    if (!source) return "Manual";
    switch (source) {
      case "warm_lead_auto":
        return "Warm Auto";
      case "cold_lead_auto":
        return "Cold Auto";
      case "chat_dropoff_auto":
        return "Chat Dropoff";
      case "invoice_auto":
        return "Invoice Auto";
      case "manual":
        return "Manual";
      default:
        return source.replace(/_/g, " ");
    }
  };

  const getTemperatureBadge = (temp?: string) => {
    switch (temp?.toLowerCase()) {
      case "hot":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium px-2.5 py-0.5">
            Hot
          </Badge>
        );
      case "warm":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-2.5 py-0.5">
            Warm
          </Badge>
        );
      case "cold":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white font-medium px-2.5 py-0.5">
            Cold
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-full p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header matching other dialogs in the app */}
        <DialogHeader className="border-b px-6 py-4.5 bg-white flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Follow-up Activity Details
              </DialogTitle>
              {lead?.leadScoring?.temperature &&
                getTemperatureBadge(lead.leadScoring.temperature)}
            </div>
            <DialogDescription className="text-xs text-gray-500">
              {lead?.projectName || leadName || "Lead Activity"}
              {lead?.jobId && ` • Job ID: ${lead.jobId}`}
              {lead?.customerName && ` • Customer: ${lead.customerName}`}
              {lead?.assignedSales?.name && ` • Sales Rep: ${lead.assignedSales.name}`}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafafa]">
          {/* Top Metrics Cards using standard StatCard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Follow-ups"
              value={String(totals?.followUpCount ?? 0)}
              color="bg-blue-600"
              icon={<CalendarIcon className="w-5 h-5 text-blue-600" />}
              loading={isLoading}
            />
            <StatCard
              title="Pending"
              value={String(totals?.pendingCount ?? 0)}
              color="bg-yellow-500"
              icon={<Clock className="w-5 h-5 text-yellow-600" />}
              loading={isLoading}
            />
            <StatCard
              title="Completed"
              value={String(totals?.completedCount ?? 0)}
              color="bg-green-600"
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              loading={isLoading}
            />
            <StatCard
              title="Overdue"
              value={String(totals?.overdueCount ?? 0)}
              color="bg-red-600"
              icon={<AlertCircle className="w-5 h-5 text-red-600" />}
              loading={isLoading}
            />
          </div>

          {/* Activity Log Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4.5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Activity Timeline History
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chronological record of communications and reminders
                </p>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {totalHistory} total {totalHistory === 1 ? "entry" : "entries"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#f8fafc]">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Follow-up Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4 min-w-30">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                        <span>SMS</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4 min-w-35">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-600" />
                        <span>Email</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Source
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Assigned / Performed By
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Notes / Outcome
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-xs text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span>Loading activity records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-28 text-center text-xs text-gray-500">
                        No follow-up activity found for this lead.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((item) => (
                      <TableRow key={item._id} className="hover:bg-gray-50/70 text-xs">
                        <TableCell className="px-4 py-3 align-top">
                          <div className="font-medium text-gray-900">
                            {item.followUpDate
                              ? dayjs(item.followUpDate).format("MMM DD, YYYY")
                              : "-"}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {item.followUpDate
                              ? dayjs(item.followUpDate).format("h:mm A")
                              : ""}
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 align-top">
                          {renderDeliveryCell("sms", item)}
                        </TableCell>

                        <TableCell className="px-4 py-3 align-top">
                          {renderDeliveryCell("email", item)}
                        </TableCell>

                        <TableCell className="px-4 py-3 align-top">
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal capitalize bg-slate-100 text-slate-700"
                          >
                            {formatSource(item.source)}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-700 align-top">
                          <div>
                            {item.assignedTo?.name ||
                              item.createdBy?.name ||
                              "Unassigned"}
                          </div>
                          {item.completedAt && (
                            <div className="text-[10px] text-emerald-600 mt-0.5">
                              Done {dayjs(item.completedAt).format("MMM DD, h:mm A")}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="px-4 py-3 align-top">
                          {getStatusBadge(item.computedStatus || item.status)}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-600 max-w-sm align-top">
                          {item.notes ? (
                            <span className="line-clamp-2">{item.notes}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalHistory > limit && (
              <div className="p-3 border-t border-gray-100 bg-white">
                <Pagination
                  currentPage={page}
                  totalItems={totalHistory}
                  rowsPerPage={limit}
                  onPageChange={setPage}
                  onRowsPerPageChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-white flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
