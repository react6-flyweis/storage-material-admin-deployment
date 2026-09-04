import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  useQuotationQuery,
  useApproveQuotationMutation,
  useRejectQuotationMutation,
  useSendQuotationMutation,
} from "@/modules/quotations/quotations.hooks";
import { API_BASE_URL } from "@/modules/auth/auth.api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QuotationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuotationQuery(id);
  const sendMutation = useSendQuotationMutation();
  const approveMutation = useApproveQuotationMutation();
  const rejectMutation = useRejectQuotationMutation();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveNote, setApproveNote] = useState("");

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const q = data?.data?.quotation;

  const handleSend = async () => {
    if (!id) return;
    try {
      const res = await sendMutation.mutateAsync(id);
      const provider = res.data?.emailProvider
        ? ` via ${res.data.emailProvider}`
        : "";
      toast.success(`Quotation sent to customer successfully${provider}!`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg =
        errorObj?.response?.data?.message ||
        "Failed to send quotation. Quotation must be approved first.";
      toast.error(msg);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync({ quotationId: id, note: approveNote });
      toast.success("Quotation approved!");
      setIsApproveOpen(false);
      setApproveNote("");
    } catch {
      toast.error("Failed to approve quotation.");
    }
  };

  const handleReject = async () => {
    if (!id || !rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        quotationId: id,
        reason: rejectionReason,
      });
      toast.success("Quotation rejected.");
      setIsRejectOpen(false);
      setRejectionReason("");
    } catch {
      toast.error("Failed to reject quotation.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError || !q) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-lg">
          Quotation not found or failed to load.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/leads")}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const effectiveStatus =
    q.workflowStatus || q.approval?.status || q.status || "draft";
  const isApproved = effectiveStatus === "approved";
  const isPending =
    effectiveStatus === "pending" || effectiveStatus === "pending_approval";
  const isRejected = effectiveStatus === "rejected";

  const fullPdfUrl = q.pdfLink
    ? q.pdfLink.startsWith("http")
      ? q.pdfLink
      : `${API_BASE_URL.replace(/\/+$/, "")}${q.pdfLink.startsWith("/") ? "" : "/"}${q.pdfLink}`
    : null;

  return (
    <div className="p-4 sm:p-6 space-y-6 ">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          className="bg-white hover:bg-gray-50 border-gray-200 text-gray-600 h-9 px-4 text-sm font-normal rounded-md flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {/* Admin Approve & Reject Actions */}
          {isPending && (
            <>
              <Button
                className="bg-[#16a34a] hover:bg-green-700 text-white h-9 px-4 text-xs font-medium rounded-md flex items-center gap-1.5"
                onClick={() => setIsApproveOpen(true)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Quote
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 h-9 px-4 text-xs font-medium rounded-md flex items-center gap-1.5"
                onClick={() => setIsRejectOpen(true)}
              >
                <XCircle className="h-4 w-4" />
                Reject Quote
              </Button>
            </>
          )}

          {/* Send to Customer (available once approved) */}
          <Button
            className="bg-[#7c3aed] hover:bg-purple-700 text-white h-9 px-4 text-xs font-medium rounded-md flex items-center gap-1.5 disabled:opacity-50"
            onClick={handleSend}
            disabled={!isApproved || sendMutation.isPending}
            title={
              !isApproved
                ? "Quotation must be approved before sending to customer"
                : "Send quotation to customer"
            }
          >
            <Send className="h-4 w-4" />
            {sendMutation.isPending ? "Sending..." : "Send to Customer"}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {isPending && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-900 text-sm">
              Pending Admin Approval
            </h4>
            <p className="text-xs text-amber-700">
              This quotation is waiting for administrative review. You can review the PDF below and approve or reject it.
            </p>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-emerald-900 text-sm">
              Quotation Approved
            </h4>
            <p className="text-xs text-emerald-700">
              This quotation has been approved and is ready to be sent to the customer.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-red-900 text-sm">
              Quotation Rejected
            </h4>
            {q.approval?.rejectionReason && (
              <p className="text-sm text-red-700">
                <strong>Reason:</strong> {q.approval.rejectionReason}
              </p>
            )}
            <p className="text-xs text-red-600 mt-1">
              Sales team has been notified to revise this quotation and resubmit for approval.
            </p>
          </div>
        </div>
      )}

      {effectiveStatus === "sent" && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
          <Send className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-blue-900 text-sm">
              Quotation Sent to Customer
            </h4>
            <p className="text-xs text-blue-700">
              This quotation has been successfully dispatched to the customer.
            </p>
          </div>
        </div>
      )}

      {effectiveStatus === "accepted" && (
        <div className="bg-green-50/80 border border-green-200 rounded-xl p-5 flex items-start gap-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-green-900 text-sm">
              Quotation Accepted by Customer
            </h4>
            <p className="text-xs text-green-700">
              The customer has accepted this quotation.
            </p>
          </div>
        </div>
      )}

      {(effectiveStatus === "draft" || effectiveStatus === "not_submitted") && (
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex items-start gap-4">
          <FileText className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900 text-sm">
              Quotation Draft
            </h4>
            <p className="text-xs text-slate-600">
              This quotation is currently a draft and has not yet been submitted for approval by sales.
            </p>
          </div>
        </div>
      )}

      {/* PDF Preview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full flex flex-col">
        {fullPdfUrl ? (
          <div className="w-full flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Quotation PDF Document</span>
              </div>
              <a
                href={fullPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open PDF in new tab
              </a>
            </div>
            <iframe
              src={`${fullPdfUrl}#toolbar=1`}
              title={`Quotation ${q.quoteNumber}`}
              className="w-full h-[calc(100vh-220px)] min-h-[750px] border-0 bg-white"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <FileText className="w-12 h-12 text-gray-300" />
            <p className="text-base font-semibold text-gray-600">
              PDF Preview not available
            </p>
            <p className="text-xs text-gray-400 max-w-sm text-center">
              This quotation does not have a linked PDF document yet.
            </p>
          </div>
        )}
      </div>


      {/* Approve Modal */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Approve Quotation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Are you sure you want to approve Quote{" "}
              <strong>{q.quoteNumber}</strong> (v{q.versionNumber})? This will
              enable sending the quotation to the customer.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Optional Approval Note
              </Label>
              <Input
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="e.g. Approved for customer send"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsApproveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#16a34a] hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Confirm Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Reject Quotation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Rejecting Quote <strong>{q.quoteNumber}</strong> (v
              {q.versionNumber}). Sales will be requested to update and
              resubmit.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Update dimensions and resend"
                className="text-sm min-h-24 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#dc2626] hover:bg-red-700 text-white"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
