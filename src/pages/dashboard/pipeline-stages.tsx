import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { ManageStagesDialog } from "@/components/dashboard/manage-stages-dialog";

interface Lead {
  id: string;
  company: string;
  value: string;
  timeAgo: string;
}

interface Stage {
  name: string;
  count: number;
  leads: Lead[];
  color: string;
}

export default function PipelineStages() {
  const navigate = useNavigate();

  const stages: Stage[] = [
    {
      name: "Qualified",
      count: 42,
      color: "bg-blue-100",
      leads: [
        {
          id: "1",
          company: "Johnson Manufacturing",
          value: "$85K",
          timeAgo: "2 days ago",
        },
        {
          id: "2",
          company: "ABC Steel Works",
          value: "$120K",
          timeAgo: "4 days ago",
        },
        {
          id: "3",
          company: "Metro Construction",
          value: "$65K",
          timeAgo: "1 week ago",
        },
      ],
    },
    {
      name: "Proposal",
      count: 28,
      color: "bg-yellow-100",
      leads: [
        {
          id: "4",
          company: "Industrial Solutions",
          value: "$200K",
          timeAgo: "1 day ago",
        },
        {
          id: "5",
          company: "BuildTech Corp",
          value: "$150K",
          timeAgo: "3 days ago",
        },
      ],
    },
    {
      name: "Negotiation",
      count: 15,
      color: "bg-green-100",
      leads: [
        {
          id: "6",
          company: "Global Industries",
          value: "$300K",
          timeAgo: "Today",
        },
        {
          id: "7",
          company: "Steel Dynamics",
          value: "$180K",
          timeAgo: "2 days ago",
        },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            size="default"
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Active Pipeline Stages
          </h1>
        </div>
        <ManageStagesDialog stages={stages} />
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage) => (
          <div key={stage.name} className={cn("space-y-2 p-2", stage.color)}>
            {/* Stage Header */}
            <div
              className={` rounded-lg p-2 flex items-center justify-between`}
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {stage.name}
              </h2>
              <span className="text-sm font-medium text-gray-700">
                {stage.count} leads
              </span>
            </div>

            {/* Lead Cards */}
            <div className="space-y-2">
              {stage.leads.map((lead) => (
                <Card
                  key={lead.id}
                  className="p-3 gap-1 rounded border-0! hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900 ">{lead.company}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="font-semibold">{lead.value}</span>
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      {lead.timeAgo}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
