import { Card, CardContent } from "@/components/ui/card";
import type { ComponentType } from "react";

export interface MetricItem {
  title: string;
  value: string;
  delta: string;
  icon: ComponentType<{ className?: string }>;
  tone: "blue" | "emerald" | "rose" | "violet";
}

export function MetricCard({ title, value, delta, icon: Icon, tone }: MetricItem) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  } as const;

  return (
    <Card className="rounded-2xl border-slate-200 p-0 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
      <CardContent className="p-0">
        <div className="flex h-full items-start gap-3 px-4 py-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] text-slate-500">{title}</p>
            <p className="mt-0.5 text-[18px] font-semibold leading-none text-slate-900">
              {value}
            </p>
            <p className="mt-1 text-[12px] font-medium text-emerald-500">
              {delta}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
