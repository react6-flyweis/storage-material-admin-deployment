import { cn } from "@/lib/utils";
import {
  CircleDollarSignIcon,
  HandbagIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
  Wallet2,
  type LucideIcon,
} from "lucide-react";
import type { DispatchReadiness as DispatchReadinessData } from "@/modules/dashboard/dashboard.types";

interface DispatchCard {
  title: string;
  value: number;
  trend: number;
  color: string;
  icon: LucideIcon;
}

function DispatchReadinessCard({
  title,
  value,
  trend,
  color,
  icon: Icon,
}: DispatchCard) {
  const isPositive = trend >= 0;

  return (
    <div className="relative overflow-hidden border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
      {/* Boomerang corner accent uses the same color as the icon chip */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-16 w-16"
        aria-hidden="true"
      >
        <div
          className={cn(
            "absolute bottom-0 left-0 size-13 [clip-path:polygon(0_14%,0_100%,100%_100%,44%_64%,16%_22%)]",
            color,
          )}
        />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="text-white" />
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 text-sm font-semibold",
          isPositive ? "text-teal-600" : "text-rose-600",
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{Math.abs(trend).toFixed(1)}%</span>
        <span className="font-normal text-gray-600">from last month</span>
      </div>
    </div>
  );
}

export default function DispatchReadiness({
  data,
}: {
  data?: DispatchReadinessData;
}) {
  const dispatchCards: DispatchCard[] = [
    {
      title: "Loads Ready for Pickup",
      value: data?.loadsReadyForPickup ?? 0,
      trend: data?.loadsReadyForPickupChangePct ?? 0,
      color: "bg-blue-500",
      icon: CircleDollarSignIcon,
    },
    {
      title: "Pending Material",
      value: data?.pendingMaterial ?? 0,
      trend: data?.pendingMaterialChangePct ?? 0,
      color: "bg-green-500",
      icon: HandbagIcon,
    },
    {
      title: "Pickups Today",
      value: data?.pickupsToday ?? 0,
      trend: data?.pickupsTodayChangePct ?? 0,
      color: "bg-yellow-500",
      icon: Wallet,
    },
    {
      title: "Missed Pickups",
      value: data?.missedPickups ?? 0,
      trend: data?.missedPickupsChangePct ?? 0,
      color: "bg-red-500",
      icon: Wallet2,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Dispatch & Readiness
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dispatchCards.map((card, index) => (
          <DispatchReadinessCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}
