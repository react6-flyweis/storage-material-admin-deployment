import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/assets/the-steel-logo-dark.svg";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Send,
  Layers,
  CheckSquare,
  Info,
  Truck,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  ShieldCheck,
} from "lucide-react";
import {
  useQuotationQuery,
  useSubmitQuotationApprovalMutation,
  useApproveQuotationMutation,
  useRejectQuotationMutation,
  useSendQuotationMutation,
} from "@/modules/quotations/quotations.hooks";
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
import dayjs from "dayjs";

function getWorkflowStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-none px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          Approved
        </Badge>
      );
    case "pending_approval":
      return (
        <Badge className="bg-[#fef3c7] text-[#d97706] hover:bg-[#fef3c7] border-none px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          Pending Approval
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-[#fee2e2] text-[#dc2626] hover:bg-[#fee2e2] border-none px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          Rejected
        </Badge>
      );
    case "sent":
      return (
        <Badge className="bg-[#dbeafe] text-[#2563eb] hover:bg-[#dbeafe] border-none px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          Quote Sent
        </Badge>
      );
    case "draft":
    case "not_submitted":
    default:
      return (
        <Badge className="bg-[#f1f5f9] text-[#475569] hover:bg-[#f1f5f9] border-none px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          Draft
        </Badge>
      );
  }
}

