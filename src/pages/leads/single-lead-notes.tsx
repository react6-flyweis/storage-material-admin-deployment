import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";

interface Note {
  id: string;
  leadName: string;
  author: string;
  message: string;
  timestamp: string;
}

export default function SingleLeadNotes() {
  const navigate = useNavigate();
  //   const { leadId } = useParams();
  const [newNote, setNewNote] = useState("");

  // Mock data - replace with actual data from API
  const leadName = "Sarah Johnson";
  const leadDetails = "Q-2025-1047 • Workshop";
  const notes: Note[] = [
    {
      id: "1",
      leadName: "Sarah Johnson",
      author: "John Smith",
      message:
        "Sent the quotation for the custom steel structure via email. Client confirmed receipt and mentioned they'll review it by Wednesday. Scheduled a follow-up call for Oct 23.",
      timestamp: "2024-01-15 at 3:45 PM",
    },
    {
      id: "2",
      leadName: "Sarah Johnson",
      author: "John Smith",
      message:
        "Sent the quotation for the custom steel structure via email. Client confirmed receipt and mentioned they'll review it by Wednesday. Scheduled a follow-up call for Oct 23.",
      timestamp: "2024-01-15 at 3:45 PM",
    },
    {
      id: "3",
      leadName: "Sarah Johnson",
      author: "John Smith",
      message:
        "Sent the quotation for the custom steel structure via email. Client confirmed receipt and mentioned they'll review it by Wednesday. Scheduled a follow-up call for Oct 23.",
      timestamp: "2024-01-15 at 3:45 PM",
    },
    {
      id: "4",
      leadName: "Sarah Johnson",
      author: "John Smith",
      message:
        "Sent the quotation for the custom steel structure via email. Client confirmed receipt and mentioned they'll review it by Wednesday. Scheduled a follow-up call for Oct 23.",
      timestamp: "2024-01-15 at 3:45 PM",
    },
  ];

  const handleSendNote = () => {
    if (newNote.trim()) {
      // TODO: Implement API call to send note
      console.log("Sending note:", newNote);
      setNewNote("");
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
        {/* Notes Section */}
        <Card className="rounded-md">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">
              Notes with {leadName}
            </CardTitle>
            <CardDescription>{leadDetails}</CardDescription>
          </CardHeader>

          {/* Notes List */}
          <CardContent className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="py-0 rounded-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Follow-Up Update{" "}
                        <span className="text-sm font-normal text-gray-500">
                          (by {note.author})
                        </span>
                      </h4>
                    </div>
                    <span className="text-xs text-gray-400">
                      {note.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{note.message}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>

          {/* Add Note Input */}
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type your Note..."
                className="min-h-25 rounded resize-none"
              />
              <div className="flex justify-end">
                <Button onClick={handleSendNote}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
