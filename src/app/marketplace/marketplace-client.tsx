"use client";

import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { Search, Filter, ShoppingCart, Zap, Play, Star, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CATEGORIES = ["All", "Intros", "Overlays", "Lower Thirds", "Social"];

const TEMPLATES = [
    {
        id: "neon-intro-01",
        title: "Cyberpunk Terminal Intro",
        category: "Intros",
        price: 5,
        rating: 4.9,
        reviews: 124,
        previewImage: "/previews/neon_intro.png",
        description: "A high-energy neon terminal intro with glitch effects and custom text data sweep.",
        code: `import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export default function NeonIntro() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const titleSpring = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(titleSpring, [0, 1], [0, 1]);
  
  return (
    <AbsoluteFill className="bg-[#05070D] flex items-center justify-center">
        <div style={{ opacity }} className="text-center">
            <h1 className="text-7xl font-black italic text-[#27F2FF] tracking-tighter shadow-[0_0_30px_rgba(39,242,255,0.5)]">
                TERMINAL REDUX
            </h1>
            <p className="text-[#B7FF3C] font-mono text-sm mt-4 uppercase tracking-[0.5em]">SYSTEM STABILIZED</p>
        </div>
    </AbsoluteFill>
  );
}`
    },
    {
        id: "hud-overlay-01",
        title: "Holographic HUD Overlay",
        category: "Overlays",
        price: 3,
        rating: 4.8,
        reviews: 89,
        previewImage: "/previews/overlay.png",
        description: "Semi-transparent data visualizations and scanning lines for futuristic compositions.",
        code: `import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export default function HUDOverlay() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill className="flex items-center justify-center">
        <div className="w-[80%] h-[80%] border-2 border-[#27F2FF]/20 rounded-3xl relative overflow-hidden">
            <div 
                className="absolute inset-0 bg-gradient-to-b from-transparent via-[#27F2FF]/5 to-transparent h-20"
                style={{ top: (frame * 5) % 100 + '%' }}
            />
            <div className="absolute top-4 left-4 font-mono text-[8px] text-[#27F2FF]/50 uppercase">
                Scanning sector 7G...
            </div>
        </div>
    </AbsoluteFill>
  );
}`
    },
    {
        id: "glass-lower-third",
        title: "Glassmorphism Title",
        category: "Lower Thirds",
        price: 2,
        rating: 4.7,
        reviews: 56,
        previewImage: "/previews/lower_third.png",
        description: "Elegant, modern title cards using advanced CSS blur and glass effects.",
        code: `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export default function GlassTitle() {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 20], [-100, 0], { extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill className="flex items-end p-20">
        <div 
            style={{ transform: \`translateX(\${slide}px)\`, opacity: interpolate(frame, [0, 20], [0, 1]) }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4"
        >
            <div className="w-1 h-12 bg-[#27F2FF]" />
            <div>
                <h2 className="text-2xl font-bold text-white italic">DESIGNER NAME</h2>
                <p className="text-xs text-[#B7FF3C] font-black uppercase tracking-widest">Motion Lead</p>
            </div>
        </div>
    </AbsoluteFill>
  );
}`
    }
];

export function MarketplaceClient() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const filteredTemplates = TEMPLATES.filter(t => {
        const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleUseTemplate = async (template: typeof TEMPLATES[0]) => {
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `New ${template.title}`,
                    resolution: "1080p",
                    fps: 30,
                    thumbnailUrl: template.previewImage
                })
            });

            if (res.ok) {
                const project = await res.json();
                console.log("[Marketplace] Project created:", project.id);

                // Update the project with template code immediately
                const versionRes = await fetch(`/api/versions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectId: project.id,
                        title: "Template Basis",
                        code: template.code
                    })
                });

                if (!versionRes.ok) {
                    const error = await versionRes.json();
                    console.error("[Marketplace] Version creation failed:", error);
                    toast.error("Template code failed to deploy.");
                    return;
                }

                toast.success("Project created from template!");
                router.push(`/studio/${project.id}`);
            } else {
                const errorData = await res.json();
                console.error("[Marketplace] Project creation failed:", errorData);
                toast.error(`Creation failed: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("[Marketplace] Error deploying template:", error);
            toast.error("Failed to deploy template.");
        }
    };

    return (
        <AppShell>
            <div className="p-8 space-y-12">
                {/* Hero */}
                <header className="relative py-16 px-12 rounded-[40px] overflow-hidden bg-[#05070D] border border-white/5 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#27F2FF]/10 via-transparent to-[#B7FF3C]/5" />
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#27F2FF] rounded-full blur-[150px] opacity-20" />

                    <div className="relative z-10 max-w-2xl">
                        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 italic font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1">
                            Premium Library
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-tight mb-6">
                            Elite Motion <br />
                            <span className="text-gradient">Architectures.</span>
                        </h1>
                        <p className="text-muted-foreground text-lg mb-8 max-w-md">
                            Browse our curated collection of high-fidelity React-based motion templates.
                            Built for builders, designed for the terminal.
                        </p>
                        <div className="flex gap-4">
                            <Button size="lg" className="rounded-2xl font-black italic uppercase text-xs tracking-widest px-8">
                                Browse Selection
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-2xl font-black italic uppercase text-xs tracking-widest px-8 border-white/10 hover:bg-white/5">
                                Top Trending
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-2 bg-card/30 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                    ? "bg-white text-black shadow-lg"
                                    : "text-muted-foreground hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Find templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 bg-card/30 border-white/5 h-12 rounded-2xl font-medium"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="group relative flex flex-col bg-card/20 rounded-[32px] border border-white/5 overflow-hidden hover:border-primary/30 transition-all duration-500"
                        >
                            <div className="absolute top-4 right-4 z-20">
                                <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white font-black italic gap-1.5 items-center">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    {template.rating}
                                </Badge>
                            </div>

                            <div className="aspect-[16/10] overflow-hidden relative">
                                <img
                                    src={template.previewImage}
                                    alt={template.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-transparent to-transparent opacity-60" />

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-sm">
                                    <Button size="icon" className="w-16 h-16 rounded-full bg-primary text-black shadow-[0_0_30px_rgba(39,242,255,0.4)]">
                                        <Play className="w-6 h-6 fill-current" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-primary">{template.category}</span>
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        {template.reviews} USES
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold italic tracking-tighter mb-3 group-hover:text-primary transition-colors">
                                    {template.title}
                                </h3>

                                <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                                    {template.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Exchange</span>
                                        <span className="text-xl font-black italic">{template.price} <span className="text-xs">CRD</span></span>
                                    </div>
                                    <Button
                                        onClick={() => handleUseTemplate(template)}
                                        className="rounded-xl font-black italic uppercase text-[10px] tracking-widest flex gap-2 h-10 px-5 group/btn"
                                    >
                                        Use Template
                                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
