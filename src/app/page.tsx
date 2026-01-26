"use client";

import Link from "next/link";
import {
  Plus,
  Search,
  Zap,
  Layers,
  ShieldCheck,
  Globe,
  ArrowRight,
  Terminal,
  MonitorPlay,
  Cpu,
  History,
  Lock,
  ChevronRight,
  ExternalLink,
  Github,
  Twitter,
  Layout,
  Code2,
  Sparkles,
  Download,
  Check,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen selection:bg-neon-cyan/30 selection:text-neon-cyan">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 py-4 ${isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent"
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-all shadow-[0_0_20px_rgba(39,242,255,0.1)]">
              <Terminal className="w-5 h-5 text-neon-cyan" />
            </div>
            <span className="text-xl font-display font-black tracking-tighter italic">TSX <span className="text-neon-cyan">STUDIO</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">
            <Link href="#features" className="hover:text-neon-cyan transition-colors">Features</Link>
            <Link href="#templates" className="hover:text-neon-cyan transition-colors">Marketplace</Link>
            <Link href="#pricing" className="hover:text-neon-cyan transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-xs font-black uppercase tracking-widest px-6 hover:text-neon-cyan transition-colors">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-neon-cyan text-background hover:bg-neon-cyan/90 font-black italic rounded-xl px-8 shadow-[0_0_20px_rgba(39,242,255,0.2)]">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        {/* Glow Effects */}
        <div
          className="absolute pointer-events-none opacity-20 blur-[120px] transition-transform duration-1000 ease-out"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, var(--color-neon-cyan), var(--color-neon-lime))`
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial="initial" animate="animate" variants={stagger}>
            <motion.div variants={fadeIn} className="mb-6">
              <Badge variant="outline" className="rounded-full px-4 py-1.5 border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan font-black uppercase tracking-widest text-[10px]">
                <Sparkles className="w-3 h-3 mr-2" /> Production Pipeline Beta 0.9.2
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-6xl md:text-[7.5rem] font-display font-black tracking-[0.02em] leading-[0.9] mb-8 italic">
              PASTE TSX.<br />
              <span className="text-gradient">RENDER MAGIC.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground/80 leading-relaxed font-medium mb-12">
              Preview and export production-grade motion overlays in minutes. <br className="hidden md:block" /> No timeline, no keyframes, just code.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-black hover:bg-neon-cyan hover:text-black transition-all font-black text-xl italic shadow-2xl">
                  Start Free Journey
                </Button>
              </Link>
              <Link href="/studio/demo">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-black text-xl italic backdrop-blur-xl">
                  <MonitorPlay className="mr-3 w-5 h-5 text-neon-cyan" /> Open Studio Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Product Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="max-w-6xl mx-auto mt-24 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan/20 via-white/5 to-neon-lime/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative glass rounded-[40px] border border-white/5 overflow-hidden shadow-2xl bg-[#03050C]/80">
            <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-6 gap-2">
              <div className="flex gap-1.5 leading-none">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 text-center font-black uppercase tracking-[0.3em] text-[9px] text-muted-foreground/50">
                TSX Studio // Internal Cluster Node 01
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 aspect-video">
              <div className="col-span-1 border-r border-white/5 p-6 bg-white/[0.02]">
                <div className="space-y-4">
                  <div className="h-3 w-3/4 bg-white/5 rounded-full" />
                  <div className="h-3 w-1/2 bg-white/5 rounded-full" />
                  <div className="h-3 w-2/3 bg-white/5 rounded-full" />
                  <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20" />
                      <div className="h-3 w-24 bg-white/10 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-lime/10 border border-neon-lime/20" />
                      <div className="h-3 w-20 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-sm" />
                <div className="relative h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-neon-cyan flex items-center justify-center text-black shadow-[0_0_30px_rgba(39,242,255,0.5)]">
                    <MonitorPlay className="w-8 h-8 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust Highlights */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-black italic uppercase tracking-tight">Versioned Projects</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-neon-cyan/60">Immutable Snapshots</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black italic uppercase tracking-tight">Safe Preview</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-neon-lime/60">Heuristic Sandboxing</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black italic uppercase tracking-tight">Multi-Format</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[#FF4FD8]/60">Cloud + Local Export</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 space-y-4">
            <Badge className="bg-neon-lime/10 text-neon-lime border-neon-lime/20 px-4 py-1.5 uppercase font-black text-[10px] tracking-widest">Capabilities</Badge>
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tight italic">Technical <br /><span className="text-gradient">Simplified.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layers className="w-6 h-6" />}
              title="Project Vault"
              benefit="Organize infinite animation files with deep nesting and metadata."
            />
            <FeatureCard
              icon={<History className="w-6 h-6" />}
              title="Rollback Engine"
              benefit="Every save is a version. Instantly travel back to any code snapshot."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Audit Guard"
              benefit="We scan your TSX for security loops and unauthorized API calls."
            />
            <FeatureCard
              icon={<Cpu className="w-6 h-6" />}
              title="Cloud Cluster"
              benefit="High-performance GPU rendering for complex Motion distributions."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Shared Hub"
              benefit="Invite collaborators and manage access across team projects."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Realtime Feed"
              benefit="Live progress tracking on exports via ultra-fast polling."
            />
          </div>
        </div>
      </section>

      {/* Marketplace Preview Row */}
      <section id="templates" className="py-32 px-6 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <Badge className="bg-[#FF4FD8]/10 text-[#FF4FD8] border-[#FF4FD8]/20 px-4 py-1.5 uppercase font-black text-[10px] tracking-widest">Marketplace</Badge>
              <h2 className="text-5xl md:text-7xl font-display font-black tracking-tight italic">Vibrance <br /><span className="text-gradient">Assets.</span></h2>
            </div>
            <Link href="/marketplace">
              <Button variant="ghost" className="font-black italic uppercase text-xs tracking-[0.2em] group">
                Browse Full Catalog <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <AssetCard title="Viral Captions" category="Captions" color="var(--color-neon-cyan)" />
            <AssetCard title="News Ticker" category="Overlay" color="var(--color-neon-lime)" />
            <AssetCard title="Chart Dynamic" category="Data" color="#FF4FD8" />
            <AssetCard title="Logo Reveal" category="Intro" color="white" />
            <AssetCard title="Bento Grid" category="Presentation" color="#27F2FF" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase">The Pipeline</h2>
            <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">Standard Operating Procedure</p>
          </div>

          <div className="relative space-y-32">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-cyan via-white/10 to-neon-lime hidden md:block" />

            <ProcessStep
              number="01"
              title="Upload / Paste Code"
              desc="Drop your TSX animation code into our professional IDE-grade editor."
              align="left"
              icon={<Code2 className="w-8 h-8" />}
            />
            <ProcessStep
              number="02"
              title="Validate & Preview"
              desc="Instant heuristic analysis and sandbox rendering for safe previews."
              align="right"
              icon={<Search className="w-8 h-8" />}
            />
            <ProcessStep
              number="03"
              title="Cloud Multi-Export"
              desc="Render high-quality MP4/MOV files on our high-performance cluster nodes."
              align="left"
              icon={<Download className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter italic">PLANS THAT <br /><span className="text-gradient underline decoration-neon-cyan/20 underline-offset-8">SCALE.</span></h2>

            <div className="flex items-center justify-center gap-4">
              <span className={`text-[10px] font-black uppercase tracking-widest ${!isYearly ? "text-neon-cyan" : "text-muted-foreground"}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="w-12 h-6 rounded-full bg-white/5 border border-white/10 relative p-1 transition-colors hover:border-neon-cyan/30"
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${isYearly ? "translate-x-6" : ""}`} />
              </button>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isYearly ? "text-neon-cyan" : "text-muted-foreground"}`}>
                Yearly <span className="text-neon-lime ml-1">(-20%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              name="Free"
              price="0"
              desc="Try the production pipeline."
              features={["3 Renders / mo", "720p Resolution", "Watermark ON", "Standard Priority"]}
              cta="Register Free"
            />
            <PricingCard
              featured
              name="Creator"
              price={isYearly ? "29" : "39"}
              desc="Power your content strategy."
              features={["120 Renders / mo", "Full 1080p Export", "NO Watermark", "Priority Queue", "Marketplace Access"]}
              cta="Go Creator"
              tag="BEST FOR ARTISTS"
            />
            <PricingCard
              name="Pro"
              price={isYearly ? "79" : "99"}
              desc="Enterprise-grade rendering."
              features={["500 Renders / mo", "4K Ultra HD", "Ultra-Priority", "Unlimited Teams", "API Webhooks"]}
              cta="Go Pro"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6 max-w-sm">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-neon-cyan" />
              </div>
              <span className="text-xl font-display font-black tracking-tighter italic">TSX STUDIO</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              The high-end production studio for code-driven creative. Built for editors who demand absolute precision and cloud scalability.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-neon-cyan"><Twitter className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-neon-cyan"><Github className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <FooterColumn title="Platform" links={["Features", "Cloud Render", "Marketplace", "Desktop App"]} />
            <FooterColumn title="Studio" links={["Demo Studio", "API Docs", "Changelog", "Integrations"]} />
            <FooterColumn title="Legal" links={["Terms", "Privacy", "Security", "Cookie Policy"]} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-12 border-t border-white/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">© 2026 TSX Studio // All Assets Reserved</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, benefit }: { icon: React.ReactNode, title: string, benefit: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group p-8 rounded-[32px] glass hover:border-neon-cyan/20 transition-all duration-500 neon-border"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-neon-cyan group-hover:scale-110 transition-transform group-hover:bg-neon-cyan/10 group-hover:border-neon-cyan/20">
        {icon}
      </div>
      <h4 className="text-xl font-black italic uppercase tracking-tight mb-3">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{benefit}</p>
    </motion.div>
  );
}

