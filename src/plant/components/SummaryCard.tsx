import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  isLoading: boolean;
  bgClass: string;
  titleTextClass: string;
  icon: React.ReactNode;
}

export default function SummaryCard({
  title,
  value,
  isLoading,
  bgClass,
  titleTextClass,
  icon,
}: SummaryCardProps) {
  if (isLoading) {
    return (
      <Card className={`rounded-xl border-0 shadow-sm overflow-hidden text-white ${bgClass}`}>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-white/20 animate-pulse" />
            <Skeleton className="h-9 w-28 bg-white/20 animate-pulse" />
          </div>
          <Skeleton className="w-12 h-12 bg-white/20 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`rounded-xl border-0 shadow-sm overflow-hidden text-white ${bgClass}`}>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className={`text-[13px] font-medium opacity-90 ${titleTextClass}`}>{title}</p>
          <h2 className="text-[32px] font-bold mt-1 leading-tight">{value}</h2>
        </div>
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
