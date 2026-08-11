import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CircleDollarSign,
  Percent,
  PiggyBank,
  Wallet,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import { BudgetActualOverviewCard } from "@/components/finance/budget-actual-overview-card";
import { ProjectBudgetSummaryCard } from "@/components/finance/project-budget-summary-card";
import { BudgetActualHeader } from "@/components/finance/budget-actual-header";
import { BudgetActualFilters } from "@/components/finance/budget-actual-filters";
import { BudgetActualTable } from "@/components/finance/budget-actual-table";
import type { MetricItem } from "@/components/finance/budget-actual-metric-card";
import {
  useBudgetVsActualProjectDetailQuery,
  useBudgetVsActualProjectsQuery,
} from "@/modules/financials/financials.hooks";

function formatCurrency(val?: number) {
  if (val === undefined || val === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(val);
}

function formatPercent(val?: number) {
  if (val === undefined || val === null) return "-";
  return `${val.toFixed(2)}%`;
}

export default function BudgetActualProject() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [groupBy, setGroupBy] = useState("Group by: Cost Head");
  const [department, setDepartment] = useState("Department: All");
  const [costCategory, setCostCategory] = useState("Cost Category: All");
  const [dateRange, setDateRange] = useState("24 Mar 2025 - 31 Mar 2025");

  const { data: projectsData } = useBudgetVsActualProjectsQuery();
  const {
    data: detailData,
    isLoading,
    isError,
    refetch,
  } = useBudgetVsActualProjectDetailQuery(projectId);

  const allProjects = projectsData?.data?.projects ?? [];
  const projectInfo = detailData?.data?.project;
  const budgetSummary = detailData?.data?.budgetSummary;
  const costHeads = detailData?.data?.costHeads ?? [];

  const topMetrics: MetricItem[] = useMemo(() => {
    return [
      {
        title: "Budget USD",
        value: formatCurrency(budgetSummary?.totalBudget),
        delta: "+12.5%",
        icon: PiggyBank,
        tone: "blue",
      },
      {
        title: "Actual USD",
        value: formatCurrency(budgetSummary?.totalActual),
        delta: "+12.5%",
        icon: CircleDollarSign,
        tone: "emerald",
      },
      {
        title: "Variance USD",
        value: formatCurrency(budgetSummary?.totalVariance),
        delta: "+12.5%",
        icon: Wallet,
        tone: "rose",
      },
      {
        title: "% of Budget USD",
        value: formatPercent(budgetSummary?.budgetUsedPct),
        delta: "+12.5%",
        icon: Percent,
        tone: "violet",
      },
    ];
  }, [budgetSummary]);

  const displayTitle = projectInfo?.projectName?.trim()
    ? `${projectInfo.projectName} (${projectInfo.projectCode || projectId})`
    : projectInfo?.projectCode || projectId || "Project Details";

  return (
    <div className="min-h-full p-5">
      <div className="mx-auto flex max-w-350 flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/finance/budget-actual")}
            className="gap-2 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 bg-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <TitleSubtitle
          title={`Budget v/s Actual - ${displayTitle}`}
          subtitle="Plan shipments by uploading shipper data, optimizing bundles, and building truckloads."
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm font-medium">Loading project budget vs actual data...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-rose-500 gap-3">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <p className="text-sm font-medium">Failed to load budget details for this project.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <BudgetActualHeader
              topMetrics={topMetrics}
              projectInfo={projectInfo}
              allProjects={allProjects}
              onSelectProject={(selectedId) => navigate(`/finance/budget-actual/${selectedId}`)}
            />

            <BudgetActualFilters
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              department={department}
              setDepartment={setDepartment}
              costCategory={costCategory}
              setCostCategory={setCostCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <BudgetActualTable costHeads={costHeads} summary={budgetSummary} />

              <div className="space-y-4">
                <BudgetActualOverviewCard summary={budgetSummary} />
                <ProjectBudgetSummaryCard summary={budgetSummary} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
