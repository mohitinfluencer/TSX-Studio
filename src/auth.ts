import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
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
                        // Create new user
                        dbUser = await db.user.create({
                            data: {
                                email: user.email,
                                name: user.name || user.email.split("@")[0],
                                emailVerified: new Date(),
                            },
                        });

                        // Create default entitlement
                        await db.userEntitlement.create({
                            data: {
                                userId: dbUser.id,
                                plan: "FREE",
                                creditsBalance: 3,
                                monthlyCredits: 3,
                            },
                        });

                        // Grant initial credits
                        await db.creditTransaction.create({
                            data: {
                                userId: dbUser.id,
                                type: "MONTHLY_GRANT",
                                amount: 3,
                            },
                        });
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
