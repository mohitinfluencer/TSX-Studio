import { AppShell } from "@/components/app-shell";
import { StudioClient } from "@/components/studio-client";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function DemoPage() {
    return (
        <div className="relative h-screen overflow-hidden flex flex-col">
            <div className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center italic shadow-2xl z-50">
                Demo Mode - Experimental Build 0.9.2
            </div>

            <div className="flex-1">
                <StudioClient projectId="demo-project" />
            </div>

            {/* Demo Overlay Banner */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-black/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold italic uppercase tracking-tight">Try the Production Pipeline</p>
                        <p className="text-xs text-muted-foreground">Exports in demo mode are restricted to 720p with watermarks.</p>
                    </div>
                    <Button size="sm" className="font-bold italic" asChild>
                        <Link href="/signup">Sign Up for Full Quality</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { Button } from "@/components/ui/button";
import Link from "next/link";
