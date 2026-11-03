import { useNavigate, useLocation, useParams } from "react-router";
import { useState } from "react";
import { useAppBack } from "@/modules/navigation";
import {
  useGetPayableInvoiceDetailQuery,
  useGetAdminVendorInvoiceDetailQuery,
  useMarkInvoicePaidMutation,
  useSendInvoiceMutation,
  useApprovePayableInvoiceMutation,
  useRejectPayableInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Wallet,
  Check,
  XCircle,
  FileText,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import logo from "@/assets/steel-building-depot-logo.png";
import SuccessDialog from "@/components/success-dialog";
import { PayableStatusBadge } from "./components/payable-status-badge";
import { RejectPayableDialog } from "./components/reject-payable-dialog";
import { InvoiceCommentsThread } from "./components/invoice-comments-thread";
import { toast } from "sonner";

export default function VendorInvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { goBack } = useAppBack("/invoice/invoices-management");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const locationState = location.state || {};
  const invoiceId = params.invoiceId || locationState.invoiceId || "";

  const queryClient = useQueryClient();
  const markPaidMutation = useMarkInvoicePaidMutation();
  const sendInvoiceMutation = useSendInvoiceMutation();
  const approveMutation = useApprovePayableInvoiceMutation();
  const rejectMutation = useRejectPayableInvoiceMutation();

  // Fetch payable invoice details (which includes comments and payableWorkflow)
  const {
    data: payableDetailResponse,
    isLoading: isPayableLoading,
    refetch: refetchPayable,
  } = useGetPayableInvoiceDetailQuery(invoiceId);

  // Fallback to standard admin invoice detail query if needed
  const {
    data: vendorDetailResponse,
    isLoading: isVendorLoading,
  } = useGetAdminVendorInvoiceDetailQuery(invoiceId);

  const invoiceData =
    payableDetailResponse?.data?.invoice ||
    (payableDetailResponse?.data as any) ||
    vendorDetailResponse?.data?.invoice;

  const isLoading = (isPayableLoading && isVendorLoading) || !invoiceData;

  const invoiceNumber =
    invoiceData?.invoiceNumber || locationState.invoiceNumber || "";
  const date = invoiceData?.date
    ? new Date(invoiceData.date).toLocaleDateString("en-US")
    : locationState.date || "";
  const daysToPay = invoiceData?.daysToPay || locationState.daysToPay || "30";
  const subtotal = invoiceData?.subtotal ?? 0;
  const total = invoiceData?.totalAmount ?? locationState.total ?? 0;
  const discount = invoiceData?.discount ?? 0;

  const payableWorkflow = invoiceData?.payableWorkflow;
  const payableStatus =
    invoiceData?.payableStatus || payableWorkflow?.status || invoiceData?.status;
  const isPendingApproval = payableStatus === "pending_admin_approval";
  const documentUrl =
    invoiceData?.documentUrl || payableWorkflow?.documentUrl;

  const vendorName =
    typeof invoiceData?.vendorId === "object"
      ? invoiceData?.vendorId?.vendorName
      : invoiceData?.payeeName;
  const projectName =
    typeof invoiceData?.leadId === "object"
      ? invoiceData?.leadId?.projectName
      : "";
  const jobId =
    typeof invoiceData?.leadId === "object" ? invoiceData?.leadId?.jobId : "";

  const items = invoiceData?.lineItems?.length
    ? invoiceData.lineItems.map((item: any, index: number) => ({
        id: item._id || `item-${index}`,
        description: item.items?.[0] || item.description || "Item Description",
        notes: item.items?.slice(1).join(", ") || "",
        total: item.total || 0,
        photos: item.images || [],
        rate: item.effectiveRate || item.rate || 0,
        quantity: item.quantity || 1,
        taxAmount: item.taxAmount || 0,
      }))
    : [];

  const totalTax =
    invoiceData?.tax ??
    items.reduce((acc: number, item: any) => acc + (item.taxAmount || 0), 0);

  const handleApprove = async () => {
    if (!invoiceId) return;
    try {
      await approveMutation.mutateAsync(invoiceId);
      toast.success("Payable invoice approved successfully.");
      refetchPayable();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve invoice.");
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!invoiceId) return;
    try {
      await rejectMutation.mutateAsync({
        invoiceId,
        payload: { reason },
      });
      toast.success("Payable invoice rejected.");
      setIsRejectOpen(false);
      refetchPayable();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject invoice.");
    }
  };

  const handleMarkPaid = async () => {
    if (!invoiceId) {
      toast.error("Cannot mark as paid: Invoice ID missing.");
      return;
    }
    if (invoiceData?.status === "paid" || payableStatus === "paid") {
      toast.info("This invoice is already paid.");
      return;
    }

    try {
      await markPaidMutation.mutateAsync(invoiceId);
      toast.success("Vendor invoice marked as paid!");
      queryClient.invalidateQueries({
        queryKey: ["adminVendorInvoiceDetail", invoiceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payableInvoiceDetail", invoiceId],
      });
    } catch (error) {
      console.error("Failed to mark vendor invoice as paid", error);
      toast.error("Failed to mark vendor invoice as paid");
    }
  };

  const handleSendEmail = async () => {
    if (!invoiceId) {
      toast.error("Invoice ID missing.");
      return;
    }
    try {
      await sendInvoiceMutation.mutateAsync(invoiceId);
      setShowSuccess(true);
      queryClient.invalidateQueries({
        queryKey: ["adminVendorInvoiceDetail", invoiceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payableInvoiceDetail", invoiceId],
      });
    } catch (error) {
      console.error("Failed to send vendor invoice email", error);
      toast.error("Failed to send email");
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading vendor invoice details...
      </div>
    );
  }

  return (
    <>
      <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6">
        {/* Top Navigation & Quick Actions */}
        <div className="flex justify-between items-center mb-3 mt-1 max-w-350 gap-4 mx-auto">
          <div>
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-25"
              onClick={() => goBack()}
            >
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {isPendingApproval ? (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectOpen(true)}
                  disabled={rejectMutation.isPending}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Invoice
                </Button>
              </>
            ) : null}

            <Button
              className={
                invoiceData?.status === "paid" || payableStatus === "paid"
                  ? "bg-gray-400 cursor-not-allowed text-white min-w-25 gap-2"
                  : "bg-[#2563EB] hover:bg-blue-700 text-white min-w-25 gap-2"
              }
              onClick={handleSendEmail}
              disabled={sendInvoiceMutation.isPending}
            >
              <Mail className="w-4 h-4" />
              {sendInvoiceMutation.isPending ? "Sending..." : "Email"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/invoice/invoices-management")}
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-25 gap-2"
            >
              <Wallet className="w-4 h-4" />
              Invoices List
            </Button>
          </div>
        </div>

        {/* Payable Workflow Status Alert Banner */}
        <div className="max-w-350 mx-auto">
          <div className="p-4 rounded-lg border bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PayableStatusBadge
                status={payableStatus}
                paymentLabel={invoiceData?.paymentLabel}
              />
              {payableWorkflow?.source && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  Source:{" "}
                  {payableWorkflow.source === "acceptance_upload"
                    ? "Vendor Acceptance Upload"
                    : "Admin Manual Upload"}
                </span>
              )}
            </div>

            {payableWorkflow?.rejectionReason && (
              <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-3 py-1.5 rounded border border-red-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>
                  <strong>Rejection Reason:</strong> {payableWorkflow.rejectionReason}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded PDF Document Banner (if exists) */}
        {documentUrl && (
          <div className="max-w-350 mx-auto">
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Uploaded Vendor Invoice PDF
                  </h4>
                  <p className="text-xs text-gray-500">
                    Original invoice document uploaded for this payable record.
                  </p>
                </div>
              </div>
              <a
                href={documentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Document
              </a>
            </div>
          </div>
        )}

        {/* Invoice Paper Document */}
        <div className="bg-white rounded-lg p-6 sm:p-14 shadow-sm mx-auto max-w-350">
          <div className="relative mb-12 flex justify-center items-center">
            <h1 className="text-gray-400 font-bold text-md md:text-xl tracking-widest uppercase">
              VENDOR INVOICE
            </h1>
            <Button
              className={
                invoiceData?.status === "paid" || payableStatus === "paid"
                  ? "absolute right-0 bg-gray-400 cursor-not-allowed text-white min-w-25"
                  : "absolute right-0 bg-[#2563EB] hover:bg-blue-700 text-white min-w-25"
              }
              onClick={handleMarkPaid}
              disabled={markPaidMutation.isPending}
            >
              {markPaidMutation.isPending ? "Marking..." : "Mark Paid"}
            </Button>
          </div>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center shrink-0">
                  <img src={logo} alt="Logo" className="h-12 object-contain" />
                </div>
              </div>

              <div className="text-xs text-gray-500 leading-relaxed">
                1851 Madison Ave Suite 300
                <br />
                Council Bluffs, IA 51503
                <br />
                United States
              </div>

              {vendorName && (
                <div className="pt-2 text-xs text-gray-700">
                  <span className="font-semibold text-gray-900 block mb-1">
                    Vendor Details:
                  </span>
                  <div>{vendorName}</div>
                  {projectName && (
                    <div>
                      Project: {projectName} {jobId ? `(${jobId})` : ""}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="min-w-50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Payment terms</span>
                <span className="text-gray-900">{daysToPay} days</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Invoice #</span>
                <span className="text-gray-900">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Date</span>
                <span className="text-gray-900">{date}</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-gray-500 font-medium">Status</span>
                <PayableStatusBadge
                  status={payableStatus}
                  paymentLabel={invoiceData?.paymentLabel}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-12">
            <div className="flex justify-between border-b border-gray-800 pb-2 mb-6">
              <span className="text-xs font-bold text-gray-700 w-2/3">
                Description
              </span>
              <span className="text-xs font-bold text-gray-700 w-1/3 text-right">
                Total
              </span>
            </div>

            <div className="space-y-8">
              {items.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className={index > 0 ? "border-t border-gray-100 pt-4" : ""}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-600 font-medium w-2/3 wrap-break-word pr-2">
                      {item.description}
                    </span>
                    <span className="text-xs text-gray-600 w-1/3 text-right font-semibold">
                      ${(item.total || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {item.notes && (
                    <div className="text-[10px] text-gray-400 mb-2">
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}

              {items.length === 0 && (
                <div className="py-4">
                  <div className="flex justify-between text-xs text-gray-700">
                    <span>
                      {invoiceData?.description || "Vendor Invoice Charge"}
                    </span>
                    <span className="font-semibold">
                      ${Number(total).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-900 font-bold">Subtotal</span>
                <span className="text-gray-500">
                  ${Number(subtotal).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs border-b border-gray-100 pb-3">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-500">
                  ${Number(totalTax).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-500">
                    -${Number(discount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs pt-1">
                <span className="text-gray-900 font-bold">Total Amount</span>
                <span className="text-gray-900 font-bold">
                  ${Number(total).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-16">
            <p className="text-xs text-gray-500 mb-8">
              Vendor Invoice Record - Accounts Payable
            </p>
          </div>
        </div>

        {/* Admin ↔ Account Comments Thread Section */}
        <div className="max-w-350 mx-auto">
          <InvoiceCommentsThread
            invoiceId={invoiceId}
            comments={payableWorkflow?.comments}
            onCommentAdded={() => refetchPayable()}
          />
        </div>
      </div>

      <RejectPayableDialog
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        invoiceNumber={invoiceNumber}
        onConfirm={handleConfirmReject}
        isLoading={rejectMutation.isPending}
      />

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Email Sent"
        okLabel="Done"
      />
    </>
  );
}
