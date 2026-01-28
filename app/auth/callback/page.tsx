"use client";

import { useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const syncSession = async () => {
            const token = searchParams.get("token");
            if (!token) {
                console.error("No token found in callback URL");
                router.push("/login?error=InvalidSession");
                return;
            }

            try {
                // Decode token to get the email
                const decoded = JSON.parse(atob(token));

                if (decoded.exp < Date.now()) {
                    router.push("/login?error=ExpiredSession");
                    return;
                }

                // SECURE HANDSHAKE:
                // Use the standard NextAuth signIn method to set cookies correctly
                const result = await signIn("credentials", {
                    email: decoded.email,
                    redirect: false, // We'll handle redirect ourselves
                    callbackUrl: "/dashboard",
                });

                if (result?.error) {
                    console.error("SignIn Error:", result.error);
                    router.push(`/login?error=${result.error}`);
                } else {
                    console.log("Session Synced Successfully!");
                    // Force a hard navigation to ensure session is picked up
                    window.location.href = "/dashboard";
                }
            } catch (e) {
                console.error("Failed to decode auth token:", e);
                router.push("/login?error=DecodingError");
            }
        };

        syncSession();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    Synchronizing <span className="text-primary italic">Identity</span>
                </h1>
                <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">
                    Establishing professional production link...
                </p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={null}>
            <AuthCallbackContent />
        </Suspense>
    );
}
