import { useState, useMemo } from "react";
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
import FilterTabs, { type Period } from "@/components/FilterTabs";
import PlantProductionStats from "@/components/dashboard/plant-production-stats";
import PlantHighlightCards from "@/components/dashboard/plant-highlight-cards";
import CustomerActivitiesApprovals from "@/components/dashboard/customer-activities-approvals";
import TotalInvoicesGenerated from "@/components/dashboard/total-invoices-generated";
import PlantSalesChart from "@/components/dashboard/plant-sales-chart";
import DeliveryFinanceOverview from "@/components/dashboard/delivery-finance-overview";
import DispatchReadiness from "@/components/dashboard/dispatch-readiness";
import { useDashboardOverviewQuery } from "@/modules/dashboard/dashboard.hooks";
import type { DashboardPeriod } from "@/modules/dashboard/dashboard.types";
import {
  Clock3,
  UserRound,
  Wallet,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

type StatCardSkeletonProps = {
  color: string;
};

type DeliverySnapshotCard = {
  title: string;
  value: string;
  icon: LucideIcon;
};

const periodKeyMap: Record<Period, DashboardPeriod> = {
  Today: "today",
  Week: "week",
  Month: "month",
  "All Time": "all",
};

const periodPrefixMap: Record<Period, string> = {
  Today: "Today's",
  Week: "Weekly",
  Month: "Monthly",
  "All Time": "Total",
};

function formatCurrency(amount?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

const US_STATE_CODE_MAP: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

function getStateCode(name?: string) {
  if (!name) return "";
  const cleaned = name.trim();
  if (cleaned.length <= 2) return cleaned.toUpperCase();
  return (
    US_STATE_CODE_MAP[cleaned.toLowerCase()] ??
    cleaned
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  );
}

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

  const periodParam = periodKeyMap[period] ?? "month";
  const periodPrefix = periodPrefixMap[period] ?? "Monthly";

  const { data: overviewResponse, isLoading } = useDashboardOverviewQuery({
    period: periodParam,
  });

  const overview = overviewResponse?.data;
  const kpis = overview?.kpis;

  const stats = {
    totalLeads: String(kpis?.totalLeads ?? 0),
    confirmedLeads: String(kpis?.confirmedLeads ?? 0),
    pipelineValue: formatCurrency(kpis?.pipelineValue),
    revenue: formatCurrency(kpis?.monthlyRevenue ?? kpis?.revenue),
  };

  // 1. Sales Funnel items
  const funnelItems = useMemo(() => {
    const funnelColors = [
      { dot: "bg-blue-500", bg: "bg-blue-50" },
      { dot: "bg-purple-500", bg: "bg-purple-50" },
      { dot: "bg-emerald-500", bg: "bg-emerald-50" },
      { dot: "bg-amber-500", bg: "bg-amber-50" },
      { dot: "bg-rose-500", bg: "bg-rose-50" },
      { dot: "bg-sky-500", bg: "bg-sky-50" },
    ];
    return (
      overview?.conversionFunnel?.stages?.slice(0, 5).map((stage, idx) => ({
        label: stage.label,
        count: stage.count,
        percent: `${stage.pct}%`,
        dotClass: funnelColors[idx % funnelColors.length].dot,
        rowBgClass: funnelColors[idx % funnelColors.length].bg,
      })) ?? []
    );
  }, [overview?.conversionFunnel]);

  // 2. Deal Size Distribution
  const dealBuckets = useMemo(() => {
    const dealColors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-purple-500",
      "bg-rose-500",
    ];
    return (
      overview?.dealSizeDistribution?.buckets?.slice(0, 5).map((bucket, idx) => ({
        label: bucket.label,
        deals: `${bucket.count} deals`,
        percentLabel: `${bucket.pct}%`,
        fillPercent: bucket.pct,
        colorClass: dealColors[idx % dealColors.length],
      })) ?? []
    );
  }, [overview?.dealSizeDistribution]);

  // 3. Reports Overview
  const reportsData = useMemo(() => {
    return (
      overview?.reportsOverview?.weeklySeries?.map((pt) => ({
        day: pt.label || pt.date,
        customers: 0,
        revenue: pt.revenue,
        income: pt.income,
        expense: pt.expense,
      })) ?? []
    );
  }, [overview?.reportsOverview?.weeklySeries]);

  const reportsSummaryStats = useMemo(() => {
    return [
      {
        label: "Customers",
        value: overview?.reportsOverview?.customers ?? 0,
        emphasis: "Customers",
        accentClass: "text-blue-600",
        highlight: true,
        accentBorder: "bg-gradient-to-r from-blue-500 to-sky-400",
      },
      {
        label: "Revenue",
        value: overview?.reportsOverview?.revenue ?? 0,
        emphasis: "Revenue",
        accentClass: "text-orange-500",
        highlight: false,
        accentBorder: "bg-orange-200/80",
      },
      {
        label: "Income",
        value: overview?.reportsOverview?.income ?? 0,
        emphasis: "Income",
        accentClass: "text-emerald-600",
        highlight: false,
        accentBorder: "bg-emerald-200/80",
      },
      {
        label: "Expense",
        value: overview?.reportsOverview?.expense ?? 0,
        emphasis: "Expense",
        accentClass: "text-rose-500",
        highlight: false,
        accentBorder: "bg-rose-200/80",
      },
    ];
  }, [overview?.reportsOverview]);

  // 4. Lead Sources Chart
  const leadSourceItems = useMemo(() => {
    return (
      overview?.leadSources?.byChannel?.slice(0, 5).map((ch) => ({
        id: ch.channel.toLowerCase().replace(/\s+/g, "_"),
        label: ch.channel,
        value: ch.count,
      })) ?? []
    );
  }, [overview?.leadSources?.byChannel]);

  // 5. Lead Conversion
  const leadConvItems = useMemo(() => {
    const leadConvColors = [
      { color: "bg-blue-500", bg: "bg-blue-50" },
      { color: "bg-purple-500", bg: "bg-purple-50" },
      { color: "bg-emerald-500", bg: "bg-emerald-50" },
      { color: "bg-amber-500", bg: "bg-amber-50" },
      { color: "bg-rose-500", bg: "bg-rose-50" },
      { color: "bg-sky-500", bg: "bg-sky-50" },
    ];
    return (
      overview?.leadConversion?.stages?.slice(0, 5).map((stage, idx) => ({
        label: stage.label,
        percent: stage.pct,
        subtitle: `${stage.count} leads`,
        colorClass: leadConvColors[idx % leadConvColors.length].color,
        bgClass: leadConvColors[idx % leadConvColors.length].bg,
      })) ?? []
    );
  }, [overview?.leadConversion?.stages]);

  // 6. Tonnage Sold
  const tonnageItems = useMemo(() => {
    return (
      overview?.tonnageSold?.categories?.slice(0, 5).map((cat) => ({
        id: cat.category.toLowerCase().replace(/\s+/g, "_"),
        label: cat.category,
        value: cat.tonnage,
      })) ?? []
    );
  }, [overview?.tonnageSold?.categories]);

  // 7. Ops KPI Snapshot Cards
  const deliverySnapshotCards: DeliverySnapshotCard[] = useMemo(() => {
    return [
      {
        title: "On-Time Delivery %",
        value: `${overview?.opsKpis?.onTimeDeliveryPct ?? 0}%`,
        icon: BarChart3,
      },
      {
        title: "Acknowledgements Pending",
        value: `${overview?.opsKpis?.acknowledgementsPendingPct ?? 0}%`,
        icon: Wallet,
      },
      {
        title: "Delivery Success Rate",
        value: `${overview?.opsKpis?.deliverySuccessRate ?? 0}%`,
        icon: UserRound,
      },
      {
        title: "Reschedule Rate",
        value: `${overview?.opsKpis?.rescheduleRate ?? 0}%`,
        icon: Clock3,
      },
    ];
  }, [overview?.opsKpis]);

  // 8. Pipeline Stage Overview
  const stageOverviewItems = useMemo(() => {
    return (
      overview?.pipelineStageOverview?.stages?.slice(0, 5).map((s) => ({
        stage: s.label,
        value: s.count,
      })) ?? []
    );
  }, [overview?.pipelineStageOverview?.stages]);

  // 9. Query Handling Distribution
  const queryHandlingData = useMemo(() => {
    if (!overview?.queryHandling) return [];
    return [
      {
        name: "AI Handled",
        value: overview.queryHandling.aiHandled,
        key: "ai",
      },
      {
        name: "Employee handled",
        value: overview.queryHandling.employeeHandled,
        key: "employee",
      },
    ];
  }, [overview?.queryHandling]);

  // 10. Active Pipeline Stages (Kanban)
  const kanbanStages = useMemo(() => {
    const kanbanColors = [
      "bg-sky-50",
      "bg-purple-50",
      "bg-emerald-50",
      "bg-amber-50",
    ];
    return (
      overview?.pipelineKanban?.columns?.slice(0, 5).map((col, idx) => ({
        id: col.key,
        name: col.label,
        count: col.total,
        color: kanbanColors[idx % kanbanColors.length],
        deals: col.leads.slice(0, 5).map((l) => ({
          company: l.name,
          value: formatCurrency(l.value),
          time: formatDate(l.updatedAt),
        })),
      })) ?? []
    );
  }, [overview?.pipelineKanban?.columns]);

  // 11. Recent Closed Deals
  const closedDeals = useMemo(() => {
    return (
      overview?.recentClosedDeals?.items?.slice(0, 5).map((item) => ({
        id: item.id,
        company: item.name,
        value: formatCurrency(item.value),
        closedTime: formatDate(item.closedAt),
      })) ?? []
    );
  }, [overview?.recentClosedDeals?.items]);

  // 12. Recent Sales Activity
  const salesActivities = useMemo(() => {
    return (
      overview?.salesActivity?.items?.slice(0, 5).map((act, idx) => ({
        id: `${act.title}-${idx}`,
        title: act.title,
        subtitle: `${act.actor ? `${act.actor} • ` : ""}${formatDate(act.at)}`,
      })) ?? []
    );
  }, [overview?.salesActivity?.items]);

  // 13. Top Sales Performers
  const performers = useMemo(() => {
    const performerColors = [
      "bg-blue-600",
      "bg-purple-600",
      "bg-emerald-600",
      "bg-amber-600",
      "bg-rose-600",
    ];
    return (
      overview?.topPerformers?.performers?.slice(0, 5).map((p, idx) => {
        const parts = p.name.split(" ");
        const initials =
          parts
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "SP";
        return {
          id: p.id || String(idx),
          name: p.name,
          initials,
          color: performerColors[idx % performerColors.length],
          deals: p.closedLeads,
          rate: p.closeRate,
          value: formatCurrency(p.revenue),
        };
      }) ?? []
    );
  }, [overview?.topPerformers?.performers]);

  // 14. Tax By State
  const stateTaxData = useMemo(() => {
    return (
      overview?.taxByState?.states?.slice(0, 5).map((st) => ({
        state: st.state,
        abbreviation: getStateCode(st.state),
        contracts: st.contracts,
        rate: `${st.taxRate}%`,
        sales: st.totalSales,
        taxDue: st.taxDue,
      })) ?? []
    );
  }, [overview?.taxByState?.states]);

  // 15. Tax By Building Type
  const buildingTypeData = useMemo(() => {
    const buildingColors = [
      "#2563EB",
      "#10B981",
      "#F59E0B",
      "#8B5CF6",
      "#EC4899",
      "#6366F1",
    ];
    return (
      overview?.taxByBuildingType?.items?.slice(0, 5).map((b, idx) => ({
        type: b.buildingType,
        value: b.tax,
        color: buildingColors[idx % buildingColors.length],
      })) ?? []
    );
  }, [overview?.taxByBuildingType?.items]);

  // 16. Construction Projects
  const constructionProjects = useMemo(() => {
    return (
      overview?.constructionProgress?.projects?.slice(0, 5).map((prj) => ({
        id: prj.id,
        name: prj.projectName,
        projectId: prj.projectCode,
        manager: prj.manager,
        progress: prj.progressPct,
        status:
          (prj.statusLabel as "On Track" | "Delayed" | "Starting") ||
          "On Track",
      })) ?? []
    );
  }, [overview?.constructionProgress?.projects]);

  // 17. Customer Activities
  const customerActivities = useMemo(() => {
    return (
      overview?.customerApprovals?.activities?.slice(0, 5).map((act) => ({
        name: act.name,
        date: formatDate(act.date),
        status: act.status,
        amount: act.amount ? formatCurrency(act.amount) : undefined,
        statusType: act.type,
      })) ?? []
    );
  }, [overview?.customerApprovals?.activities]);

  // 18. Sales Mix (Plant Sales Chart)
  const plantSalesDistribution = useMemo(() => {
    const mixColors: Record<string, string> = {
      sales: "#2563EB",
      revenue: "#10B981",
      expenses: "#F97316",
    };
    return (
      overview?.salesMix?.slices?.slice(0, 5).map((slice) => ({
        name: slice.label,
        value: slice.pct,
        color: mixColors[slice.key] || "#8B5CF6",
        amount: slice.amount,
      })) ?? []
    );
  }, [overview?.salesMix?.slices]);

  return (
    <div>
      {/* Tabs */}
      <FilterTabs initialPeriod={period} onPeriodChange={setPeriod} />

      <div className="p-5 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Complete overview of your leads, sales pipeline, and revenue
            performance
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
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
                title={`${periodPrefix} Total Leads`}
                value={stats.totalLeads}
                icon={<img src={LeadsIcon} alt="leads" className="size-7" />}
                color="bg-blue-500"
                navigateTo="/leads"
              />

              <StatCard
                title={`${periodPrefix} Confirmed Leads`}
                value={stats.confirmedLeads}
                icon={
                  <img src={ConfirmedIcon} alt="confirmed" className="size-7" />
                }
                color="bg-green-500"
                navigateTo="/leads"
              />

              <StatCard
                title={`${periodPrefix} Pipeline Value`}
                value={stats.pipelineValue}
                icon={<img src={ValueIcon} alt="value" className="size-7" />}
                color="bg-yellow-500"
                navigateTo="/analytics"
              />

              <StatCard
                title={`${periodPrefix} Revenue`}
                value={stats.revenue}
                icon={
                  <img src={RevenueIcon} alt="revenue" className="size-7" />
                }
                color="bg-orange-500"
                navigateTo="/analytics"
              />
            </>
          )}
        </div>

        {/* Delivery Finance Overview */}
        <DeliveryFinanceOverview
          finance={overview?.deliveryFinance}
          loadOptimization={overview?.loadOptimization}
          operations={overview?.deliveryOperations}
          communication={overview?.communicationStatus}
          freight={overview?.freightActivity}
        />

        {/* Chart Row 1: Funnel & Deal Size */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex flex-col">
            <SalesFunnel items={funnelItems} />
          </div>
          <div className="lg:col-span-1 flex flex-col">
            <DealSizeDistribution
              items={dealBuckets}
              averageDealSize={formatCurrency(
                overview?.dealSizeDistribution?.averageDealSize
              )}
            />
          </div>
        </div>

        {/* Chart Row 2: Reports & Lead Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3 flex flex-col">
            <ReportsOverview
              data={reportsData}
              summaryStats={reportsSummaryStats}
            />
          </div>
          <div className="lg:col-span-2 flex flex-col">
            <LeadSourcesChart data={leadSourceItems} />
          </div>
        </div>

        {/* Dispatch readiness */}
        <DispatchReadiness data={overview?.dispatchReadiness} />

        {/* Chart Row 3: Lead Conversion & Tonnage Sold */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3 flex flex-col">
            <LeadConversion items={leadConvItems} />
          </div>
          <div className="lg:col-span-2 flex flex-col">
            <TonnageSold data={tonnageItems} />
          </div>
        </div>

        {/* Delivery Ops KPI snapshot row */}
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3 flex flex-col">
            <PipelineStageOverview data={stageOverviewItems} />
          </div>
          <div className="lg:col-span-2 flex flex-col">
            <QueryHandlingDistribution data={queryHandlingData} />
          </div>
        </div>

        {/* Active Pipeline Stages (Kanban) and Recent Closed Deals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex flex-col">
            <ActivePipelineStages stages={kanbanStages} />
          </div>
          <div className="lg:col-span-1 flex flex-col">
            <RecentClosedDeals deals={closedDeals} />
          </div>
        </div>

        {/* Recent Sales Activity and Top Sales Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col">
            <RecentSalesActivity items={salesActivities} />
          </div>
          <div className="flex flex-col">
            <TopSalesPerformers performers={performers} />
          </div>
        </div>

        {/* Tax Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="flex flex-col">
            <TaxSummaryCard data={overview?.taxSummary} />
          </div>
          <div className="flex flex-col">
            <StateTaxCard data={stateTaxData} />
          </div>
          <div className="flex flex-col">
            <BuildingTypeTaxCard data={buildingTypeData} />
          </div>
        </div>

        {/* Sales Tax Filing and Tax Report Export */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col">
            <SalesTaxFiling filings={[]} />
          </div>
          <div className="flex flex-col">
            <TaxReportExport />
          </div>
        </div>

        {/* Construction Progress Overview */}
        <ConstructionProgressOverview projects={constructionProjects} />

        {/* Plant Production Status Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Plant production status
          </h2>

          {/* Plant Stats Cards */}
          <PlantProductionStats data={overview?.plantProduction} />

          {/* Highlight Cards */}
          <PlantHighlightCards data={overview?.businessHighlights} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Customer Activities and Total Invoices Row */}
            <div className="space-y-6 lg:col-span-3">
              <CustomerActivitiesApprovals activities={customerActivities} />
              <TotalInvoicesGenerated
                totalCount={overview?.customerApprovals?.totalInvoicesGenerated ?? 0}
                invoices={[]}
              />
            </div>

            {/* Sales Chart (Sales Mix) */}
            <div className="lg:col-span-2">
              <PlantSalesChart data={plantSalesDistribution} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
