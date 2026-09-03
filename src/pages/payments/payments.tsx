import React from "react";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import PaymentStatusDistribution from "@/components/payments/payment-status-distribution";
import RevenueTrend from "@/components/payments/revenue-trend";
import PaymentAgingAnalysis from "@/components/payments/payment-aging-analysis";
import StageWisePaymentProgress from "@/components/payments/stage-wise-payment-progress";
import RecentPaymentsTable from "@/components/payments/recent-payments-table";
import StatCardV2 from "@/components/ui/stat-card-v2";
import {
  DollarSign,
  ShoppingBag,
  Hourglass,
  Handbag,
  CircleDollarSign,
  Upload,
} from "lucide-react";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { Button } from "@/components/ui/button";
import {
  getPaymentsDashboardProvider,
  exportPaymentsDashboardProvider,
} from "@/modules/payments/payments.api";

export default function PaymentsPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = React.useState(false);

  const startDate = dateRange?.from
    ? dateRange.from.toISOString().split("T")[0]
    : undefined;
  const endDate = dateRange?.to
    ? dateRange.to.toISOString().split("T")[0]
    : undefined;

  const { data: response, isLoading } = useQuery({
    queryKey: ["payments-dashboard", startDate, endDate],
    queryFn: () => getPaymentsDashboardProvider({ startDate, endDate }),
  });

  const dashboardData = response?.data;
  const stats = dashboardData?.stats;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportPaymentsDashboardProvider({ startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payments_dashboard_${startDate || "all"}_to_${endDate || "all"}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export payments dashboard:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amt?: number) => {
    if (amt === undefined || amt === null) return "$0";
    return `$${amt.toLocaleString()}`;
  };

  return (
    <div className="lg:pr-5 lg:pt-5 p-5 lg:p-0 space-y-5">
      {/* Header */}

      <div className="flex justify-between">
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">
            Track all payments, outstanding, and revenue trends in one place
          </p>
        </div>
        {/* Action buttons (date range filter and export ) */}
        <div className="flex items-center space-x-3">
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            className="bg-white"
          />
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Upload className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCardV2
          title="Total Payments"
          value={isLoading ? "..." : formatCurrency(stats?.totalPayments)}
          subtitle="Total recorded"
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
        <StatCardV2
          title="Total Received"
          value={isLoading ? "..." : formatCurrency(stats?.totalReceived)}
          subtitle="Received amount"
          icon={<ShoppingBag className="w-5 h-5" />}
          color="green"
        />
        <StatCardV2
          title="Total Outstanding"
          value={isLoading ? "..." : formatCurrency(stats?.totalOutstanding)}
          subtitle="Outstanding amount"
          icon={<Handbag className="w-5 h-5" />}
          color="yellow"
        />
        <StatCardV2
          title="Total Overdue"
          value={isLoading ? "..." : formatCurrency(stats?.totalOverdue)}
          subtitle="Overdue amount"
          icon={<Hourglass className="w-5 h-5" />}
          color="red"
        />
        <StatCardV2
          title="Total Overdue (YTD)"
          value={isLoading ? "..." : `${stats?.totalOverdueYTDPct ?? 0}%`}
          subtitle={`YTD: ${formatCurrency(stats?.totalOverdueYTD)}`}
          icon={<CircleDollarSign className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* First Row - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PaymentStatusDistribution
          data={dashboardData?.statusDistribution}
          isLoading={isLoading}
        />
        <RevenueTrend
          data={dashboardData?.revenueTrend}
          isLoading={isLoading}
        />
        <PaymentAgingAnalysis
          data={dashboardData?.expectedPayments}
          isLoading={isLoading}
        />
      </div>

      {/* Second Row - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StageWisePaymentProgress
          data={dashboardData?.stageWise}
          isLoading={isLoading}
        />

        {/* Recent payments table */}
        <div className="lg:col-span-2">
          <RecentPaymentsTable
            data={dashboardData?.recentPayments}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

