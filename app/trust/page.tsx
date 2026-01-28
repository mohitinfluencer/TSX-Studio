"use client";

import {
    ShieldCheck,
    Lock,
    Cpu,
    Zap,
    EyeOff,
    Fingerprint,
    Download,
    ChevronRight,
    Info,
    Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrustPage() {
    const router = useRouter();

    return (
        <AppShell>
            <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 pb-24">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
                    </div>

                    <div className="max-w-4xl mx-auto px-8 relative z-10 text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest italic mb-6">
                                <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                                Secured by Architecture
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.95] uppercase mb-6">
                                Built for Privacy. <br />
                                <span className="text-primary italic">Designed for Trust.</span>
                            </h1>
                            <p className="text-xl text-white/40 font-medium leading-relaxed max-w-2xl mx-auto">
                                TSX Studio runs directly on your computer. No cloud processing. No hidden uploads. No data resale.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-wrap justify-center gap-6 pt-4"
                        >
                            <TrustBadge icon={<Cpu />} label="Local-Only Processing" />
                            <TrustBadge icon={<Lock />} label="No Server Uploads" />
                            <TrustBadge icon={<EyeOff />} label="Transparent Architecture" />
                        </motion.div>
                    </div>
                </section>

                {/* Windows Security Section */}
                <section className="max-w-4xl mx-auto px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group hover:border-white/10 transition-all shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="w-48 h-48" />
                        </div>

                        <div className="max-w-2xl space-y-8 relative z-10">
                            <h2 className="text-3xl font-black italic tracking-tight uppercase">Why does Windows show a security warning?</h2>

                            <div className="space-y-6">
                                <p className="text-lg text-white/50 leading-relaxed font-medium">
                                    TSX Studio is an independent desktop application. Windows Defender warns users about any relatively new or independent application to ensure you are aware of what you are installing.
                                </p>

                                <div className="space-y-4">
                                    <p className="text-sm font-black uppercase tracking-widest text-primary/80">Standard Installation Steps:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <SecurityStep number="1" text="Click 'More info' on the blue prompt" />
                                        <SecurityStep number="2" text="Click 'Run anyway' to proceed" />
                                        <SecurityStep number="3" text="TSX Studio opens normally" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <Info className="w-5 h-5 text-primary" />
                                    <p className="text-xs font-medium text-white/40"> This is a standard Windows protection screen, not an error. It appears because we are a specialized independent tool.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Local Architecture */}
                <section className="max-w-4xl mx-auto px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black italic tracking-tight uppercase leading-tight">
                                Local-First <br />
                                <span className="text-primary italic">AI Architecture</span>
                            </h2>
                            <p className="text-lg text-white/40 font-medium leading-relaxed">
                                Unlike traditional video editors that rely on heavy cloud servers, TSX Studio utilizes your own hardware for maximum performance and privacy.
                            </p>
                            <ul className="space-y-4">
                                <BulletPoint text="Rendering happens on your CPU/GPU hardware" />
                                <BulletPoint text="Transcription runs locally using AI models" />
                                <BulletPoint text="Media files never leave your machine" />
                                <BulletPoint text="Zero queues, zero waiting, zero server costs" />
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <ArchitectureCard icon={<Zap />} title="Zero Cloud" desc="No external dependancy" />
                            <ArchitectureCard icon={<ShieldCheck />} title="Offline" desc="Works without internet" />
                            <ArchitectureCard icon={<Cpu />} title="Unlimited" desc="No minute limits" />
                            <ArchitectureCard icon={<Activity />} title="Native" desc="Direct GPU access" />
                        </div>
                    </div>
                </section>

                {/* Privacy Promise */}
                <section className="max-w-4xl mx-auto px-8 py-20 text-center border-t border-white/5">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black italic tracking-tight uppercase">Your Data Never Leaves Your Machine</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <PromisePoint text="No uploads without user action" />
                            <PromisePoint text="No background syncing" />
                            <PromisePoint text="No telemetry on media files" />
                            <PromisePoint text="No selling or sharing data" />
                        </div>
                        <p className="text-xl text-primary font-black italic uppercase tracking-tight pt-8">
                            "TSX Studio cannot see your videos, audio, or projects — by design."
                        </p>
                    </div>
                </section>

                {/* Authentication Clarity */}
                <section className="max-w-4xl mx-auto px-8 py-20 bg-white/[0.01] border-y border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black italic tracking-tight uppercase">Authentication Clarity</h3>
                            <p className="text-white/40 leading-relaxed font-medium">
                                We use Google Sign-In strictly to verify your identity and manage your license. This is the same secure standard used by tools like Figma and Slack.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <AuthCheck label="No access to your local files" />
                            <AuthCheck label="No access to Gmail or Drive" />
                            <AuthCheck label="Used only for identity & licensing" />
                        </div>
                    </div>
                </section>

                {/* Indie Transparency */}
                <section className="max-w-4xl mx-auto px-8 py-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6 max-w-2xl mx-auto"
                    >
                        <Heart className="w-10 h-10 text-primary mx-auto opacity-50 mb-4" />
                        <h2 className="text-3xl font-black italic tracking-tight uppercase">Independent & Transparent</h2>
                        <p className="text-lg text-white/50 leading-relaxed font-medium">
                            TSX Studio is built by a small independent team. We prioritize transparency, privacy, and performance over growth hacks. We are in the early stages and actively improving based on your feedback.
                        </p>
                    </motion.div>
                </section>

                {/* Final CTA */}
                <section className="max-w-4xl mx-auto px-8 pb-20">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={() => router.push('/download')}
                            size="lg"
                            className="h-16 px-10 bg-white text-black hover:bg-neutral-200 font-black italic rounded-2xl transition-all active:scale-95 text-lg"
                        >
                            <Download className="w-5 h-5 mr-3" />
                            DOWNLOAD TSX STUDIO
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-16 px-10 border-white/10 bg-white/5 hover:bg-white/10 font-black italic uppercase tracking-widest text-[11px] rounded-2xl transition-all"
                        >
                            <Link href="/install/windows">VIEW INSTALL GUIDE</Link>
                        </Button>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}

function TrustBadge({ icon, label }: { icon: any, label: string }) {
    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
            <div className="text-primary w-4 h-4">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60">{label}</span>
        </div>
    );
}

function SecurityStep({ number, text }: { number: string, text: string }) {
    return (
        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2">
            <span className="text-xs font-black italic text-primary/50">Step {number}</span>
            <p className="text-[11px] font-bold text-white/70 leading-tight uppercase">{text}</p>
        </div>
    );
}

function BulletPoint({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 text-white/60 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-sm">{text}</span>
        </li>
    );
}

function PromisePoint({ text }: { text: string }) {
    return (
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-relaxed">{text}</p>
        </div>
    );
}

function AuthCheck({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-tight text-white/70">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {label}
        </div>
    );
}

function ArchitectureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-[24px] space-y-2 hover:bg-white/[0.05] transition-colors">
            <div className="text-primary w-5 h-5">{icon}</div>
            <div>
                <h4 className="text-[10px] font-black uppercase italic tracking-widest text-white">{title}</h4>
                <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">{desc}</p>
            </div>
        </div>
    );
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
