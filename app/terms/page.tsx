"use client";

import { ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
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
                            <Scale className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase">
                            Terms of <br /><span className="text-primary">Service.</span>
                        </h1>
                        <p className="text-muted-foreground text-lg italic font-medium">
                            Operational Ruleset: Effective January 2026
                        </p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-invert max-w-none space-y-12"
                >
                    <section className="space-y-4 text-muted-foreground leading-relaxed">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">01. Acceptable Utilization</h2>
                        <p>
                            TSX Studio is designed for professional creative distribution. Any attempt to exploit our rendering nodes for illegal content, crypto mining, or denial-of-service attacks will result in immediate termination of assets without refund.
                        </p>
                    </section>

                    <section className="space-y-4 text-muted-foreground leading-relaxed">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">02. Intellectual Property</h2>
                        <p>
                            You retain 100% ownership of your TSX code and exported video files. However, you grant TSX Studio a temporary license to process, render, and store these assets on our cloud infrastructure to fulfill your requests.
                        </p>
                    </section>

                    <section className="space-y-4 text-muted-foreground leading-relaxed">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">03. Beta Limitations</h2>
                        <p>
                            TSX Studio is currently in rapid development. While we maintain 99.98% uptime for our production cluster, we provide the service "as is" and do not guarantee that your specific TSX code will render perfectly on every engine iteration.
                        </p>
                    </section>

                    <section className="space-y-4 text-muted-foreground leading-relaxed">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">04. Billing & Credits</h2>
                        <p>
                            Subscription tiers and export credits are final. While we offer a Free tier for testing, paid allocations are non-refundable except in cases of verified system failure.
                        </p>
                    </section>

                    <section className="space-y-4 text-muted-foreground leading-relaxed pt-12 border-t border-white/5">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Legal Contact</h2>
                        <p>
                            For formal legal inquiries or dispute resolution: <br />
                            <span className="text-primary font-bold italic underline">mohitgupta4006@gmail.com</span>
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
