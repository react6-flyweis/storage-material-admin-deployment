import { useState } from "react";
import { format } from "date-fns";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangeFilter from "@/components/ui/date-range-filter";
import MarginStatCard from "@/components/finance/margin-stat-card";
import MarginTrendOverTimeChart from "@/components/finance/margin-trend-over-time-chart";
import MarginByProjectsChart from "@/components/finance/margin-by-projects-chart";
import MarginProfitLossSummaryTable from "@/components/finance/margin-profit-loss-summary-table";
import {
  useMarginAnalysisQuery,
  useBudgetVsActualProjectsQuery,
} from "@/modules/financials/financials.hooks";
import type { DateRange } from "react-day-picker";

export default function MarginAnalysisPage() {
  // const [company, setCompany] = useState("all-companies");
  // const [currency, setCurrency] = useState("usd");
  const [project, setProject] = useState("all-projects");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { data: projectsRes } = useBudgetVsActualProjectsQuery();
  const projectOptions = projectsRes?.data?.projects || [];

  const startDateStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDateStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const queryParams = {
    projectId: project !== "all-projects" ? project : undefined,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  const { data, isLoading } = useMarginAnalysisQuery(queryParams);
  const marginData = data?.data;

  const isFiltered =
    project !== "all-projects" ||
    Boolean(dateRange?.from || dateRange?.to);

  const handleClearFilters = () => {
    setProject("all-projects");
    setDateRange(undefined);
  };

  const summaryCards = [
    {
      title: "Gross Margin %",
      value: marginData ? `${marginData.grossMarginPct.toFixed(2)}%` : "-",
      growth: "+12.5%",
    },
    {
      title: "Operating Margin",
      value: marginData ? `${marginData.operatingMarginPct.toFixed(2)}%` : "-",
      growth: "+12.5%",
    },
    {
      title: "Net Profit Margin",
      value: marginData ? `${marginData.netProfitMarginPct.toFixed(2)}%` : "-",
      growth: "+12.5%",
    },
    {
      title: "Contribution Margin",
      value: marginData
        ? `${marginData.contributionMarginPct.toFixed(2)}%`
        : "-",
      growth: "+12.5%",
    },
    {
      title: "Avg Selling Price",
      value: marginData
        ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(marginData.avgSellingPrice)
        : "-",
      growth: "+12.5%",
    },
  ];

  return (
    <div className="min-h-full space-y-4 p-5">
      <TitleSubtitle
        title="Margin Analysis"
        subtitle="Plan shipments by uploading shipper data, optimizing bundles, and building truckloads."
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* <Select value={company} onValueChange={setCompany}>
          <SelectTrigger className="h-9 w-auto min-w-36 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-companies">All Companies</SelectItem>
            <SelectItem value="company-1">Company 1</SelectItem>
            <SelectItem value="company-2">Company 2</SelectItem>
          </SelectContent>
        </Select> */}

        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="h-9 w-auto min-w-48 bg-white">
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

        {/* <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="h-9 w-auto min-w-44 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">All Currencies (USD)</SelectItem>
            <SelectItem value="eur">EUR</SelectItem>
            <SelectItem value="gbp">GBP</SelectItem>
          </SelectContent>
        </Select> */}

        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          className="min-w-56 bg-white"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-9 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">
          Loading margin analysis data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <MarginStatCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <MarginTrendOverTimeChart />
            <MarginByProjectsChart />
          </div>

          <MarginProfitLossSummaryTable
            data={marginData?.plSummary}
          />
        </>
      )}
    </div>
  );
}

