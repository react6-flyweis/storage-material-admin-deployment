import { useState } from "react";
import { format, isValid } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SuccessDialog from "@/components/success-dialog";
import {
  usePaymentApprovalDetailQuery,
  useAddPaymentApprovalRemarkMutation,
  useReviewPaymentApprovalMutation,
} from "@/modules/payments/payments.hooks";
import type { PaymentApprovalDetailData } from "@/modules/payments/payments.api";

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

const formatCategoryName = (cat: string) => {
  if (!cat) return "";
  return cat
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatStatusName = (st: string) => {
  if (!st) return "";
  return st
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

export default function PaymentApprovalDetail({
  isOpen,
  onOpenChange,
  approvalId,
  paymentData,
}: PaymentApprovalDetailProps) {
  const [newRemark, setNewRemark] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState("");
  const [successDialogDescription, setSuccessDialogDescription] = useState("");

  const {
    data: detailRes,
    isLoading: isDetailLoading,
  } = usePaymentApprovalDetailQuery(approvalId, isOpen && Boolean(approvalId));

  const addRemarkMutation = useAddPaymentApprovalRemarkMutation();
  const reviewMutation = useReviewPaymentApprovalMutation();

  const detail: PaymentApprovalDetailData | undefined = detailRes?.data;

  // Header and fields
  const displayPaymentId = detail?.paymentId || paymentData?.paymentId || "N/A";
  const rawStatus = detail?.status || paymentData?.status || "Pending";
  const displayStatus =
    detail?.statusLabel || formatStatusName(paymentData?.status || rawStatus);
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

  const canReview = detail?.canReview ?? true;

  // Tabs Data
  const remarks = detail?.reviews?.remarks || [];
  const attachments = detail?.attachments || [];
  const history = detail?.history || [];

  const hasAdditionalDetails =
    detail?.details?.hasAdditionalDetails ??
    Boolean(
      detail?.details?.additionalNotes ||
        detail?.details?.invoiceDetails ||
        detail?.details?.project
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

  const handleReviewAction = async (action: "approved" | "rejected") => {
    if (!approvalId) {
      toast.error("Approval ID is missing.");
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        approvalId,
        payload: { action },
      });
      setSuccessDialogTitle(
        action === "approved"
          ? "Payment Request Approved"
          : "Payment Request Rejected"
      );
      setSuccessDialogDescription(
        `Payment request ${displayPaymentId} has been ${
          action === "approved" ? "approved" : "rejected"
        } successfully.`
      );
      setSuccessDialogOpen(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${action} payment request.`;
      toast.error(msg);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    onOpenChange(false);
  };

  const handleDownloadAttachment = (index: number, url?: string) => {
    if (url) {
      window.open(url, "_blank");
    } else if (approvalId) {
      window.open(
        `/api/account/financial/payment-approvals/${approvalId}/attachments/${index}/download`,
        "_blank"
      );
    }
  };

  if (!isOpen && !paymentData && !approvalId) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
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
            <SheetClose asChild>
              <button className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isDetailLoading && !paymentData ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Loading approval details...</p>
              </div>
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
                                    detail.details.project.jobId ? ` (${detail.details.project.jobId})` : ""
                                  }`
                                : String(detail.details.project)}
                            </p>
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
                  <TabsContent value="attachments" className="mt-6 space-y-3">
                    {attachments.length === 0 ? (
                      <p className="text-slate-600">No attachments</p>
                    ) : (
                      attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {att.name || `Attachment #${idx + 1}`}
                            </p>
                            {att.fileSize && (
                              <p className="text-xs text-slate-500">
                                {formatFileSize(att.fileSize)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleDownloadAttachment(idx, att.url)}
                          >
                            Download
                          </Button>
                        </div>
                      ))
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

                {/* Action Buttons */}
                {canReview && (
                  <div className="flex gap-3 pt-6 border-t border-slate-200">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                      onClick={() => handleReviewAction("rejected")}
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Reject
                    </Button>
                    <Button
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      onClick={() => handleReviewAction("approved")}
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Approve
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
