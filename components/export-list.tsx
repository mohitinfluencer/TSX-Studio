"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    ExternalLink,
    Play,
    Film,
    FileVideo,
    RefreshCw,
    Activity,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface Job {
    id: string;
    projectId: string;
    versionId: string;
    status: string;
    outputFormat: string;
    resolution: string;
    fps: number;
    progress: number;
    durationSeconds: number | null;
    outputSizeBytes: string | null;
    outputUrl: string | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    project: {
        name: string;
    };
}

interface ExportListProps {
    initialJobs: Job[];
}

export function ExportList({ initialJobs }: ExportListProps) {
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "FAILED">("ALL");
    const router = useRouter();

    const refreshJobs = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/render");
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error("Refresh failed", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Auto refresh while jobs are active
    useEffect(() => {
        const hasActiveJobs = jobs.some(j => isActive(j.status));
        if (hasActiveJobs) {
            const interval = setInterval(refreshJobs, 3000);
            return () => clearInterval(interval);
        }
    }, [jobs]);

    const normalizeStatus = (s: string) => s?.toUpperCase() || "";

    const isActive = (status: string) => {
        const s = normalizeStatus(status);
        return ["QUEUED", "RENDERING", "PROCESSING", "LOCAL_READY", "STARTING"].includes(s);
    };

    const isCompleted = (status: string) => {
        const s = normalizeStatus(status);
        return ["COMPLETED", "SUCCEEDED", "FINISHED"].includes(s);
    };

    const isFailed = (status: string) => {
        const s = normalizeStatus(status);
        return ["FAILED", "ERROR"].includes(s);
    };

    const activeCount = jobs.filter(j => isActive(j.status)).length;
    const completedCount = jobs.filter(j => isCompleted(j.status)).length;
    const failedCount = jobs.filter(j => isFailed(j.status)).length;

    const filteredJobs = jobs.filter(j => {
        if (filter === "ALL") return true;
        if (filter === "ACTIVE") return isActive(j.status);
        if (filter === "COMPLETED") return isCompleted(j.status);
        if (filter === "FAILED") return isFailed(j.status);
        return true;
    });

    const getStatusUI = (job: Job) => {
        const status = normalizeStatus(job.status);
        switch (status) {
            case "COMPLETED":
            case "SUCCEEDED":
            case "FINISHED":
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-2 py-1.5 px-3 uppercase text-[10px] font-black italic">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </Badge>
                );
            case "PROCESSING":
            case "RENDERING":
            case "LOCAL_READY":
            case "STARTING":
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-2 py-1.5 px-3 uppercase text-[10px] font-black italic">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {status === "LOCAL_READY" ? "Ready" : "Rendering"}
                    </Badge>
                );
            case "QUEUED":
                return (
                    <Badge variant="outline" className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20 gap-2 py-1.5 px-3 uppercase text-[10px] font-black italic">
                        <Clock className="w-3.5 h-3.5" /> Queued
                    </Badge>
                );
            case "FAILED":
            case "ERROR":
                return (
                    <div className="flex flex-col gap-1.5 items-start">
                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 gap-2 py-1.5 px-3 uppercase text-[10px] font-black italic">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                        </Badge>
                        {job.errorMessage && (
                            <span className="text-[9px] text-red-400/60 font-medium max-w-[200px] leading-tight flex items-center gap-1.5 group">
                                <Info className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate group-hover:whitespace-normal group-hover:bg-black/80 group-hover:p-2 group-hover:rounded-lg group-hover:border group-hover:border-red-500/20 group-hover:absolute group-hover:z-50 group-hover:mt-12 transition-all">
                                    {job.errorMessage}
                                </span>
                            </span>
                        )}
                    </div>
                );
            default:
                return <Badge variant="secondary" className="uppercase text-[10px] font-black">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[40px] shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center shadow-inner">
                        <Film className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic text-white tracking-tight leading-none uppercase">Export History</h2>
                        <p className="text-xs text-muted-foreground font-medium mt-2 opacity-60">Manage and download your rendered animations.</p>
                    </div>
                </div>

                <Button
                    onClick={refreshJobs}
                    disabled={isRefreshing}
                    variant="outline"
                    className="h-12 px-6 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] group"
                >
                    <RefreshCw className={cn("w-4 h-4 mr-3 transition-transform duration-700", isRefreshing && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Stats/Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setFilter("ACTIVE")}
                    className={cn(
                        "flex items-center justify-between p-6 rounded-[32px] border transition-all active:scale-95",
                        filter === "ACTIVE"
                            ? "bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", filter === "ACTIVE" ? "bg-blue-500/20" : "bg-white/5")}>
                            <Activity className={cn("w-5 h-5", filter === "ACTIVE" ? "text-blue-400" : "text-white/20")} />
                        </div>
                        <span className={cn("font-bold text-sm", filter === "ACTIVE" ? "text-blue-400" : "text-white/40")}>ACTIVE</span>
                    </div>
                    <span className="text-2xl font-black italic text-white leading-none">{activeCount}</span>
                </button>

                <button
                    onClick={() => setFilter("COMPLETED")}
                    className={cn(
                        "flex items-center justify-between p-6 rounded-[32px] border transition-all active:scale-95",
                        filter === "COMPLETED"
                            ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", filter === "COMPLETED" ? "bg-emerald-500/20" : "bg-white/5")}>
                            <CheckCircle2 className={cn("w-5 h-5", filter === "COMPLETED" ? "text-emerald-400" : "text-white/20")} />
                        </div>
                        <span className={cn("font-bold text-sm", filter === "COMPLETED" ? "text-emerald-400" : "text-white/40")}>COMPLETED</span>
                    </div>
                    <span className="text-2xl font-black italic text-white leading-none">{completedCount}</span>
                </button>

                <button
                    onClick={() => setFilter("FAILED")}
                    className={cn(
                        "flex items-center justify-between p-6 rounded-[32px] border transition-all active:scale-95",
                        filter === "FAILED"
                            ? "bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", filter === "FAILED" ? "bg-red-500/20" : "bg-white/5")}>
                            <XCircle className={cn("w-5 h-5", filter === "FAILED" ? "text-red-400" : "text-white/20")} />
                        </div>
                        <span className={cn("font-bold text-sm", filter === "FAILED" ? "text-red-400" : "text-white/40")}>FAILED</span>
                    </div>
                    <span className="text-2xl font-black italic text-white leading-none">{failedCount}</span>
                </button>
            </div>

            {/* Jobs Table */}
            <div className="bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-3xl">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow className="border-white/5 hover:bg-transparent tracking-widest uppercase font-black text-[10px] text-muted-foreground/30 h-16">
                            <TableHead className="w-[280px] px-8">Project</TableHead>
                            <TableHead>Format</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[180px]">Progress</TableHead>
                            <TableHead>Size / Duration</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right px-8">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableCell colSpan={7} className="h-[400px] text-center p-0">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                                <Info className="w-8 h-8 text-white/10" />
                                            </div>
                                            <p className="text-sm font-bold text-white/20 uppercase tracking-[0.2em]">No renders found in this category.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredJobs.map((job, index) => (
                                    <motion.tr
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={cn(
                                            "border-white/5 group transition-all hover:bg-white/[0.03]",
                                            index === filteredJobs.length - 1 && "border-0"
                                        )}
                                    >
                                        <TableCell className="py-6 px-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight text-base italic">
                                                    {job.project?.name || "Deleted Project"}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono opacity-40 uppercase tracking-widest">
                                                    ID: {job.id.slice(0, 8)}...
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/50 font-black italic text-[9px] px-2 py-1 uppercase">
                                                ⚡ {job.outputFormat || "VIDEO"} @ {(job.resolution || "1080p").replace('1080p', '1920')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusUI(job)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2 pr-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black italic text-white/30 uppercase tracking-widest">Progress</span>
                                                    <span className="text-[10px] font-mono text-blue-400/60 font-black">{job.progress}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${job.progress}%` }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white/60">{(job.durationSeconds || 0).toFixed(1)}s</span>
                                                <span className="text-[10px] font-mono text-muted-foreground/40">{job.outputSizeBytes && job.outputSizeBytes !== "0" ? (parseInt(job.outputSizeBytes) / 1024 / 1024).toFixed(1) + ' MB' : '--'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-white/30 italic">
                                                {new Date(job.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                                                    ? "Today at " + new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : new Date(job.createdAt).toLocaleDateString()
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            {isCompleted(job.status) ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        if (job.outputUrl) {
                                                            if (typeof window !== 'undefined' && (window as any).electronAPI) {
                                                                (window as any).electronAPI.openPath(job.outputUrl);
                                                            } else {
                                                                window.open(job.outputUrl, '_blank');
                                                            }
                                                        }
                                                    }}
                                                    className="bg-white text-black hover:bg-neutral-200 font-black italic rounded-xl h-10 px-6 shadow-lg shadow-white/5 group-hover:scale-105 transition-transform"
                                                >
                                                    <Download className="w-4 h-4 mr-2" /> OPEN FILE
                                                </Button>
                                            ) : isFailed(job.status) ? (
                                                <div className="flex items-center justify-end text-red-500 gap-2">
                                                    <XCircle className="w-4 h-4" />
                                                    <span className="text-[10px] font-black italic uppercase">Failed</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-3 text-white/20">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span className="text-[10px] font-black italic uppercase tracking-widest">Processing</span>
                                                </div>
                                            )}
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            {/* Bottom Info */}
            <div className="flex items-center justify-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/10 py-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Hardware Acceleration Active
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    24/7 Cloud Sync
                </div>
            </div>
        </div>
    );
}
