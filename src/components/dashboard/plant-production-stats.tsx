import { TrendingDown, Package, RefreshCw, Bell } from "lucide-react";

export default function PlantProductionStats({
  period,
}: {
  period?: "Today" | "Week" | "Month";
}) {
  void period;
  const baseStats = [
    {
      title: "Material Value",
      value: "$0",
      change: "0%",
      trend: "up",
      icon: Package,
      iconBg: "bg-emerald-50",
      iconFg: "text-emerald-600",
      label: "vs Last Month",
    },
    {
      title: "Outflow this Month",
      value: "$0.00",
      change: "0%",
      trend: "down",
      icon: TrendingDown,
      iconBg: "bg-rose-50",
      iconFg: "text-rose-600",
      label: "vs Last Month",
    },
    {
      title: "Reorder Requests Pending",
      value: "0",
      change: "0%",
      trend: "up",
      icon: RefreshCw,
      iconBg: "bg-sky-50",
      iconFg: "text-sky-600",
      label: "vs Last Month",
    },
    {
      title: "Emergency Material Alerts",
      value: "0",
      change: "0%",
      trend: "down",
      icon: Bell,
      iconBg: "bg-purple-50",
      iconFg: "text-purple-600",
      label: "vs Last Month",
    },
  ];

  const stats = baseStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  stat.iconBg || "bg-gray-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${stat.iconFg || "text-gray-600"}`} />
              </div>
            </div>

            <hr className="border-t border-gray-100 my-3" />

            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}{" "}
                <span className="text-gray-500 font-normal">{stat.label}</span>
              </span>
              <button className="text-sm text-gray-500 hover:text-blue-600">
                View All
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
