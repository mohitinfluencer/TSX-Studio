"use client";

import {
    Download,
    MousePointer2,
    ShieldCheck,
    CheckCircle2,
    Rocket,
    ShieldAlert,
    Cpu,
    EyeOff,
    ArrowRight,
    Monitor,
    Zap,
    Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WindowsInstallGuide() {
    const router = useRouter();

    return (
        <AppShell>
            <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 pb-24">
                {/* Hero Section */}
                <section className="relative pt-32 pb-16 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
                    </div>

                    <div className="max-w-4xl mx-auto px-8 relative z-10 text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none uppercase mb-4">
                                Install TSX Studio <br />
                                <span className="text-primary italic text-4xl md:text-5xl">on Windows</span>
                            </h1>
                            <p className="text-xl text-white/40 font-medium leading-relaxed max-w-2xl mx-auto">
                                A one-minute guide to safely install and start using TSX Studio.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-wrap justify-center gap-4 pt-4"
                        >
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Monitor className="w-3 h-3 mr-2 text-primary" />
                                Windows 10 / 11
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Zap className="w-3 h-3 mr-2 text-primary" />
                                Offline-First App
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <EyeOff className="w-3 h-3 mr-2 text-primary" />
                                No Cloud Uploads
                            </Badge>
                        </motion.div>
                    </div>
                </section>

                {/* Installation Steps */}
                <section className="max-w-4xl mx-auto px-8 py-12 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Step 1 */}
                        <InstallStep
                            number="1"
                            title="Download the Installer"
                            icon={<Download className="w-5 h-5 text-primary" />}
                            content={
                                <p className="text-sm text-white/50 leading-relaxed">
                                    Click the Download button on our website. Your browser will download a file named: <code className="bg-white/5 px-2 py-0.5 rounded text-primary font-mono text-xs">TSX-Studio-Setup-1.0.0.exe</code>
                                </p>
                            }
                        />

                        {/* Step 2 */}
                        <InstallStep
                            number="2"
                            title="Open the Installer"
                            icon={<MousePointer2 className="w-5 h-5 text-primary" />}
                            content={
                                <div className="space-y-2">
                                    <p className="text-sm text-white/50 leading-relaxed">
                                        Once the download is complete, double-click the installer file to begin setup.
                                    </p>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">
                                        Your browser may ask for confirmation before opening.
                                    </p>
                                </div>
                            }
                        />
                    </div>

                    {/* Step 3 - Highlighted */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-primary/[0.03] border border-primary/20 rounded-[32px] p-8 md:p-10 relative overflow-hidden"
                    >
                        <div className="max-w-3xl flex flex-col md:flex-row gap-8 items-start relative z-10">
                            <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                                <ShieldAlert className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-6 flex-1">
                                <div>
                                    <span className="text-xs font-black italic text-primary uppercase tracking-[0.2em] mb-2 block">Step 3</span>
                                    <h2 className="text-2xl font-black italic tracking-tight uppercase">Windows Security Notice (This Is Normal)</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <p className="text-sm text-white/60 leading-relaxed font-medium">
                                            Windows protects users from unrecognized apps. As an independent tool, we often trigger this screen on new systems. This does not mean TSX Studio is unsafe.
                                        </p>
                                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                            <p className="text-[11px] font-medium text-white/40 leading-relaxed italic">
                                                "Many trusted professional tools show this screen when installed for the first time."
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <VisualStep number="1" text="Click 'More info' on the prompt" />
                                        <VisualStep number="2" text="Click 'Run anyway' to proceed" />
                                        <VisualStep number="3" text="Installation continues normally" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Step 4 */}
                        <InstallStep
                            number="4"
                            title="Finish Installation"
                            icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
                            content={
                                <p className="text-sm text-white/50 leading-relaxed">
                                    The installer will complete setup in a few seconds. A <span className="text-white font-bold">TSX Studio</span> shortcut will appear on your desktop.
                                </p>
                            }
                        />

                        {/* Step 5 */}
                        <InstallStep
                            number="5"
                            title="Launch TSX Studio"
                            icon={<Rocket className="w-5 h-5 text-primary" />}
                            content={
                                <div className="space-y-2">
                                    <p className="text-sm text-white/50 leading-relaxed">
                                        Open TSX Studio and Sign in with Google to connect your account and start working.
                                    </p>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">
                                        Google sign-in is used only for identity—your files stay local.
                                    </p>
                                </div>
                            }
                        />
                    </div>
                </section>

                {/* Educational Section */}
                <section className="max-w-4xl mx-auto px-8 py-20 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tight uppercase leading-tight mb-6">
                                Why does Windows <br />
                                <span className="text-primary italic">show this message?</span>
                            </h2>
                            <div className="space-y-4 text-white/50 text-sm leading-relaxed font-medium">
                                <p>TSX Studio is a new desktop application. Microsoft displays warnings for apps that haven't yet built a vast historical "reputation" on their servers.</p>
                                <p>As more users install and use TSX Studio safely, this reputation builds automatically over time. No action is required from you beyond the initial confirmation.</p>
                            </div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white italic">Security & Privacy Reminder</h3>
                            <ul className="space-y-4">
                                <TrustPoint icon={<Zap />} text="TSX Studio runs locally on your machine" />
                                <TrustPoint icon={<EyeOff />} text="No background or hidden uploads" />
                                <TrustPoint icon={<Lock />} text="No access to files without permission" />
                            </ul>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-primary font-black italic uppercase tracking-widest text-xs">Your system. Your files. Your control.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="max-w-4xl mx-auto px-8 py-20 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={() => router.push('/download')}
                            size="lg"
                            className="h-16 px-10 bg-white text-black hover:bg-neutral-200 font-black italic rounded-2xl transition-all active:scale-95 text-lg"
                        >
                            <Download className="w-5 h-5 mr-3" />
                            DOWNLOAD FOR WINDOWS
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-16 px-10 border-white/10 bg-white/5 hover:bg-white/10 font-black italic uppercase tracking-widest text-[11px] rounded-2xl transition-all"
                        >
                            <Link href="/trust">READ TRUST & SECURITY</Link>
                        </Button>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}

function InstallStep({ number, title, icon, content }: { number: string, title: string, icon: any, content: any }) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.03] transition-colors group">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-3xl font-black italic text-white/10 group-hover:text-primary/20 transition-colors tracking-tighter">{number}</span>
            </div>
            <div className="space-y-3">
                <h3 className="text-lg font-black italic tracking-tight uppercase leading-none">{title}</h3>
                {content}
            </div>
        </div>
    );
}

function VisualStep({ number, text }: { number: string, text: string }) {
    return (
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black italic text-primary">{number}</span>
            </div>
            <p className="text-[11px] font-bold text-white/70 uppercase leading-none">{text}</p>
        </div>
    );
}

function TrustPoint({ icon, text }: { icon: any, text: string }) {
    return (
        <div className="flex items-center gap-3 text-white/50 text-xs font-bold uppercase tracking-tight">
            <div className="text-primary w-4 h-4">{icon}</div>
            {text}
        </div>
    );
}
