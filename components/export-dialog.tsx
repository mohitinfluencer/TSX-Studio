"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Rocket, Loader2, Download, Terminal, Info, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ExportDialogProps {
    projectId: string;
    versionId: string;
    disabled?: boolean;
    isLoggedIn?: boolean;
    width?: number;
    height?: number;
    fps?: number;
    durationInFrames?: number;
}

export function ExportDialog({
    projectId,
    versionId,
    disabled = false,
    isLoggedIn = false,
    width = 1080,
    height = 1920,
    fps = 30,
    durationInFrames = 300,
}: ExportDialogProps) {
    const [step, setStep] = useState(1);
    const [isPreparing, setIsPreparing] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function prepareLocalRender() {
        setIsPreparing(true);
        try {
            const response = await fetch("/api/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, versionId }),
            });

            if (!response.ok) throw new Error("Failed to bundle project");

            toast.success("Project bundle verified and ready.");
            setStep(2);
        } catch (error: any) {
            toast.error(error.message || "Failed to prepare bundle.");
        } finally {
            setIsPreparing(false);
        }
    }

    if (disabled) {
        return (
            <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                <Button size="sm" variant="outline" className="gap-2 text-[10px] h-8 font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/10">
                    <Rocket className="w-3.5 h-3.5" /> {isLoggedIn ? "Start Real Project" : "Sign in to Export"}
                </Button>
            </Link>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 text-xs h-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0">
                    <Rocket className="w-3.5 h-3.5" /> Render Video
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-[#0A0A0B] border-white/10 text-white overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-2xl font-black italic">
                                    <Terminal className="w-6 h-6 text-blue-400" />
                                    LOCAL RENDERING ENGINE
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium">
                                    To ensure maximum quality and unlimited duration, TSX Studio renders videos using your local hardware.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <Info className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold text-blue-200">Why local?</p>
                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            Cloud rendering is limited to 30 seconds. Local rendering allows for any duration, custom fonts, and utilizes your GPU for faster processing.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button variant="ghost" onClick={() => setOpen(false)}>Later</Button>
                                <Button
                                    onClick={prepareLocalRender}
                                    disabled={isPreparing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                >
                                    {isPreparing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                                    {isPreparing ? "Bundling..." : "Prepare Local Bundle"}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-2xl font-black italic">
                                    <Download className="w-6 h-6 text-green-400" />
                                    READY TO RENDER
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium">
                                    Follow these steps to generate your ultra-high-quality MP4.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 font-mono">
                                <div className="p-4 bg-black rounded-xl border border-white/5 space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Step 1: Install CLI</p>
                                        <code className="block bg-white/5 p-2 rounded text-blue-300 text-xs">npm install -g @tsx-studio/cli</code>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Step 2: Authenticate</p>
                                        <code className="block bg-white/5 p-2 rounded text-blue-300 text-xs text-wrap break-all">tsx-studio auth your_api_secret</code>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Step 3: Run Render</p>
                                        <code className="block bg-green-500/10 border border-green-500/20 p-2 rounded text-green-400 text-xs">tsx-studio render {projectId}</code>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 hover:bg-white/5">Back</Button>
                                <Button
                                    onClick={() => {
                                        setOpen(false);
                                        router.push("/exports");
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                                >
                                    Go to My Renders
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
