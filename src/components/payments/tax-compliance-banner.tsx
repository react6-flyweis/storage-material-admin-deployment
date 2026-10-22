import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import type { TaxComplianceStatusData } from "@/modules/payments/payments.api";

interface TaxComplianceBannerProps {
  compliance?: TaxComplianceStatusData | null;
  isLoading?: boolean;
  onSync?: () => void;
  isSyncing?: boolean;
}

export default function TaxComplianceBanner({
  compliance,
  isLoading,
  onSync,
  isSyncing,
}: TaxComplianceBannerProps) {
  if (isLoading || !compliance) {
    return null;
  }

  const { syncState, message, provider, canSync } = compliance;

  // Don't show banner if already synced with no special message
  const isHealthy = syncState === "synced" && !message;
  if (isHealthy) {
    return null;
  }

  const isWarning =
    syncState === "not_configured" ||
    syncState === "empty" ||
    syncState === "error";

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isWarning
          ? "bg-amber-50/70 border-amber-200 text-amber-900"
          : "bg-blue-50/70 border-blue-200 text-blue-900"
      }`}
    >
      <div className="flex items-start gap-3">
        {isWarning ? (
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {isWarning ? "Tax Compliance Notice" : "Tax Engine Status"}
            </span>
            {provider && (
              <Badge
                variant="outline"
                className="text-[11px] uppercase tracking-wider py-0 px-2 font-mono"
              >
                Provider: {provider}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-[11px] uppercase tracking-wider py-0 px-2 font-mono ${
                syncState === "synced"
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                  : "border-amber-400 text-amber-700 bg-amber-50"
              }`}
            >
              State: {syncState?.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-xs text-slate-700">
            {message ||
              "Configure Avalara Returns or use local tax engine for development."}
          </p>
        </div>
      </div>

      {canSync && onSync && (
        <Button
          size="sm"
          onClick={onSync}
          disabled={isSyncing}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-4 shrink-0 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      )}
    </div>
  );
}
