import { Shield, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import StatCardV2 from "@/components/ui/stat-card-v2";

interface AdminStatsGridProps {
  stats: {
    totalAdmins: number;
    activeAdmins: number;
    inactiveAdmins: number;
    hasMainAdmin: boolean;
  };
  loading?: boolean;
}

export function AdminStatsGrid({ stats, loading = false }: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCardV2
        title="Total Admins"
        value={loading ? "..." : stats.totalAdmins}
        subtitle="All registered administrators"
        icon={<Users className="w-5 h-5" />}
        color="purple"
      />
      <StatCardV2
        title="Active Admins"
        value={loading ? "..." : stats.activeAdmins}
        subtitle="Currently active & verified"
        icon={<UserCheck className="w-5 h-5" />}
        color="green"
      />
      <StatCardV2
        title="Inactive Admins"
        value={loading ? "..." : stats.inactiveAdmins}
        subtitle="Deactivated or suspended"
        icon={<UserX className="w-5 h-5" />}
        color="red"
      />
      <StatCardV2
        title="Main Admin Status"
        value={
          loading ? (
            "..."
          ) : stats.hasMainAdmin ? (
            <span className="text-blue-600 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5" /> Configured
            </span>
          ) : (
            <span className="text-yellow-600 flex items-center gap-1.5">
              <Shield className="w-5 h-5" /> Not Set
            </span>
          )
        }
        subtitle="Primary administrator privilege"
        icon={<ShieldCheck className="w-5 h-5" />}
        color="yellow"
      />
    </div>
  );
}
