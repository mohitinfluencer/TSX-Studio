export const dynamic = "force-dynamic";

import { Suspense } from "react";

import { AuthErrorClient } from "./error-client";

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 grayscale pointer-events-none" />

            <Suspense fallback={
                <div className="w-full max-w-md p-8 text-center text-white font-black animate-pulse">
                    SYNCHRONIZING AUTH PROTOCOLS...
                </div>
            }>
                <AuthErrorClient />
            </Suspense>
        </div>
    );
}
