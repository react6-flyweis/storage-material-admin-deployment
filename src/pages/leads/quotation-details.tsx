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
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useQuotationQuery,
  useDownloadQuotationPdfMutation,
  useQuotationHtmlPreviewQuery,
} from "@/modules/quotations/quotations.hooks";
import { toast } from "sonner";
import ApproveQuotationDialog from "@/components/leads/approve-quotation-dialog";
import RejectQuotationDialog from "@/components/leads/reject-quotation-dialog";
import SendQuotationDialog from "@/components/leads/send-quotation-dialog";

export default function QuotationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuotationQuery(id);
  const {
    data: htmlPreviewData,
    isLoading: isHtmlLoading,
    isError: isHtmlError,
    refetch: refetchHtmlPreview,
  } = useQuotationHtmlPreviewQuery(id);

  const downloadPdfMutation = useDownloadQuotationPdfMutation();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);

  const q = data?.data?.quotation;

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

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      const blob = await downloadPdfMutation.mutateAsync(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Quotation-${q.quoteNumber || id}-v${q.versionNumber || 1}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch {
      toast.error("Failed to download PDF document.");
    }
  };

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
          {/* Download PDF button */}
          <Button
            size="sm"
            variant="outline"
            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 h-9 px-4 text-xs font-medium rounded-md flex items-center gap-1.5"
            onClick={handleDownloadPdf}
            disabled={downloadPdfMutation.isPending}
            title="Download PDF"
          >
            {downloadPdfMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-gray-600" />
            )}
            <span>{downloadPdfMutation.isPending ? "Downloading..." : "Download PDF"}</span>
          </Button>

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
            onClick={() => setIsSendOpen(true)}
            disabled={!isApproved}
            title={
              !isApproved
                ? "Quotation must be approved before sending to customer"
                : "Send quotation to customer"
            }
          >
            <Send className="h-4 w-4" />
            Send to Customer
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
              This quotation is waiting for administrative review. You can review the preview below and approve or reject it.
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

      {/* Quotation HTML Preview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full flex flex-col">
        {isHtmlLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3 min-h-100">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-gray-600">
              Loading quotation preview...
            </p>
          </div>
        ) : isHtmlError || !htmlPreviewData ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3 min-h-100">
            <FileText className="w-12 h-12 text-gray-300" />
            <p className="text-base font-semibold text-gray-600">
              Preview not available
            </p>
            <p className="text-xs text-gray-400 max-w-sm text-center">
              Unable to load quotation preview HTML directly.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs flex items-center gap-1.5"
              onClick={() => refetchHtmlPreview()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Preview
            </Button>
          </div>
        ) : (
          <div className="w-full bg-white p-4 sm:p-8">
            <div
              className="quotation-direct-preview w-full"
              dangerouslySetInnerHTML={{ __html: htmlPreviewData }}
            />
          </div>
        )}
      </div>

      {/* Extracted Approve Modal */}
      {id && (
        <ApproveQuotationDialog
          open={isApproveOpen}
          onOpenChange={setIsApproveOpen}
          quotationId={id}
          quoteNumber={q.quoteNumber}
          versionNumber={q.versionNumber}
        />
      )}

      {/* Extracted Reject Modal */}
      {id && (
        <RejectQuotationDialog
          open={isRejectOpen}
          onOpenChange={setIsRejectOpen}
          quotationId={id}
          quoteNumber={q.quoteNumber}
          versionNumber={q.versionNumber}
        />
      )}

      {/* Extracted Send Modal */}
      {id && (
        <SendQuotationDialog
          open={isSendOpen}
          onOpenChange={setIsSendOpen}
          quotationId={id}
          quoteNumber={q.quoteNumber}
          versionNumber={q.versionNumber}
        />
      )}
    </div>
  );
}
