import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { FinancialOverviewTopCustomer } from "@/modules/financials/financials.api";

type TopCustomersRevenueCardProps = {
  customers?: FinancialOverviewTopCustomer[];
  isLoading?: boolean;
};

export function TopCustomersRevenueCard({
  customers = [],
  isLoading = false,
}: TopCustomersRevenueCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers (Revenue)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y border-slate-300 bg-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">
                  Revenue (USD)
                </th>
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-slate-500">
                    No top customer data available
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const fullName = [c.customer?.firstName, c.customer?.lastName]
                    .filter(Boolean)
                    .join(" ") || "Unknown Customer";

                  return (
                    <tr
                      key={c._id}
                      className="border-b border-slate-300 bg-white"
                    >
                      <td className="px-6 py-4 text-base font-medium text-slate-800">
                        {fullName}
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-slate-500">
                        ${c.revenue?.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

