import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

import EmptyState from "@/components/ui/empty-state";
import { Landmark } from "lucide-react";

export interface BuildingTypeData {
  type: string;
  value: number;
  color: string;
}

export default function BuildingTypeTaxCard({
  data = [],
}: {
  data?: BuildingTypeData[];
}) {
  const buildingTypeData = data;
  const totalTaxByBuilding = buildingTypeData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <Link to="/sales-tax">
      <Card className="bg-white">
        <CardHeader className="border-b">
          <CardTitle>Tax Distribution by Building Type</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {buildingTypeData.length === 0 ? (
            <EmptyState
              title="No building type data"
              description="No tax distribution records available by building type."
              icon={Landmark}
            />
          ) : (
            <div className="space-y-4">
              {buildingTypeData.map((item) => {
                const percentage =
                  totalTaxByBuilding > 0
                    ? ((item.value / totalTaxByBuilding) * 100).toFixed(0)
                    : "0";
                const width =
                  totalTaxByBuilding > 0
                    ? `${(item.value / totalTaxByBuilding) * 100}%`
                    : "0%";
                return (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-right text-gray-900 font-semibold">
                        ${item.value.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full"
                          style={{ width, backgroundColor: item.color }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <div>{percentage}% of total</div>
                        <div />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
