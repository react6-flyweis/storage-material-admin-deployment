import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FileBarChart,
  Info,
} from "lucide-react";
import StateTaxCard from "@/components/sales-tax/StateTaxCard";
import BuildingTypeTaxCard from "@/components/sales-tax/BuildingTypeTaxCard";
import DetailedTaxReport from "@/components/sales-tax/DetailedTaxReport";
import { cn } from "@/lib/utils";

// Types
// interface StateData {
//   state: string;
//   abbreviation: string;
//   contracts: number;
//   rate: string;
//   sales: number;
//   taxDue: number;
// }

// const stateData: StateData[] = [
//   {
//     state: "Texas",
//     abbreviation: "TX",
//     contracts: 2,
//     rate: "8.25%",
//     sales: 112000,
//     taxDue: 9240,
//   },
//   {
//     state: "Louisiana",
//     abbreviation: "LA",
//     contracts: 1,
//     rate: "9.45%",
//     sales: 28500,
//     taxDue: 2693.25,
//   },
//   {
//     state: "New York",
//     abbreviation: "NE",
//     contracts: 1,
//     rate: "8%",
//     sales: 32000,
//     taxDue: 1920,
//   },
//   {
//     state: "Indiana",
//     abbreviation: "IA",
//     contracts: 1,
//     rate: "5.5%",
//     sales: 38000,
//     taxDue: 2090,
//   },
//   {
//     state: "Oklahoma",
//     abbreviation: "OK",
//     contracts: 1,
//     rate: "4.5%",
//     sales: 41000,
//     taxDue: 1845,
//   },
// ];

export default function SalesTaxReporting() {
  const navigate = useNavigate();
  const [reportPeriod, setReportPeriod] = useState("this-month");
  const [stateFilter, setStateFilter] = useState("all");
  const [reportType, setReportType] = useState("monthly");

  // Sample data
  const totalContracts = 6;
  const totalSales = 251500;
  const totalTaxDue = 17788.25;
  const avgTaxRate = 7.07;

  const stats = [
    {
      title: "Total Contracts",
      value: totalContracts,
      format: (v: number) => v,
      textClass: "text-blue-600",
    },
    {
      title: "Total Sales",
      value: totalSales,
      format: (v: number) => `$${v.toLocaleString()}`,
      textClass: "text-green-600",
    },
    {
      title: "Total Tax Due",
      value: totalTaxDue,
      format: (v: number) => `$${v.toLocaleString()}`,
      textClass: "text-red-600",
    },
    {
      title: "Avg Tax Rate",
      value: avgTaxRate,
      format: (v: number) => `${v}%`,
      textClass: "text-purple-600",
    },
  ];

  const exportOptions = [
    {
      key: "excel",
      title: "Export to Excel",
      desc: "Download detailed spreadsheet",
      icon: FileSpreadsheet,
      colorClass: "border-green-300 hover:border-green-500 hover:bg-green-50",
      iconColorClass: "text-green-600",
    },
    {
      key: "pdf",
      title: "Export to PDF",
      desc: "Generate formatted report",
      icon: FileText,
      colorClass: "border-red-300 hover:border-red-500 hover:bg-red-50",
      iconColorClass: "text-red-600",
    },
    {
      key: "csv",
      title: "Export to CSV",
      desc: "Raw data for analysis",
      icon: FileBarChart,
      colorClass: "border-blue-300 hover:border-blue-500 hover:bg-blue-50",
      iconColorClass: "text-blue-600",
    },
  ];

  return (
    <div className="pr-5 p-5 lg:p-0">
      {/* Header */}
      <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="default"
            size="default"
            onClick={() => navigate('/')}
            className="gap-3 px-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl  text-gray-900">Sales Tax Reporting</h1>
        </div>
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white px-4"
          >
            <Mail className="w-4 h-4" />
            Email Report
          </Button>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className="" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Report Period:</span>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">State Filter:</span>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="tx">Texas</SelectItem>
                <SelectItem value="la">Louisiana</SelectItem>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="in">Indiana</SelectItem>
                <SelectItem value="ok">Oklahoma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Report Type:</span>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Summary</SelectItem>
                <SelectItem value="quarterly">Quarterly Summary</SelectItem>
                <SelectItem value="annual">Annual Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 ">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <Card key={s.title} className="border-0 rounded">
              <div className="text-center">
                <div
                  className={`text-2xl md:text-3xl font-bold ${s.textClass}`}
                >
                  {typeof s.value === "number" ? s.format(s.value) : s.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{s.title}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StateTaxCard />

          <BuildingTypeTaxCard />
        </div>

        {/* Detailed report table */}
        <div className="mt-6">
          <DetailedTaxReport />
        </div>

        {/* Export & Automation Card */}
        <Card className="mt-6 p-5 gap-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Export & Automation
          </h2>

          {/* Export Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {exportOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  className={cn(
                    "w-full border-2 border-dashed rounded-lg p-4 transition-colors",
                    opt.colorClass
                  )}
                >
                  <div className="flex flex-col items-center text-center">
                    <Icon
                      className={cn("w-10 h-10 mb-3", opt.iconColorClass)}
                    />
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {opt.title}
                    </h3>
                    <p className="text-sm text-gray-600">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Automated Reports Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Automated Monthly Reports
                </h4>
                <p className="text-sm text-blue-700">
                  Tax reports are automatically generated and emailed on the
                  last day of each month.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
