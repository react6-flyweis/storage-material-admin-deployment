import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Loader2, User } from "lucide-react";
import { useAddPayableInvoiceCommentMutation } from "@/modules/invoices/invoices.hooks";
import type { PayableComment } from "@/modules/invoices/invoices.api";
import { toast } from "sonner";

interface InvoiceCommentsThreadProps {
  invoiceId: string;
  comments?: PayableComment[];
  onCommentAdded?: () => void;
  className?: string;
}

function formatCommentDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} at ${d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } catch {
    return dateStr;
  }
}

export function InvoiceCommentsThread({
  invoiceId,
  comments = [],
  onCommentAdded,
  className = "",
}: InvoiceCommentsThreadProps) {
  const [commentText, setCommentText] = useState("");
  const addCommentMutation = useAddPayableInvoiceCommentMutation();

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    if (!invoiceId) {
      toast.error("Invoice ID is missing.");
      return;
    }

    try {
      await addCommentMutation.mutateAsync({
        invoiceId,
        payload: { text },
      });
      setCommentText("");
      toast.success("Comment posted.");
      onCommentAdded?.();
    } catch (error: any) {
      console.error("Failed to post comment:", error);
      toast.error(
        error?.response?.data?.message || "Failed to post comment. Please try again."
      );
    }
  };

  return (
    <Card className={`overflow-hidden border border-gray-200 bg-white ${className}`}>
      <CardHeader className="py-4 px-6 border-b bg-gray-50/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-base font-semibold text-gray-900">
            Comments & Discussion
          </CardTitle>
        </div>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Comment Thread */}
        <div className="space-y-4 max-h-105 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm border border-dashed rounded-lg bg-gray-50/50">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>No comments yet on this invoice.</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Leave a note for the Accounts or Admin team below.
              </p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const role = comment.authorRole?.toLowerCase() || "user";
              const isAdmin = role === "admin";
              const isAccount = role === "account";

              const authorName =
                typeof comment.authorId === "object" && comment.authorId?.name
                  ? comment.authorId.name
                  : isAdmin
                  ? "Admin Team"
                  : isAccount
                  ? "Accounts Team"
                  : "User";

              return (
                <div
                  key={comment._id || `comment-${index}`}
                  className="p-4 rounded-lg bg-gray-50/80 border border-gray-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {authorName}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          isAdmin
                            ? "bg-purple-100 text-purple-700"
                            : isAccount
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {isAdmin ? "Admin" : isAccount ? "Account" : role}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 whitespace-pre-wrap pl-9">
                    {comment.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* New Comment Input */}
        <form onSubmit={handlePostComment} className="space-y-3 pt-2 border-t">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Add a Note / Comment
          </label>
          <Textarea
            placeholder="Write a message for Accounts or Admin team (e.g. Please confirm W-9)..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            className="w-full resize-none text-sm"
            disabled={addCommentMutation.isPending}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={addCommentMutation.isPending || !commentText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Post Comment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
