import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLeadScoringQuery } from "@/modules/leads/leads.hooks";

export default function LeadScoring() {
  const { data: leadScoringResponse, isLoading } = useLeadScoringQuery(1, 10, { status: "hot" });
  
  const leads = leadScoringResponse?.data?.leads || [];
  const totalLeads = leadScoringResponse?.data?.total || leads.length;

  const getStatusColors = (temperature: string) => {
    const temp = temperature?.toLowerCase() || "";
    if (temp === "hot") return { bg: "bg-red-50", text: "text-red-600" };
    if (temp === "warm") return { bg: "bg-yellow-50", text: "text-yellow-700" };
    if (temp === "cold") return { bg: "bg-blue-50", text: "text-blue-600" };
    return { bg: "bg-gray-50", text: "text-gray-600" };
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between border-b">
        <div>
          <CardTitle>🎯 Lead Scoring</CardTitle>
          <CardDescription>Top performing leads</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
            {totalLeads} total leads
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : leads.length > 0 ? (
          leads.map((lead) => {
            const colors = getStatusColors(lead.temperature);
            return (
              <div
                key={lead.leadId}
                className="flex items-center justify-between bg-gray-50 rounded-md p-4"
              >
                <div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-sm px-2 py-1 rounded capitalize font-medium ${colors.bg} ${colors.text}`}
                    >
                      {lead.temperature || "None"}
                    </span>
                    <div className="font-medium text-gray-900">{lead.customerName || "Unknown"}</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{lead.projectName}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-sm font-semibold">{lead.score || 0}</div>
                  <div className="w-20 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-600 rounded transition-all duration-500"
                      style={{ width: `${Math.min(lead.score || 0, 100)}%` }}
                    />
                  </div>
                  <Link to={`/leads/${lead.leadId}`}>
                    <div className="text-sm text-blue-600 font-medium ml-2 hover:underline">Follow Up</div>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No leads found.
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <Link to="/leads/follow-up/scoring">
          <Button variant="link">
            View All Lead Scores
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
