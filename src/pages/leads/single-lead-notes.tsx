import { useState } from "react";
import { useParams } from "react-router";
import { useAppBack } from "@/modules/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { addLeadNoteProvider } from "@/modules/leads/leads.api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

export default function SingleLeadNotes() {
  const { goBack } = useAppBack("/leads");
  const { id } = useParams<{ id: string }>();
  const [newNote, setNewNote] = useState("");
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useLeadDetailQuery(id || "");
  const leadData = response?.data;
  const lead = leadData?.lead;
  const customer = leadData?.customer;
  const notes = leadData?.leadNotes || [];

  const leadName = customer?.firstName
    ? `${customer.firstName} ${customer.lastName || ""}`.trim()
    : lead?.projectName || "Lead";
  const leadDetails = `${lead?.jobId || "No Job ID"} • ${lead?.buildingType || "Project"}`;

  const addNoteMutation = useMutation({
    mutationFn: (note: string) => addLeadNoteProvider(id!, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["lead", "detail", id] });
      setNewNote("");
      toast.success("Note added successfully");
    },
    onError: () => {
      toast.error("Failed to add note");
    },
  });

  const handleSendNote = () => {
    if (newNote.trim() && id) {
      addNoteMutation.mutate(newNote.trim());
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-[#4ECDC4] text-white px-6 py-3 flex items-center gap-3">
        <Button onClick={() => goBack()} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
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
          <CardContent className="space-y-4 pt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-gray-400 italic py-4">No notes added yet.</p>
            ) : (
              notes.map((note: any) => (
                <Card key={note._id} className="py-0 rounded-md min-w-0 overflow-hidden">
                  <CardContent className="p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 break-words [overflow-wrap:anywhere]">
                          Note{" "}
                          <span className="text-sm font-normal text-gray-500">
                            (by {note.addedBy?.name || "System"})
                          </span>
                        </h4>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {note.addedAt ? new Date(note.addedAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {note.note}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>

          {/* Add Note Input */}
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type your Note..."
                className="min-h-25 rounded resize-none"
                disabled={addNoteMutation.isPending}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendNote}
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                >
                  {addNoteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {addNoteMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
