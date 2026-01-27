"use client";

import { AppShell } from "@/components/app-shell";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Zap } from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();

    return (
        <AppShell>
            <div className="p-8 max-w-4xl mx-auto w-full">
                <header className="mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter">Profile <span className="text-primary italic">Matrix</span></h1>
                    <p className="text-muted-foreground mt-2">Manage your system identity and account parameters.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* User Card */}
                    <div className="md:col-span-2 space-y-6">
                        <section className="p-8 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-xl">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">Identity Parameters</h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <User className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Full Alias</p>
                                        <p className="text-xl font-bold italic">{session?.user?.name || "Member User"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                        <Mail className="w-8 h-8 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Communication node</p>
                                        <p className="text-xl font-bold italic">{session?.user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="p-8 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-xl group hover:border-primary/20 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold italic">Account Security</h3>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Configure multi-node authentication</p>
                                </div>
                                <Shield className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </section>
                    </div>

                    {/* Stats/Badges Column */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl bg-primary text-black shadow-2xl shadow-primary/10 relative overflow-hidden group">
                            <Zap className="absolute -right-4 -top-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                            <h3 className="text-3xl font-black italic mt-1">PRO BUNDLE</h3>
                            <button className="mt-6 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                Manage Tier
                            </button>
                        </div>

                        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Encryption level</p>
                            <p className="text-2xl font-bold italic mt-1">MIL-SPEC 256</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
