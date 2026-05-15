import { useState } from "react";
import StatCard from "@/components/ui/stat-card";
import SalesFunnel from "@/components/dashboard/sales-funnel";
import DealSizeDistribution from "@/components/dashboard/deal-size-distribution";
import ReportsOverview from "@/components/dashboard/reports-overview";
import LeadSourcesChart from "@/components/dashboard/lead-sources";
import LeadConversion from "@/components/dashboard/lead-conversion";
import TonnageSold from "@/components/dashboard/tonnage-sold";
import PipelineStageOverview from "@/components/dashboard/pipeline-stage-overview";
import QueryHandlingDistribution from "@/components/dashboard/query-handling-distribution";
import ActivePipelineStages from "@/components/dashboard/active-pipeline-stages";
import RecentClosedDeals from "@/components/dashboard/recent-closed-deals";
import RecentSalesActivity from "@/components/dashboard/recent-sales-activity";
import TopSalesPerformers from "@/components/dashboard/top-sales-performers";
import LeadsIcon from "@/assets/icons/dashboard/leads.svg";
import ConfirmedIcon from "@/assets/icons/dashboard/confirmed.svg";
import ValueIcon from "@/assets/icons/dashboard/value.svg";
import RevenueIcon from "@/assets/icons/dashboard/revenue.svg";
import BuildingTypeTaxCard from "@/components/sales-tax/BuildingTypeTaxCard";
import StateTaxCard from "@/components/sales-tax/StateTaxCard";
import TaxSummaryCard from "@/components/sales-tax/TaxSummaryCard";
import SalesTaxFiling from "@/components/dashboard/sales-tax-filing";
import TaxReportExport from "@/components/dashboard/tax-report-export";
import ConstructionProgressOverview from "@/components/dashboard/construction-progress-overview";
import FilterTabs from "@/components/FilterTabs";
import PlantProductionStats from "@/components/dashboard/plant-production-stats";
import PlantHighlightCards from "@/components/dashboard/plant-highlight-cards";
import CustomerActivitiesApprovals from "@/components/dashboard/customer-activities-approvals";
import TotalInvoicesGenerated from "@/components/dashboard/total-invoices-generated";
import PlantSalesChart from "@/components/dashboard/plant-sales-chart";
import DeliveryFinanceOverview from "@/components/dashboard/delivery-finance-overview";
import DispatchReadiness from "@/components/dashboard/dispatch-readiness";
import { useLeadStatsQuery } from "@/modules/dashboard/dashboard.hooks";
import {
  Clock3,
  UserRound,
  Wallet,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

type Period = "Today" | "Week" | "Month";

type StatCardSkeletonProps = {
  color: string;
};

type DeliverySnapshotCard = {
  title: string;
  value: string;
  icon: LucideIcon;
};

const deliverySnapshotCards: DeliverySnapshotCard[] = [
  {
    title: "On-Time Delivery %",
    value: "20%",
    icon: BarChart3,
  },
  {
    title: "Acknowledgements Pending",
    value: "60%",
    icon: Wallet,
  },
  {
    title: "Delivery Success Rate",
    value: "50%",
    icon: UserRound,
  },
  {
    title: "Reschedule Rate",
    value: "33",
    icon: Clock3,
  },
];

function StatCardSkeleton({ color }: StatCardSkeletonProps) {
  return (
    <div
      className={`sm:p-5 px-3 py-5 rounded-md border-none ${color} animate-pulse`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 w-full">
          <div className="h-3 w-24 rounded bg-white/35" />
          <div className="h-6 w-20 rounded bg-white/45" />
        </div>

        <div className="bg-white/65 sm:p-2 p-1 rounded-md">
          <div className="size-7 rounded bg-white/80" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("Month");
  const { data: leadStatsResponse, isLoading: isLeadStatsLoading } =
    useLeadStatsQuery();

  const leadStats = leadStatsResponse?.data;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  const stats = {
    totalLeads: String(leadStats?.totalLeads ?? 0),
    confirmedLeads: String(leadStats?.confirmedLeads ?? 0),
    pipelineValue: formatCurrency(leadStats?.pipelineValue ?? 0),
    monthlyRevenue: formatCurrency(leadStats?.monthlyRevenue ?? 0),
  };

  return (
    <div className="">
      {/* Tabs */}
      <FilterTabs initialPeriod={period} onPeriodChange={setPeriod} />

      <div className="p-5  space-y-5">
        {/* Header */}
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Complete overview of your leads, sales pipeline, and revenue
            performance
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLeadStatsLoading ? (
            <>
              {[
                "bg-blue-500",
                "bg-green-500",
                "bg-yellow-500",
                "bg-orange-500",
              ].map((color, index) => (
                <StatCardSkeleton key={index} color={color} />
              ))}
            </>
          ) : (
            <>
              <StatCard
                // Time-period filter is temporarily disabled for stats; keeping monthly only.
                // title={`${period} Total Leads`}
                title="Monthly Total Leads"
                value={stats.totalLeads}
                icon={<img src={LeadsIcon} alt="leads" className="size-7" />}
                color="bg-blue-500"
                navigateTo="/leads"
              />

              <StatCard
                // title={`${period} Confirmed Leads`}
                title="Monthly Confirmed Leads"
                value={stats.confirmedLeads}
                icon={
                  <img src={ConfirmedIcon} alt="confirmed" className="size-7" />
                }
                color="bg-green-500"
                navigateTo="/leads"
              />

              <StatCard
                // title={`${period} Pipeline Value`}
                title="Monthly Pipeline Value"
                value={stats.pipelineValue}
                icon={<img src={ValueIcon} alt="value" className="size-7" />}
                color="bg-yellow-500"
                navigateTo="/analytics"
              />

              <StatCard
                // title={`${period} Revenue`}
                title="Monthly Revenue"
                value={stats.monthlyRevenue}
                icon={
                  <img src={RevenueIcon} alt="revenue" className="size-7" />
                }
                color="bg-orange-500"
                navigateTo="/analytics"
              />
            </>
          )}
        </div>

        <DeliveryFinanceOverview />

        {/* Chart Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesFunnel />
          </div>
          <DealSizeDistribution period={period} />
        </div>

        {/* Chart Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ReportsOverview period={period} />
          </div>
          <div className="lg:col-span-2">
            <LeadSourcesChart period={period} />
          </div>
        </div>

        {/* Dispatch readiness */}
        <DispatchReadiness />

        {/* Chart Row 3: Requested charts below */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <LeadConversion period={period} />
          </div>
          <div className="lg:col-span-2">
            <TonnageSold />
          </div>
        </div>

        {/* another stats like row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {deliverySnapshotCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-lg border border-blue-500 bg-white px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-500">
                      {card.title}
                    </p>
                    <p className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart Row 4: Pipeline stage and Query distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PipelineStageOverview period={period} />
          </div>
          <div className="lg:col-span-2">
            <QueryHandlingDistribution period={period} />
          </div>
        </div>

        {/* Active Pipeline Stages and Recent Closed Deals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivePipelineStages period={period} />
          </div>
          <div className="lg:col-span-1">
            <RecentClosedDeals period={period} />
          </div>
        </div>

        {/* Recent Sales Activity and Top Sales Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentSalesActivity period={period} />
          <TopSalesPerformers period={period} />
        </div>

        {/* Tax Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TaxSummaryCard />

          <StateTaxCard />

          <BuildingTypeTaxCard />
        </div>

        {/* Sales Tax Filing and Tax Report Export */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesTaxFiling />
          <TaxReportExport />
        </div>

        {/* Construction Progress Overview */}
        <ConstructionProgressOverview period={period} />

        {/* Plant Production Status Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Plant production status
          </h2>

          {/* Plant Stats Cards */}
          <PlantProductionStats period={period} />

          {/* Highlight Cards */}
          <PlantHighlightCards period={period} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Customer Activities and Total Invoices Row */}
            <div className="space-y-6 lg:col-span-3">
              <CustomerActivitiesApprovals period={period} />
              <TotalInvoicesGenerated period={period} />
            </div>

            {/* Sales Chart */}
            <div className="lg:col-span-2">
              <PlantSalesChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
