"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Monitor, Cpu, CheckCircle, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DesktopStatus() {
    const [isDesktop, setIsDesktop] = useState(false);
    const [systemInfo, setSystemInfo] = useState<any>(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        const check = async () => {
            if (typeof window !== 'undefined' && (window as any).electronAPI) {
                setIsDesktop(true);
                const info = await (window as any).electronAPI.checkSystem();
                setSystemInfo(info);

                const handleLoginAction = (token: string) => {
                    console.log("Processing Desktop OAuth...");
                    window.location.href = `/auth/callback?token=${token}`;
                };

                // 1. Check for missed/pending tokens (startup/reload)
                const pending = await (window as any).electronAPI.getPendingToken();
                if (pending) {
                    handleLoginAction(pending);
                    return;
                }

                // 2. Listen for live protocol callbacks
                (window as any).electronAPI.onAuthSuccess((token: string) => {
                    handleLoginAction(token);
                });
            }
        };
        check();
    }, []);

    const handleConnect = async () => {
        if ((window as any).electronAPI) {
            await (window as any).electronAPI.login();
        }
    };

    if (!isDesktop) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass border border-neon-cyan/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 bg-[#0A0A0B]/80 backdrop-blur-xl"
            >
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-neon-cyan" />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Desktop Pro</span>
                        <Badge className="bg-neon-cyan/20 text-neon-cyan border-none text-[8px] h-4 font-black">
                            {status === 'authenticated' ? 'Synced' : 'Standby'}
                        </Badge>
                    </div>
                    {status === 'authenticated' ? (
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5 font-medium uppercase tracking-tighter">
                            <Cpu className="w-3 h-3" /> {systemInfo?.cpu || "Local GPU Active"}
                            <CheckCircle className="w-3 h-3 text-neon-lime ml-1" />
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleConnect}
                            className="h-5 px-0 text-[9px] text-neon-cyan font-black uppercase tracking-widest hover:bg-transparent"
                        >
                            <Cloud className="w-3 h-3 mr-1" /> Connect Cloud
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
