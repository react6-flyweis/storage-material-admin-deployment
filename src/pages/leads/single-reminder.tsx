import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import FollowUpDialog from "@/components/follow-up/follow-up-dialog";

interface RecommendedTime {
  id: string;
  label: string;
}

interface RecentFollowUp {
  id: string;
  name: string;
  description: string;
  timestamp: string;
}

export default function SingleReminder() {
  const navigate = useNavigate();

  const [openAddFollowUp, setOpenAddFollowUp] = useState(false);

  const [recommendedTimes] = useState<RecommendedTime[]>([
    { id: "1", label: "Today 10:30 AM" },
    { id: "2", label: "Tomorrow 9:30 AM" },
    { id: "3", label: "Wednesday, April 17 1:30 PM" },
    { id: "4", label: "Friday, Apr 19 11:00 AM" },
  ]);

  const [recentFollowUps] = useState<RecentFollowUp[]>([
    {
      id: "1",
      name: "John Smith",
      description: "Sent project proposal and timeline for Q1 initiatives...",
      timestamp: "2024-01-15 at 3:45 PM",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      description: "Sent project proposal and timeline for Q1 initiatives...",
      timestamp: "2024-01-15 at 3:45 PM",
    },
    {
      id: "3",
      name: "John Smith",
      description: "Sent project proposal and timeline for Q1 initiatives...",
      timestamp: "2024-01-15 at 3:45 PM",
    },
  ]);

  const handleBack = () => {
    navigate('/leads');
  };

  const handleApply = () => {
    // Open Add Follow-up dialog so user can create a follow-up
    setOpenAddFollowUp(true);
  };

  const handleSnooze = () => {
    console.log("Snooze reminder");
    // Implement snooze logic
  };

  return (
    <div className="">
      {/* Header */}
      <div className="bg-[#89D5DC] text-white px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <Button
            onClick={handleBack}
            className="text-white hover:bg-white/20 -ml-2"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Smart Follow-Up Reminders</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Next Follow Up Card */}
        <Card className="bg-gradient-to-r from-green-400 to-emerald-500 border-none shadow-lg mb-6 rounded-lg">
          <CardContent className="">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded p-3">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <p className="text-base mb-2">
                    Next follow up for Sarah Johnson
                  </p>
                  <h2 className="text-4xl font-bold">Today at 1:00 PM</h2>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleApply}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-6"
                >
                  Apply
                </Button>
                <Button
                  onClick={handleSnooze}
                  className="bg-green-600 text-white hover:bg-green-700 px-6"
                >
                  Snooze
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Times */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Times
          </h3>
          <div className="flex flex-wrap gap-3">
            {recommendedTimes.map((time) => (
              <button
                key={time.id}
                className="px-4 py-2 bg-white rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Follow ups */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Follow ups
          </h3>
          <div className="space-y-3">
            {recentFollowUps.map((followUp) => (
              <Card key={followUp.id} className="shadow-sm py-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {followUp.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {followUp.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {followUp.timestamp}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <FollowUpDialog
        open={openAddFollowUp}
        onOpenChange={setOpenAddFollowUp}
      />
    </div>
  );
}
