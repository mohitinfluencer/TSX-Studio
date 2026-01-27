export const runtime = "nodejs";

import { auth } from "@/auth";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get or Create Referral Code
    let referralCode = await db.referralCode.findUnique({
        where: { userId: session.user.id }
    });

    if (!referralCode) {
        referralCode = await db.referralCode.create({
            data: {
                userId: session.user.id,
                code: crypto.randomBytes(4).toString('hex').toUpperCase()
            }
        });
    }

    // 2. Get Referral Stats
    const referrals = await db.referralEvent.findMany({
        where: { referrerId: session.user.id },
        include: {
            referredUser: {
                select: {
                    name: true,
                    email: true,
                    createdAt: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const totalEarned = referrals.length * 5; // Example: 5 credits per referral

    return NextResponse.json({
        code: referralCode.code,
        referrals: referrals.map(r => ({
            id: r.id,
            name: r.referredUser.name || "Elite User",
            email: r.referredUser.email?.replace(/(.{3}).*(@.*)/, "$1...$2"),
            status: r.status,
            date: r.createdAt
        })),
        stats: {
            totalCount: referrals.length,
            totalEarned
        }
    });
}
