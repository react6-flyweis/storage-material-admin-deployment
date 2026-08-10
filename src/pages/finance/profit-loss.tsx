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
import { useProfitLossQuery } from "@/modules/financials/financials.hooks";
import ProjectWiseProfitLoss from "@/modules/financials/components/ProjectWiseProfitLoss";
import IncomeVsExpenseTrendChart from "@/modules/financials/components/IncomeVsExpenseTrendChart";
import ProfitLossExpenseBreakdownChart from "@/modules/financials/components/ProfitLossExpenseBreakdownChart";
import ProfitLossSummaryTable, {
  type SummaryRow,
  type SummaryTotalsRow,
} from "@/modules/financials/components/ProfitLossSummaryTable";

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

const calcVariance = (thisVal?: number, lastVal?: number) => {
  const current = thisVal ?? 0;
  const previous = lastVal ?? 0;
  const diff = current - previous;
  const pct = previous !== 0 ? (diff / Math.abs(previous)) * 100 : current !== 0 ? 100 : 0;
  return {
    diff: formatCurrency(diff),
    pct: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
  };
};

export default function ProfitLossPage() {
  const [project, setProject] = useState("all-projects");

  const { data: response, isLoading, isError, error, refetch } = useProfitLossQuery();
  const plData = response?.data;

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

  const thisMonthSummary = plData?.summary?.thisMonth;
  const lastMonthSummary = plData?.summary?.lastMonth;
  const incomeBreakdown = plData?.incomeBreakdown;
  const expenseBreakdown = plData?.expenseBreakdown;

  // Income summary rows
  const projectRevenueVar = calcVariance(incomeBreakdown?.projectRevenue, undefined);
  const otherIncomeVar = calcVariance(incomeBreakdown?.otherIncome, undefined);
  const totalIncomeVar = calcVariance(
    thisMonthSummary?.totalRevenue ?? incomeBreakdown?.totalIncome,
    lastMonthSummary?.totalRevenue
  );

  // Expense summary rows
  const directCostsVar = calcVariance(expenseBreakdown?.directCosts, undefined);
  const indirectCostsVar = calcVariance(expenseBreakdown?.indirectCosts, undefined);
  const adminExpensesVar = calcVariance(expenseBreakdown?.administrativeExpenses, undefined);
  const otherExpensesVar = calcVariance(expenseBreakdown?.otherExpenses, undefined);
  const totalExpensesVar = calcVariance(
    thisMonthSummary?.totalExpenses ?? expenseBreakdown?.totalExpenses,
    lastMonthSummary?.totalExpenses
  );

  // Operating & Net Profit rows
  const grossProfitVar = calcVariance(thisMonthSummary?.grossProfit, lastMonthSummary?.grossProfit);
  const netProfitVar = calcVariance(thisMonthSummary?.netProfit ?? plData?.netProfit, undefined);

  const summaryIncomeRows: SummaryRow[] = [
    {
      label: "Project Revenue",
      thisPeriod: formatCurrency(incomeBreakdown?.projectRevenue),
      lastPeriod: "-",
      varianceAmount: projectRevenueVar.diff,
      variancePercent: projectRevenueVar.pct,
      tone: "income",
    },
    {
      label: "Other Income",
      thisPeriod: formatCurrency(incomeBreakdown?.otherIncome),
      lastPeriod: "-",
      varianceAmount: otherIncomeVar.diff,
      variancePercent: otherIncomeVar.pct,
      tone: "income",
    },
    {
      label: "Total Income (A)",
      thisPeriod: formatCurrency(thisMonthSummary?.totalRevenue ?? incomeBreakdown?.totalIncome),
      lastPeriod: formatCurrency(lastMonthSummary?.totalRevenue),
      varianceAmount: totalIncomeVar.diff,
      variancePercent: totalIncomeVar.pct,
      tone: "total",
    },
  ];

  const summaryExpenseRows: SummaryRow[] = [
    {
      label: "Direct Costs",
      thisPeriod: formatCurrency(expenseBreakdown?.directCosts),
      lastPeriod: "-",
      varianceAmount: directCostsVar.diff,
      variancePercent: directCostsVar.pct,
      tone: "expense",
    },
    {
      label: "Indirect Costs",
      thisPeriod: formatCurrency(expenseBreakdown?.indirectCosts),
      lastPeriod: "-",
      varianceAmount: indirectCostsVar.diff,
      variancePercent: indirectCostsVar.pct,
      tone: "expense",
    },
    {
      label: "Administrative Expenses",
      thisPeriod: formatCurrency(expenseBreakdown?.administrativeExpenses),
      lastPeriod: "-",
      varianceAmount: adminExpensesVar.diff,
      variancePercent: adminExpensesVar.pct,
      tone: "expense",
    },
    {
      label: "Other Expenses",
      thisPeriod: formatCurrency(expenseBreakdown?.otherExpenses),
      lastPeriod: "-",
      varianceAmount: otherExpensesVar.diff,
      variancePercent: otherExpensesVar.pct,
      tone: "expense",
    },
  ];

  const totalExpensesRow: SummaryTotalsRow = {
    label: "Total Expenses (B)",
    thisPeriod: formatCurrency(thisMonthSummary?.totalExpenses ?? expenseBreakdown?.totalExpenses),
    lastPeriod: formatCurrency(lastMonthSummary?.totalExpenses),
    varianceAmount: totalExpensesVar.diff,
    variancePercent: totalExpensesVar.pct,
    rowTone: "expense-total",
  };

  const grossProfitRow: SummaryTotalsRow = {
    label: "Gross Profit (A-B)",
    thisPeriod: formatCurrency(thisMonthSummary?.grossProfit ?? plData?.grossProfit),
    lastPeriod: formatCurrency(lastMonthSummary?.grossProfit),
    varianceAmount: grossProfitVar.diff,
    variancePercent: grossProfitVar.pct,
    rowTone: "gross-profit",
  };

  const netProfitRow: SummaryTotalsRow = {
    label: "Net Profit",
    thisPeriod: formatCurrency(thisMonthSummary?.netProfit ?? plData?.netProfit),
    lastPeriod: "-",
    varianceAmount: netProfitVar.diff,
    variancePercent: netProfitVar.pct,
    rowTone: "net-profit",
  };

  return (
    <div className="min-h-full bg-[#e8efff] px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-400 flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <TitleSubtitle
            title="Profit & Loss Statement"
            subtitle="Overview of income, expenses and profitability for your projects."
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-lg border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <CalendarRange className="mr-2 h-4 w-4" />
              This Month
            </Button>

            <Select value={project} onValueChange={setProject}>
              <SelectTrigger className="h-9 w-40 rounded-lg border-slate-200 bg-white text-sm text-slate-700 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                <SelectItem value="project-1">Project 1</SelectItem>
                <SelectItem value="project-2">Project 2</SelectItem>
                <SelectItem value="project-3">Project 3</SelectItem>
              </SelectContent>
            </Select>

            <Button className="h-9 rounded-lg bg-[#1976d2] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1667b8]">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <StatCardV2 key={card.title} {...card} />
          ))}
        </div>

        <ProfitLossSummaryTable
          incomeRows={summaryIncomeRows}
          expenseRows={summaryExpenseRows}
          totalExpensesRow={totalExpensesRow}
          grossProfitRow={grossProfitRow}
          netProfitRow={netProfitRow}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <IncomeVsExpenseTrendChart
            totalRevenue={plData?.totalRevenue}
            totalExpenses={plData?.totalExpenses}
          />

          <ProfitLossExpenseBreakdownChart
            expenseBreakdown={expenseBreakdown}
            totalExpenses={plData?.totalExpenses}
          />
        </div>

        <ProjectWiseProfitLoss />
      </div>
    </div>
  );
}
