import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  FileText,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  Calendar
} from "lucide-react";
import { Link } from "react-router";
import { useGetActivityLogQuery } from "@/modules/leads/leads.hooks";
import { formatDistanceToNow } from "date-fns";

export default function LeadCommunicationTimeline() {
  const { data: activityLogResponse, isLoading } = useGetActivityLogQuery({
    page: 1,
    limit: 10,
  });

  const activities = activityLogResponse?.data?.activities || [];

  const getIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("call")) return Phone;
    if (lowerType.includes("email")) return Mail;
    if (lowerType.includes("meeting")) return MessageCircle;
    if (lowerType.includes("doc")) return FileText;
    return Calendar;
  };

  const getBgColor = (type: string) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("call")) return "bg-emerald-50 text-emerald-600";
    if (lowerType.includes("email")) return "bg-sky-50 text-sky-600";
    if (lowerType.includes("meeting")) return "bg-purple-50 text-purple-600";
    return "bg-gray-50 text-gray-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b">
        <div>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Recent activities</CardDescription>
        </div>

        {/* <div className="flex items-center space-x-2" data-slot="card-action">
          <Link to="/leads/1/notes">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              + Add Note
            </Button>
          </Link>
          <Link to="/leads/1/calls">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Phone className="" />
              Log Call
            </Button>
          </Link>
        </div> */}
      </CardHeader>

      <CardContent className="space-y-3 pt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : activities.length > 0 ? (
          activities.map((it) => {
            const Icon = getIcon(it.type);
            const bgClass = getBgColor(it.type);
            const timeAgo = it.followUpDate ? formatDistanceToNow(new Date(it.followUpDate), { addSuffix: true }) : "-";
            
            return (
              <div
                key={it._id}
                className="flex items-start justify-between bg-muted rounded-md p-4"
              >
                <div className="flex items-start space-x-3">
                  <Avatar className={`h-9 w-9 ${bgClass}`}>
                    <AvatarFallback className="text-sm">
                      <Icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium text-foreground">{it.clientName || it.projectName || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">{it.notes || `Follow up by ${it.followedBy?.name || "Unknown"}`}</div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground flex flex-col items-end">
                  <div className="text-right text-nowrap">{timeAgo}</div>
                  <div className="text-xs mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 capitalize`}
                    >
                      {it.type || "Note"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No recent activities found.
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <Link to="/leads/activity-log">
          <Button variant="link">
            View Full Timeline
            <ArrowRight />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
