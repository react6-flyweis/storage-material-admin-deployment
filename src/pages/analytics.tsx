import { BarChart3, TrendingUp, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/modules/auth/auth.api";
import { Button } from "@/components/ui/button";
import CustomReportDialog from "@/components/custom-report-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConversionFunnelDetailed from "@/components/dashboard/conversion-funnel-detailed";
import SalesAnalyticsDetailed from "@/components/analytics/sales-analytics-detailed";
import TeamPerformanceDetailed from "@/components/analytics/team-performance-detailed";

const reportCards = [
  {
    title: "Reports & Analytics",
    description: "Performance metrics and trends",
    icon: BarChart3,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    total: "$331,000",
    growth: "+15%",
    growthColor: "text-green-600",
    period: "Last 6 months",
  },
  {
    title: "Conversion Funnel",
    description: "Pipeline analysis and optimization",
    icon: TrendingUp,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    total: "24.8%",
    growth: "+3.2%",
    growthColor: "text-green-600",
    period: "Last 6 months",
  },
  {
    title: "Team Performance",
    description: "Employee metrics and KPIs",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    total: "8.5/10",
    growth: "+0.8",
    growthColor: "text-green-600",
    period: "Last 6 months",
  },
];

export default function Analytics() {
  const [activeReport, setActiveReport] = useState<string | null>(
    "Reports & Analytics"
  );
  const [period, setPeriod] = useState<string>("monthly");

  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const res = await apiClient.get(`/api/admin/reports/analytics?timeframe=${period}`);
      return res.data; // Assuming data is directly in res.data, adjust if it's res.data.data
    },
  });

  const analyticsData = analyticsResponse?.data || analyticsResponse; // fallback if wrapped in data


  const salesRef = useRef<HTMLDivElement | null>(null);
  const convRef = useRef<HTMLDivElement | null>(null);
  const teamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeReport) return;
    const ref =
      activeReport === "Reports & Analytics"
        ? salesRef.current
        : activeReport === "Conversion Funnel"
        ? convRef.current
        : teamRef.current;
    ref?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeReport]);

  function handleViewReport(title: string) {
    setActiveReport(title);
  }

  function formatPeriod(p: string) {
    switch (p) {
      case "weekly":
        return "Last week";
      case "yearly":
        return "Last year";
      case "monthly":
      default:
        return "Last month";
    }
  }

  return (
    <div className="p-6 space-y-6 min-h-0">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row  lg:items-center justify-between">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v)}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <CustomReportDialog />
        </div>
      </div>

      {/* Report Cards */}
      <div className="gap-4 overflow-x-auto grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="bg-linear-to-br from-white to-gray-50 py-4"
            >
              <CardHeader className="px-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.iconBg}`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {card.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-bold">{card.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Growth
                    </span>
                    <span
                      className={`text-sm font-semibold ${card.growthColor}`}
                    >
                      {card.growth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Period
                    </span>
                    <span className="text-sm">{formatPeriod(period)}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleViewReport(card.title)}
                >
                  View Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Overview</h2>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${analyticsData?.quickOverview?.revenue?.toLocaleString() || "67,000"}
              </div>
              <div className="text-sm text-muted-foreground">
                This month Revenue
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.quickOverview?.newLeads || "158"}
              </div>
              <div className="text-sm text-muted-foreground">New Leads</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.quickOverview?.conversions || "42"}
              </div>
              <div className="text-sm text-muted-foreground">Conversions</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.quickOverview?.conversionRate || "26.6"}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Sales Analytics - Detailed View (extracted) */}
      {activeReport === "Reports & Analytics" && (
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[720px]">
            <SalesAnalyticsDetailed
              ref={salesRef}
              setActiveReport={setActiveReport}
              analyticsData={analyticsData}
              period={period}
              setPeriod={setPeriod}
            />
          </div>
        </div>
      )}

      {/* Conversion Funnel - Detailed (shown when triggered) */}
      {activeReport === "Conversion Funnel" && (
        <div ref={convRef} className="mt-6 overflow-x-auto">
          <div className="min-w-[720px]">
            <ConversionFunnelDetailed />
          </div>
        </div>
      )}

      {/* Team Performance detailed view (extracted) */}
      {activeReport === "Team Performance" && (
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[720px]">
            <TeamPerformanceDetailed
              ref={teamRef}
              setActiveReport={setActiveReport}
            />
          </div>
        </div>
      )}
    </div>
  );
}
