import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import type { FinancialOverviewProfitabilityBreakdown } from "@/modules/financials/financials.api";

type ProfitabilityChartProps = {
  data?: FinancialOverviewProfitabilityBreakdown;
  isLoading?: boolean;
};

export function ProfitabilityChart({ data, isLoading = false }: ProfitabilityChartProps) {
  const cogs = data?.costOfGoodsSold || 0;
  const opex = data?.operatingExpenses || 0;
  const otherIncome = data?.otherIncome || 0;
  const netProfit = data?.netProfit || 0;

  const total = Math.max(cogs + opex + otherIncome + netProfit, 1);

  const getPercentage = (val: number) => Math.round((val / total) * 100);

  const profitabilityData = [
    {
      name: "Cost of goods sold",
      value: cogs,
      percentage: getPercentage(cogs),
      amount: `$${cogs.toLocaleString()}`,
      color: "#0f5f75",
    },
    {
      name: "Operating Expenses",
      value: opex,
      percentage: getPercentage(opex),
      amount: `$${opex.toLocaleString()}`,
      color: "#f97316",
    },
    {
      name: "Other Income",
      value: otherIncome,
      percentage: getPercentage(otherIncome),
      amount: `$${otherIncome.toLocaleString()}`,
      color: "#facc15",
    },
    {
      name: "Net Profit",
      value: netProfit,
      percentage: getPercentage(netProfit),
      amount: `$${netProfit.toLocaleString()}`,
      color: "#22c55e",
    },
  ];

  return (
    <Card className="rounded">
      <CardHeader className="border-b px-4 items-center">
        <CardTitle className="text-sm">Profitability (Net Profit)</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            <CalendarIcon className="size-3" />
            This Month
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-52 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profitabilityData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {profitabilityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 text-xs">
              {profitabilityData.map((item) => (
                <div key={item.name} className="space-y-0.5">
                  <p className="inline-flex items-center gap-1 text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </p>
                  <p className="text-slate-500">
                    {item.amount} ({item.percentage}%)
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

