"use client";

import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase">
                            Privacy <br /><span className="text-primary">Protocol.</span>
                        </h1>
                        <p className="text-muted-foreground text-lg italic font-medium">
                            Last Updated: January 26, 2026
                        </p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-invert max-w-none space-y-12"
                >
                    <section className="space-y-4 text-muted-foreground leading-relaxed">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">01. Data Collection</h2>
                        <p>
                            TSX Studio collects essential information required to provide our elite rendering services. This includes your account email via auth providers, project metadata, your TSX code structures, and the final exported media files.
                        </p>
                    </section>

                    <section className="space-y-4 text-muted-foreground leading-relaxed">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">02. Usage Logic</h2>
                        <p>
                            Your data is utilized strictly for executing render jobs, improving our transcription algorithms, and tailoring the Studio experience. We do not sell your code or media to third parties. Our internal engineering team may review anonymized logs to resolve technical bottlenecking.
                        </p>
                    </section>

                    <section className="space-y-4 text-muted-foreground leading-relaxed">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">03. Storage Duration</h2>
                        <p>
                            Projects and exports are stored while your account is active. Temporary render assets are purged 24 hours after job completion. You may request full account deletion at any time via the Support console.
                        </p>
                    </section>

                    <section className="space-y-4 text-muted-foreground leading-relaxed">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">04. Cookies & Identity</h2>
                        <p>
                            We use secure cookies to manage session integrity and authentication. We leverage industry-standard providers like Stripe for billing and Auth.js for identity management.
                        </p>
                    </section>

                    <section className="space-y-4 text-muted-foreground leading-relaxed pt-12 border-t border-white/5">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Inquiries?</h2>
                        <p>
                            Direct your privacy concerns to our secure channel: <br />
                            <span className="text-primary font-bold italic underline">mohitgupta4006@gmail.com</span>
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
