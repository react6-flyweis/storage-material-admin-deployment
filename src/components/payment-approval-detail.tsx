import { useState, type ChangeEvent } from "react";
import { format, isValid } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Loader2, AlertCircle, Paperclip, Upload } from "lucide-react";
import { toast } from "sonner";
import SuccessDialog from "@/components/success-dialog";
import { uploadFileToS3 } from "@/lib/upload";
import {
  usePaymentApprovalDetailQuery,
  useAddPaymentApprovalRemarkMutation,
  useAddPaymentApprovalAttachmentMutation,
  useReviewPaymentApprovalMutation,
} from "@/modules/payments/payments.hooks";
import {
  PAYMENT_APPROVALS_BASE,
  type PaymentApprovalDetailData,
} from "@/modules/payments/payments.api";

interface PaymentApprovalDetailProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  approvalId?: string | null;
  paymentData?: {
    paymentId: string;
    payee: string;
    category: string;
    requestedBy: string;
    requestDate: string;
    reference: string;
    dueDate: string;
    amount: string;
    status: string;
    canReview?: boolean;
  };
}

const categoryColors: Record<string, string> = {
  vendor_payment: "bg-emerald-500",
  shipper_payment: "bg-blue-500",
  equipment: "bg-amber-500",
  other_expenses: "bg-violet-600",
  "Vendor Payment": "bg-emerald-500",
  "Shipper Payment": "bg-blue-500",
  "Other Expenses": "bg-violet-600",
  Equipment: "bg-amber-500",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  under_review: "bg-blue-500",
  approved: "bg-emerald-500",
  disputed: "bg-orange-500",
  rejected: "bg-rose-500",
  Pending: "bg-amber-500",
  Approved: "bg-emerald-500",
  Rejected: "bg-rose-500",
  "Under Review": "bg-blue-500",
  Disputed: "bg-orange-500",
};

const formatCategoryName = (cat: unknown) => {
  if (!cat) return "";
  if (typeof cat === "object") {
    return (cat as any)?.label || (cat as any)?.name || (cat as any)?.code || "";
  }
  const str = String(cat);
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const cleanStatusLabel = (st: string) => {
  return String(st || "").replace(/\s+Approval$/i, "").trim();
};

const formatStatusName = (st: unknown) => {
  if (!st) return "";
  if (typeof st === "object") {
    return (st as any)?.label || (st as any)?.name || (st as any)?.code || "";
  }
  const str = String(st);
  return cleanStatusLabel(
    str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return isValid(d) ? format(d, "MMM dd, yyyy hh:mm a") : String(dateStr);
};

const formatCurrency = (val: number | string | undefined | null) => {
  const num =
    typeof val === "number"
      ? val
      : parseFloat(String(val || 0).replace(/[^0-9.-]+/g, ""));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num || 0);
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const renderTextContent = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return Object.entries(val as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join("\n");
  }
  return String(val);
};

function PaymentApprovalDetailSkeleton({
  showActions = true,
}: {
  showActions?: boolean;
}) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Details Grid Skeleton */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Payee/Vendor</p>
            <Skeleton className="h-5 w-3/4 rounded" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Category</p>
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Requested by</p>
            <Skeleton className="h-5 w-2/3 rounded" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Requested Date</p>
            <Skeleton className="h-5 w-4/5 rounded" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Reference/Invoice</p>
            <Skeleton className="h-5 w-1/2 rounded" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Due Date</p>
            <Skeleton className="h-5 w-3/4 rounded" />
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-400 mb-1">Amount</p>
            <Skeleton className="h-8 w-36 rounded" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="w-full">
        <div className="grid w-full grid-cols-4 border-y border-slate-200 py-3">
          <Skeleton className="h-4 w-14 mx-auto rounded" />
          <Skeleton className="h-4 w-16 mx-auto rounded" />
          <Skeleton className="h-4 w-24 mx-auto rounded" />
          <Skeleton className="h-4 w-14 mx-auto rounded" />
        </div>

        {/* Tab Content Placeholder */}
        <div className="mt-6 space-y-6">
          <Skeleton className="h-5 w-40 rounded" />

          {/* Timeline comment skeleton items */}
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 pt-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <Skeleton className="h-3 w-32 rounded" />
                  <Skeleton className="h-14 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Add remark skeleton */}
          <div className="mt-8 space-y-3">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton (only shown if reviewable) */}
      {showActions && (
        <div className="flex gap-3 pt-6 border-t border-slate-200">
          <Skeleton className="flex-1 h-11 rounded-md" />
          <Skeleton className="flex-1 h-11 rounded-md" />
        </div>
      )}
    </div>
  );
}

