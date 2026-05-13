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
  type LucideIcon,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";

type TimelineItem = {
  id: number;
  name: string;
  note: string;
  time: string;
  type: "note" | "email" | "call" | "doc";
  bg: string;
  icon: LucideIcon;
};

export default function LeadCommunicationTimeline() {
  const items: TimelineItem[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      note: "Discussed pricing options and implementation timeline",
      time: "2 hours ago",
      type: "note",
      icon: MessageCircle,
      bg: "bg-purple-50 text-purple-600",
    },
    {
      id: 2,
      name: "Michael Chen",
      note: "Sent product demo video and case studies",
      time: "4 hours ago",
      type: "email",
      icon: Mail,
      bg: "bg-sky-50 text-sky-600",
    },
    {
      id: 3,
      name: "Emily Davis",
      note: "30-min discovery call completed - high interest level",
      time: "6 hours ago",
      type: "call",
      icon: Phone,
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: 4,
      name: "Robert Wilson",
      note: "Lead requested technical specifications document",
      time: "1 day ago",
      type: "doc",
      icon: FileText,
      bg: "bg-gray-50 text-gray-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b">
        <div>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Recent activities</CardDescription>
        </div>

        <div className="flex items-center space-x-2" data-slot="card-action">
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
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.id}
              className="flex items-start justify-between bg-muted rounded-md p-4"
            >
              <div className="flex items-start space-x-3">
                <Avatar className={`h-9 w-9 ${it.bg}`}>
                  <AvatarFallback className="text-sm">
                    <Icon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="font-medium text-foreground">{it.name}</div>
                  <div className="text-sm text-muted-foreground">{it.note}</div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="text-right text-nowrap">{it.time}</div>
                <div className="text-xs mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700`}
                  >
                    {it.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="justify-center">
        <Link to="/leads/follow-up/communication-timeline">
          <Button variant="link">
            View Full Timeline
            <ArrowRight />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
