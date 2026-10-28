import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/empty-state";
import { PieChart } from "lucide-react";

type DealItem = {
  label: string;
  deals: string | number;
  percentLabel?: string;
  colorClass?: string;
  fillPercent?: number | string;
};

type Props = {
  title?: string;
  items?: DealItem[];
  averageDealSize?: string;
  className?: string;
};

type Period = "Today" | "Week" | "Month";

export default function DealSizeDistribution({
  title = "Deal Size Distribution",
  items,
  averageDealSize = "$0",
  className,
}: Props & { period?: Period }) {
  const rows = items ?? [];

  return (
    <Card className={cn("p-5 gap-0", className)}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>

      {rows.length === 0 ? (
        <EmptyState
          title="No deals distributed"
          description="No deal size data recorded for this timeframe."
          icon={PieChart}
        />
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-4 h-4 rounded-md ${
                      r.colorClass ?? "bg-slate-400"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-slate-800">
                    {r.label}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {r.deals}
                  </div>
                  {r.percentLabel ? (
                    <div className="text-xs text-slate-500 mt-1">
                      {r.percentLabel}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${r.colorClass ?? "bg-slate-500"} h-2 rounded-full`}
                  style={{
                    width:
                      typeof r.fillPercent === "number"
                        ? `${r.fillPercent}%`
                        : r.fillPercent,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Deal Size</span>
          <span className="text-lg font-bold">{averageDealSize}</span>
        </div>
      </div>
    </Card>
  );
}
