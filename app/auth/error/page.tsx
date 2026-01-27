"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

enum Error {
    Configuration = "Configuration",
    AccessDenied = "AccessDenied",
    Verification = "Verification",
    Default = "Default",
}

const errorMap = {
    [Error.Configuration]: {
        title: "System Configuration Error",
        description: "There is a problem with the server configuration. This is usually due to missing environment variables or database connection issues.",
    },
    [Error.AccessDenied]: {
        title: "Access Denied",
        description: "You do not have permission to access this resource or your account has been restricted.",
    },
    [Error.Verification]: {
        title: "Link Expired",
        description: "The sign-in link has expired or has already been used. Please request a new one.",
    },
    [Error.Default]: {
        title: "Authentication Protocol Error",
        description: "An unexpected error occurred during the identity verification process. Please try again.",
    },
};

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error") as Error;
    const { title, description } = errorMap[error] || errorMap[Error.Default];

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 grayscale pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-red-500/20 bg-background/40 backdrop-blur-3xl rounded-[40px] shadow-2xl p-4">
                    <CardHeader className="space-y-4 text-center pt-8">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-2xl">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-black tracking-tighter uppercase text-white">
                                {title}
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                                {description}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 text-center">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3 text-left">
                            <Terminal className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                            <code className="text-xs text-red-400 font-mono break-all">
                                ERR_AUTH_NODE_FAILURE: {error || "UNKNOWN_DEVIATION"}
                            </code>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 px-8 pb-12">
                        <Button
                            asChild
                            className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl transition-all"
                        >
                            <Link href="/login">
                                Try Re-Authenticating
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full h-12 text-muted-foreground hover:text-white font-bold rounded-xl"
                        >
                            <Link href="/" className="flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Return to Surface
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
