import { TrendingDown, Package, RefreshCw, Bell } from "lucide-react";
import type { PlantProduction } from "@/modules/dashboard/dashboard.types";
import { Link } from "react-router";

function formatCurrency(amount?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export default function PlantProductionStats({
  data,
}: {
  period?: "Today" | "Week" | "Month";
  data?: PlantProduction;
}) {
  const stats = [
    {
      title: "Material Value",
      value: formatCurrency(data?.materialValue),
      change: `${(data?.materialValueChangePct ?? 0) >= 0 ? "+" : ""}${data?.materialValueChangePct ?? 0}%`,
      trend: (data?.materialValueChangePct ?? 0) >= 0 ? "up" : "down",
      icon: Package,
      iconBg: "bg-emerald-50",
      iconFg: "text-emerald-600",
      label: "vs Last Month",
      link: "/plant/materials",
    },
    {
      title: "Outflow this Month",
      value: formatCurrency(data?.outflowThisMonth),
      change: `${(data?.outflowChangePct ?? 0) >= 0 ? "+" : ""}${data?.outflowChangePct ?? 0}%`,
      trend: (data?.outflowChangePct ?? 0) <= 0 ? "up" : "down",
      icon: TrendingDown,
      iconBg: "bg-rose-50",
      iconFg: "text-rose-600",
      label: "vs Last Month",
      link: "/plant/materials",
    },
    {
      title: "Reorder Requests Pending",
      value: String(data?.reorderRequestsPending ?? 0),
      change: `${(data?.reorderRequestsChangePct ?? 0) >= 0 ? "+" : ""}${data?.reorderRequestsChangePct ?? 0}%`,
      trend: (data?.reorderRequestsChangePct ?? 0) <= 0 ? "up" : "down",
      icon: RefreshCw,
      iconBg: "bg-sky-50",
      iconFg: "text-sky-600",
      label: "vs Last Month",
      link: "/plant/materials",
    },
    {
      title: "Emergency Material Alerts",
      value: String(data?.emergencyMaterialAlerts ?? 0),
      change: `${(data?.emergencyAlertsChangePct ?? 0) >= 0 ? "+" : ""}${data?.emergencyAlertsChangePct ?? 0}%`,
      trend: (data?.emergencyAlertsChangePct ?? 0) <= 0 ? "up" : "down",
      icon: Bell,
      iconBg: "bg-purple-50",
      iconFg: "text-purple-600",
      label: "vs Last Month",
      link: "/plant/materials",
    },
  ];

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
              <Link to={stat.link} className="text-sm text-gray-500 hover:text-blue-600">
                View All
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
