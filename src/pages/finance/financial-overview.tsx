"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import TitleSubtitle from "@/components/TitleSubtitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { Download, Loader2 } from "lucide-react";
import { RevenueTrendChart } from "@/components/finance/revenue-trend-chart";
import { IncomeVsExpenseChart } from "@/components/finance/income-vs-expense-chart";
import { ProfitabilityChart } from "@/components/finance/profitability-chart";
import { ProfitLossSummaryCard, type ProfitLossRow } from "@/components/finance/profit-loss-summary-card";
import { TopCustomersRevenueCard } from "@/components/finance/top-customers-revenue-card";
import type { DateRange } from "react-day-picker";
import {
  useFinancialOverviewQuery,
  useBudgetVsActualProjectsQuery,
} from "@/modules/financials/financials.hooks";

function StatCard({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: string;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <div className="mt-2 flex items-center justify-between">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : (
          <p className="text-xl font-semibold leading-none text-slate-900">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

export default function FinancialOverviewPage() {
  const [project, setProject] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch project list from budget vs actual projects endpoint
  const { data: projectsRes, isLoading: isProjectsLoading } = useBudgetVsActualProjectsQuery();
  const projects = projectsRes?.data?.projects || [];

  const startDateStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDateStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const queryParams = {
    projectId: project !== "all" ? project : undefined,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  const { data: overviewRes, isLoading: isOverviewLoading } = useFinancialOverviewQuery(queryParams);
  const overviewData = overviewRes?.data;


  const statCards = [
    {
      title: "Total Revenue",
      value: overviewData ? `$${overviewData.totalRevenue.toLocaleString()}` : "$0",
    },
    {
      title: "Gross Profit",
      value: overviewData ? `$${overviewData.grossProfit.toLocaleString()}` : "$0",
    },
    {
      title: "Gross Margin",
      value: overviewData ? `${overviewData.grossMargin}%` : "0%",
    },
    {
      title: "Net Profit",
      value: overviewData ? `$${overviewData.netProfit.toLocaleString()}` : "$0",
    },
    {
      title: "Operating Cash Flow",
      value: overviewData ? `$${overviewData.operatingCashFlow.toLocaleString()}` : "$0",
    },
  ];

  const profitLossRows: ProfitLossRow[] = overviewData
    ? [
        {
          label: "Total Revenue",
          thisMonth: `$${overviewData.totalRevenue.toLocaleString()}`,
          lastMonth: "-",
          change: "-",
          ytd: "-",
        },
        {
          label: "Cost of Goods Sold",
          thisMonth: `$${overviewData.profitabilityBreakdown?.costOfGoodsSold.toLocaleString()}`,
          lastMonth: "-",
          change: "-",
          ytd: "-",
          negative: true,
        },
        {
          label: "Gross Profit",
          thisMonth: `$${overviewData.grossProfit.toLocaleString()}`,
          lastMonth: "-",
          change: "-",
          ytd: "-",
        },
        {
          label: "Operating Expenses",
          thisMonth: `$${overviewData.profitabilityBreakdown?.operatingExpenses.toLocaleString()}`,
          lastMonth: "-",
          change: "-",
          ytd: "-",
          negative: true,
        },
        {
          label: "Other Income",
          thisMonth: `$${overviewData.profitabilityBreakdown?.otherIncome.toLocaleString()}`,
          lastMonth: "-",
          change: "-",
          ytd: "-",
        },
        {
          label: "Net Profit",
          thisMonth: `$${overviewData.netProfit.toLocaleString()}`,
          lastMonth: "-",
          change: "-",
          ytd: "-",
        },
      ]
    : [];

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <TitleSubtitle
          title="Financial Overview"
          subtitle="Monitor your business financial performance and key metrics"
        />

        <Button className="h-9 bg-violet-600 px-4 text-white hover:bg-violet-700">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={project} onValueChange={setProject} disabled={isProjectsLoading}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.projectName || p.jobId || p._id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          className="bg-white"
        />
      </div>


      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} isLoading={isOverviewLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <RevenueTrendChart data={overviewData?.revenueTrend} isLoading={isOverviewLoading} />
        <IncomeVsExpenseChart data={overviewData?.incomeVsExpenseTrend} isLoading={isOverviewLoading} />
        <ProfitabilityChart data={overviewData?.profitabilityBreakdown} isLoading={isOverviewLoading} />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
        <ProfitLossSummaryCard rows={profitLossRows} isLoading={isOverviewLoading} />
        <TopCustomersRevenueCard customers={overviewData?.topCustomers} isLoading={isOverviewLoading} />
      </div>
    </div>
  );
}

