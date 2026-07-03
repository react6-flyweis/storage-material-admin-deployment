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
  User,
  SparkleIcon,
  Copy,
  Send,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { useFollowUpAiScriptsQuery } from "@/modules/followups/followups.hooks";
import { Skeleton } from "@/components/ui/skeleton";

const getRelativeTime = (dateString?: string) => {
  if (!dateString) return "Just now";
  
  const timestamp = new Date(dateString).getTime();
  if (isNaN(timestamp)) {
    return "Unknown time";
  }

  const deltaInMinutes = Math.round((timestamp - Date.now()) / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(deltaInMinutes) < 60) {
    return formatter.format(deltaInMinutes, "minute");
  }

  const deltaInHours = Math.round(deltaInMinutes / 60);
  if (Math.abs(deltaInHours) < 24) {
    return formatter.format(deltaInHours, "hour");
  }

  const deltaInDays = Math.round(deltaInHours / 24);
  return formatter.format(deltaInDays, "day");
};

export default function AiScriptGenerator() {
  const { data, isLoading } = useFollowUpAiScriptsQuery();

  const items = (data?.data?.scripts || []).slice(0, 3).map((script: any, idx: number) => {
    const toneLabel = (script.tone || script.followupType || "professional").trim().toLowerCase();
    
    // Assign different backgrounds based on index for visual variety
    const bgs = [
      "bg-purple-50 text-purple-600",
      "bg-green-50 text-green-600",
      "bg-blue-50 text-blue-600",
    ];
    
    return {
      id: script._id || idx,
      name: script.customerName?.trim() || script.customerId?.firstName?.trim() || "Customer",
      tone: toneLabel,
      snippet: script.generatedScript || script.script || script.message || script.content || "",
      time: getRelativeTime(script.createdAt),
      icon: script.channel?.toLowerCase() === "phone" ? MessageCircle : FileText,
      bg: bgs[idx % bgs.length],
    };
  });

  return (
    <Card>
      <Link to="/leads/follow-up/script-generator">
        <CardHeader className="flex items-center justify-between border-b">
          <div>
            <CardTitle>✨ AI Script Generator</CardTitle>
            <CardDescription>Recent generated scripts</CardDescription>
          </div>

          <div className="flex items-center space-x-2" data-slot="card-action">
            <Link to="/leads/follow-up/script-generator">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <SparkleIcon />
                Generate
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Link>

      <CardContent className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 border rounded-md p-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 border rounded-md bg-gray-50">
            No scripts generated yet.
          </div>
        ) : (
          items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.id}
                className="flex items-center justify-between border rounded-md p-4"
              >
                <div className="flex items-start space-x-3">
                  <Avatar className={`h-9 w-9 ${it.bg}`}>
                    <AvatarFallback className="text-sm">
                      <Icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="overflow-hidden">
                    <div className="font-medium text-foreground">{it.name}</div>
                    <div className="text-sm text-muted-foreground max-w-sm line-clamp-2">
                      {it.snippet}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {it.time}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      it.tone === "professional"
                        ? "bg-blue-100 text-blue-700"
                        : it.tone === "friendly"
                        ? "bg-green-100 text-green-700"
                        : it.tone === "urgent"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {it.tone}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1 rounded hover:bg-muted/40"
                      aria-label="copy"
                      title="Copy"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <button
                      className="p-1 rounded hover:bg-muted/40"
                      aria-label="send"
                      title="Send"
                    >
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <Link to="/leads/follow-up/script-generator">
          <Button variant="link">
            View All Scripts
            <ArrowRight />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
