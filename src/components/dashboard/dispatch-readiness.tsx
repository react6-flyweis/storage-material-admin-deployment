import { cn } from "@/lib/utils";
import {
  CircleDollarSignIcon,
  HandbagIcon,
  TrendingUp,
  Wallet,
  Wallet2,
  type LucideIcon,
} from "lucide-react";

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
  icon,
}: DispatchCard) {
  const Icon = icon; // Assign the icon component to a variable for rendering
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

      <div className="flex items-center gap-1 text-teal-600 text-sm">
        <TrendingUp className="w-4 h-4" />
        <span className="font-semibold">{trend.toFixed(2)}%</span>
        <span className="text-gray-600">from last month</span>
      </div>
    </div>
  );
}

export default function DispatchReadiness() {
  const dispatchCards: DispatchCard[] = [
    {
      title: "Loads Ready for Pickup",
      value: 3,
      trend: 5.62,
      color: "bg-blue-500",
      icon: CircleDollarSignIcon,
    },
    {
      title: "Pending Material",
      value: 39,
      trend: 11.4,
      color: "bg-green-500",
      icon: HandbagIcon,
    },
    {
      title: "Pickups Today",
      value: 45,
      trend: 8.12,
      color: "bg-yellow-500",
      icon: Wallet,
    },
    {
      title: "Missed Pickups",
      value: 3,
      trend: 7.45,
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
