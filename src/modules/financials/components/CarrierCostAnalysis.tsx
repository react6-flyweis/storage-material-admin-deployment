import { Card } from "@/components/ui/card";
import { Truck } from "lucide-react";
import type { CostDistributionByCarrierItem } from "../financials.api";

type Props = {
  data?: CostDistributionByCarrierItem[];
  totalCost?: number;
  isLoading?: boolean;
};

export default function CarrierCostAnalysis({
  data = [],
  totalCost = 0,
  isLoading,
}: Props) {
  return (
    <Card className="p-0 overflow-hidden border border-slate-200 shadow-sm gap-0">
      <div className="px-6 pt-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          Carrier Cost Analysis
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Detailed breakdown by carrier partner
        </p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading carrier cost analysis...
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No carrier cost analysis data available
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {data.map((carrier) => {
              const carrierTotal = carrier.total ?? 0;
              const percentage =
                totalCost > 0
                  ? Math.round((carrierTotal / totalCost) * 100)
                  : 0;

              return (
                <div
                  key={carrier._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-semibold text-slate-900">
                          {carrier.carrierName || "Unknown Carrier"}
                        </h4>
                        <p className="text-xs text-slate-500">YTD Total</p>
                      </div>
                      <div className="rounded-xl bg-blue-100 p-3">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-5 space-y-5">
                      <div className="flex items-end justify-between gap-4">
                        <p className="text-sm text-slate-500">Total Cost</p>
                        <p className="text-2xl font-semibold text-slate-900">
                          ${carrierTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <p className="text-sm text-slate-500">% of Total</p>
                        <p className="text-2xl font-semibold text-blue-600">
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

