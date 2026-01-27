import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";
import { cookies } from "next/headers";
import { validateEnv } from "@/lib/env";

validateEnv();


export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    trustHost: true,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, account }) {
            // On first sign in, user object is available
            if (user) {
                // For credentials login, create user if doesn't exist
                if (account?.provider === "credentials" && user.email) {
                    let dbUser = await db.user.findUnique({
                        where: { email: user.email },
                    });

                    if (!dbUser) {
                        // 0. Check for referral cookie
                        let refCode = null;
                        try {
                            const cookieStore = await cookies();
                            refCode = cookieStore.get("tsx_referral_code")?.value;
                        } catch (e) {
                            // Ignore cookie failure in JWT callback
                        }
                        let referrer = null;

                        if (refCode) {
                            referrer = await db.referralCode.findUnique({
                                where: { code: refCode },
                                include: { user: true }
                            });
                        }

                        // 1. Create new user
                        dbUser = await db.user.create({
                            data: {
                                email: user.email,
                                name: user.name || user.email.split("@")[0],
                                emailVerified: new Date(),
                            },
                        });

                        // 2. Initial rewards (Base 3 + Referral 2)
                        const initialCredits = referrer ? 5 : 3;

                        // 3. Create default entitlement
                        await db.userEntitlement.create({
                            data: {
                                userId: dbUser.id,
                                plan: "FREE",
                                creditsBalance: initialCredits,
                                monthlyCredits: 3,
                            },
                        });

                        // 4. Grant initial credits transaction
                        await db.creditTransaction.create({
                            data: {
                                userId: dbUser.id,
                                type: "INITIAL_GRANT",
                                amount: initialCredits,
                            },
                        });

                        // 5. If referred, handle referrer reward and logging
                        if (referrer) {
                            // Log the referral event
                            await db.referralEvent.create({
                                data: {
                                    referrerId: referrer.userId,
                                    referredUserId: dbUser.id,
                                    status: "COMPLETED"
                                }
                            });

                            // Reward the referrer (+5)
                            await db.userEntitlement.update({
                                where: { userId: referrer.userId },
                                data: { creditsBalance: { increment: 5 } }
                            });

                            // Log transaction for referrer
                            await db.creditTransaction.create({
                                data: {
                                    userId: referrer.userId,
                                    type: "REFERRAL_REWARD",
                                    amount: 5,
                                },
                            });
                        }
                    }

                    token.sub = dbUser.id;
                    token.name = dbUser.name;
                    token.email = dbUser.email;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
});
