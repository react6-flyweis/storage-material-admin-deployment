import { CircleDollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface MarginStatCardProps {
  title: string;
  value: string;
  growth?: string;
}

export function MarginStatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="my-1.5 h-8 w-28" />
      <Skeleton className="mt-1 h-4 w-14" />
    </div>
  );
}

export default function MarginStatCard({
  title,
  value,
  growth,
}: MarginStatCardProps) {
  const isNegative = growth?.trim().startsWith("-");

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
      {growth ? (
        <p
          className={`mt-1 text-sm font-medium ${
            isNegative ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {growth}
        </p>
      ) : (
        <div className="mt-1 h-5" />
      )}
    </div>
  );
}
