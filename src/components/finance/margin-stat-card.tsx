import { CircleDollarSign } from "lucide-react";

export interface MarginStatCardProps {
  title: string;
  value: string;
  growth: string;
}

export default function MarginStatCard({
  title,
  value,
  growth,
}: MarginStatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <CircleDollarSign className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
      </div>
      <p className="text-[30px] font-semibold leading-none tracking-tight text-slate-900 md:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-emerald-600">{growth}</p>
    </div>
  );
}
