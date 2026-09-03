import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import {
  useGetInvoiceDetailQuery,
  useMarkInvoicePaidMutation,
  useSendInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import logo from "@/assets/steel-building-depot-logo.png";
import SuccessDialog from "@/components/success-dialog";
import {
  ApproveInvoiceDialog,
  RejectInvoiceDialog,
} from "@/components/invoices/approval-action-dialogs";
import ApprovalTimeline from "@/components/invoices/approval-timeline";
import InvoiceStatusBadge from "@/components/invoices/invoice-status-badge";
import { toast } from "sonner";

export default function InvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const defaultItems = [
    {
      id: "1",
      description: "Building 1",
      notes: "3500 sq ft building",
      total: 75000,
      displayTotal: "$75,00.000",
      photos: [
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2670&auto=format&fit=crop",
      ],
    },
    {
      id: "2",
      description: "Building 2",
      notes: "Notes",
      total: 75000,
      displayTotal: "$75,00.000",
    },
    {
      id: "3",
      description: "Building 2",
      notes: "Notes",
      total: 75000,
      displayTotal: "$75,00.000",
    },
  ];

  const { invoiceId, ...fallbackState } = location.state || {};

  const queryClient = useQueryClient();
  const markPaidMutation = useMarkInvoicePaidMutation();
  const sendInvoiceMutation = useSendInvoiceMutation();

  const { data: detailResponse, isLoading } =
    useGetInvoiceDetailQuery(invoiceId);

  const invoiceData = detailResponse?.data?.invoice;
  const paymentSchedule = detailResponse?.data?.paymentSchedule;

  const invoiceNumber =
    invoiceData?.invoiceNumber || fallbackState?.invoiceNumber || "2460";
  const date = invoiceData?.date
    ? new Date(invoiceData.date).toLocaleDateString("en-US")
    : fallbackState?.date || "10-25-2025";
  const daysToPay = invoiceData?.daysToPay || fallbackState?.daysToPay || "15";
  const subtotal = invoiceData?.subtotal ?? fallbackState?.subtotal ?? 0;

  const total = invoiceData?.totalAmount ?? fallbackState?.total ?? 0;
  const deposit = invoiceData?.depositAmount ?? 0;
  const markupTotal = invoiceData?.markupTotal ?? 0;
  const discount = invoiceData?.discount ?? 0;

  // Approval & Workflow calculation
  const approval = invoiceData?.approval;
  const approvalStatus =
    approval?.status ||
    (invoiceData?.status === "sent" ? "approved" : "not_submitted");
  const workflowStatus =
    invoiceData?.workflowStatus ||
    (invoiceData?.status === "sent" ? "sent" : approvalStatus);
  const revision = invoiceData?.revision || 1;
  const approvedRevision = approval?.approvedRevision;
  const isRevisionCurrent =
    approvedRevision === undefined || approvedRevision === revision;
  const isApproved = approvalStatus === "approved" && isRevisionCurrent;
  const isPendingApproval = approvalStatus === "pending_approval";
  const isRejected = approvalStatus === "rejected";
  const isSent = (invoiceData?.status || fallbackState?.status) === "sent";
  const isPaid = (invoiceData?.status || fallbackState?.status) === "paid";

  const handleMarkPaid = async () => {
    if (!invoiceId) {
      toast.error("Cannot mark as paid: Invoice is not saved yet.");
      return;
    }
    const currentStatus = invoiceData?.status || fallbackState?.status;
    if (currentStatus === "paid") {
      toast.info("This invoice is already paid.");
      return;
    }
    if (currentStatus !== "sent") {
      toast.error(
        "Invoice must be sent to the customer before marking it as paid.",
      );
      return;
    }

    try {
      await markPaidMutation.mutateAsync(invoiceId);
      toast.success("Invoice marked as paid successfully!");
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (error) {
      console.error("Failed to mark invoice as paid", error);
      toast.error("Failed to mark invoice as paid");
    }
  };

  const handleSendEmail = async () => {
    if (!invoiceId) {
      toast.error("Please save the invoice before sending.");
      return;
    }
    if (isSent) {
      toast.info("Invoice has already been sent.");
      return;
    }
    if (isPaid) {
      toast.info("Cannot send an invoice that is already paid.");
      return;
    }
    if (!isApproved) {
      toast.error(
        "Invoice must be approved by an admin before sending to the customer.",
      );
      return;
    }

    try {
      await sendInvoiceMutation.mutateAsync(invoiceId);
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (error: any) {
      console.error("Failed to send invoice email", error);
      const msg =
        error?.response?.data?.message || "Failed to send invoice email";
      toast.error(msg);
    }
  };

  const handleApprovalSuccess = () => {
    if (invoiceId) {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    }
  };

  const items = invoiceData?.lineItems?.length
    ? invoiceData.lineItems.map((item: any, idx: number) => ({
        id: item._id || String(idx),
        description: item.items?.[0] || "Item Description",
        notes: item.items?.slice(1).join(", ") || "",
        total: item.total || 0,
        photos: item.images || [],
        rate: item.effectiveRate || item.rate || 0,
        quantity: item.quantity || 1,
        taxAmount: item.taxAmount || 0,
      }))
    : fallbackState?.items?.length > 0
      ? fallbackState.items
      : defaultItems;

  const totalTax =
    invoiceData?.tax ??
    items.reduce((acc: number, item: any) => acc + (item.taxAmount || 0), 0);

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading invoice details...
      </div>
    );
  }

  const isEmailDisabled =
    !isApproved || isSent || isPaid || sendInvoiceMutation.isPending;

  return (
    <>
      <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6">
        {/* Top Actions */}
        <div className="flex justify-between items-center mb-3 mt-1  gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-[100px] gap-1.5"
              onClick={() => navigate("/invoice/list")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {/* <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-[100px]"
              onClick={() => navigate("/invoice/list")}
            >
              Cancel
            </Button> */}
          </div>
          <div className="flex items-center gap-3">
            {/* Admin Approval Actions */}
            {isPendingApproval && (
              <>
                <Button
                  variant="outline"
                  className="border-rose-300 text-rose-600 hover:bg-rose-50 min-w-[100px] gap-1.5"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px] gap-1.5"
                  onClick={() => setShowApproveDialog(true)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>
              </>
            )}

            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-[100px]"
              onClick={() =>
                navigate(
                  invoiceId
                    ? `/invoice/${invoiceId}/edit`
                    : `/invoice/${invoiceNumber}/edit`,
                )
              }
            >
              Edit
            </Button>

            <Button
              className={
                isEmailDisabled
                  ? "bg-gray-400 cursor-not-allowed text-white min-w-[100px] gap-2"
                  : "bg-[#2563EB] hover:bg-blue-700 text-white min-w-[100px] gap-2"
              }
              onClick={handleSendEmail}
              disabled={isEmailDisabled}
              title={
                !isApproved
                  ? "Requires admin approval before sending"
                  : isSent
                    ? "Invoice already sent"
                    : isPaid
                      ? "Invoice already paid"
                      : "Send invoice to customer"
              }
            >
              <Mail className="w-4 h-4" />
              {sendInvoiceMutation.isPending ? "Sending..." : "Email"}
            </Button>

            {/* <Button
              variant="outline"
              onClick={() => navigate("/invoice/list")}
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-[100px] gap-2"
            >
              <Wallet className="w-4 h-4" />
              Payments
            </Button> */}

            <Button
              className={
                (invoiceData?.status || fallbackState?.status) !== "sent"
                  ? "bg-gray-400 cursor-not-allowed text-white min-w-[100px]"
                  : "bg-[#2563EB] hover:bg-blue-700 text-white min-w-[100px]"
              }
              onClick={handleMarkPaid}
              disabled={
                markPaidMutation.isPending ||
                (invoiceData?.status || fallbackState?.status) !== "sent"
              }
            >
              {markPaidMutation.isPending ? "Marking..." : "Mark Paid"}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-[4px] p-6 sm:p-14 sm:pt-6 shadow-sm">
          <div className="relative mb-12 flex justify-center items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-gray-400 font-bold text-md md:text-xl tracking-widest uppercase">
                INVOICE
              </h1>
              <InvoiceStatusBadge
                workflowStatus={workflowStatus}
                approvalStatus={approvalStatus}
                financialStatus={invoiceData?.status}
              />
            </div>
          </div>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16 ">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center shrink-0">
                  <img src={logo} alt="Logo" className="h-12  object-contain" />
                </div>
              </div>

              <div className="text-xs text-gray-500 leading-relaxed">
                1851 Madison Ave Suite 300
                <br />
                Council Bluffs, IA
                <br />
                51503
                <br />
                United States
                <br />
                travis@storagematerials.com
                <br />
                www.storagematerials.com
              </div>
            </div>

            <div className="min-w-[200px] space-y-2">
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
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  Business/Tax #
                </span>
                <span className="text-gray-900">99- 4515145</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-12">
            <div className="flex justify-between border-b border-gray-800 pb-2 mb-6">
              <span className="text-xs font-bold text-gray-700 w-1/3">
                Description
              </span>
              <span className="text-xs font-bold text-gray-700 w-1/6 text-right">
                Rate
              </span>
              <span className="text-xs font-bold text-gray-700 w-1/6 text-right">
                Qty
              </span>
              <span className="text-xs font-bold text-gray-700 w-1/6 text-right">
                Tax
              </span>
              <span className="text-xs font-bold text-gray-700 w-1/6 text-right">
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
                    <span className="text-xs text-gray-600 font-medium w-1/3 break-words pr-2">
                      {item.description || "Item Description"}
                    </span>
                    <span className="text-xs text-gray-600 w-1/6 text-right">
                      $
                      {item.rate?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs text-gray-600 w-1/6 text-right">
                      {item.quantity}
                    </span>
                    <span className="text-xs text-gray-600 w-1/6 text-right">
                      $
                      {item.taxAmount?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    {/* Calculate item total */}
                    <span className="text-xs text-gray-600 w-1/6 text-right">
                      {item.displayTotal ||
                        `$${(item.total || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}`}
                    </span>
                  </div>

                  {item.notes && (
                    <div className="text-[10px] text-gray-400 mb-2">
                      {item.notes}
                    </div>
                  )}

                  {/* Display Photos if any */}
                  {item.photos && item.photos.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-3 mb-4">
                      {item.photos.map((photo: string, i: number) => (
                        <div
                          key={i}
                          className="w-64 h-40 overflow-hidden rounded-sm bg-gray-100"
                        >
                          {/* Use the photo URL if it looks like a blob/url, otherwise placeholder */}
                          <img
                            src={
                              photo.startsWith("blob:") ||
                              photo.startsWith("http")
                                ? photo
                                : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2670&auto=format&fit=crop"
                            }
                            alt={`Item photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Fallback to show something if no items */}
              {items.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-4">
                  No items added
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
                  $
                  {Number(subtotal).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs border-b border-gray-100 pb-3">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-500">
                  $
                  {Number(totalTax).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-gray-500 text-red-500">
                    -$
                    {Number(discount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs pt-1">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-gray-900 font-bold">
                  $
                  {Number(total).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
                <span className="text-gray-900 font-medium">Deposit Due</span>
                <span className="text-gray-900 font-bold">
                  $
                  {deposit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="mb-16 max-w-lg ml-auto">
            <h3 className="text-xs font-bold text-gray-900 mb-4">
              Payment Schedule
            </h3>
            <div className="space-y-3">
              {paymentSchedule?.stages?.length ? (
                paymentSchedule.stages.map((stage: any, i: number) => (
                  <div
                    key={stage._id || i}
                    className="flex justify-between text-xs border-b border-gray-50 pb-2"
                  >
                    <span className="text-gray-500">
                      {stage.stageName}{" "}
                      {stage.amountType === "percentage"
                        ? `(${stage.amount}%)`
                        : ""}
                    </span>
                    <span className="text-gray-900 font-medium">
                      $
                      {stage.amountType === "percentage"
                        ? (
                            (stage.amount / 100) *
                            (paymentSchedule.totalAmount || total)
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })
                        : stage.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Total Due</span>
                  <span className="text-gray-900 font-medium">
                    $
                    {Number(total).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-16">
            <p className="text-xs text-gray-500 mb-8">
              Thank you for your business? Reach out with any questions
            </p>
          </div>
        </div>

        {/* Approval Audit Timeline */}

        <ApprovalTimeline
          approval={approval}
          workflowStatus={workflowStatus}
          revision={revision}
        />
      </div>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Email Sent"
        okLabel="Done"
      />

      <ApproveInvoiceDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        onSuccess={handleApprovalSuccess}
      />

      <RejectInvoiceDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        onSuccess={handleApprovalSuccess}
      />
    </>
  );
}
