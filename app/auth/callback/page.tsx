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
                // Decode token to get the user data
                const decoded = JSON.parse(atob(token));

                if (decoded.exp < Date.now()) {
                    console.error("Token expired");
                    router.push("/login?error=ExpiredSession");
                    return;
                }

                console.log("Professional Sync: Handshaking with identity provider for", decoded.email);

                // SECURE HANDSHAKE:
                // We use the credentials provider which we've configured to allow
                // silent login via email for desktop sessions.
                const result = await signIn("credentials", {
                    email: decoded.email,
                    redirect: false,
                });

                if (result?.error) {
                    console.error("Critical Sync Error:", result.error);
                    router.push(`/login?error=${result.error}`);
                } else {
                    console.log("Handshake Complete. Identity verified.");
                    // Hard reload to /dashboard to ensure ALL session state and cookies are correctly initialized
                    window.location.href = "/dashboard";
                }
            } catch (e) {
                console.error("Handshake Decoding Error:", e);
                router.push("/login?error=DecodingError");
            }
        };

        syncSession();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-neon-cyan animate-spin" />
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    Establishing <span className="text-neon-cyan italic">Secure Link</span>
                </h1>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                    Verifying production credentials...
                </p>
            </div>
            {/* Hidden fallback button in case the script hangs */}
            <button
                onClick={() => window.location.href = "/dashboard"}
                className="opacity-0 absolute bottom-4 text-[8px] text-white/10"
            >
                Manual Bypass
            </button>
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
