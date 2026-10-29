import { useState } from "react";
import { Card } from "@/components/ui/card";

import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

import EmptyState from "@/components/ui/empty-state";
import { Filter } from "lucide-react";

type FunnelItem = {
  label: string;
  count: string | number;
  percent?: string;
  dotClass?: string;
  rowBgClass?: string;
};

type SalesFunnelProps = {
  title?: string;
  timeframeOptions?: string[];
  items?: FunnelItem[];
};

export default function SalesFunnel({
  title = "Sales Conversion Funnel",
  items,
}: SalesFunnelProps) {
  const [timeframe, setTimeframe] = useState<string>("month");

  const rows = items ?? [];

  return (
    <Card className="h-full flex flex-col p-5 gap-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-sm border-0", {
              "bg-blue-100 text-primary": timeframe === "month",
            })}
            onClick={() => setTimeframe("month")}
          >
            This Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-sm border-0", {
              "bg-blue-100 text-primary": timeframe === "year",
            })}
            onClick={() => setTimeframe("year")}
          >
            {/* this year  */}
            This year
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <EmptyState
            title="No conversion data"
            description="No sales conversion funnel data recorded for this timeframe."
            icon={Filter}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 justify-start">
          {rows.map((r) => (
            <Link to="/leads" key={r.label}>
              <div
                className={`rounded-lg p-4 flex items-center justify-between ${
                  r.rowBgClass ?? "bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      r.dotClass ?? "bg-slate-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-slate-800">
                    {r.label}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">
                    {r.count}
                  </div>
                  {r.percent ? (
                    <div className="text-xs text-slate-500 mt-1">{r.percent}</div>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
