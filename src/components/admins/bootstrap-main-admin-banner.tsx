import { ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetMainSelfMutation } from "@/modules/admins/admins.hooks";
import { toast } from "sonner";
import { useState } from "react";

interface BootstrapMainAdminBannerProps {
  isMainAdmin?: boolean;
}

export function BootstrapMainAdminBanner({
  isMainAdmin,
}: BootstrapMainAdminBannerProps) {
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const setMainSelfMutation = useSetMainSelfMutation();

  if (isMainAdmin) {
    return null;
  }

  const handleClaimMainAdmin = async () => {
    setIsBootstrapping(true);
    try {
      const res = await setMainSelfMutation.mutateAsync();
      toast.success(res.message || "Main admin access enabled successfully!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to claim main admin privileges. A main admin may already exist.";
      toast.error(errMsg);
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 via-orange-50 to-amber-50 p-4 md:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600 ring-1 ring-amber-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                Main Admin Setup & Privileges
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                <Sparkles className="h-3 w-3" /> Bootstrap Available
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">
              Only a verified <strong>Main Admin</strong> can create, edit, deactivate, or delete other admin users. If no main admin has been assigned yet, claim main admin access for your account below.
            </p>
          </div>
        </div>

        <Button
          onClick={handleClaimMainAdmin}
          disabled={isBootstrapping || setMainSelfMutation.isPending}
          className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-medium"
        >
          <ShieldCheck className="h-4 w-4 mr-1.5" />
          {isBootstrapping ? "Claiming Access..." : "Claim Main Admin Access"}
        </Button>
      </div>
    </div>
  );
}
