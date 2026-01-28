"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Download,
    Monitor,
    Cpu,
    Zap,
    ShieldCheck,
    ChevronRight,
    Sparkles,
    EyeOff,
    Lock,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";

export default function DownloadPage() {
    const [os, setOs] = useState<"windows" | "mac" | "linux">("windows");
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const platform = window.navigator.platform.toLowerCase();
        let currentOs: "windows" | "mac" | "linux" = "windows";
        if (platform.includes("win")) currentOs = "windows";
        else if (platform.includes("mac")) currentOs = "mac";
        else if (platform.includes("linux")) currentOs = "linux";

        setOs(currentOs);

        // Automatic Download Funnel
        const timer = setTimeout(() => {
            if (!hasTriggered) {
                handleDownload(currentOs);
                setHasTriggered(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleDownload = (selectedOs?: string) => {
        const targetOs = selectedOs || os;
        window.location.href = `/api/download?platform=${targetOs}`;
    };

    return (
        <AppShell>
            <div className="min-h-[90vh] flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
                </div>

                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    {/* Left Column - Info */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest italic mb-6">
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                Hardware Acceleration Ready
                            </Badge>
                            <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter leading-[0.9] uppercase text-white mb-6">
                                Next Gen <br />
                                <span className="text-primary italic">Desktop Engine</span>
                            </h1>
                            <p className="text-xl text-white/40 font-medium leading-relaxed max-w-lg">
                                Experience 10x faster local rendering and private AI transcription with zero server costs. Built for professionals.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col gap-4 pt-4"
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => handleDownload()}
                                    size="lg"
                                    className="h-16 px-10 bg-white text-black hover:bg-neutral-200 font-black italic rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] group text-lg w-full sm:w-fit"
                                >
                                    <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                                    DOWNLOAD FOR {os.toUpperCase()}
                                </Button>
                            </div>
                            <div className="px-2 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    {hasTriggered ? "Download Initiated" : "Auto-downloading for your system..."}
                                    <span className="text-white/20 ml-2">— If it doesn't start, click the button above.</span>
                                </p>

                                {os === "windows" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1, duration: 0.5 }}
                                        className="mt-6 bg-primary/[0.03] border border-primary/20 rounded-[32px] p-6 md:p-8 space-y-6 relative overflow-hidden group shadow-2xl"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                            <ShieldCheck className="w-32 h-32" />
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                                </div>
                                                <h3 className="text-xl font-black italic tracking-tight uppercase leading-none">Windows Security Notice <span className="text-primary/50 font-medium tracking-normal">(Expected)</span></h3>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[13px] text-white/50 leading-relaxed font-medium">
                                                    TSX Studio is a new desktop application. Windows may show a security confirmation before installation. This is normal for new professional software.
                                                </p>
                                                <p className="text-[11px] font-black uppercase tracking-widest text-primary/80 italic">
                                                    This does NOT mean the app is unsafe.
                                                </p>
                                            </div>

                                            <div className="pt-4 space-y-4 border-t border-white/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 font-bold">What you may see during install:</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-3 text-center">
                                                        <div className="relative group/img overflow-hidden rounded-xl border border-white/10">
                                                            <img src="/images/smartscreen-step1.png" alt="Step 1" className="w-full grayscale group-hover/img:grayscale-0 transition-all duration-500 shadow-2xl" />
                                                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                                        </div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Step 1: Click "More info"</p>
                                                    </div>
                                                    <div className="space-y-3 text-center">
                                                        <div className="relative group/img overflow-hidden rounded-xl border border-white/10">
                                                            <img src="/images/smartscreen-step2.png" alt="Step 2" className="w-full grayscale group-hover/img:grayscale-0 transition-all duration-500 shadow-2xl" />
                                                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                                        </div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Step 2: Click "Run anyway"</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-xs text-white/30 leading-relaxed font-medium italic">
                                                Many trusted tools show this message when first installed. After the first run, Windows will not show this again.
                                            </p>

                                            <div className="pt-4 flex flex-col sm:flex-row gap-5 border-t border-white/5">
                                                <Link href="/install/windows" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-all hover:drop-shadow-[0_0_8px_rgba(39,242,255,0.4)]">
                                                    Need help installing?
                                                </Link>
                                                <Link href="/trust" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                                                    How we protect your privacy
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Trust Signal Row */}
                                <div className="flex flex-wrap items-center gap-6 px-2 pt-6">
                                    <TrustSignal icon={<Cpu className="w-3.5 h-3.5" />} label="Local Processing" />
                                    <TrustSignal icon={<EyeOff className="w-3.5 h-3.5" />} label="No Cloud Uploads" />
                                    <TrustSignal icon={<Zap className="w-3.5 h-3.5" />} label="Offline Capable" />
                                    <TrustSignal icon={<Lock className="w-3.5 h-3.5" />} label="Private Data" />
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white italic leading-none">V1.0.0</span>
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">Latest Stable</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white italic leading-none">64-BIT</span>
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">Architecture</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white italic leading-none">FREE</span>
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">Community Edition</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Features/Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="space-y-4"
                    >
                        <FeatureCard
                            icon={<Zap className="w-6 h-6" />}
                            title="Zero Latency Rendering"
                            desc="Renders videos directly using your local GPU/CPU hardware. No wait times, no queues."
                            color="text-emerald-400"
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-6 h-6" />}
                            title="Private AI Engine"
                            desc="Transcribe hours of audio locally using Whisper AI. Your data never leaves your machine."
                            color="text-blue-400"
                        />
                        <FeatureCard
                            icon={<Cpu className="w-6 h-6" />}
                            title="Native Resources"
                            desc="Optimized for multicore processing with support for H.264 and ProRes exports."
                            color="text-purple-400"
                        />

                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 mt-8 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Monitor className="w-32 h-32" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-2 italic">Available For</h3>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="bg-white/5 border-white/5 text-[9px] font-black italic uppercase px-3 py-1">Windows 10/11</Badge>
                                <Badge variant="secondary" className="bg-white/5 border-white/5 text-[9px] font-black italic uppercase px-3 py-1">macOS Intel/M1/M2</Badge>
                                <Badge variant="secondary" className="bg-white/5 border-white/5 text-[9px] font-black italic uppercase px-3 py-1">Ubuntu/Debian</Badge>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Footer Section */}
                <div className="mt-24 text-[9px] font-black uppercase tracking-[0.5em] text-white/10 flex items-center gap-8">
                    <span>Hardware Optimized</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span>Next.js 15 Native</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span>Local First Architecture</span>
                </div>
            </div>
        </AppShell>
    );
}

function TrustSignal({ icon, label }: { icon: any, label: string }) {
    return (
        <div className="flex items-center gap-2.5 group">
            <div className="text-primary/40 group-hover:text-primary transition-colors">
                {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20 group-hover:text-white/40 transition-colors">
                {label}
            </span>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.05] hover:border-white/10 transition-all group shadow-xl">
            <div className="flex items-start gap-5">
                <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${color} group-hover:scale-110 transition-transform shadow-inner`}>
                    {icon}
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-white text-lg tracking-tight italic uppercase">{title}</h3>
                    <p className="text-sm text-white/30 leading-relaxed font-medium">
                        {desc}
                    </p>
                </div>
            </div>
        </div>
    );
}