export default function QuotationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuotationQuery(id);
  const sendMutation = useSendQuotationMutation();
  const submitMutation = useSubmitQuotationApprovalMutation();
  const approveMutation = useApproveQuotationMutation();
  const rejectMutation = useRejectQuotationMutation();

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitNote, setSubmitNote] = useState("");

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

  const handleSubmitForApproval = async () => {
    if (!id) return;
    try {
      await submitMutation.mutateAsync({ quotationId: id, note: submitNote });
      toast.success("Submitted for admin approval!");
      setIsSubmitOpen(false);
      setSubmitNote("");
    } catch {
      toast.error("Failed to submit for approval.");
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
  const isPending = effectiveStatus === "pending_approval";
  const canSubmit =
    effectiveStatus === "draft" ||
    effectiveStatus === "not_submitted" ||
    effectiveStatus === "rejected";
  const isRejected = effectiveStatus === "rejected";

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          className="bg-white hover:bg-gray-50 border-gray-200 text-gray-600 h-9 px-4 text-sm font-normal rounded-md flex items-center gap-2"
          onClick={() => navigate("/leads")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {getWorkflowStatusBadge(effectiveStatus)}

          {/* Submit CTA */}
          {canSubmit && (
            <Button
              className="bg-[#3b82f6] hover:bg-blue-600 text-white h-9 px-4 text-xs font-medium rounded-md flex items-center gap-1.5"
              onClick={() => setIsSubmitOpen(true)}
            >
              <ShieldCheck className="h-4 w-4" />
              Submit for Approval
            </Button>
          )}

          {/* Admin Approve & Reject */}
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

          {/* Send Button */}
          <Button
            className="bg-[#7c3aed] hover:bg-purple-700 text-white h-9 px-4 text-xs font-medium rounded-md flex items-center gap-1.5 disabled:opacity-50"
            onClick={handleSend}
            disabled={!isApproved || sendMutation.isPending}
            title={
              !isApproved
                ? "Admin approval required before sending"
                : "Send to customer"
            }
          >
            <Send className="h-4 w-4" />
            {sendMutation.isPending ? "Sending..." : "Send to Customer"}
          </Button>
        </div>
      </div>

      {/* Rejection Alert Banner */}
      {isRejected && q.approval?.rejectionReason && (
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-red-900 text-sm">
              Quotation Rejected by Admin
            </h4>
            <p className="text-sm text-red-700">
              <strong>Reason:</strong> {q.approval.rejectionReason}
            </p>
            <p className="text-xs text-red-600 mt-2">
              To proceed, please update the quotation details. Editing the
              quotation will reset the approval status so you can resubmit.
            </p>
          </div>
        </div>
      )}

      {/* Main Quotation Card */}
      <div className="bg-white rounded-2xl shadow-sm w-full p-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <img src={Logo} alt="The Steel Logo" className="w-36" />
            <div className="text-sm text-gray-500 leading-relaxed">
              <p>1851 Madison Ave Suite 300</p>
              <p>Council Bluffs, IA 51503</p>
              <p>United States</p>
              <p>travis@storagematerials.com</p>
              <p>www.storagematerials.com</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 text-right space-y-2">
            <h1 className="text-2xl font-bold tracking-widest text-gray-300 mb-6">
              QUOTATION
            </h1>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
              <span className="font-medium text-gray-500">Quote #</span>
              <span className="font-bold text-gray-900">{q.quoteNumber}</span>
              <span className="font-medium text-gray-500">Version</span>
              <span className="font-bold text-gray-900">
                v{q.versionNumber}
              </span>
              <span className="font-medium text-gray-500">Proposal Date</span>
              <span className="text-gray-800">
                {q.proposalDate
                  ? dayjs(q.proposalDate).format("MMM DD, YYYY")
                  : "—"}
              </span>
              <span className="font-medium text-gray-500">Valid Until</span>
              <span className="text-gray-800">
                {q.validTill ? dayjs(q.validTill).format("MMM DD, YYYY") : "—"}
              </span>
              <span className="font-medium text-gray-500">Status</span>
              <span>{getWorkflowStatusBadge(effectiveStatus)}</span>
            </div>
          </div>
        </div>

        {/* Project Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-6 bg-[#f4f8fb] rounded-xl">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Building Type</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">
                {q.buildingType || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Location</p>
              <p className="text-sm font-semibold text-gray-800">
                {q.location || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Layers className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Dimensions (W×L×H)</p>
              <p className="text-sm font-semibold text-gray-800">
                {q.width || "—"} × {q.length || "—"} × {q.height || "—"} ft
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Roof Style</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">
                {q.roofStyle || "—"}
              </p>
            </div>
          </div>
          {q.windLoad && (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Wind Load</p>
                <p className="text-sm font-semibold text-gray-800">
                  {q.windLoad}
                </p>
              </div>
            </div>
          )}
          {q.snowLoad && (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Snow Load</p>
                <p className="text-sm font-semibold text-gray-800">
                  {q.snowLoad}
                </p>
              </div>
            </div>
          )}
          {q.estimatedDelivery && (
            <div className="flex items-start gap-2">
              <Truck className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Est. Delivery</p>
                <p className="text-sm font-semibold text-gray-800">
                  {q.estimatedDelivery}
                </p>
              </div>
            </div>
          )}
          {q.paymentTerms && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Payment Terms</p>
                <p className="text-sm font-semibold text-gray-800">
                  {q.paymentTerms}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="border-t pt-6 mb-10">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Pricing Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#f4f8fb] rounded-xl p-4">
              <p className="text-xs text-blue-500 mb-1">Base Price</p>
              <p className="text-xl font-bold text-gray-900">
                ${(q.basePrice || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#f4f8fb] rounded-xl p-4">
              <p className="text-xs text-green-600 mb-1">Max Price</p>
              <p className="text-xl font-bold text-gray-900">
                ${(q.maxPrice || 0).toLocaleString()}
              </p>
            </div>
            {(q.finalPrice ?? 0) > 0 && (
              <div className="bg-[#f4f8fb] rounded-xl p-4">
                <p className="text-xs text-purple-600 mb-1">Final Price</p>
                <p className="text-xl font-bold text-[#7c3aed]">
                  ${(q.finalPrice || 0).toLocaleString()}
                </p>
              </div>
            )}
            {(q.totalArea ?? 0) > 0 && (
              <div className="bg-[#f4f8fb] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total Area</p>
                <p className="text-xl font-bold text-gray-900">
                  {q.totalArea} sqft
                </p>
              </div>
            )}
          </div>

          {/* COGS breakdown if available */}
          {(q.materialCost ?? 0) > 0 && (
            <div className="mt-4 border rounded-xl p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Cost Breakdown
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Material Cost</p>
                  <p className="font-semibold">
                    ${(q.materialCost || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Freight Cost</p>
                  <p className="font-semibold">
                    ${(q.freightCost || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total COGS</p>
                  <p className="font-semibold">
                    ${(q.totalCOGS || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">
                    Markup ({q.markupPercent || 0}%)
                  </p>
                  <p className="font-semibold">
                    ${(q.markupValue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Structure & Engineering */}
        {(q.frameType ||
          q.girtType ||
          q.purlinType ||
          q.bracingType ||
          q.roofSlope) && (
          <div className="border-t pt-6 mb-10">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Structure & Engineering
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {q.frameType && (
                <div>
                  <p className="text-xs text-gray-400">Frame Type</p>
                  <p className="font-semibold">{q.frameType}</p>
                </div>
              )}
              {q.endwallType && (
                <div>
                  <p className="text-xs text-gray-400">Endwall Type</p>
                  <p className="font-semibold">{q.endwallType}</p>
                </div>
              )}
              {q.girtType && (
                <div>
                  <p className="text-xs text-gray-400">Girt Type</p>
                  <p className="font-semibold">{q.girtType}</p>
                </div>
              )}
              {q.purlinType && (
                <div>
                  <p className="text-xs text-gray-400">Purlin Type</p>
                  <p className="font-semibold">{q.purlinType}</p>
                </div>
              )}
              {q.bracingType && (
                <div>
                  <p className="text-xs text-gray-400">Bracing Type</p>
                  <p className="font-semibold">{q.bracingType}</p>
                </div>
              )}
              {q.roofSlope && (
                <div>
                  <p className="text-xs text-gray-400">Roof Slope</p>
                  <p className="font-semibold">{q.roofSlope}</p>
                </div>
              )}
              {q.roofPanel && (
                <div>
                  <p className="text-xs text-gray-400">Roof Panel</p>
                  <p className="font-semibold">{q.roofPanel}</p>
                </div>
              )}
              {q.wallPanelType && (
                <div>
                  <p className="text-xs text-gray-400">Wall Panel</p>
                  <p className="font-semibold">{q.wallPanelType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Included Components */}
        {q.includedComponents && q.includedComponents.length > 0 && (
          <div className="border-t pt-6 mb-10">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" /> Included Components
            </h2>
            <div className="flex flex-wrap gap-2">
              {q.includedComponents.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-100"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Approval History & Audit Trail */}
        {q.approval?.history && q.approval.history.length > 0 && (
          <div className="border-t pt-6 mb-10">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="h-4 w-4" /> Approval History & Audit Trail
            </h2>
            <div className="space-y-3">
              {q.approval.history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-[#f8fafc] rounded-xl border border-gray-100"
                >
                  <div className="shrink-0 mt-0.5">
                    {getWorkflowStatusBadge(item.status)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="font-medium text-gray-800">
                        {item.by
                          ? typeof item.by === "object"
                            ? (item.by as { name?: string }).name || "User"
                            : String(item.by)
                          : "System"}
                      </span>
                      <span>
                        {item.at
                          ? dayjs(item.at).format("MMM DD, YYYY, h:mm A")
                          : "—"}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-sm text-gray-700 bg-white p-2.5 rounded border border-gray-100 mt-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {(q.specialNote || q.clientNotes || q.internalNotes) && (
          <div className="border-t pt-6 mb-10 space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              Notes
            </h2>
            {q.specialNote && (
              <div className="bg-yellow-50/80 border border-yellow-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-600 mb-1">
                  Special Note (Customer-visible)
                </p>
                <p className="text-sm text-gray-700">{q.specialNote}</p>
              </div>
            )}
            {q.clientNotes && (
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 mb-1">
                  Client Notes
                </p>
                <p className="text-sm text-gray-700">{q.clientNotes}</p>
              </div>
            )}
            {q.internalNotes && (
              <div className="bg-gray-100/80 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Internal Notes (Not sent to customer)
                </p>
                <p className="text-sm text-gray-700">{q.internalNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-6 text-sm text-gray-500">
          <p className="mb-4">
            Thank you for your business. Reach out with any questions.
          </p>
          <p className="mb-12 text-xs">
            By accepting this quotation, the customer agrees to the services and
            conditions outlined in this document.
          </p>
          <div className="flex justify-end pr-12">
            <div className="w-64">
              <hr className="border-gray-400 mb-3" />
              <p className="text-xs text-gray-500 font-medium">
                Client Signature
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Submit Quotation for Approval
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Submitting Quote <strong>{q.quoteNumber}</strong> (v
              {q.versionNumber}) for admin approval.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Optional Note for Admin
              </Label>
              <Input
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value)}
                placeholder="e.g. Please review dimensions and price"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#3b82f6] hover:bg-blue-600 text-white"
              onClick={handleSubmitForApproval}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Confirm Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
