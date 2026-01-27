import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    // Check if Stripe is configured
    if (!stripe) {
        return new NextResponse("Stripe is not configured", { status: 503 });
    }

    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.userId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        await db.user.update({
            where: {
                id: session.metadata.userId,
            },
            data: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                // Map plan based on price ID in a real app
                plan: "CREATOR", // Simplified for demo
            },
        });

        // Grant monthly credits
        await db.userEntitlement.upsert({
            where: { userId: session.metadata.userId },
            update: {
                plan: "CREATOR",
                creditsBalance: { increment: 120 },
            },
            create: {
                userId: session.metadata.userId,
                plan: "CREATOR",
                creditsBalance: 120,
                monthlyCredits: 120,
            },
        });
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        await db.user.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                plan: "CREATOR", // Simplified
            },
        });
    }

    return new NextResponse(null, { status: 200 });
}

