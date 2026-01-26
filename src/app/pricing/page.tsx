"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, ShieldCheck, ArrowLeft, Star, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
    {
        name: "Free",
        price: "0",
        description: "Perfect for testing the production pipeline.",
        features: [
            "3 Export credits / month",
            "Up to 720p Resolution",
            "Watermarked exports",
            "Standard queue priority",
            "Heuristic code scanning"
        ],
        cta: "Start Free",
        icon: <Zap className="w-5 h-5" />,
        popular: false,
        color: "white"
    },
    {
        name: "Creator",
        price: "39",
        description: "For active content creators & designers.",
        features: [
            "120 Export credits / month",
            "Full 1080p Resolution",
            "NO Watermark",
            "Priority cluster queue",
            "Marketplace Asset Sharing",
            "Dedicated Asset Hub"
        ],
        cta: "Go Creator",
        icon: <Sparkles className="w-5 h-5" />,
        popular: true,
        color: "#27F2FF"
    },
    {
        name: "Pro",
        price: "99",
        description: "For agencies and high-scale production.",
        features: [
            "500 Export credits / month",
            "4K Ultra HD Resolution",
            "Ultra-priority cluster",
            "Unlimited team nodes",
            "Custom branding profiles",
            "API & Webhook access"
        ],
        cta: "Contact Sales",
        icon: <ShieldCheck className="w-5 h-5" />,
        popular: false,
        color: "#B7FF3C"
    }
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);

    const handleSubscribe = async (plan: string) => {
        if (plan === "Free") {
            window.location.href = "/signup";
            return;
        }

        toast.info("Redirecting to elite checkout...");

        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: plan.toUpperCase(), isYearly }),
            });

            const { url } = await res.json();
            if (url) window.location.href = url;
        } catch (err) {
            toast.error("Failed to initiate secure checkout");
        }
    };

    return (
        <div className="min-h-screen py-32 bg-background relative selection:bg-neon-cyan/30 selection:text-neon-cyan">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-neon-cyan/[0.02] blur-[120px] pointer-events-none" />

            <div className="container px-6 mx-auto relative z-10">
                <div className="flex flex-col items-center text-center space-y-8 mb-24">
                    <Link href="/" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Base
                    </Link>

                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter italic">
                            SELECT YOUR <br /><span className="text-gradient">CAPACITY.</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-muted-foreground text-lg italic font-medium">
                            Enterprise-grade rendering nodes tailored for your specific creative distribution.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isYearly ? "bg-white text-black shadow-xl" : "text-muted-foreground hover:text-white"}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isYearly ? "bg-neon-cyan text-black shadow-xl" : "text-muted-foreground hover:text-white"}`}
                        >
                            Yearly <span className="ml-1 opacity-60">(-20%)</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative flex flex-col p-10 rounded-[40px] border transition-all duration-500 hover:y-[-8px] ${plan.popular
                                    ? "border-neon-cyan bg-neon-cyan/[0.03] shadow-[0_0_50px_rgba(39,242,255,0.08)] scale-105"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-neon-cyan text-background px-6 py-1.5 rounded-full uppercase text-[9px] font-black tracking-widest italic shadow-xl">
                                        <Star className="w-3 h-3 mr-2 fill-current" /> MOST OPTIMAL
                                    </Badge>
                                </div>
                            )}

                            <div className="mb-12">
                                <div
                                    className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-2xl border border-white/5"
                                    style={{ color: plan.color }}
                                >
                                    {plan.icon}
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground font-medium italic">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="flex items-baseline gap-2 mb-10">
                                <span className="text-6xl font-display font-black italic">
                                    ${isYearly ? Math.floor(parseInt(plan.price) * 0.8) : plan.price}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">/ month</span>
                            </div>

                            <div className="space-y-4 mb-12 flex-1">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 text-sm font-medium">
                                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                            <Check className="w-3 h-3" style={{ color: plan.popular ? 'var(--color-neon-cyan)' : 'inherit' }} />
                                        </div>
                                        <span className="text-muted-foreground/80">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => handleSubscribe(plan.name)}
                                className={`w-full h-16 rounded-2xl font-black italic text-lg transition-all ${plan.popular
                                        ? "bg-neon-cyan text-background hover:bg-neon-cyan/90 shadow-[0_0_30px_rgba(39,242,255,0.3)]"
                                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                                    }`}
                            >
                                {plan.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-40 grid grid-cols-2 lg:grid-cols-4 gap-12 max-w-5xl mx-auto border-t border-white/5 pt-20">
                    <UptimeStat icon={<MonitorPlay className="w-5 h-5" />} value="99.98%" label="Node Uptime" />
                    <UptimeStat icon={<Zap className="w-5 h-5" />} value="1s" label="Sandbox Boot" />
                    <UptimeStat icon={<ShieldCheck className="w-5 h-5" />} value="BANK-LEVEL" label="Asset Security" />
                    <UptimeStat icon={<Star className="w-5 h-5" />} value="24/7" label="Elite Support" />
                </div>
            </div>
        </div>
    );
}

function UptimeStat({ icon, value, label }: { icon: any, value: string, label: string }) {
    return (
        <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-muted-foreground">
                {icon}
            </div>
            <h4 className="text-2xl font-black italic tracking-tight">{value}</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
    )
}
