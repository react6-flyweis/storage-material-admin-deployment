import { useState } from "react";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCallTime } from "@/lib/call-format";
import type { TranscriptSummary } from "@/modules/leads/leads.api";

interface AiSummaryCardProps {
  summary?: TranscriptSummary;
  projectName?: string;
  leadId?: string;
  isLoading?: boolean;
}

export default function AiSummaryCard({
  summary,
  projectName,
  isLoading = false,
}: AiSummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary?.text) return;

    try {
      await navigator.clipboard.writeText(summary.text);
      setCopied(true);
      toast.success("AI summary copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy summary to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-12 text-slate-500 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-purple-600 mb-2" />
        <span className="text-sm">Synthesizing AI summary...</span>
      </div>
    );
  }

  if (!summary?.text) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">
          No AI summary generated
        </h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          An automated executive summary of customer requirements, building
          dimensions, and preferences will be generated once customer chat or
          voice calls occur.
        </p>
      </div>
    );
  }

  // Split into paragraphs for clean typography
  const paragraphs = summary.text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex-shrink-0">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                AI Requirements Summary
              </h3>
              {projectName && (
                <span className="rounded-full bg-purple-50 border border-purple-200/60 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                  {projectName}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Generated from customer calls & chats
              {summary.updatedAt
                ? ` • Last updated ${formatCallTime(summary.updatedAt)}`
                : ""}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-1.5 text-xs text-gray-700 hover:text-purple-700 hover:border-purple-300"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-gray-500" />
              <span>Copy Summary</span>
            </>
          )}
        </Button>
      </div>

      {/* Summary Body */}
      <div className="p-6 space-y-4 text-sm leading-relaxed text-gray-700 font-normal bg-white">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="whitespace-pre-wrap">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
