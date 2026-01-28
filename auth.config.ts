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
                token: { label: "Token", type: "text" },
            },
            async authorize(credentials) {
                // Support Desktop Auth Bridge
                if (credentials?.token) {
                    try {
                        const tokenStr = credentials.token as string;
                        const decoded = JSON.parse(Buffer.from(tokenStr, 'base64').toString());

                        // Basic validation of decoded payload
                        if (decoded.uid && decoded.email && decoded.exp > Date.now()) {
                            return {
                                id: decoded.uid,
                                email: decoded.email,
                                name: decoded.email.split("@")[0],
                            };
                        }
                    } catch (error) {
                        console.error("Bridge Handshake Error:", error);
                        return null;
                    }
                }

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
        error: "/auth/error",
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
