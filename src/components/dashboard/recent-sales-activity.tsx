import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router";
import EmptyState from "@/components/ui/empty-state";
import { Activity } from "lucide-react";

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export default function RecentSalesActivity({
  items = [],
}: {
  period?: "Today" | "Week" | "Month";
  items?: ActivityItem[];
}) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex flex-row justify-between items-center">
        <CardTitle>Recent Sales Activity</CardTitle>
        <Link to="/employees/audit-log">
          <Button variant="link" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 pt-6 flex-1 flex flex-col justify-start">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <EmptyState
              title="No sales activity"
              description="No recent sales activity has been logged for this period."
              icon={Activity}
            />
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="flex items-start gap-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                {it.icon ?? <Activity className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 font-medium text-sm">{it.title}</div>
                <div className="text-xs text-gray-500 mt-1">{it.subtitle}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
