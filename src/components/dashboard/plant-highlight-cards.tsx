import { Trophy, Building2, TrendingUp } from "lucide-react";
import type { BusinessHighlights } from "@/modules/dashboard/dashboard.types";

function formatCurrency(amount?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export default function PlantHighlightCards({
  data,
}: {
  period?: "Today" | "Week" | "Month" | "All Time";
  data?: BusinessHighlights;
}) {
  const topSector = data?.topSector;
  const topCustomer = data?.topCustomerByProfit;

  const cards = [
    {
      id: "top-sector",
      title: "Top Sector",
      subtitle: topSector?.label || "No Sector",
      metricLabel: "Month over Month",
      metricValue: `${(topSector?.monthOverMonthPct ?? 0) >= 0 ? "+" : ""}${topSector?.monthOverMonthPct ?? 0}%`,
      extra: topSector?.value ? formatCurrency(topSector.value) : undefined,
      containerClass:
        "bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200",
      icon: Trophy,
      iconBgClass: "p-2 bg-yellow-100 rounded-full",
      iconClass: "size-5 text-yellow-600",
      metricClass: "text-sm font-semibold text-slate-700",
    },
    {
      id: "top-customer",
      title: "Top Customer by Profit",
      subtitle: topCustomer?.name || "No Customer",
      metricLabel: "Total Profit",
      metricValue: formatCurrency(topCustomer?.totalProfit),
      extra: topCustomer?.revenue ? `Rev: ${formatCurrency(topCustomer.revenue)}` : undefined,
      containerClass:
        "bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200",
      icon: Building2,
      iconBgClass: "p-2 bg-green-100 rounded-full",
      iconClass: "size-5 text-green-600",
      metricClass: "text-sm font-semibold text-gray-900",
    },
    {
      id: "current-oi",
      title: "Current Month OI",
      subtitle: formatCurrency(data?.currentMonthOI),
      metricLabel: "Growth Rate",
      metricValue: `${(data?.oiGrowthRatePct ?? 0) >= 0 ? "+" : ""}${data?.oiGrowthRatePct ?? 0}%`,
      extra: undefined,
      containerClass:
        "bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200",
      icon: TrendingUp,
      iconBgClass: "p-2 bg-blue-100 rounded-full",
      iconClass: "size-5 text-blue-600",
      metricClass: "text-sm font-semibold text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={card.containerClass}>
            <div className="flex items-start gap-3">
              <div className={card.iconBgClass}>
                <Icon className={card.iconClass} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-1">{card.title}</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {card.subtitle}
                </p>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600">
                      {card.metricLabel}:
                    </span>
                    <span className={card.metricClass}>{card.metricValue}</span>
                  </div>
                  {card.extra && (
                    <span className="text-xs text-gray-500 font-medium">
                      {card.extra}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
