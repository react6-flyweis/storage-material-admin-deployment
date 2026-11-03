import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


import EmptyState from "@/components/ui/empty-state";
import { ArrowRightLeft } from "lucide-react";

type Item = {
  label: string;
  percent: number;
  subtitle?: string;
  colorClass?: string;
  bgClass?: string;
  iconSrc?: string;
};
type Period = "Today" | "Week" | "Month";

export default function LeadConversion({
  className,
  title = "Lead Conversion",
  items = [],
}: {
  className?: string;
  title?: string;
  period?: Period;
  items?: Item[];
}) {
  const rows = items;

  return (
    <Card className={cn("w-full p-6 gap-0 ", className)}>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-6">
        Stages of deals and conversions
      </p>

      {rows.length === 0 ? (
        <EmptyState
          title="No conversion stages"
          description="No deal stage conversion metrics available for this period."
          icon={ArrowRightLeft}
        />
      ) : (
        <div className="space-y-4 flex flex-col">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "w-12 h-12 flex items-center justify-center  shadow",
                  r.bgClass ?? "bg-slate-100"
                )}
              >
                {r.iconSrc ? (
                  <img
                    src={r.iconSrc}
                    alt={r.label}
                    className={cn("size-6", "text-slate-500")}
                  />
                ) : null}
              </div>

              {/* Bar + label */}
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={cn(
                          r.colorClass ?? "bg-slate-400",
                          "h-2 rounded-full"
                        )}
                        style={{ width: `${r.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="ml-4 w-16 text-right">
                    <span className="text-sm font-semibold text-slate-700">
                      {r.percent}%
                    </span>
                  </div>
                </div>

                <div className="">
                  <span className="text-sm text-slate-500">{r.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
