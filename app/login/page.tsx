"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Globe, ArrowRight, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your system identity email");
            return;
        }

        setIsLoading(true);
        try {
            await signIn("credentials", {
                email,
                callbackUrl: "/dashboard",
                redirect: true
            });
            toast.success("Identity verified. Accessing clusters...");
        } catch (error) {
            toast.error("Handshake failed. Protocol error.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden selection:bg-neon-cyan/30 selection:text-neon-cyan">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 grayscale pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 blur-[120px] pointer-events-none rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-white/5 bg-background/40 backdrop-blur-3xl rounded-[40px] shadow-2xl p-4 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Terminal className="w-24 h-24 text-neon-cyan" />
                    </div>

                    <CardHeader className="space-y-4 text-center pt-8">
                        <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto shadow-2xl group transition-all">
                            <Terminal className="w-6 h-6 text-neon-cyan group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-3xl font-display font-black tracking-tighter italic uppercase text-white">Identity Check</CardTitle>
                            <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 italic">
                                Establish your secure production link
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-8">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Universal Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your-node@identity.com"
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 font-medium text-white focus:border-neon-cyan/30 focus:ring-neon-cyan/20 transition-all placeholder:text-muted-foreground/30 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 text-lg font-black italic bg-white text-black hover:bg-neon-cyan hover:shadow-[0_0_30px_rgba(39,242,255,0.4)] rounded-2xl transition-all group"
                            >
                                {isLoading ? "Synching..." : "Initiate Session"}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em]">
                                <span className="bg-transparent px-4 text-muted-foreground/40">External Protocols</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => {
                                if (typeof window !== 'undefined' && (window as any).electronAPI) {
                                    (window as any).electronAPI.login();
                                } else {
                                    signIn("google");
                                }
                            }}
                            className="w-full h-14 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl font-black italic text-sm group"
                        >
                            <Globe className="mr-3 w-5 h-5 text-neon-cyan" />
                            Link Google Node
                        </Button>
                    </CardContent>

                    <CardFooter className="flex flex-col items-center gap-6 pb-12 pt-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">
                            New creative entity?
                            <Link href="/signup" className="text-neon-cyan hover:text-white transition-colors underline decoration-neon-cyan/20 underline-offset-4">
                                Register Cluster
                            </Link>
                        </div>

                        <div className="flex items-center gap-4 text-muted-foreground/20">
                            <Sparkles className="w-4 h-4" />
                            <div className="w-[1px] h-4 bg-white/5" />
                            <span className="text-[8px] font-black uppercase tracking-[0.5em]">TSX PRODUCTION ENGINE V.0.9</span>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
