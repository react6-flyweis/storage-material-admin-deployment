import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function TaxSummaryCard() {
  const totalTax = 0;
  const totalSales = 0;
  const avgRate = "0.0%";
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
    <Card className="bg-white">
      <CardHeader className="border-b">
        <CardTitle>Tax Summary</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-4">
          {summaries.map((s) => (
            <div
              key={s.id}
              className={`${s.bg} p-2 rounded flex items-center justify-between`}
            >
              <div>
                <div className="text-sm text-gray-500">{s.title}</div>
                <div className={`text-2xl font-bold ${s.textClass}`}>
                  {s.format === "currency"
                    ? s.precision !== undefined
                      ? `$${s.value.toLocaleString(undefined, {
                          minimumFractionDigits: s.precision,
                          maximumFractionDigits: s.precision,
                        })}`
                      : `$${s.value.toLocaleString()}`
                    : s.value}
                </div>
              </div>
              <div className={`${s.textClass} text-xl`}>{s.icon}</div>
            </div>
          ))}

          <div className="mt-2">
            <Button
              onClick={() => navigate("/sales-tax")}
              className="w-full  bg-linear-to-r from-blue-600 from-70% to-blue-800  font-medium"
            >
              View Full Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
