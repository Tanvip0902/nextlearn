import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

console.log("🟢 WEBHOOK FILE LOADED - Ready to process Stripe events");

export async function POST(req: Request) {
  console.log("🚀 WEBHOOK RECEIVED - Starting processing");
  
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature") as string;

  console.log("📥 Webhook details:", {
    hasBody: !!body,
    bodyLength: body.length,
    hasSignature: !!signature,
    timestamp: new Date().toISOString()
  });

  if (!signature) {
    console.error("❌ No Stripe signature header found");
    return new Response("No signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified successfully");
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  console.log(`📝 Event received: ${event.type} (ID: ${event.id})`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log("💳 Processing checkout.session.completed:", {
      sessionId: session.id,
      customerId: session.customer,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
      amountTotal: session.amount_total
    });

    const { courseId, enrollmentId, userId } = session.metadata || {};

    if (!courseId || !enrollmentId) {
      console.error("❌ Missing required metadata:", { courseId, enrollmentId });
      return new Response("Missing metadata", { status: 400 });
    }

    try {
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          Course: { select: { title: true, slug: true } }
        }
      });

      console.log("📋 Found enrollment:", {
        enrollmentId,
        currentStatus: existingEnrollment?.status,
        courseTitle: existingEnrollment?.Course?.title
      });

      if (!existingEnrollment) {
        console.error("❌ Enrollment not found:", enrollmentId);
        return new Response("Enrollment not found", { status: 404 });
      }

      // Update enrollment to Active
      console.log("🔄 Updating enrollment status to Active...");
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: "Active",
          amount: session.amount_total || 0,
          updatedAt: new Date()
        }
      });

      console.log("✅ ENROLLMENT UPDATED SUCCESSFULLY:", {
        enrollmentId: updatedEnrollment.id,
        newStatus: updatedEnrollment.status,
        amount: updatedEnrollment.amount
      });

      // Revalidate paths
      if (existingEnrollment.Course?.slug) {
        revalidatePath(`/course/${existingEnrollment.Course.slug}`);
        console.log(`🔄 Revalidated path: /course/${existingEnrollment.Course.slug}`);
      }
      
      revalidatePath('/dashboard');

      return new Response(JSON.stringify({ 
        success: true, 
        enrollmentId: updatedEnrollment.id,
        status: updatedEnrollment.status
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      return new Response("Database error", { status: 500 });
    }
  }

  console.log(`ℹ️ Unhandled event type: ${event.type}`);
  return new Response(JSON.stringify({ received: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Keep the GET method for testing
export async function GET() {
  console.log("🟡 GET request to webhook endpoint");
  return new Response("Webhook endpoint is working!", { status: 200 });
}