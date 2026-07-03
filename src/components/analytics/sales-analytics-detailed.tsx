import { Download } from "lucide-react";
import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  setActiveReport: (v: string | null) => void;
  analyticsData?: any;
  period?: string;
  setPeriod?: (v: string) => void;
}

const SalesAnalyticsDetailed = forwardRef<HTMLDivElement, Props>(
  ({ setActiveReport, analyticsData, period, setPeriod }, ref) => {
    const [successOpen, setSuccessOpen] = useState(false);
    return (
      <div ref={ref} className="bg-white rounded-lg shadow p-6 w-full min-h-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold">
            Sales Analytics - Detailed View
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground mr-2">
                Project Status
              </label>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in-pipeline">In Pipeline</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground mr-2">
                Timeframe
              </label>
              <Select value={period || "monthly"} onValueChange={(val) => setPeriod && setPeriod(val)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 ">
          <div className="flex-1 bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              ${analyticsData?.detailedSummary?.totalRevenue?.toLocaleString() || "331,000"}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="flex-1 bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">
              {analyticsData?.detailedSummary?.totalLeads || "828"}
            </div>
            <div className="text-sm text-muted-foreground">Total Leads</div>
          </div>
          <div className="flex-1 bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {analyticsData?.detailedSummary?.conversions || "205"}
            </div>
            <div className="text-sm text-muted-foreground">Conversions</div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="min-w-[720px] w-full table-fixed">
            <thead className="text-sm text-muted-foreground border-y">
              <tr className="text-left">
                <th className="py-3 w-1/4">Month</th>
                <th className="py-3 w-1/4">Revenue</th>
                <th className="py-3 w-1/4">Leads</th>
                <th className="py-3 w-1/4">Conversions</th>
                <th className="py-3 w-1/4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {analyticsData?.monthlyBreakdown ? (
                analyticsData.monthlyBreakdown.map((row: any) => (
                  <tr key={row.monthKey || row.month} className="border-b">
                    <td className="py-4 font-medium">{row.month}</td>
                    <td className="py-4">${row.revenue?.toLocaleString()}</td>
                    <td className="py-4">{row.leads}</td>
                    <td className="py-4">{row.conversions}</td>
                    <td className="py-4">{row.conversionRate}%</td>
                  </tr>
                ))
              ) : (
                [
                  ["Jan", "$45,000", "120", "28", "23.3%"],
                  ["Feb", "$52,000", "135", "32", "23.7%"],
                  ["Mar", "$48,000", "128", "30", "23.4%"],
                  ["Apr", "$61,000", "145", "38", "26.2%"],
                  ["May", "$58,000", "142", "35", "24.6%"],
                  ["Jun", "$67,000", "158", "42", "26.6%"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b">
                    <td className="py-4 font-medium">{row[0]}</td>
                    <td className="py-4">{row[1]}</td>
                    <td className="py-4">{row[2]}</td>
                    <td className="py-4">{row[3]}</td>
                    <td className="py-4">{row[4]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setSuccessOpen(true)}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setActiveReport(null)}>Close</Button>
        </div>
        <SuccessDialog
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Report exported"
          okLabel="Great"
        />
      </div>
    );
  }
);

export default SalesAnalyticsDetailed;