function AssetCard({ title, category, color }: { title: string, category: string, color: string }) {
  return (
    <div className="group space-y-4 cursor-pointer">
      <div className="aspect-[3/4] rounded-[24px] bg-neutral-900 overflow-hidden relative border border-white/5 group-hover:border-white/20 transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <Badge className="w-fit mb-2 text-[8px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md border-white/10" style={{ color: color }}>{category}</Badge>
          <h5 className="text-lg font-black italic uppercase tracking-tight group-hover:translate-x-1 transition-transform">{title}</h5>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 rotate-45 opacity-0 group-hover:opacity-20 transition-all duration-1000">
          <Sparkles className="w-32 h-32" style={{ color: color }} />
        </div>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, desc, align, icon }: { number: string, title: string, desc: string, align: "left" | "right", icon: React.ReactNode }) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1 space-y-4 text-center md:text-left">
        <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-neon-cyan mx-auto md:mx-0 shadow-2xl">
          {icon}
        </div>
        <h3 className="text-3xl font-black italic uppercase tracking-tight">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto md:mx-0">{desc}</p>
      </div>

      <div className={`flex shrink-0 z-10 ${align === 'right' ? 'md:-mr-6' : 'md:-ml-6'}`}>
        <div className="w-12 h-12 rounded-full bg-background border border-white/20 flex items-center justify-center text-sm font-black italic shadow-2xl">
          {number}
        </div>
      </div>

      <div className="flex-1 hidden md:block" />
    </div>
  );
}

