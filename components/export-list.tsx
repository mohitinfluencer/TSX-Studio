"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw, Loader2, Clock, CheckCircle2, XCircle, Film, Zap, Terminal, Globe, CloudUpload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

interface RenderJob {
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
    startedAt: string | null;
    finishedAt: string | null;
    project?: { name: string };
}

interface ExportListProps {
    initialJobs: RenderJob[];
}

export function ExportList({ initialJobs }: ExportListProps) {
    const [jobs, setJobs] = useState<RenderJob[]>(initialJobs);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchJobs = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/render");
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const hasActiveJobs = jobs.some(j => j.status === "QUEUED" || j.status === "RUNNING");
        if (!hasActiveJobs) return;

        const interval = setInterval(fetchJobs, 3000);
        return () => clearInterval(interval);
    }, [jobs]);

    const copyCommand = (projectId: string) => {
        navigator.clipboard.writeText(`tsx-studio render ${projectId}`);
        toast.success("CLI command copied to clipboard!");
    };

    const formatFileSize = (bytes: string | null) => {
        if (!bytes) return "—";
        const size = parseInt(bytes);
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Calculate stats
    const localJobs = jobs.filter(j => j.status === "LOCAL_READY").length;
    const completedJobs = jobs.filter(j => j.status === "SUCCEEDED" || j.status === "UPLOADED").length;
    const failedJobs = jobs.filter(j => j.status === "FAILED").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight italic uppercase italic">Production <span className="text-blue-500">Node History</span></h1>
                    <p className="text-muted-foreground font-medium text-sm">Managing results from your local rendering clusters.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        className="gap-2 border-white/5 bg-white/5 hover:bg-white/10 text-xs font-bold"
                        onClick={fetchJobs}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={isRefreshing ? "w-4 h-4 animate-spin text-blue-400" : "w-4 h-4 text-blue-400"} />
                        {isRefreshing ? "Syncing..." : "Sync Status"}
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    title="Ready to Render"
                    value={localJobs}
                    icon={<Terminal className="w-5 h-5 text-blue-400" />}
                    color="blue"
                />
                <StatCard
                    title="Sync'd to Cloud"
                    value={completedJobs}
                    icon={<Globe className="w-5 h-5 text-green-400" />}
                    color="green"
                />
                <StatCard
                    title="System Errors"
                    value={failedJobs}
                    icon={<XCircle className="w-5 h-5 text-red-400" />}
                    color="red"
                />
            </div>

            {/* Jobs Table */}
            <div className="rounded-[32px] border border-white/5 bg-card/30 backdrop-blur-xl overflow-hidden p-1 shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                        <TableRow className="border-0 hover:bg-transparent">
                            <TableHead className="text-[10px] uppercase font-black tracking-widest px-8">Production Name</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Configuration</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Status</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Hardware Work</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Metadata</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Logged</TableHead>
                            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest px-8">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-60 border-0">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                                            <Film className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <h3 className="font-black italic text-xl mb-1 uppercase tracking-tighter">No Productions Recorded</h3>
                                        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                                            Prepare a project bundle to start rendering using your local CPU/GPU clusters.
                                        </p>
                                        <Link href="/dashboard">
                                            <Button className="bg-blue-600 hover:bg-blue-700 font-bold px-8 rounded-full">
                                                Go to Dashboard
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell className="font-medium px-8">
                                        <div className="flex flex-col">
                                            <Link href={`/studio/${job.projectId}`} className="text-sm font-bold italic group-hover:text-blue-400 transition-colors">
                                                {job.project?.name || "Unknown Production"}
                                            </Link>
                                            <span className="text-[9px] text-muted-foreground font-mono opacity-50">
                                                ID: {job.id.slice(0, 8)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[9px] border-white/5 font-black uppercase gap-1 bg-white/5 px-2">
                                            <Zap className="w-2.5 h-2.5 text-blue-400" />
                                            {job.outputFormat} • {job.resolution}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={job.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground mb-1">
                                                <span>Workload</span>
                                                <span>{job.progress}%</span>
                                            </div>
                                            <Progress value={job.progress} className="h-1 w-20 bg-white/5" />

                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-medium">
                                        <div className="flex flex-col">
                                            <span>{formatFileSize(job.outputSizeBytes)}</span>
                                            <span className="text-[9px] opacity-60 italic">{job.durationSeconds ? `${job.durationSeconds}s` : ""}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">
                                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        {job.status === "LOCAL_READY" ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 h-8 border-blue-500/30 text-blue-400 hover:bg-blue-400 hover:text-black font-bold text-[10px] uppercase tracking-tighter"
                                                onClick={() => copyCommand(job.projectId)}
                                            >
                                                <Terminal className="w-3.5 h-3.5" /> Copy CLI
                                            </Button>
                                        ) : (job.status === "SUCCEEDED" || job.status === "UPLOADED") && job.outputUrl ? (
                                            <a href={job.outputUrl} download target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="default" className="gap-2 h-8 bg-white text-black hover:bg-green-400 font-bold text-[10px] uppercase">
                                                    <Download className="w-3.5 h-3.5" /> Download
                                                </Button>
                                            </a>
                                        ) : job.status === "FAILED" ? (
                                            <Badge variant="destructive" className="font-black text-[9px] uppercase">Hardware Error</Badge>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase text-muted-foreground animate-pulse">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Compute Active</span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: "blue" | "green" | "red" }) {
    const colorClasses = {
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        green: "bg-green-500/10 border-green-500/20 text-green-400",
        red: "bg-red-500/10 border-red-500/20 text-red-400",
    };

    return (
        <div className={`p-5 rounded-[24px] border bg-card/30 backdrop-blur-xl shadow-lg hover:translate-y-[-2px] transition-all`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-black italic">{value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{title}</p>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "LOCAL_READY":
            return (
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 gap-1.5 text-[9px] font-black uppercase px-2 py-0.5">
                    <Terminal className="w-2.5 h-2.5" /> Ready Local
                </Badge>
            );
        case "UPLOADED":
        case "SUCCEEDED":
            return (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/30 gap-1.5 text-[9px] font-black uppercase px-2 py-0.5">
                    <CloudUpload className="w-2.5 h-2.5" /> Cloud Sync'd
                </Badge>
            );
        case "RUNNING":
            return (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1.5 text-[9px] font-black uppercase px-2 py-0.5">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Syncing
                </Badge>
            );
        case "FAILED":
            return (
                <Badge variant="destructive" className="gap-1.5 text-[9px] font-black uppercase px-2 py-0.5">
                    <XCircle className="w-2.5 h-2.5" /> Failed
                </Badge>
            );
        default:
            return <Badge variant="outline" className="text-[9px] font-black uppercase">{status}</Badge>;
    }
}
