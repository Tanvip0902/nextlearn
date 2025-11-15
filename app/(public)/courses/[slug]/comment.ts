"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type CommentResponse = {
  status: "success" | "error";
  message?: string;
  comment?: {
    id: string;
    content: string;
    createdAt: Date;
    user: { 
      name: string | null;
      id: string;
    } | null;
  };
};

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    throw new Error("Unauthorized - Please sign in to comment");
  }
  
  return session.user;
}

export async function addComment(courseId: string, content: string): Promise<CommentResponse> {
  try {
    const user = await getCurrentUser();

    if (!content.trim()) {
      return { status: "error", message: "Comment cannot be empty" };
    }

    if (content.length > 1000) {
      return { status: "error", message: "Comment is too long (max 1000 characters)" };
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        courseId,
      },
      include: {
        user: { 
          select: { 
            name: true,
            id: true 
          } 
        },
      },
    });

    // Revalidate the course page to show the new comment
    revalidatePath(`/courses/[slug]`, 'page');

    return { 
      status: "success", 
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: comment.user
      }
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { 
        status: "error", 
        message: "Please sign in to add comments" 
      };
    }
    
    return { 
      status: "error", 
      message: "Failed to add comment. Please try again." 
    };
  }
}

export async function deleteComment(commentId: string): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    const user = await getCurrentUser();

    // Check if the comment belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });

    if (!comment) {
      return { status: "error", message: "Comment not found" };
    }

    if (comment.userId !== user.id) {
      return { status: "error", message: "You can only delete your own comments" };
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    revalidatePath(`/courses/[slug]`, 'page');

    return { status: "success" };
  } catch (error) {
    console.error("Error deleting comment:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { 
        status: "error", 
        message: "Please sign in to delete comments" 
      };
    }
    
    return { status: "error", message: "Failed to delete comment" };
  }
}