function PricingCard({ featured = false, name, price, desc, features, cta, tag }: { featured?: boolean, name: string, price: string, desc: string, features: string[], cta: string, tag?: string }) {
  return (
    <div className={`relative p-10 rounded-[40px] border flex flex-col h-full transition-all duration-500 overflow-hidden ${featured
        ? "border-neon-cyan bg-neon-cyan/[0.03] scale-105 shadow-[0_0_50px_rgba(39,242,255,0.1)]"
        : "border-white/5 bg-white/[0.02] hover:border-white/10"
      }`}>
      {featured && (
        <div className="absolute top-6 right-6">
          <Badge className="bg-neon-cyan text-background font-black italic uppercase tracking-widest text-[8px] py-1">{tag}</Badge>
        </div>
      )}

      <div className="mb-12 space-y-2">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter">{name}</h3>
        <p className="text-sm font-medium text-muted-foreground">{desc}</p>
      </div>

      <div className="flex items-baseline gap-2 mb-10">
        <span className="text-6xl font-display font-black italic">${price}</span>
        <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">/mo</span>
      </div>

      <div className="space-y-4 mb-12 flex-1">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3 text-sm font-medium">
            <Check className={`w-4 h-4 ${featured ? "text-neon-cyan" : "text-muted-foreground"}`} />
            <span className="text-muted-foreground/80">{f}</span>
          </div>
        ))}
      </div>

      <Button className={`h-14 rounded-2xl font-black italic text-lg transition-all ${featured
          ? "bg-neon-cyan text-background hover:bg-neon-cyan/90 shadow-[0_0_30px_rgba(39,242,255,0.3)]"
          : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
        }`}>
        {cta}
      </Button>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="space-y-6">
      <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white underline decoration-neon-cyan decoration-2 underline-offset-8">{title}</h5>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link}>
            <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors font-medium">{link}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