export default function PaymentApprovalDetail({
  isOpen,
  onOpenChange,
  approvalId,
  paymentData,
}: PaymentApprovalDetailProps) {
  const [newRemark, setNewRemark] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [activeReviewAction, setActiveReviewAction] = useState<
    "approved" | "rejected" | "under_review" | "disputed" | null
  >(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState("");
  const [successDialogDescription, setSuccessDialogDescription] = useState("");

  const {
    data: detailRes,
    isLoading: isDetailLoading,
    isError,
    refetch,
  } = usePaymentApprovalDetailQuery(approvalId, isOpen && Boolean(approvalId));

  const addRemarkMutation = useAddPaymentApprovalRemarkMutation();
  const addAttachmentMutation = useAddPaymentApprovalAttachmentMutation();
  const reviewMutation = useReviewPaymentApprovalMutation();

  const detail: PaymentApprovalDetailData | undefined = detailRes?.data;
  const isFreshDataLoaded = Boolean(!isDetailLoading && detail);

  // Header and fields
  const displayPaymentId = detail?.paymentId || paymentData?.paymentId || "N/A";
  const rawStatus = detail?.status || paymentData?.status || "Pending";
  const displayStatus = cleanStatusLabel(
    detail?.statusLabel || formatStatusName(paymentData?.status || rawStatus)
  );
  const statusBadgeColor =
    statusColors[rawStatus.toLowerCase()] ||
    statusColors[displayStatus] ||
    "bg-slate-500";

  const displayPayee =
    typeof detail?.header?.payee === "object"
      ? (detail?.header?.payee as any)?.name || JSON.stringify(detail?.header?.payee)
      : detail?.header?.payee || paymentData?.payee || "N/A";

  const rawCategory = detail?.header?.category || paymentData?.category || "";
  const displayCategory =
    detail?.header?.categoryLabel || formatCategoryName(rawCategory);
  const categoryColor =
    categoryColors[rawCategory] ||
    categoryColors[displayCategory] ||
    "bg-slate-500";

  const reqBy = detail?.header?.requestedBy;
  const displayRequestedBy =
    typeof reqBy === "object"
      ? reqBy?.name
      : reqBy || paymentData?.requestedBy || "N/A";

  const displayRequestDate = detail?.header?.requestedAt
    ? formatDateTime(detail.header.requestedAt)
    : paymentData?.requestDate || "N/A";

  const displayReference =
    typeof detail?.header?.invoiceNumber === "object"
      ? JSON.stringify(detail?.header?.invoiceNumber)
      : detail?.header?.invoiceNumber || paymentData?.reference || "N/A";

  const displayDueDate = detail?.header?.dueDate
    ? formatDateTime(detail.header.dueDate)
    : paymentData?.dueDate || "N/A";

  const displayAmount =
    detail?.header?.amount !== undefined
      ? formatCurrency(detail.header.amount)
      : paymentData?.amount || "$0.00";

  const isStatusNonReviewable =
    rawStatus.toLowerCase() === "approved" ||
    rawStatus.toLowerCase() === "rejected" ||
    rawStatus.toLowerCase() === "disputed";

  const canReview = isStatusNonReviewable
    ? false
    : detail?.canReview !== undefined
      ? Boolean(detail.canReview)
      : Boolean(paymentData?.canReview);

  // Tabs Data
  const remarks = detail?.reviews?.remarks || [];
  const attachments = detail?.attachments || [];
  const history = detail?.history || [];

  const hasAdditionalDetails =
    detail?.details?.hasAdditionalDetails ??
    Boolean(
      detail?.details?.additionalNotes ||
        detail?.details?.invoiceDetails ||
        detail?.details?.project ||
        detail?.details?.linkedTransaction ||
        (detail?.details?.costBreakdown &&
          Object.keys(detail.details.costBreakdown).length > 0)
    );

  const handleAddRemark = async () => {
    if (!newRemark.trim()) {
      toast.error("Please enter a remark.");
      return;
    }
    if (!approvalId) {
      toast.error("Approval ID is missing.");
      return;
    }

    try {
      await addRemarkMutation.mutateAsync({
        approvalId,
        payload: { text: newRemark.trim() },
      });
      setNewRemark("");
      toast.success("Remark added successfully.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to add remark.";
      toast.error(msg);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !approvalId) return;

    try {
      setIsUploadingFile(true);
      const fileUrl = await uploadFileToS3(file, "payment-approvals");
      await addAttachmentMutation.mutateAsync({
        approvalId,
        payload: {
          name: file.name,
          url: fileUrl,
          fileSize: file.size,
        },
      });
      toast.success("Attachment uploaded successfully.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || (err as Error)?.message || "Failed to upload attachment.";
      toast.error(msg);
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleDownloadAttachment = (index: number, url?: string) => {
    if (url) {
      window.open(url, "_blank");
    } else if (approvalId) {
      window.open(
        `${PAYMENT_APPROVALS_BASE}/${approvalId}/attachments/${index}/download`,
        "_blank"
      );
    }
  };

  const openReviewDialog = (
    action: "approved" | "rejected" | "under_review" | "disputed"
  ) => {
    setActiveReviewAction(action);
    setReviewNotes("");
  };

  const handleConfirmReview = async () => {
    if (!approvalId || !activeReviewAction) {
      toast.error("Approval ID is missing.");
      return;
    }

    const action = activeReviewAction;
    try {
      await reviewMutation.mutateAsync({
        approvalId,
        payload: {
          action,
          reviewNotes: reviewNotes.trim() || undefined,
        },
      });

      const actionTextMap: Record<string, string> = {
        approved: "approved",
        rejected: "rejected",
        under_review: "marked as under review",
        disputed: "disputed",
      };

      setSuccessDialogTitle(
        action === "approved"
          ? "Payment Request Approved"
          : action === "rejected"
          ? "Payment Request Rejected"
          : action === "under_review"
          ? "Request Under Review"
          : "Payment Request Disputed"
      );
      setSuccessDialogDescription(
        `Payment request ${displayPaymentId} has been ${
          actionTextMap[action] || action
        } successfully.`
      );
      setActiveReviewAction(null);
      setSuccessDialogOpen(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to process ${action} for payment request.`;
      toast.error(msg);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    onOpenChange(false);
  };

  if (!isOpen && !paymentData && !approvalId) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
            {!isFreshDataLoaded && !paymentData ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20 rounded" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {displayPaymentId}
                </h2>
                <Badge
                  className={`${statusBadgeColor} hover:${statusBadgeColor} text-white rounded px-3 py-0.5 h-auto text-sm font-normal`}
                >
                  {displayStatus}
                </Badge>
              </div>
            )}
            <SheetClose asChild>
              <button className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {!isFreshDataLoaded ? (
              isError ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                  <p className="text-sm font-medium text-slate-800">
                    Failed to load approval details
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    An error occurred while fetching fresh data from the server.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              ) : (
                <PaymentApprovalDetailSkeleton showActions={canReview} />
              )
            ) : (
              <>
                {/* Details Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Payee/Vendor</p>
                      <p className="text-slate-900 font-medium">
                        {displayPayee}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Category</p>
                      <Badge
                        className={`${categoryColor} hover:${categoryColor} text-white rounded-md px-3 font-normal w-fit`}
                      >
                        {displayCategory}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Requested by</p>
                      <p className="text-slate-900">{displayRequestedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Requested Date</p>
                      <p className="text-slate-900">{displayRequestDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Reference/Invoice</p>
                      <p className="text-slate-900">{displayReference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Due Date</p>
                      <p className="text-slate-900">{displayDueDate}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600 mb-1">Amount</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {displayAmount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="reviews" className="w-full">
                  <TabsList
                    variant="line"
                    className="grid w-full grid-cols-4 border-y border-slate-200 bg-transparent p-0 h-auto"
                  >
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  {/* Details Tab */}
                  <TabsContent value="details" className="mt-6 space-y-4">
                    {hasAdditionalDetails ? (
                      <div className="space-y-4 text-sm">
                        {detail?.details?.project && (
                          <div>
                            <p className="text-slate-600 mb-1 font-medium">Project</p>
                            <p className="text-slate-900">
                              {typeof detail.details.project === "object"
                                ? `${detail.details.project.projectName || ""}${
                                    detail.details.project.jobId
                                      ? ` (${detail.details.project.jobId})`
                                      : ""
                                  }`
                                : String(detail.details.project)}
                            </p>
                          </div>
                        )}
                        {detail?.details?.linkedTransaction && (
                          <div>
                            <p className="text-slate-600 mb-1 font-medium">Linked Transaction</p>
                            <p className="text-slate-900 whitespace-pre-line">
                              {renderTextContent(detail.details.linkedTransaction)}
                            </p>
                          </div>
                        )}
                        {detail?.details?.costBreakdown &&
                          Object.keys(detail.details.costBreakdown).length > 0 && (
                            <div>
                              <p className="text-slate-600 mb-1 font-medium">Cost Breakdown</p>
                              <div className="bg-slate-50 p-3 rounded-md border border-slate-100 space-y-1.5">
                                {Object.entries(detail.details.costBreakdown).map(([k, v]) => (
                                  <div key={k} className="flex justify-between text-xs">
                                    <span className="text-slate-600 capitalize">
                                      {k.replace(/_/g, " ")}:
                                    </span>
                                    <span className="font-medium text-slate-900">
                                      {typeof v === "number" ? formatCurrency(v) : String(v)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        {detail?.details?.invoiceDetails && (
                          <div>
                            <p className="text-slate-600 mb-1 font-medium">Invoice Details</p>
                            <p className="text-slate-900 whitespace-pre-line">
                              {renderTextContent(detail.details.invoiceDetails)}
                            </p>
                          </div>
                        )}
                        {detail?.details?.additionalNotes && (
                          <div>
                            <p className="text-slate-600 mb-1 font-medium">Additional Notes</p>
                            <p className="text-slate-900 whitespace-pre-line">
                              {renderTextContent(detail.details.additionalNotes)}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-600">No additional details</p>
                    )}
                  </TabsContent>

                  {/* Reviews Tab */}
                  <TabsContent value="reviews" className="mt-6 space-y-6">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-6">
                        Remarks & Comments
                      </h3>

                      {/* Timeline */}
                      {remarks.length === 0 ? (
                        <p className="text-slate-600 text-sm mb-6">No remarks yet.</p>
                      ) : (
                        <div className="space-y-6">
                          {remarks.map((comment, index) => {
                            const author = comment.authorName || "Reviewer";
                            const initials =
                              comment.authorInitials ||
                              author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) ||
                              "RV";

                            return (
                              <div key={comment.id || comment._id || index} className="flex gap-4">
                                {/* Timeline line and avatar */}
                                <div className="h-full flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                    {initials}
                                  </div>
                                  {index < remarks.length - 1 && (
                                    <div className="w-0.5 min-h-6 bg-blue-300 mt-2"></div>
                                  )}
                                </div>

                                {/* Comment content */}
                                <div className="flex-1 pt-1">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="font-semibold text-slate-900">
                                      {author}
                                    </p>
                                    {comment.isLatest && (
                                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2 py-0.5">
                                        Latest
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mb-3">
                                    {formatDateTime(comment.createdAt)}
                                  </p>
                                  <p className="text-slate-600 text-sm whitespace-pre-line bg-slate-50 p-3 rounded-md">
                                    {typeof comment.text === "object"
                                      ? JSON.stringify(comment.text)
                                      : comment.text}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Remark */}
                      <div className="mt-8 space-y-3">
                        <textarea
                          value={newRemark}
                          onChange={(e) => setNewRemark(e.target.value)}
                          placeholder="Add a Remark"
                          className="w-full p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                          rows={4}
                          disabled={addRemarkMutation.isPending}
                        />
                        <Button
                          onClick={handleAddRemark}
                          disabled={addRemarkMutation.isPending || !newRemark.trim()}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {addRemarkMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Add Remark
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Attachments Tab */}
                  <TabsContent value="attachments" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">
                        Supporting Documents
                      </h3>
                      <div>
                        <input
                          type="file"
                          id="attachment-upload-input"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isUploadingFile || addAttachmentMutation.isPending}
                        />
                        <label htmlFor="attachment-upload-input">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
                            asChild
                            disabled={isUploadingFile || addAttachmentMutation.isPending}
                          >
                            <span>
                              {isUploadingFile || addAttachmentMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              Upload File
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>

                    {attachments.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 text-sm">No attachments uploaded yet</p>
                        <p className="text-slate-400 text-xs mt-1">
                          Upload invoices or receipts to support this request
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {att.name || `Attachment #${idx + 1}`}
                                </p>
                                {att.fileSize ? (
                                  <p className="text-xs text-slate-500">
                                    {formatFileSize(att.fileSize)}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-300 text-blue-600 hover:bg-blue-50 shrink-0 ml-3"
                              onClick={() => handleDownloadAttachment(idx, att.url)}
                            >
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history" className="mt-6 space-y-4">
                    {history.length === 0 ? (
                      <p className="text-slate-600">No history</p>
                    ) : (
                      <div className="space-y-4">
                        {history.map((h, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5" />
                              {i < history.length - 1 && (
                                <div className="w-0.5 min-h-6 bg-slate-200 mt-1" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">
                                {typeof h.label === "object"
                                  ? JSON.stringify(h.label)
                                  : h.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatDateTime(h.at)} {h.userName && `• ${h.userName}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Review Action Buttons */}
                {canReview && (
                  <div className="pt-6 border-t border-slate-200 space-y-2">
                    <div className="flex flex-wrap gap-2.5">
                      <Button
                        variant="outline"
                        className="flex-1 h-10 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-sm"
                        onClick={() => openReviewDialog("rejected")}
                        disabled={reviewMutation.isPending}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm"
                        onClick={() => openReviewDialog("under_review")}
                        disabled={reviewMutation.isPending}
                      >
                        Under Review
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 border-amber-300 text-amber-700 hover:bg-amber-50 font-medium text-sm"
                        onClick={() => openReviewDialog("disputed")}
                        disabled={reviewMutation.isPending}
                      >
                        Dispute
                      </Button>
                      <Button
                        className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                        onClick={() => openReviewDialog("approved")}
                        disabled={reviewMutation.isPending}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Review Confirmation Dialog */}
      <Dialog
        open={Boolean(activeReviewAction)}
        onOpenChange={(open) => !open && setActiveReviewAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {activeReviewAction === "approved"
                ? "Approve Payment Request"
                : activeReviewAction === "rejected"
                ? "Reject Payment Request"
                : activeReviewAction === "under_review"
                ? "Mark Request Under Review"
                : "Dispute Payment Request"}
            </DialogTitle>
            <DialogDescription>
              {activeReviewAction === "approved"
                ? `Confirm approval for payment request ${displayPaymentId} (${displayAmount}).`
                : `Provide any review notes or reason for this action on ${displayPaymentId}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            <label className="text-xs font-medium text-slate-700">
              Review Notes (optional)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Enter review notes, verification comments, or reason..."
              className="w-full p-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setActiveReviewAction(null)}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className={
                activeReviewAction === "rejected"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : activeReviewAction === "approved"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-800 hover:bg-slate-900 text-white"
              }
              onClick={handleConfirmReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm {activeReviewAction === "approved" ? "Approval" : activeReviewAction === "rejected" ? "Rejection" : "Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={handleSuccessClose}
        title={successDialogTitle}
        description={successDialogDescription}
        okLabel="Done"
      />
    </>
  );
}
