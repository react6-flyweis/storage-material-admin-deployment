import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router";
import EmptyState from "@/components/ui/empty-state";
import { Handshake } from "lucide-react";

export interface ClosedDeal {
  id: string;
  company: string;
  value: string;
  closedTime: string;
}

type Period = "Today" | "Week" | "Month";

export default function RecentClosedDeals({
  deals = [],
}: {
  period?: Period;
  deals?: ClosedDeal[];
}) {
  const closedDeals = deals;

  const totalThisWeek = closedDeals.reduce((sum, deal) => {
    const value = parseInt(deal.value.replace(/[^0-9]/g, "")) || 0;
    return sum + value;
  }, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <CardTitle>Recent Closed Deals</CardTitle>
        <Link to="/leads">
          <Button variant="link" size="sm">
            View
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-6 flex-1 flex flex-col justify-between">
        {closedDeals.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <EmptyState
              title="No closed deals"
              description="No deals have been closed in this timeframe."
              icon={Handshake}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {closedDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center gap-4 hover:bg-gray-50 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-0.5 truncate text-sm">
                      {deal.company}
                    </h4>
                    <p className="text-xs text-gray-500">{deal.closedTime}</p>
                  </div>
                  <div className="shrink-0">
                    <span className="text-base font-semibold text-green-600">
                      {deal.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium text-sm">Total This Week</span>
                <span className="text-xl font-bold text-green-600">
                  ${(totalThisWeek / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
