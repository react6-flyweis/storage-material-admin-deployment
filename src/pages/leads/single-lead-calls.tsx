import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone } from "lucide-react";

interface Call {
  id: string;
  type: "outgoing" | "incoming" | "missed";
  author: string;
  timestamp: string;
  duration: string;
}

export default function SingleLeadCalls() {
  const navigate = useNavigate();
  //   const { leadId } = useParams();

  // Mock data - replace with actual data from API
  const leadName = "Sarah Johnson";
  const leadDetails = "Q-2025-1047 • Workshop";
  const calls: Call[] = [
    {
      id: "1",
      type: "outgoing",
      author: "john Smith",
      timestamp: "2024-01-15 at 3:45 PM",
      duration: "05m 33s",
    },
    {
      id: "2",
      type: "outgoing",
      author: "john Smith",
      timestamp: "2024-01-15 at 3:45 PM",
      duration: "05m 33s",
    },
    {
      id: "3",
      type: "outgoing",
      author: "john Smith",
      timestamp: "2024-01-15 at 3:45 PM",
      duration: "05m 33s",
    },
    {
      id: "4",
      type: "outgoing",
      author: "john Smith",
      timestamp: "2024-01-15 at 3:45 PM",
      duration: "05m 33s",
    },
    {
      id: "5",
      type: "outgoing",
      author: "john Smith",
      timestamp: "2024-01-15 at 3:45 PM",
      duration: "05m 33s",
    },
    {
      id: "6",
      type: "outgoing",
      author: "john Smith",
      timestamp: "2024-01-15 at 3:45 PM",
      duration: "05m 33s",
    },
  ];

  const handleCall = () => {
    // TODO: Implement call functionality
    console.log("Initiating call to:", leadName);
  };

  const getCallTypeLabel = (type: Call["type"]) => {
    switch (type) {
      case "outgoing":
        return "Outgoing";
      case "incoming":
        return "Incoming";
      case "missed":
        return "Missed";
    }
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
        {/* Calls Section */}
        <Card className="rounded-md">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Calls with {leadName}
                </CardTitle>
                <CardDescription>{leadDetails}</CardDescription>
              </div>
              <Button
                onClick={handleCall}
                className="bg-green-500 hover:bg-green-600"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          </CardHeader>

          {/* Calls List */}
          <CardContent className="space-y-4">
            {calls.map((call) => (
              <Card key={call.id} className="py-0 rounded-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {getCallTypeLabel(call.type)}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          (by {call.author})
                        </span>
                      </h4>
                      <p className="text-xs text-gray-400">{call.timestamp}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {call.duration}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
