import { useState } from "react";
import TitleSubtitle from "@/components/TitleSubtitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { CircleDollarSign } from "lucide-react";
import MarginTrendOverTimeChart from "@/components/finance/margin-trend-over-time-chart";
import MarginByProjectsChart from "@/components/finance/margin-by-projects-chart";
import MarginProfitLossSummaryTable, {
  type ProfitLossData,
} from "@/components/finance/margin-profit-loss-summary-table";
import type { DateRange } from "react-day-picker";

const summaryCards = [
  { title: "Gross Margin %", value: "24.35%", growth: "+12.5%" },
  { title: "Operating Margin", value: "18.71%", growth: "+12.5%" },
  { title: "Net Profit Margin", value: "14.82%", growth: "+12.5%" },
  { title: "Contribution Margin", value: "28.90%", growth: "+12.5%" },
  { title: "Avg Selling Price", value: "$4,900.00", growth: "+12.5%" },
];

const marginTrendData = [
  { month: "Jan", gross: 8, operating: 9, net: 6, contribution: 5 },
  { month: "Feb", gross: 16, operating: 25, net: 22, contribution: 18 },
  { month: "Mar", gross: 16, operating: 25, net: 22, contribution: 18 },
  { month: "Apr", gross: 14, operating: 20, net: 17, contribution: 14 },
  { month: "May", gross: 17, operating: 29, net: 26, contribution: 21 },
  { month: "Jun", gross: 17, operating: 29, net: 26, contribution: 21 },
  { month: "Jul", gross: 20, operating: 38, net: 35, contribution: 26 },
];

const marginByProjectsData = [
  { name: "Project A", gross: 76, operating: 42, net: 93, contribution: 23 },
  { name: "Project B", gross: 76, operating: 42, net: 93, contribution: 23 },
  { name: "Project C", gross: 76, operating: 42, net: 93, contribution: 23 },
  { name: "Project D", gross: 76, operating: 42, net: 93, contribution: 23 },
  { name: "Project E", gross: 76, operating: 42, net: 93, contribution: 23 },
];

const profitLossData: ProfitLossData[] = [
  {
    id: "1",
    projectName: "Project A",
    category: "",
    sales: "$1,245,360.00",
    cogs: "$1,050,180.00",
    grossProfit: "$5,842,190.00",
    grossMargin1: "18.66%",
    grossMargin2: "18.66%",
    grossMargin3: "18.66%",
    grossMargin4: "18.66%",
  },
  {
    id: "2",
    projectName: "Project B",
    category: "",
    sales: "$1,245,360.00",
    cogs: "$1,050,180.00",
    grossProfit: "$5,842,190.00",
    grossMargin1: "18.66%",
    grossMargin2: "18.66%",
    grossMargin3: "18.66%",
    grossMargin4: "18.66%",
  },
  {
    id: "3",
    projectName: "Project C",
    category: "",
    sales: "$1,245,360.00",
    cogs: "$1,050,180.00",
    grossProfit: "$5,842,190.00",
    grossMargin1: "18.66%",
    grossMargin2: "18.66%",
    grossMargin3: "18.66%",
    grossMargin4: "18.66%",
  },
  {
    id: "4",
    projectName: "Project D",
    category: "",
    sales: "$1,245,360.00",
    cogs: "$1,050,180.00",
    grossProfit: "$5,842,190.00",
    grossMargin1: "18.66%",
    grossMargin2: "18.66%",
    grossMargin3: "18.66%",
    grossMargin4: "18.66%",
  },
  {
    id: "5",
    projectName: "Project E",
    category: "",
    sales: "$1,245,360.00",
    cogs: "$1,050,180.00",
    grossProfit: "$5,842,190.00",
    grossMargin1: "18.66%",
    grossMargin2: "18.66%",
    grossMargin3: "18.66%",
    grossMargin4: "18.66%",
  },
];

function MarginStatCard({
  title,
  value,
  growth,
}: {
  title: string;
  value: string;
  growth: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <CircleDollarSign className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
      </div>
      <p className="text-[30px] font-semibold leading-none tracking-tight text-slate-900 md:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-emerald-600">{growth}</p>
    </div>
  );
}

export default function MarginAnalysisPage() {
  const [company, setCompany] = useState("all-companies");
  const [project, setProject] = useState("all-projects");
  const [currency, setCurrency] = useState("usd");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <div className="min-h-full space-y-4 p-5">
      <TitleSubtitle
        title="Margin Analysis"
        subtitle="Plan shipments by uploading shipper data, optimizing bundles, and building truckloads."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger className="h-9 w-auto min-w-36 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-companies">All Companies</SelectItem>
            <SelectItem value="company-1">Company 1</SelectItem>
            <SelectItem value="company-2">Company 2</SelectItem>
          </SelectContent>
        </Select>

        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="h-9 w-auto min-w-36 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-projects">All Projects</SelectItem>
            <SelectItem value="project-a">Project A</SelectItem>
            <SelectItem value="project-b">Project B</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="h-9 w-auto min-w-44 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">All Currencies (USD)</SelectItem>
            <SelectItem value="eur">EUR</SelectItem>
            <SelectItem value="gbp">GBP</SelectItem>
          </SelectContent>
        </Select>

        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          className="min-w-56 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <MarginStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <MarginTrendOverTimeChart data={marginTrendData} />
        <MarginByProjectsChart data={marginByProjectsData} />
      </div>

      <MarginProfitLossSummaryTable data={profitLossData} />
    </div>
  );
}
