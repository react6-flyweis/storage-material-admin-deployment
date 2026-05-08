import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import { useNavigate } from "react-router";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, MessageSquareIcon, User } from "lucide-react";
import ChatDialog from "./chat-dialog";
import QuoteSummaryDialog from "./quote-summary-dialog";
import TrackOrderLifecycleDialog from "./track-order-lifecycle-dialog";
import QuotationDialog from "./quotation-dialog";
import DocumentsDialog from "./documents-dialog";
import DetailedLeadDialog from "./detailed-lead-dialog";
import ConversationHistoryDialog from "./conversation-history-dialog";
import { apiClient } from "@/modules/auth/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";

type Lead = {
  id: string;
  backendId?: string;
  name: string;
  workshop?: string;
  category?: string;
  assignedTo?: string | null;
  assignedToName?: string;
  assignmentStatus?: string;
  progress?: number;
  progressStep?: string;
  status?: string;
  statusColor?: string;
  quoteValue?: string;
  chatCount?: number;
};

type LeadDetailResponse = {
  success: boolean;
  message: string;
  data: {
    lead: {
      _id: string;
      customerId?: {
        customerId?: string;
        firstName?: string;
        email?: string;
        phone?: {
          number?: string;
          countryCode?: string;
        };
      };
      buildingType?: string;
      location?: string;
      source?: string;
      assignedSales?: {
        _id?: string;
        name?: string;
      } | null;
      quoteValue?: number;
      lifecycleStatus?: string;
      leadScoring?: {
        score?: number;
        scoreBreakdown?: {
          projectSize?: { points?: number; reason?: string };
          budgetSignals?: { points?: number; reason?: string };
          timeline?: { points?: number; reason?: string };
          decisionMaker?: { points?: number; reason?: string };
          projectClarity?: { points?: number; reason?: string };
        };
      };
      createdAt?: string;
      updatedAt?: string;
      documents?: unknown[];
    };
    recentMessages?: unknown[];
    documents?: unknown[];
  };
};

type ScoreBreakdownItem = {
  label: string;
  value: number;
  max: number;
  hint: string;
};

const scoreBreakdownConfig = [
  {
    label: "Project Size",
    max: 25,
    hint: "Building scope and fit for your target segment",
  },
  {
    label: "Budget Signals",
    max: 25,
    hint: "Budget confidence based on conversations",
  },
  {
    label: "Timeline",
    max: 20,
    hint: "Urgency and readiness to move forward",
  },
  {
    label: "Decision Maker",
    max: 15,
    hint: "Access to final buyer or key stakeholder",
  },
  {
    label: "Project Clarity",
    max: 15,
    hint: "How specific the project details are",
  },
] as const;

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const createSeededRandom = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const createMockScoreData = (seedInput: string) => {
  const rand = createSeededRandom(hashString(seedInput));
  const score = Math.round(15 + rand() * 80);

  const rawValues = scoreBreakdownConfig.map((item) => rand() * item.max);
  const totalRaw = rawValues.reduce((sum, n) => sum + n, 0) || 1;
  const values = rawValues.map((n) => Math.round((n / totalRaw) * score));

  let diff = score - values.reduce((sum, n) => sum + n, 0);
  while (diff !== 0) {
    let adjusted = false;
    for (let i = 0; i < values.length; i++) {
      const max = scoreBreakdownConfig[i].max;
      if (diff > 0 && values[i] < max) {
        values[i] += 1;
        diff -= 1;
        adjusted = true;
      } else if (diff < 0 && values[i] > 0) {
        values[i] -= 1;
        diff += 1;
        adjusted = true;
      }
      if (diff === 0) break;
    }
    if (!adjusted) break;
  }

  const breakdown: ScoreBreakdownItem[] = scoreBreakdownConfig.map(
    (item, index) => ({
      label: item.label,
      value: values[index],
      max: item.max,
      hint: item.hint,
    }),
  );

  return { score, breakdown };
};

const formatTitleCase = (value: string) =>
  value
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value?: string) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-CA");
};

const getLifecycleUi = (lifecycleStatus?: string) => {
  switch (lifecycleStatus) {
    case "proposal_sent":
      return { status: "Proposal sent", statusColor: "purple" };
    case "quotation_sent":
      return { status: "Quotation Sent", statusColor: "orange" };
    case "closed_won":
      return { status: "Closed", statusColor: "green" };
    case "negotiation":
      return { status: "Negotiation", statusColor: "orange" };
    default:
      return {
        status: lifecycleStatus
          ? formatTitleCase(lifecycleStatus)
          : "Initial Contact",
        statusColor: "blue",
      };
  }
};

