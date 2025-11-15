"use client";

import { useState, useTransition } from "react";
import { addComment, deleteComment, type CommentResponse } from "./comment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Trash2 } from "lucide-react";
// import { toast } from "sonner"; // Uncomment if you have sonner installed

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: { 
    name: string | null;
    id: string;
  } | null;
}

interface CommentsProps {
  courseId: string;
  initialComments: Comment[];
  currentUserId?: string; // To determine if user can delete their comments
}

const Comments: React.FC<CommentsProps> = ({ courseId, initialComments, currentUserId }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (newComment.length > 1000) {
      setError("Comment is too long (max 1000 characters)");
      return;
    }

    setError(null);
    
    startTransition(async () => {
      try {
        const result = await addComment(courseId, newComment);
        
        if (result.status === "success" && result.comment) {
          setComments(prev => [result.comment!, ...prev]);
          setNewComment("");
          // toast?.success("Comment added successfully!");
          console.log("Comment added successfully!");
        } else {
          setError(result.message || "Failed to add comment");
          // toast?.error(result.message || "Failed to add comment");
        }
      } catch (error) {
        setError("An unexpected error occurred");
        // toast?.error("An unexpected error occurred");
        console.error("Comment submission error:", error);
      }
    });
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setDeletingCommentId(commentId);
    
    try {
      const result = await deleteComment(commentId);
      
      if (result.status === "success") {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        // toast?.success("Comment deleted successfully!");
        console.log("Comment deleted successfully!");
      } else {
        // toast?.error(result.message || "Failed to delete comment");
        console.error(result.message || "Failed to delete comment");
      }
    } catch (error) {
      // toast?.error("An unexpected error occurred");
      console.error("Comment deletion error:", error);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - commentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return commentDate.toLocaleDateString();
    }
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-6" />
        <h2 className="text-3xl font-semibold tracking-tight">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Add Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this course..."
                className="min-h-[100px] resize-none"
                disabled={isPending}
                maxLength={1000}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{newComment.length}/1000 characters</span>
              </div>
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isPending || !newComment.trim()}
                className="flex items-center gap-2"
              >
                <Send className="size-4" />
                {isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="size-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                <p>Be the first to share your thoughts about this course!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.user?.name || "Anonymous User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      
                      {/* Delete button - only show for comment owner */}
                      {currentUserId && comment.user?.id === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;