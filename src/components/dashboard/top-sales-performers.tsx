import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

import EmptyState from "@/components/ui/empty-state";
import { Award } from "lucide-react";

export interface Performer {
  id: string;
  name: string;
  initials: string;
  color: string;
  deals: number;
  rate: number;
  value: string;
  rankIcon?: ReactNode;
}

export default function TopSalesPerformers({
  performers = [],
}: {
  period?: "Today" | "Week" | "Month";
  performers?: Performer[];
}) {
  const teamTotal = performers.reduce(
    (sum, p) => sum + (parseInt(p.value.replace(/[^0-9]/g, "")) || 0),
    0
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Top Sales Performers</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {performers.length === 0 ? (
          <EmptyState
            title="No performers recorded"
            description="No sales performance data recorded for this timeframe."
            icon={Award}
          />
        ) : (
          <>
            {performers.map((p) => (
              <div key={p.id} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${p.color}`}
                >
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-500">
                    {p.deals} deals closed • {p.rate}% rate
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {p.value}
                  </div>

                  <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                    {p.rankIcon}
                    <span className="">#{p.id}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-6 flex justify-between items-center">
              <span className="text-gray-700 font-medium">Team Total</span>
              <span className="text-blue-600 font-bold text-lg">
                ${(teamTotal / 1000).toFixed(2)}K
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
