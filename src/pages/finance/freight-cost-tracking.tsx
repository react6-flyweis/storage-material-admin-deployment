import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Truck, DollarSign, Users, CalendarDays, Info } from "lucide-react";
import RecentFreightCosts from "@/components/finance/recent-freight-costs";
import TitleSubtitle from "@/components/TitleSubtitle";
import MonthlyFreightCostTrendChart from "@/modules/financials/components/MonthlyFreightCostTrendChart";
import FreightCarrierDistributionChart from "@/modules/financials/components/FreightCarrierDistributionChart";
import CarrierCostAnalysis from "@/modules/financials/components/CarrierCostAnalysis";
import { useFreightCostTrackingQuery } from "@/modules/financials/financials.hooks";

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  isLoading?: boolean;
};

function MetricCard({ title, value, icon, className, isLoading }: MetricCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg shadow-md text-white flex items-center justify-between",
        className,
      )}
    >
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-24 bg-white/30" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <div className="text-xs opacity-90 mt-1">{title}</div>
      </div>
      <div className="p-3 bg-white/20 rounded-md">{icon}</div>
    </div>
  );
}

export default function FreightCostTracking() {
  const { data: response, isLoading } = useFreightCostTrackingQuery();
  const trackingData = response?.data;

  const totalCost = trackingData?.totalFreightCost ?? 0;
  const activeCarriers = trackingData?.activeCarriers ?? 0;
  const avgCost = trackingData?.avgCostPerDelivery ?? 0;
  const pendingInvoices = trackingData?.pendingInvoices ?? 0;

  return (
    <div className="p-6 space-y-6">
      <TitleSubtitle
        title="Freight Costs Tracking"
        subtitle="Monitor and track freight costs across all projects and deliveries"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Freight Cost"
          value={`$${totalCost.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          className="bg-blue-600"
          isLoading={isLoading}
        />

        <MetricCard
          title="Active Carriers"
          value={activeCarriers}
          icon={<Truck className="h-6 w-6 text-white" />}
          className="bg-green-500"
          isLoading={isLoading}
        />

        <MetricCard
          title="Avg Cost/Delivery"
          value={`$${avgCost.toLocaleString()}`}
          icon={<CalendarDays className="h-6 w-6 text-white" />}
          className="bg-orange-500"
          isLoading={isLoading}
        />

        <MetricCard
          title="Pending Invoices"
          value={pendingInvoices}
          icon={<Users className="h-6 w-6 text-white" />}
          className="bg-yellow-500"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyFreightCostTrendChart
          data={trackingData?.monthlyFreightCostTrend}
          isLoading={isLoading}
        />
        <FreightCarrierDistributionChart
          data={trackingData?.costDistributionByCarrier}
          isLoading={isLoading}
        />
      </div>

      {/* Carrier Cost Analysis Section */}
      <CarrierCostAnalysis
        data={trackingData?.costDistributionByCarrier}
        totalCost={totalCost}
        isLoading={isLoading}
      />

      {/* Recent Freight Costs and About section */}
      <RecentFreightCosts />

      <div>
        <Card className="p-6 bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                About Freight Costs
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                This screen provides visibility into freight costs across all
                projects and deliveries. Freight costs are automatically
                captured from awarded freight bids and linked to deliveries. For
                more details on freight operations and delivery management,
                please refer to the appropriate operational modules.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

