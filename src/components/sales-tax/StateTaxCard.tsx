import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router";

import EmptyState from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

export interface StateData {
  state: string;
  abbreviation: string;
  contracts: number;
  rate: string;
  sales: number;
  taxDue: number;
}

export default function StateTaxCard({
  data = [],
}: {
  data?: StateData[];
}) {
  const stateData = data;

  return (
    <Link to="/sales-tax">
      <Card className="bg-white">
        <CardHeader className=" border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Tax Due by State
          </h2>
        </CardHeader>
        <CardContent className="pt-6">
          {stateData.length === 0 ? (
            <EmptyState
              title="No state tax records"
              description="No tax liability records available by state."
              icon={Receipt}
            />
          ) : (
            <div className="space-y-4">
              {stateData.map((state) => (
                <div
                  key={state.abbreviation}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {state.abbreviation}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {state.contracts} contract{state.contracts > 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        {state.state} ({state.rate} rate)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-600">
                      ${state.taxDue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${state.sales.toLocaleString()} sales
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
