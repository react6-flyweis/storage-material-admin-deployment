import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

import EmptyState from "@/components/ui/empty-state";
import { GitBranch } from "lucide-react";

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  color: string;
  deals: {
    company: string;
    value: string;
    time: string;
  }[];
}

type Period = "Today" | "Week" | "Month";

export default function ActivePipelineStages({
  stages = [],
}: {
  period?: Period;
  stages?: PipelineStage[];
}) {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center border-b">
        <CardTitle>Active Pipeline Stages</CardTitle>
        <Link to="/pipeline-stages" className="self-start">
          <Button variant="link">Manage Stages</Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-6">
        {stages.length === 0 ? (
          <EmptyState
            title="No active pipeline stages"
            description="There are currently no deals in active pipeline stages."
            icon={GitBranch}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`${stage.color} rounded-lg p-4 space-y-3`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stage.name}
                  </h3>
                  <span className="text-blue-600 font-medium">
                    {stage.count} leads
                  </span>
                </div>

                <div className="space-y-3">
                  {stage.deals.map((deal, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">
                        {deal.company}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {deal.value} • {deal.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
