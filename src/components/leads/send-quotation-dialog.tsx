import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useSendQuotationMutation,
  useMarkQuotationSentMutation,
} from "@/modules/quotations/quotations.hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import {
  Send,
  CheckCheck,
  AlertCircle,
  X,
  Plus,
  Mail,
  FileCheck,
  Info,
} from "lucide-react";

interface SendQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  quoteNumber?: string;
  versionNumber?: number;
  recipientEmail?: string;
  status?: string;
  sendMethod?: "platform" | "manual" | string | null;
  sentAt?: string | null;
  onSuccess?: () => void;
}

const AVAILABLE_SECTIONS = [
  { id: "quote", label: "Quote" },
  { id: "sow", label: "Scope of Work (SOW)" },
  { id: "contract", label: "Contract" },
  { id: "drawings", label: "Drawings" },
];

function SendQuotationModalBody({
  quotationId,
  quoteNumber,
  versionNumber,
  recipientEmail,
  status,
  sendMethod,
  sentAt,
  onClose,
  onSuccess,
}: {
  quotationId: string;
  quoteNumber?: string;
  versionNumber?: number;
  recipientEmail?: string;
  status?: string;
  sendMethod?: "platform" | "manual" | string | null;
  sentAt?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const isAlreadySent = status === "sent";
  const [activeTab, setActiveTab] = useState<"platform" | "manual">("platform");

  // Platform Send state
  const [toEmail, setToEmail] = useState(recipientEmail || "");
  const [ccList, setCcList] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState("");
  const [emailMessage, setEmailMessage] = useState(
    `Please review the attached quotation ${quoteNumber ? `(${quoteNumber})` : ""} and let us know your feedback.`,
  );
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "quote",
    "sow",
    "contract",
    "drawings",
  ]);

  // Manual Mark Sent state
  const [manualNote, setManualNote] = useState("");
  const [customSentAt, setCustomSentAt] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendMutation = useSendQuotationMutation();
  const markSentMutation = useMarkQuotationSentMutation();

  const handleAddCc = () => {
    const raw = ccInput.trim().replace(/[,;]/g, "");
    if (!raw) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(raw)) {
      setErrorMessage(`"${raw}" is not a valid email address.`);
      return;
    }

    if (toEmail.trim() && raw.toLowerCase() === toEmail.trim().toLowerCase()) {
      setErrorMessage("CC email cannot be identical to the To email address.");
      return;
    }

    if (ccList.map((c) => c.toLowerCase()).includes(raw.toLowerCase())) {
      setErrorMessage("This email is already in the CC list.");
      return;
    }

    if (ccList.length >= 10) {
      setErrorMessage("Maximum of 10 CC recipients allowed.");
      return;
    }

    setCcList([...ccList, raw]);
    setCcInput("");
    setErrorMessage(null);
  };

  const handleRemoveCc = (idx: number) => {
    setCcList(ccList.filter((_, i) => i !== idx));
  };

  const toggleSection = (id: string) => {
    if (selectedSections.includes(id)) {
      if (selectedSections.length === 1) {
        toast.info("At least one section must be included.");
        return;
      }
      setSelectedSections(selectedSections.filter((s) => s !== id));
    } else {
      setSelectedSections([...selectedSections, id]);
    }
  };

  const handlePlatformSend = async () => {
    if (!quotationId) return;
    setErrorMessage(null);

    const payload: {
      toEmail?: string;
      cc?: string[];
      message?: string;
      sections?: string[];
    } = {};

    if (toEmail.trim()) {
      payload.toEmail = toEmail.trim();
    }
    if (ccList.length > 0) {
      payload.cc = ccList;
    }
    if (emailMessage.trim()) {
      payload.message = emailMessage.trim();
    }
    if (selectedSections.length > 0) {
      payload.sections = selectedSections;
    }

    try {
      const res = await sendMutation.mutateAsync({
        quotationId,
        payload,
      });

      const provider = res.data?.emailProvider
        ? ` via ${res.data.emailProvider}`
        : "";
      toast.success(
        isAlreadySent
          ? `Quotation re-sent to customer successfully${provider}!`
          : `Quotation sent to customer successfully${provider}!`,
      );
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Failed to send quotation. Quotation must be approved first.",
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleMarkAsSent = async () => {
    if (!quotationId) return;
    setErrorMessage(null);

    try {
      await markSentMutation.mutateAsync({
        quotationId,
        payload: {
          note: manualNote.trim() || undefined,
          sentAt: customSentAt ? new Date(customSentAt).toISOString() : undefined,
        },
      });

      toast.success("Quotation marked as sent successfully!");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Failed to mark quotation as sent. Ensure quotation is approved.",
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <DialogHeader className="border-b px-6 py-4.5">
        <DialogTitle className="text-lg font-semibold text-gray-900">
          {isAlreadySent
            ? `Resend Quote ${quoteNumber ? `#${quoteNumber}` : ""} ${
                versionNumber !== undefined ? `(v${versionNumber})` : ""
              }`
            : `Send Quote ${quoteNumber ? `#${quoteNumber}` : ""} ${
                versionNumber !== undefined ? `(v${versionNumber})` : ""
              }`}
        </DialogTitle>
        <DialogDescription className="text-xs text-gray-500 mt-1">
          {isAlreadySent
            ? "This quotation was previously sent. You can dispatch another copy to the customer."
            : "Send quote to customer via email or record it as externally sent."}
        </DialogDescription>
      </DialogHeader>

      <div className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
        {/* Notice if already sent */}
        {isAlreadySent && (
          <div className="bg-blue-50 border border-blue-200/80 rounded-lg p-3 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#1D51A4] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-900">Quotation already sent</p>
              <p className="text-gray-600 text-xs">
                Sent via{" "}
                <span className="font-medium text-gray-800 capitalize">
                  {sendMethod === "manual" ? "external email" : "platform email"}
                </span>
                {sentAt ? ` on ${new Date(sentAt).toLocaleDateString()}` : ""}.
                You can re-send the quotation below via platform email.
              </p>
            </div>
          </div>
        )}

        {/* Segmented Tab Bar (only if not already sent) */}
        {!isAlreadySent && (
          <div className="bg-gray-100 p-1 rounded-lg grid grid-cols-2 gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("platform");
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "platform"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Mail
                className={`w-3.5 h-3.5 ${
                  activeTab === "platform" ? "text-[#1D51A4]" : "text-gray-500"
                }`}
              />
              Send via Email (SMTP)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("manual");
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "manual"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckCheck
                className={`w-3.5 h-3.5 ${
                  activeTab === "manual" ? "text-[#1D51A4]" : "text-gray-500"
                }`}
              />
              Mark as Sent (External)
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="wrap-break-word">{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: Platform Send */}
        {activeTab === "platform" && (
          <div className="space-y-4 text-xs">
            {/* To Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 flex justify-between">
                <span>To (Customer Email)</span>
                <span className="text-gray-400 font-normal">
                  Optional — defaults to customer email
                </span>
              </Label>
              <Input
                type="email"
                value={toEmail}
                onChange={(e) => {
                  setToEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={
                  recipientEmail
                    ? `${recipientEmail} (or enter another email)`
                    : "Defaults to customer email on file"
                }
                className="h-9 text-xs border-gray-200 bg-white placeholder:text-gray-400"
              />
            </div>

            {/* CC Emails */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 flex justify-between">
                <span>CC (Optional - max 10)</span>
                <span className="text-gray-400 font-normal">{ccList.length}/10</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={ccInput}
                  onChange={(e) => {
                    setCcInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddCc();
                    }
                  }}
                  placeholder="name@example.com (press Enter or comma)"
                  className="h-9 text-xs flex-1 border-gray-200 bg-white placeholder:text-gray-400"
                  disabled={ccList.length >= 10}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCc}
                  disabled={!ccInput.trim() || ccList.length >= 10}
                  className="h-9 px-3 text-xs border-gray-200 text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>

              {ccList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ccList.map((cc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1D51A4] border border-blue-200 rounded-md px-2.5 py-1 text-xs font-medium"
                    >
                      {cc}
                      <button
                        type="button"
                        onClick={() => handleRemoveCc(idx)}
                        className="text-blue-400 hover:text-[#1D51A4] p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Email Message Draft */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Email Cover Message
              </Label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Add a personalized note for the customer..."
                rows={3}
                className="text-xs border-gray-200 bg-white placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* PDF Included Sections */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700">
                Include in Generated PDF Attachment
              </Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SECTIONS.map((sec) => {
                  const isSelected = selectedSections.includes(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-300 text-[#1D51A4]"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xs font-bold">{isSelected ? "✓" : "+"}</span>
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] text-gray-600 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-gray-500 shrink-0" />
              <span>
                The quotation PDF with selected sections will be automatically attached by the platform.
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: Manual Mark as Sent (External Email) */}
        {activeTab === "manual" && !isAlreadySent && (
          <div className="space-y-4 text-xs">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3 text-xs text-gray-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#1D51A4] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">Emailed outside the platform?</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Use this if you already sent the quote to the customer via Gmail,
                  Outlook, or another external email. This marks the quote as
                  sent and unlocks subsequent workflows (such as creating invoices)
                  without requiring platform SMTP delivery.
                </p>
              </div>
            </div>

            {/* Note / Memo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Reference / Note (optional)
              </Label>
              <Textarea
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="e.g. Sent directly via company Gmail on 7 Sep"
                rows={2}
                className="text-xs border-gray-200 bg-white placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Optional Sent At */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Sent Date & Time (optional, defaults to now)
              </Label>
              <Input
                type="datetime-local"
                value={customSentAt}
                onChange={(e) => setCustomSentAt(e.target.value)}
                className="h-9 text-xs border-gray-200 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="border-t px-6 py-3.5 bg-gray-50/50 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-medium rounded-md border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
          onClick={onClose}
          disabled={sendMutation.isPending || markSentMutation.isPending}
        >
          Cancel
        </Button>

        {activeTab === "platform" ? (
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-medium rounded-md bg-[#1D51A4] hover:bg-[#174287] text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
            onClick={handlePlatformSend}
            disabled={sendMutation.isPending}
          >
            <Send className="w-3.5 h-3.5" />
            {sendMutation.isPending
              ? "Sending..."
              : isAlreadySent
                ? "Resend Quotation"
                : "Send Quotation"}
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-medium rounded-md bg-[#1D51A4] hover:bg-[#174287] text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
            onClick={handleMarkAsSent}
            disabled={markSentMutation.isPending}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {markSentMutation.isPending ? "Recording..." : "Mark as Sent"}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

export default function SendQuotationDialog({
  open,
  onOpenChange,
  quotationId,
  quoteNumber,
  versionNumber,
  recipientEmail,
  status,
  sendMethod,
  sentAt,
  onSuccess,
}: SendQuotationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {open && (
          <SendQuotationModalBody
            key={quotationId + "-" + (recipientEmail || "")}
            quotationId={quotationId}
            quoteNumber={quoteNumber}
            versionNumber={versionNumber}
            recipientEmail={recipientEmail}
            status={status}
            sendMethod={sendMethod}
            sentAt={sentAt}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
