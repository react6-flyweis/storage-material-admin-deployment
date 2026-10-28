import { Trophy, Building2, TrendingUp } from "lucide-react";

type Period = "Today" | "Week" | "Month";

export default function PlantHighlightCards({ period }: { period?: Period }) {
  void period;

  const cards = [
    {
      id: "top-sector",
      title: "Top Sector",
      subtitle: "None",
      metricLabel: "Month over Month",
      metricValue: "0.0%",
      containerClass:
        "bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200",
      icon: Trophy,
      iconBgClass: "p-2 bg-yellow-100 rounded-full",
      iconClass: "size-5 text-yellow-600",
      metricClass: "text-sm font-semibold text-slate-500",
    },
    {
      id: "top-customer",
      title: "Top Customer by Profit",
      subtitle: "None",
      metricLabel: "Total Profit",
      metricValue: "$0",
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
      subtitle: "$0",
      metricLabel: "Growth Rate",
      metricValue: "0.0%",
      containerClass:
        "bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200",
      icon: TrendingUp,
      iconBgClass: "p-2 bg-blue-100 rounded-full",
      iconClass: "size-5 text-blue-600",
      metricClass: "text-sm font-semibold text-slate-500",
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
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">{card.title}</p>
                <p className="text-lg font-bold text-gray-900">
                  {card.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-600">
                    {card.metricLabel}
                  </span>
                  <span className={card.metricClass}>{card.metricValue}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
