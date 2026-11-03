import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import type { TaxSummary } from "@/modules/dashboard/dashboard.types";

function formatUSD(amount?: number, precision?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precision ?? 0,
    maximumFractionDigits: precision ?? 0,
  }).format(amount ?? 0);
}

export default function TaxSummaryCard({ data }: { data?: TaxSummary }) {
  const totalTax = data?.totalTaxDue ?? 0;
  const totalSales = data?.totalSales ?? 0;
  const avgRate = data?.avgTaxRate !== undefined ? `${data.avgTaxRate}%` : "0.0%";

  const summaries = [
    {
      id: "tax",
      title: "Total Tax Due",
      value: totalTax,
      format: "currency",
      bg: "bg-red-50",
      textClass: "text-red-600",
      icon: "📈",
      precision: 2,
    },
    {
      id: "sales",
      title: "Total Sales",
      value: totalSales,
      format: "currency",
      bg: "bg-green-50",
      textClass: "text-green-600",
      icon: "💲",
    },
    {
      id: "rate",
      title: "Avg Tax Rates",
      value: avgRate,
      format: "raw",
      bg: "bg-blue-50",
      textClass: "text-blue-600",
      icon: "%",
    },
  ];

  const navigate = useNavigate();

  return (
    <Card className="bg-white h-full flex flex-col">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <CardTitle>Tax Summary</CardTitle>
        <Link to="/sales-tax">
          <Button variant="link" size="sm">
            View
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-6 px-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {summaries.map((s) => (
            <div
              key={s.id}
              className={`${s.bg} p-2.5 rounded-md flex items-center justify-between`}
            >
              <div>
                <div className="text-sm text-gray-500">{s.title}</div>
                <div className={`text-2xl font-bold ${s.textClass}`}>
                  {s.format === "currency"
                    ? typeof s.value === "number"
                      ? formatUSD(s.value, s.precision)
                      : s.value
                    : s.value}
                </div>
              </div>
              <div className={`${s.textClass} text-xl`}>{s.icon}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-2">
          <Button
            onClick={() => navigate("/sales-tax")}
            className="w-full bg-linear-to-r from-blue-600 from-70% to-blue-800 font-medium"
          >
            View Full Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
