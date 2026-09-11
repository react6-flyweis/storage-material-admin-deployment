import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export type ProfitLossRow = {
  label: string;
  thisMonth: string;
  lastMonth: string;
  change: string;
  ytd: string;
  negative?: boolean;
};

type ProfitLossSummaryCardProps = {
  rows?: ProfitLossRow[];
  isLoading?: boolean;
};

export function ProfitLossSummaryCard({ rows = [], isLoading = false }: ProfitLossSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit &amp; Loss Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-max w-full border-collapse">
              <thead>
                <tr className="border-y border-slate-300 bg-slate-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">
                    Particulars
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">
                    Amount (USD)
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-slate-500">
                      No profit &amp; loss summary available
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-slate-300 bg-white"
                    >
                      <td className="px-6 py-4 text-base font-medium text-slate-800">
                        {row.label}
                      </td>
                      <td
                        className={`px-6 py-4 text-base font-normal ${
                          row.negative ? "text-red-500" : "text-slate-700"
                        }`}
                      >
                        {row.thisMonth}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

