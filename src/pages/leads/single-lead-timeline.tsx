import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useGetLeadTimelineQuery } from "@/modules/leads/leads.hooks";
import { type TimelineActivity } from "@/modules/leads/leads.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, UserCheck, CheckCircle2, UserPlus, ClipboardList, Activity } from "lucide-react";



export default function SingleLeadTimeline() {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const leadIdSafe = leadId || "";
  
  const { data: timelineData, isLoading } = useGetLeadTimelineQuery(leadIdSafe, {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const activities = timelineData?.data?.timeline || [];
  
  // Mock data - replace with actual data from API when available
  const leadName = "Sarah Johnson"; // Can be fetched from lead details if needed

  const formatActionName = (action: string) => {
    return action.replace("lead.", "").split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "lead.lifecycle_updated":
        return <RefreshCw className="h-5 w-5 text-white" />;
      case "lead.handed_to_sales":
        return <UserCheck className="h-5 w-5 text-white" />;
      case "lead.assigned.auto":
        return <UserPlus className="h-5 w-5 text-white" />;
      case "lead.quote_ready":
        return <ClipboardList className="h-5 w-5 text-white" />;
      case "lead.created":
        return <CheckCircle2 className="h-5 w-5 text-white" />;
      default:
        return <Activity className="h-5 w-5 text-white" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "lead.lifecycle_updated":
        return "bg-blue-500";
      case "lead.handed_to_sales":
        return "bg-purple-500";
      case "lead.assigned.auto":
        return "bg-yellow-500";
      case "lead.quote_ready":
        return "bg-orange-500";
      case "lead.created":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityLabel = (action: string) => {
    return formatActionName(action);
  };

  const getActivityMessage = (activity: TimelineActivity) => {
    if (activity.action === "lead.lifecycle_updated") {
      return `Lifecycle status changed to: ${activity.metadata?.lifecycleStatus || 'Unknown'}`;
    }
    if (activity.action === "lead.quote_ready") {
      return `Quote is ready. Value: $${activity.metadata?.quoteValue || 0}, Budget: $${activity.metadata?.customerBudget || 0}`;
    }
    if (activity.action === "lead.created") {
      return `Lead created via ${activity.metadata?.source || 'unknown'}. ${activity.metadata?.isNewCustomer ? '(New Customer)' : ''}`;
    }
    if (activity.action === "lead.handed_to_sales" || activity.action === "lead.assigned.auto") {
      return `Lead was assigned to sales.`;
    }
    return "Action performed on lead.";
  };

  const handleActivityClick = (action: string) => {
    // We can add navigation logic based on action type here if needed later
    console.log("Clicked action:", action);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-[#4ECDC4] text-white px-6 py-3 flex items-center gap-3">
        <Button onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Lead Communication Timeline</h2>
      </div>

      <div className="p-6">
        {/* Date Filters */}
        <Card className="mb-6 py-0 rounded-md">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date From
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date To
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Section */}
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>
              Follow Up Timeline ({activities.length} activities)
            </CardTitle>
            <CardDescription>
              Chronological view of lead interactions
            </CardDescription>
          </CardHeader>

          {/* Timeline Items */}
          <CardContent className="relative">
            {/* Vertical Line */}
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Timeline Activities */}
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity._id} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    onClick={() => handleActivityClick(activity.action)}
                    className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${getActivityColor(
                      activity.action
                    )} flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                    title={`View details for ${getActivityLabel(
                      activity.action
                    ).toLowerCase()}`}
                  >
                    {getActivityIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <Card className="flex-1 py-0">
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {activity.performedBy?.name || "System Auto"}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {getActivityLabel(activity.action)} 
                          {activity.performedBy?.role ? ` by ${activity.performedBy.role}` : ""}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getActivityMessage(activity)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
