"use client";

import { useState, useEffect } from "react";
import {
    Gift,
    Users,
    Copy,
    Check,
    Share2,
    TrendingUp,
    Rocket,
    Clock,
    UserCheck,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Referral {
    id: string;
    name: string;
    email: string;
    status: string;
    date: string;
}

interface ReferralStats {
    totalCount: number;
    totalEarned: number;
}

export function ReferralClient() {
    const [data, setData] = useState<{ code: string; referrals: Referral[]; stats: ReferralStats } | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch("/api/referrals")
            .then(res => res.json())
            .then(setData)
            .catch(() => toast.error("Failed to load referral data"))
            .finally(() => setLoading(false));
    }, []);

    const referralLink = data ? `${window.location.origin}/?ref=${data.code}` : "";

    const copyToClipboard = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success("Referral link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Users className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Network Size</p>
                    <h3 className="text-4xl font-black italic">{data?.stats.totalCount || 0}</h3>
                    <p className="text-[10px] text-muted-foreground mt-4 italic">Total creators onboarded</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-[32px] bg-secondary/10 border border-secondary/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Gift className="w-16 h-16 text-secondary" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-2">Rewards Earned</p>
                    <h3 className="text-4xl font-black italic text-secondary">{data?.stats.totalEarned || 0} <span className="text-sm">Credits</span></h3>
                    <p className="text-[10px] text-muted-foreground mt-4 italic">Available for high-res renders</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-[32px] bg-primary/10 border border-primary/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Conversion Rate</p>
                    <h3 className="text-4xl font-black italic text-primary">High <span className="text-sm italic">Impact</span></h3>
                    <p className="text-[10px] text-muted-foreground mt-4 italic">Your invites are high-value</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Referral Link Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-10 rounded-[40px] border border-white/5 bg-[#0A0A0B] space-y-8"
                >
                    <div className="space-y-4">
                        <Badge className="bg-primary/20 text-primary border-none font-black uppercase tracking-widest text-[9px]">Elite Program</Badge>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Your Referral <br /> <span className="text-primary">Dispatch Link.</span></h2>
                        <p className="text-muted-foreground italic font-medium">Share this link with your network. For every creator who signs up, you both receive bonus rendering energy.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black border border-white/5 flex items-center gap-4 group">
                            <code className="flex-1 text-sm font-mono text-primary truncate">
                                {referralLink || "Generating link..."}
                            </code>
                            <Button
                                onClick={copyToClipboard}
                                size="icon"
                                variant="ghost"
                                className="hover:bg-primary/10 hover:text-primary transition-all"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <div className="flex items-center gap-8 px-2">
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">You Get</p>
                                <p className="text-xs font-bold text-white italic">+5 Credits</p>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">They Get</p>
                                <p className="text-xs font-bold text-white italic">+2 Credits</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                            <Share2 className="w-3 h-3" /> Share Twitter
                        </button>
                        <button className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                            <Rocket className="w-3 h-3" /> Broadcast
                        </button>
                    </div>
                </motion.div>

                {/* Referrals List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-10 rounded-[40px] border border-white/5 bg-[#0A0A0B] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black italic uppercase tracking-tight">Recent Dispatch</h3>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{data?.referrals.length || 0} Total</Badge>
                    </div>

                    {data?.referrals.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <Clock className="w-12 h-12" />
                            <p className="text-xs font-black uppercase tracking-widest italic">No successful referrals yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4 flex-1">
                            {data?.referrals.map((ref) => (
                                <div key={ref.id} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <UserCheck className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black italic uppercase text-white">{ref.name}</p>
                                            <p className="text-[10px] font-mono text-muted-foreground">{ref.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase tracking-widest mb-1">+5 Credits</Badge>
                                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest italic">Success</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-8 mt-auto flex items-center gap-4 text-muted-foreground/60">
                        <CreditCard className="w-4 h-4" />
                        <p className="text-[10px] font-medium italic">Rewards are applied instantly to your cluster balance.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
