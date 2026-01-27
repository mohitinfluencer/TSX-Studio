export const runtime = "nodejs";

import { auth } from "@/auth";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const entitlement = await db.userEntitlement.findUnique({
        where: { userId: session.user.id },
    });

    if (!entitlement) {
        // Create default if missing (should be handled on signup, but safety net)
        const newEntitlement = await db.userEntitlement.create({
            data: {
                userId: session.user.id,
                plan: "FREE",
                creditsBalance: 3,
                monthlyCredits: 3,
            },
        });
        return NextResponse.json(newEntitlement);
    }

    return NextResponse.json(entitlement);
}
