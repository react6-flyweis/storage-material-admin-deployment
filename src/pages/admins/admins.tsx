import { useState } from "react";
import { AdminStatsGrid } from "@/components/admins/admin-stats-grid";
import { AdminTable } from "@/components/admins/admin-table";
import { AddAdminDialog } from "@/components/admins/add-admin-dialog";
import { BootstrapMainAdminBanner } from "@/components/admins/bootstrap-main-admin-banner";
import { useAdminsQuery } from "@/modules/admins/admins.hooks";
import { useAuthStore } from "@/modules/auth/auth.store";
import { AlertCircle, RefreshCw, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const currentUser = useAuthStore((state) => state.user);

  const {
    data: adminsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAdminsQuery();

  const admins = adminsResponse?.data?.admins ?? [];
  const summary = adminsResponse?.data?.summary;

  const totalAdmins = summary?.total ?? admins.length;
  const activeAdmins =
    summary?.active ?? admins.filter((a) => a.isActive).length;
  const inactiveAdmins = totalAdmins - activeAdmins;
  const mainAdminId = summary?.mainAdminId;
  const hasMainAdmin = Boolean(summary?.mainAdminId);

  const isMainAdmin = mainAdminId === currentUser?._id;

  const stats = {
    totalAdmins,
    activeAdmins,
    inactiveAdmins,
    hasMainAdmin,
  };

  return (
    <div className="space-y-6 p-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin User Management
            </h1>
            {isMainAdmin ? (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Main
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                <Shield className="w-3.5 h-3.5 text-gray-500" /> Admin
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Manage administrators, role privileges, access states, and main
            administrator ownership.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="text-gray-600 border-gray-200"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${
                isRefetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>

          <AddAdminDialog disabled={!isMainAdmin} />
        </div>
      </div>

      {/* Bootstrap Banner (Shown if current user is not main admin) */}
      <BootstrapMainAdminBanner isMainAdmin={isMainAdmin} />

      {/* Error state alert if query fails */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Unable to load admin users</p>
            <p className="text-xs text-red-600 mt-0.5">
              {(
                error as {
                  response?: { data?: { message?: string } };
                  message?: string;
                }
              )?.response?.data?.message ||
                (error as Error)?.message ||
                "Admin users can only be listed by a Main Admin. Claim main admin access above if needed."}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <AdminStatsGrid stats={stats} loading={isLoading} />

      {/* Admin Table */}
      <AdminTable
        admins={admins}
        loading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onRefresh={() => refetch()}
        isMainAdmin={isMainAdmin}
      />
    </div>
  );
}