const lifecycleSteps = [
  "initial_contact",
  "requirements_gathered",
  "proposal_sent",
  "quotation_sent",
  "negotiation",
  "closed_won",
  "payment_done",
  "delivered",
];

async function getAdminLeadDetailProvider(leadId: string) {
  const response = await apiClient.get<LeadDetailResponse>(
    `/api/admin/leads/${encodeURIComponent(leadId)}/detail`,
  );

  return response.data;
}

type Props = {
  lead: Lead;
  escalationReason?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function LeadDetailDialog({
  lead,
  escalationReason,
  trigger,
  open,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isDetailedLeadOpen, setIsDetailedLeadOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConversationHistoryOpen, setIsConversationHistoryOpen] =
    useState(false);
  // const navigate = useNavigate();
  const effectiveLeadId = lead.backendId ?? lead.id;
  const isDialogOpen = open ?? internalOpen;

  const {
    data: leadDetailResponse,
    isLoading: isLeadDetailLoading,
    error: leadDetailError,
  } = useQuery({
    queryKey: ["leads", "admin-detail", effectiveLeadId],
    queryFn: () => getAdminLeadDetailProvider(effectiveLeadId),
    staleTime: 60 * 1000,
    enabled: isDialogOpen && Boolean(effectiveLeadId),
  });

  const leadDetail:
    | (LeadDetailResponse["data"]["lead"] & { updatedAt?: string })
    | undefined = leadDetailResponse?.data.lead;
  const lifecycleUi = getLifecycleUi(leadDetail?.lifecycleStatus);
  const customer = leadDetail?.customerId;
  const customerPhone = customer?.phone
    ? `${customer.phone.countryCode ?? ""} ${customer.phone.number ?? ""}`.trim()
    : "Not available";
  const recentMessagesCount =
    leadDetailResponse?.data.recentMessages?.length ?? 0;
  const documentsCount =
    leadDetailResponse?.data.documents?.length ??
    leadDetail?.documents?.length ??
    0;
  const statusText = leadDetail?.lifecycleStatus
    ? lifecycleUi.status
    : (lead.status ?? "Initial Contact");
  const statusColor = leadDetail?.lifecycleStatus
    ? lifecycleUi.statusColor
    : lead.statusColor;

  const progressFromLifecycle = leadDetail?.lifecycleStatus
    ? Math.max(lifecycleSteps.indexOf(leadDetail.lifecycleStatus), 0)
    : (lead.progress ?? 0);

  const apiScoreBreakdown = leadDetail?.leadScoring?.scoreBreakdown;
  const normalizedScore =
    leadDetail?.leadScoring?.score ?? createMockScoreData(lead.id).score;
  const scoreBreakdown: ScoreBreakdownItem[] = apiScoreBreakdown
    ? [
        {
          label: "Project Size",
          value: apiScoreBreakdown.projectSize?.points ?? 0,
          max: 25,
          hint:
            apiScoreBreakdown.projectSize?.reason ||
            "Building scope and fit for your target segment",
        },
        {
          label: "Budget Signals",
          value: apiScoreBreakdown.budgetSignals?.points ?? 0,
          max: 25,
          hint:
            apiScoreBreakdown.budgetSignals?.reason ||
            "Budget confidence based on conversations",
        },
        {
          label: "Timeline",
          value: apiScoreBreakdown.timeline?.points ?? 0,
          max: 20,
          hint:
            apiScoreBreakdown.timeline?.reason ||
            "Urgency and readiness to move forward",
        },
        {
          label: "Decision Maker",
          value: apiScoreBreakdown.decisionMaker?.points ?? 0,
          max: 15,
          hint:
            apiScoreBreakdown.decisionMaker?.reason ||
            "Access to final buyer or key stakeholder",
        },
        {
          label: "Project Clarity",
          value: apiScoreBreakdown.projectClarity?.points ?? 0,
          max: 15,
          hint:
            apiScoreBreakdown.projectClarity?.reason ||
            "How specific the project details are",
        },
      ]
    : createMockScoreData(lead.id).breakdown;

  const getStatusBadgeColor = (color: string | undefined) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-100 text-purple-700",
      orange: "bg-orange-100 text-orange-700",
      green: "bg-green-100 text-green-700",
      blue: "bg-blue-100 text-blue-700",
    };
    return colors[color || ""] || "bg-gray-100 text-gray-700";
  };

  const progressSteps = [
    "Initial Contact",
    "Requirements Gathered",
    "Proposal Sent",
    "Quotation Sent",
    "Negotiation",
    "Deal Closed",
    "Payment Done",
    "Delivered",
  ];

  const getScoreFillColorClass = (score: number) => {
    if (score < 30) return "bg-blue-500";
    if (score < 50) return "bg-green-500";
    if (score < 80) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreTextColorClass = (score: number) => {
    if (score < 30) return "text-blue-700";
    if (score < 50) return "text-green-700";
    if (score < 80) return "text-amber-700";
    return "text-red-700";
  };

  const getScoreTag = (score: number) => {
    if (score < 30) return "COLD";
    if (score < 50) return "GOOD";
    if (score < 80) return "WARM";
    return "HOT";
  };

  const topActionButtonClass = "bg-gray-100 text-gray-700 border-gray-300";

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  // const handleOpenPayments = () => {
  //   onOpenChange?.(false);
  //   navigate(`/leads/${encodeURIComponent(lead.id)}/payments`);
  // };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
              <CheckCircle className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-scroll">
          <DialogHeader className="border-b">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-2xl">
                Leads Details - {customer?.firstName ?? lead.name}
              </DialogTitle>
              {/* badge or edit lead button */}
              {escalationReason && (
                <div className="bg-red-100 px-2 py-1 rounded  text-xs">
                  <span className="text-red-700 font-semibold">Escalated </span>{" "}
                  <span className="font-semibold">
                    | Reason: {escalationReason}
                  </span>
                </div>
              )}
              {/* // <Link to={`/leads/${lead.id}/edit`}>
                //   <Button>Edit lead</Button>
                // </Link> */}
            </div>
            <DialogDescription className="mt-1 text-sm text-gray-500">
              {customer?.customerId ?? lead.id}
            </DialogDescription>
          </DialogHeader>

          {leadDetailError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {getApiErrorMessage(
                leadDetailError,
                "Failed to load lead details. Showing fallback data.",
              )}
            </div>
          )}

          {isLeadDetailLoading && (
            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              Loading lead details...
            </div>
          )}

          <div className="mt-4 flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className={topActionButtonClass}
                onClick={() => setIsQuoteDialogOpen(true)}
              >
                RFQ
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={topActionButtonClass}
                onClick={() => setIsDetailedLeadOpen(true)}
              >
                See Quotation
              </Button>
              {/* assign a person */}
              <Button
                variant="outline"
                size="sm"
                className={topActionButtonClass}
              >
                Assign a person
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={topActionButtonClass}
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquareIcon className="h-4 w-4" />
                Open Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={topActionButtonClass}
                onClick={() => setIsConversationHistoryOpen(true)}
              >
                Call History
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={topActionButtonClass}
                onClick={() => setIsTrackDialogOpen(true)}
              >
                Track Order Lifecycle
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={topActionButtonClass}
                onClick={() => setIsDocumentsOpen(true)}
              >
                Documents
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className={topActionButtonClass}
                onClick={handleOpenPayments}
              >
                Payments
              </Button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Contact Information
                </h3>
                <div className="mt-3 text-sm text-gray-700 space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Full Name</div>
                    <div className="text-sm text-gray-900">
                      {customer?.firstName ?? lead.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm text-gray-900">
                      {customer?.email ?? "Not available"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-sm text-gray-900">{customerPhone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="text-sm text-gray-900">
                      {leadDetail?.location ?? lead.category ?? "Not available"}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-100 text-gray-700 border-gray-300"
                    >
                      Assign construction & plant teams
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Project Details
                </h3>
                <div className="mt-3 text-sm text-gray-700 space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Building Type</div>
                    <div className="text-sm text-gray-900">
                      {leadDetail?.buildingType
                        ? formatTitleCase(leadDetail.buildingType)
                        : (lead.workshop ?? "Not available")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Quote Value</div>
                    <div className="text-sm text-gray-900">
                      {typeof leadDetail?.quoteValue === "number"
                        ? formatCurrency(leadDetail.quoteValue)
                        : (lead.quoteValue ?? "Not available")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="mt-1">
                      <Badge
                        variant="secondary"
                        className={getStatusBadgeColor(statusColor || "")}
                      >
                        {statusText}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Created On</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(leadDetail?.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Assignment
                </h4>
                <div className="p-4 rounded-lg bg-gray-50 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Assigned to:{" "}
                      {leadDetail?.assignedSales?.name ??
                        lead.assignedToName ??
                        "Not assigned"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {leadDetail?.assignedSales?.name
                        ? "1 person working on this lead"
                        : "No sales assignee yet"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Signed Contract/Agreement
                </h4>
                <div className="p-4 rounded-lg bg-gray-50 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Signed contact/Agreement
                    </div>
                    <div className="text-xs text-gray-500">
                      Signed on: 12 April 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-white">
                <div className="text-xs tracking-wider text-gray-500 font-semibold">
                  LEAD SCORING
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span
                    className={`text-4xl font-bold leading-none ${getScoreTextColorClass(
                      normalizedScore,
                    )}`}
                  >
                    {normalizedScore}
                  </span>
                  <span className="text-gray-400 text-lg">/100</span>
                </div>
                <div className="mt-3">
                  <Badge
                    variant="secondary"
                    className={`${getScoreFillColorClass(normalizedScore)} text-white`}
                  >
                    {getScoreTag(normalizedScore)}
                  </Badge>
                </div>
              </div>

              <div className="lg:col-span-2 p-4 rounded-lg border bg-white">
                <div className="text-xs tracking-wider text-gray-500 font-semibold mb-3">
                  SCORE BREAKDOWN
                </div>

                <div className="space-y-3">
                  {scoreBreakdown.map((item) => {
                    const itemPercent = Math.max(
                      0,
                      Math.min(100, (item.value / item.max) * 100),
                    );
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800">
                            {item.label}
                          </span>
                          <span
                            className={`font-semibold ${getScoreTextColorClass(
                              item.value,
                            )}`}
                          >
                            {item.value}/{item.max}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreFillColorClass(
                              item.value,
                            )}`}
                            style={{ width: `${itemPercent}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.hint}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Progress Lifecycle
              </h4>
              <div className="space-y-3">
                {progressSteps.map((step, i) => {
                  const idx = i + 1;
                  const completed = idx <= progressFromLifecycle;
                  const isCurrent = idx === progressFromLifecycle + 1;
                  return (
                    <div
                      key={step}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            completed
                              ? "bg-green-600 text-white"
                              : isCurrent
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm">{idx}</span>
                          )}
                        </div>
                        <div>
                          <div
                            className={`text-sm ${
                              completed
                                ? "text-green-800"
                                : isCurrent
                                  ? "text-blue-700 font-semibold"
                                  : "text-gray-700"
                            }`}
                          >
                            {step}
                          </div>
                          {isCurrent && (
                            <div className="text-xs text-gray-500">
                              Current Step
                            </div>
                          )}
                        </div>
                      </div>
                      {completed && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Progress: Step{" "}
                {Math.min(progressFromLifecycle + 1, progressSteps.length)} of{" "}
                {progressSteps.length}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Recent Activity
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 mt-1 rounded-full bg-blue-500" />{" "}
                  Last activity: {formatDate(leadDetail?.updatedAt)}
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 mt-1 rounded-full bg-blue-300" />{" "}
                  Lead created: {formatDate(leadDetail?.createdAt)}
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 mt-1 rounded-full bg-red-500" />
                  {recentMessagesCount} unread messages
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Photos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden h-32 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                  >
                    <div className="text-gray-500 text-sm">
                      {index <= documentsCount
                        ? `Document ${index}`
                        : `Photo ${index}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="bg-white">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuoteSummaryDialog
        open={isQuoteDialogOpen}
        onOpenChange={setIsQuoteDialogOpen}
      />

      <ChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        lead={{ id: lead.id, name: lead.name, chatCount: lead.chatCount }}
      />

      <ConversationHistoryDialog
        open={isConversationHistoryOpen}
        onOpenChange={setIsConversationHistoryOpen}
        lead={{ id: lead.id, name: lead.name }}
      />

      <QuotationDialog
        open={isQuotationOpen}
        onOpenChange={setIsQuotationOpen}
      />

      <TrackOrderLifecycleDialog
        open={isTrackDialogOpen}
        onOpenChange={setIsTrackDialogOpen}
        lead={{ id: lead.id, name: lead.name, progress: lead.progress }}
      />

      <DocumentsDialog
        open={isDocumentsOpen}
        onOpenChange={setIsDocumentsOpen}
        lead={{ id: lead.id, name: lead.name }}
      />

      <DetailedLeadDialog
        open={isDetailedLeadOpen}
        onOpenChange={setIsDetailedLeadOpen}
        lead={lead}
      />
    </>
  );
}
