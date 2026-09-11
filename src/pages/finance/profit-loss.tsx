import { useState } from "react";
import {
  BadgeDollarSign,
  CalendarRange,
  Download,
  Loader2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCardV2 from "@/components/ui/stat-card-v2";
import TitleSubtitle from "@/components/TitleSubtitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProfitLossQuery,
  useExportExpensesMutation,
  useBudgetVsActualProjectsQuery,
} from "@/modules/financials/financials.hooks";
import type { ProfitLossPeriod } from "@/modules/financials/financials.api";
import ProjectWiseProfitLoss from "@/modules/financials/components/ProjectWiseProfitLoss";
import IncomeVsExpenseTrendChart from "@/modules/financials/components/IncomeVsExpenseTrendChart";
import ProfitLossExpenseBreakdownChart from "@/modules/financials/components/ProfitLossExpenseBreakdownChart";
import ProfitLossSummaryTable from "@/modules/financials/components/ProfitLossSummaryTable";

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
};

const formatPercent = (val?: number) => {
  if (val === undefined || val === null) return "0.00%";
  return `${val.toFixed(2)}%`;
};

export default function ProfitLossPage() {
  const [project, setProject] = useState("all-projects");
  const [period, setPeriod] = useState<ProfitLossPeriod>("monthly");

  const { data: projectsRes } = useBudgetVsActualProjectsQuery();
  const projectOptions = projectsRes?.data?.projects || [];

  const queryParams = {
    projectId: project !== "all-projects" ? project : undefined,
    period,
  };

  const { data: response, isLoading, isError, error, refetch } = useProfitLossQuery(queryParams);
  const plData = response?.data;

  const exportExpensesMutation = useExportExpensesMutation();

  const handleExport = async () => {
    try {
      const exportParams = {
        projectId: project !== "all-projects" ? project : undefined,
      };

      const blob = await exportExpensesMutation.mutateAsync(exportParams);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expenses-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export expenses report failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-[#e8efff]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3 bg-[#e8efff]">
        <p className="text-sm font-medium text-rose-600">
          Failed to load Profit & Loss data: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(plData?.totalRevenue),
      subtitle: "vs Previous Month",
      icon: <BadgeDollarSign className="h-4 w-4" />,
      color: "purple" as const,
    },
    {
      title: "Total Expenses",
      value: formatCurrency(plData?.totalExpenses),
      subtitle: "vs Previous Month",
      icon: <Wallet className="h-4 w-4" />,
      color: "green" as const,
    },
    {
      title: "Gross Profit",
      value: formatCurrency(plData?.grossProfit),
      subtitle: "vs Previous Month",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "yellow" as const,
    },
    {
      title: "Net Profit",
      value: formatCurrency(plData?.netProfit),
      subtitle: "vs Previous Month",
      icon: <TrendingDown className="h-4 w-4" />,
      color: "red" as const,
    },
    {
      title: "Net Profit Margin",
      value: formatPercent(plData?.netProfitMargin),
      subtitle: "vs Previous Month",
      icon: <BadgeDollarSign className="h-4 w-4" />,
      color: "purple" as const,
    },
  ];

  return (
    <div className="min-h-full bg-[#e8efff] px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-400 flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <TitleSubtitle
            title="Profit & Loss Statement"
            subtitle="Overview of income, expenses and profitability for your projects."
          />

          <div className="flex   items-center gap-2">
            <Select value={period} onValueChange={(val) => setPeriod(val as ProfitLossPeriod)}>
              <SelectTrigger className="h-9 w-38 rounded-lg border-slate-200 bg-white text-sm text-slate-700 shadow-sm">
                <div className="flex items-center">
                  <CalendarRange className="mr-2 h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Period" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={project} onValueChange={setProject}>
              <SelectTrigger className="h-9 w-48 rounded-lg border-slate-200 bg-white text-sm text-slate-700 shadow-sm">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                {projectOptions.map((proj) => (
                  <SelectItem key={proj._id} value={proj._id}>
                    {proj.jobId ? `${proj.jobId} - ${proj.projectName}` : proj.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleExport}
              disabled={exportExpensesMutation.isPending}
              className="h-9 rounded-lg bg-[#1976d2] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1667b8]"
            >
              {exportExpensesMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <StatCardV2 key={card.title} {...card} />
          ))}
        </div>

        <ProfitLossSummaryTable summaryItems={plData?.summary} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <IncomeVsExpenseTrendChart
            totalRevenue={plData?.totalRevenue}
            totalExpenses={plData?.totalExpenses}
            trendData={plData?.incomeVsExpenseTrend}
          />

          <ProfitLossExpenseBreakdownChart
            expenseBreakdown={plData?.expenseBreakdown}
            totalExpenses={plData?.totalExpenses}
          />
        </div>

        <ProjectWiseProfitLoss />
      </div>
    </div>
  );
}
