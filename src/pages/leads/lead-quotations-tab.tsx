import { useState } from "react";
import { Link } from "react-router";
import { Eye, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import CreateQuotationDialog from "@/components/leads/create-quotation-dialog";
import QuotationDetailsDialog from "@/components/leads/quotation-details-dialog";
import {
  useLeadQuotationsQuery,
  useSubmitQuotationApprovalMutation,
  useApproveQuotationMutation,
  useRejectQuotationMutation,
  useSendQuotationMutation,
} from "@/modules/quotations/quotations.hooks";
import type { Quotation } from "@/modules/quotations/quotations.api";
import { toast } from "sonner";
import dayjs from "dayjs";

interface LeadQuotationsTabProps {
  leadId: string;
  customerName?: string;
}

function getWorkflowBadge(quotation: Quotation) {
  const status = quotation.workflowStatus || quotation.approval?.status || quotation.status || "draft";

  switch (status) {
    case "approved":
      return (
        <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-none px-2 py-0.5 rounded text-[11px] font-bold capitalize tracking-wider">
          Approved
        </Badge>
      );
    case "pending_approval":
      return (
        <Badge className="bg-[#fef3c7] text-[#d97706] hover:bg-[#fef3c7] border-none px-2 py-0.5 rounded text-[11px] font-bold capitalize tracking-wider">
          Pending Approval
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-[#fee2e2] text-[#dc2626] hover:bg-[#fee2e2] border-none px-2 py-0.5 rounded text-[11px] font-bold capitalize tracking-wider">
          Rejected
        </Badge>
      );
    case "sent":
      return (
        <Badge className="bg-[#dbeafe] text-[#2563eb] hover:bg-[#dbeafe] border-none px-2 py-0.5 rounded text-[11px] font-bold capitalize tracking-wider">
          Quote Sent
        </Badge>
      );
    case "draft":
    case "not_submitted":
    default:
      return (
        <Badge className="bg-[#f1f5f9] text-[#475569] hover:bg-[#f1f5f9] border-none px-2 py-0.5 rounded text-[11px] font-bold capitalize tracking-wider">
          Draft
        </Badge>
      );
  }
}

export default function LeadQuotationsTab({ leadId, customerName }: LeadQuotationsTabProps) {
  const { data: response, isLoading, isError } = useLeadQuotationsQuery(leadId);
  const quotations = response?.data?.quotations || [];

  const submitMutation = useSubmitQuotationApprovalMutation();
  const approveMutation = useApproveQuotationMutation();
  const rejectMutation = useRejectQuotationMutation();
  const sendMutation = useSendQuotationMutation();

  const [approveDialogQuote, setApproveDialogQuote] = useState<Quotation | null>(null);
  const [approveNote, setApproveNote] = useState("");

  const [rejectDialogQuote, setRejectDialogQuote] = useState<Quotation | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [submitDialogQuote, setSubmitDialogQuote] = useState<Quotation | null>(null);
  const [submitNote, setSubmitNote] = useState("");

  const [viewDialogQuote, setViewDialogQuote] = useState<Quotation | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleSubmitForApproval = async () => {
    if (!submitDialogQuote) return;
    try {
      await submitMutation.mutateAsync({
        quotationId: submitDialogQuote._id,
        note: submitNote,
      });
      toast.success("Quotation submitted for admin approval!");
      setSubmitDialogQuote(null);
      setSubmitNote("");
    } catch {
      toast.error("Failed to submit quotation for approval.");
    }
  };

  const handleApprove = async () => {
    if (!approveDialogQuote) return;
    try {
      await approveMutation.mutateAsync({
        quotationId: approveDialogQuote._id,
        note: approveNote,
      });
      toast.success("Quotation approved successfully!");
      setApproveDialogQuote(null);
      setApproveNote("");
    } catch {
      toast.error("Failed to approve quotation.");
    }
  };

  const handleReject = async () => {
    if (!rejectDialogQuote || !rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        quotationId: rejectDialogQuote._id,
        reason: rejectionReason,
      });
      toast.success("Quotation rejected.");
      setRejectDialogQuote(null);
      setRejectionReason("");
    } catch {
      toast.error("Failed to reject quotation.");
    }
  };

  const handleSend = async (q: Quotation) => {
    try {
      const res = await sendMutation.mutateAsync(q._id);
      const provider = res.data?.emailProvider ? ` via ${res.data.emailProvider}` : "";
      toast.success(`Quotation sent to customer successfully${provider}!`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || "Failed to send quotation. Ensure quote is approved.";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading quotations...</div>;
  }

  if (isError) {
    return <div className="p-6 text-center text-red-500">Failed to load quotations.</div>;
  }

  const approvedCount = quotations.filter((q) => (q.workflowStatus || q.approval?.status) === "approved").length;
  const pendingCount = quotations.filter((q) => (q.workflowStatus || q.approval?.status) === "pending_approval").length;
  const latestQuote = quotations[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Quotations Summary Box */}
      <div className="bg-[#f4f8fb] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-gray-900">Quotations Summary</h3>
          <CreateQuotationDialog
            leadData={{ id: leadId, name: customerName || "Lead" }}
            trigger={
              <Button className="bg-[#3b82f6] hover:bg-blue-600 text-white h-8 px-3 text-xs rounded font-medium flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Create Quotation
              </Button>
            }
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-6 pr-12">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Total Quotations</p>
            <p className="text-xl font-bold text-gray-900">{quotations.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Approved</p>
            <p className="text-xl font-bold text-[#16a34a]">{approvedCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Pending Approval</p>
            <p className="text-xl font-bold text-[#d97706]">{pendingCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Latest Quote Amount</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(latestQuote?.finalPrice || latestQuote?.basePrice || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Quotations List Table */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4 px-1">Quotations List</h3>
        <div className="bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc] text-gray-600 text-xs font-bold border-b border-t border-gray-100 uppercase">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">QUOTE #</th>
                  <th className="px-6 py-4 whitespace-nowrap">VERSION</th>
                  <th className="px-6 py-4 whitespace-nowrap">BUILDING</th>
                  <th className="px-6 py-4 whitespace-nowrap">AMOUNT</th>
                  <th className="px-6 py-4 whitespace-nowrap">STATUS</th>
                  <th className="px-6 py-4 whitespace-nowrap">DATE</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.length > 0 ? (
                  quotations.map((q) => {
                    const effectiveStatus = q.workflowStatus || q.approval?.status || q.status;
                    const isApproved = effectiveStatus === "approved";
                    const isPending = effectiveStatus === "pending_approval";
                    const canSubmit = effectiveStatus === "draft" || effectiveStatus === "not_submitted" || effectiveStatus === "rejected";
                    const price = q.finalPrice || q.basePrice || 0;

                    return (
                      <tr key={q._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          <Link
                            to={`/leads/quotation-details/${q._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {q.quoteNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-500">v{q.versionNumber}</td>
                        <td className="px-6 py-4 text-gray-900 capitalize">{q.buildingType || "—"}</td>
                        <td className="px-6 py-4 text-gray-900 font-bold">{formatCurrency(price)}</td>
                        <td className="px-6 py-4">
                          {getWorkflowBadge(q)}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {dayjs(q.createdAt).format("MMM DD, YYYY")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canSubmit && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 rounded"
                                onClick={() => setSubmitDialogQuote(q)}
                              >
                                Submit
                              </Button>
                            )}
                            {isPending && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-[#16a34a] hover:bg-green-700 text-white h-7 px-2.5 text-xs font-medium rounded"
                                  onClick={() => setApproveDialogQuote(q)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50 h-7 px-2.5 text-xs font-medium rounded"
                                  onClick={() => setRejectDialogQuote(q)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {isApproved && (
                              <Button
                                size="sm"
                                className="bg-[#3b82f6] hover:bg-blue-600 text-white h-7 px-2.5 text-xs font-medium rounded flex items-center gap-1"
                                disabled={sendMutation.isPending}
                                onClick={() => handleSend(q)}
                              >
                                <Send className="w-3 h-3" /> Send
                              </Button>
                            )}
                            <button
                              type="button"
                              onClick={() => setViewDialogQuote(q)}
                              className="text-purple-600 hover:text-purple-800 inline-block p-1 cursor-pointer"
                              title="View Quotation Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No quotations created yet for this lead.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <Dialog open={!!submitDialogQuote} onOpenChange={(o) => !o && setSubmitDialogQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Submit Quotation for Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Submit Quote <strong>{submitDialogQuote?.quoteNumber}</strong> (v{submitDialogQuote?.versionNumber}) for admin review?
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Optional Note for Admin</Label>
              <Input
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value)}
                placeholder="e.g. Special custom margin applied"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSubmitDialogQuote(null)}>
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
      <Dialog open={!!approveDialogQuote} onOpenChange={(o) => !o && setApproveDialogQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Approve Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Approve Quote <strong>{approveDialogQuote?.quoteNumber}</strong> (v{approveDialogQuote?.versionNumber}) for customer send?
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Optional Approval Note</Label>
              <Input
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="e.g. Approved for customer send"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setApproveDialogQuote(null)}>
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
      <Dialog open={!!rejectDialogQuote} onOpenChange={(o) => !o && setRejectDialogQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Reject Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Rejecting Quote <strong>{rejectDialogQuote?.quoteNumber}</strong> (v{rejectDialogQuote?.versionNumber}). Sales will need to update and resubmit.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Update dimensions and margin before resubmitting"
                className="text-sm min-h-24 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRejectDialogQuote(null)}>
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

      {/* Details Modal */}
      <QuotationDetailsDialog
        open={!!viewDialogQuote}
        onOpenChange={(o) => !o && setViewDialogQuote(null)}
        quotation={viewDialogQuote}
        onApprove={(q) => {
          setViewDialogQuote(null);
          setApproveDialogQuote(q);
        }}
        onReject={(q) => {
          setViewDialogQuote(null);
          setRejectDialogQuote(q);
        }}
        onSend={(q) => {
          handleSend(q);
        }}
      />
    </div>
  );
}
