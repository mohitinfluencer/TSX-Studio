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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Rocket, Loader2, CheckCircle2, Film, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ExportDialogProps {
    projectId: string;
    versionId: string;
    disabled?: boolean;
    isLoggedIn?: boolean;
    width?: number;
    height?: number;
    fps?: number;
    durationInFrames?: number;
    code?: string;
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
    code = ""
}: ExportDialogProps) {
    const [isExporting, setIsExporting] = useState(false);

    // Export Options
    const [format, setFormat] = useState("mp4");
    const [quality, setQuality] = useState("high");

    const [open, setOpen] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const [isLoadingCredits, setIsLoadingCredits] = useState(false);
    const router = useRouter();

    const cost = 1; // Simplify cost for now

    // Fetch credits when dialog opens
    useEffect(() => {
        if (open) {
            fetchCredits();
        }
    }, [open]);

    async function fetchCredits() {
        setIsLoadingCredits(true);
        try {
            const res = await fetch("/api/user/credits");
            if (res.ok) {
                const data = await res.json();
                setCredits(data.creditsBalance);
            }
        } catch (error) {
            console.error("Failed to fetch credits");
        }
        setIsLoadingCredits(false);
    }

    async function startExport() {
        if (credits !== null && credits < cost) {
            toast.error(`Insufficient credits. Required: ${cost}, Available: ${credits}`);
            return;
        }

        setIsExporting(true);
        try {
            const response = await fetch("/api/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    versionId,
                    format,
                    quality,
                    width,
                    height,
                    fps,
                    durationInFrames,
                    code,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to start export");
            }

            toast.success("Export job queued successfully!");
            setOpen(false);
            router.push("/exports");
        } catch (error: any) {
            toast.error(error.message || "Failed to start export.");
        } finally {
            setIsExporting(false);
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
                <Button size="sm" className="gap-2 text-xs h-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0">
                    <Rocket className="w-3.5 h-3.5" /> Export Video
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0A0A0B] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-green-500" />
                        Export Configuration
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Configure your video render settings.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Summary */}
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Dimensions:</span>
                            <span className="font-mono font-bold text-green-400">{width}x{height}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Frame Rate:</span>
                            <span className="font-mono font-bold text-green-400">{fps} FPS</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-mono font-bold text-primary">{Math.round(durationInFrames / fps)}s ({durationInFrames} frames)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="format">Format</Label>
                            <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger id="format" className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111112] border-white/10">
                                    <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                                    <SelectItem value="mov">MOV (ProRes)</SelectItem>
                                    <SelectItem value="webm">WebM (Transparent)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quality">Quality</Label>
                            <Select value={quality} onValueChange={setQuality}>
                                <SelectTrigger id="quality" className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Quality" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111112] border-white/10">
                                    <SelectItem value="high">High (Best)</SelectItem>
                                    <SelectItem value="medium">Medium (Standard)</SelectItem>
                                    <SelectItem value="low">Low (Fast)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold mb-1">Estimated Cost: {cost} Credit(s)</p>
                            <p className="opacity-70">
                                {isLoadingCredits ? "Checking balance..." : `Your Balance: ${credits ?? 0} Credits`}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isExporting}>Cancel</Button>
                    <Button
                        onClick={startExport}
                        disabled={isExporting || isLoadingCredits || (credits !== null && credits < cost)}
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                        {isExporting ? "Rendering..." : "Render Video"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
