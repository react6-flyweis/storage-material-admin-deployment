import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router";

import EmptyState from "@/components/ui/empty-state";
import { HardHat } from "lucide-react";

export interface Project {
  id: string;
  name: string;
  projectId: string;
  manager: string;
  progress: number;
  status: "On Track" | "Delayed" | "Starting";
}

export default function ConstructionProgressOverview({
  projects = [],
}: {
  period?: "Today" | "Week" | "Month";
  projects?: Project[];
}) {

  //   const getStatusVariant = (status: string) => {
  //     switch (status) {
  //       case "On Track":
  //         return "default";
  //       case "Delayed":
  //         return "destructive";
  //       case "Starting":
  //         return "secondary";
  //       default:
  //         return "default";
  //     }
  //   };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-100 text-green-700";
      case "Delayed":
        return "bg-red-100 text-red-700";
      case "Starting":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Construction progress overview</CardTitle>
          <Link to="/construction">
            <Button variant="link" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {projects.length === 0 ? (
          <EmptyState
            title="No construction projects"
            description="No active construction progress records available."
            icon={HardHat}
          />
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className=" font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    {project.projectId} • {project.manager}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 min-w-12 text-right">
                  {project.progress}%
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
