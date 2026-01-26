"use client";

import { ArrowLeft, Mail, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ContactPage() {
    const [copied, setCopied] = useState(false);
    const email = "mohitgupta4006@gmail.com";

    const copyEmail = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        toast.success("Support email copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen py-32 bg-background relative selection:bg-primary/30 selection:text-primary">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/[0.02] blur-[120px] pointer-events-none" />

            <div className="container px-6 mx-auto relative z-10 max-w-4xl">
                <div className="flex flex-col space-y-8 mb-16">
                    <Link href="/" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Exit to Base
                    </Link>

                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase">
                            Connect with <br /><span className="text-primary">Engineering.</span>
                        </h1>
                        <p className="max-w-xl text-muted-foreground text-lg italic font-medium">
                            Our team monitors high-priority support nodes 24/7 for our Creator and Pro users.
                        </p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12"
                >
                    <div className="space-y-8">
                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                            <h3 className="text-xl font-black italic uppercase tracking-tight">Direct Support</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground font-medium">Official Dispatch Address:</p>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-sm group">
                                    <span className="flex-1 text-primary">{email}</span>
                                    <button
                                        onClick={copyEmail}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button
                                onClick={() => window.location.href = `mailto:${email}`}
                                className="w-full h-14 rounded-xl font-black italic uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                            >
                                Open Mail Client
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-8 pt-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-primary">Support Protocol</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-primary/20 pl-6">
                                "For maximum efficiency in resolution, please include your **Project ID**, a copy of your **TSX Code**, and a **Screenshot** of any validation errors encountered."
                            </p>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Standard Priority: 2-4 Hours</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pro Priority: &lt; 30 Minutes</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
