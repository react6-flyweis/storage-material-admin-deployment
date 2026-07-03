import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Send } from "lucide-react";

interface Email {
  id: string;
  contactPerson: string;
  subject: string;
  message: string;
  timestamp: string;
  sender: string;
  recipient: string;
  status: "sent" | "received" | "draft";
}

export default function SingleLeadEmails() {
  const navigate = useNavigate();
  // const { leadId } = useParams();

  // Mock data - replace with actual data from API
  const leadName = "Sarah Johnson";
  const emails: Email[] = [
    {
      id: "1",
      contactPerson: "Sarah Johnson",
      subject: "Q-2025-1047 - Workshop",
      sender: "john.smith@company.com",
      recipient: "sarah.johnson@example.com",
      message: "Sent project proposal and timeline for Q1 initiatives...",
      timestamp: "2024-01-15 at 3:45 PM",
      status: "sent",
    },
    {
      id: "2",
      contactPerson: "Sarah Johnson",
      subject: "Re: Project Discussion",
      sender: "sarah.johnson@example.com",
      recipient: "john.smith@company.com",
      message: "Thank you for the detailed proposal. I have a few questions...",
      timestamp: "2024-01-15 at 4:20 PM",
      status: "received",
    },
    {
      id: "3",
      contactPerson: "Sarah Johnson",
      subject: "Follow-up on Previous Discussion",
      sender: "john.smith@company.com",
      recipient: "sarah.johnson@example.com",
      message:
        "Following up on our previous conversation about the timeline...",
      timestamp: "2024-01-16 at 10:15 AM",
      status: "sent",
    },
    {
      id: "4",
      contactPerson: "Sarah Johnson",
      subject: "Budget Approval Request",
      sender: "john.smith@company.com",
      recipient: "sarah.johnson@example.com",
      message: "Requesting approval for the budget allocation discussed...",
      timestamp: "2024-01-17 at 2:30 PM",
      status: "sent",
    },
    {
      id: "5",
      contactPerson: "Sarah Johnson",
      subject: "Re: Budget Approval Request",
      sender: "sarah.johnson@example.com",
      recipient: "john.smith@company.com",
      message:
        "Budget has been approved. Please proceed with the next steps...",
      timestamp: "2024-01-18 at 9:00 AM",
      status: "received",
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-[#4ECDC4] text-white px-6 py-3 flex items-center gap-3">
        <Button
          onClick={() => navigate('/leads')}
          className="text-white hover:bg-[#3db3aa] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-base sm:text-lg font-semibold">
          Lead Communication Timeline
        </h2>
      </div>

      <div className="p-4 sm:p-6">
        {/* Email List */}
        <Card className="rounded-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Email With {leadName}</CardTitle>
                <CardDescription>Q-2025-1047 . Workshop </CardDescription>
              </div>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>
          </CardHeader>

          {/* Email Items */}
          <CardContent className="relative">
            {/* Vertical Line */}
            <div className="absolute left-10 sm:left-12 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Email List */}
            <div className="space-y-6">
              {emails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No emails found matching your search criteria
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    className="relative flex flex-col sm:flex-row gap-4"
                  >
                    {/* Icon */}
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>

                    {/* Compact Card (matches image) */}
                    <div className="flex-1">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between">
                          <div className="pr-0 sm:pr-4">
                            <h4 className="font-semibold text-gray-900">
                              {email.contactPerson}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {email.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-0 sm:ml-4 mt-2 sm:mt-0">
                            {email.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More Button */}
            {emails.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button variant="link">Load More</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
