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
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row justify-between items-center border-b">
        <CardTitle>Active Pipeline Stages</CardTitle>
        <Link to="/pipeline-stages">
          <Button variant="link" size="sm">Manage Stages</Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-6 flex-1 flex flex-col">
        {stages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <EmptyState
              title="No active pipeline stages"
              description="There are currently no deals in active pipeline stages."
              icon={GitBranch}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-stretch">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`${stage.color} rounded-lg p-4 flex flex-col h-full`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    {stage.name}
                  </h3>
                  <span className="text-xs text-blue-600 font-medium">
                    {stage.count} leads
                  </span>
                </div>

                <div className="space-y-3 flex-1 flex flex-col">
                  {stage.deals.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center min-h-[100px] rounded-md border border-dashed border-gray-300/70 bg-white/40">
                      <p className="text-xs text-gray-400 font-medium">No deals</p>
                    </div>
                  ) : (
                    stage.deals.map((deal, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 shadow-xs hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                      >
                        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {deal.company}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {deal.value} • {deal.time}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
