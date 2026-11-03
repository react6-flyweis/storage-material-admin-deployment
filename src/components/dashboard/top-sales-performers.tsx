import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
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
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex flex-row justify-between items-center">
        <CardTitle>Top Sales Performers</CardTitle>
        <Link to="/employees">
          <Button variant="link" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-6 flex-1 flex flex-col justify-between">
        {performers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <EmptyState
              title="No performers recorded"
              description="No sales performance data recorded for this timeframe."
              icon={Award}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {performers.map((p) => (
                <div key={p.id} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 font-medium ${p.color}`}
                  >
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p.deals} deals closed • {p.rate}% rate
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-semibold text-green-600">
                      {p.value}
                    </div>

                    <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                      {p.rankIcon}
                      <span>#{p.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-6 flex justify-between items-center">
              <span className="text-gray-700 font-medium text-sm">Team Total</span>
              <span className="text-blue-600 font-bold text-base">
                ${(teamTotal / 1000).toFixed(2)}K
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
