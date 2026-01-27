import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // This will be handled by the full auth.ts - we just return basic info here
                // The actual user creation/lookup happens in auth.ts with the adapter
                if (!credentials?.email) {
                    return null;
                }

                const email = credentials.email as string;

                // Return a temporary user object - the adapter will handle the rest
                return {
                    id: email, // Temporary ID, will be replaced by adapter
                    email: email,
                    name: email.split("@")[0],
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const protectedPaths = ["/dashboard", "/studio", "/settings", "/exports", "/referrals", "/billing", "/admin", "/marketplace"];
            const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

            if (isProtected) {
                if (isLoggedIn) return true;
                return false;
            } else if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
