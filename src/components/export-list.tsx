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
import { Download, RefreshCw, Loader2, Clock, CheckCircle2, XCircle, Film, Zap } from "lucide-react";
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

        const interval = setInterval(fetchJobs, 2000);
        return () => clearInterval(interval);
    }, [jobs]);

    const handleRetry = async (job: RenderJob) => {
        try {
            const res = await fetch("/api/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: job.projectId,
                    versionId: job.versionId,
                    format: job.outputFormat,
                    resolution: job.resolution,
                    fps: job.fps,
                }),
            });

            if (res.ok) {
                toast.success("Retry job queued!");
                fetchJobs();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to retry");
            }
        } catch (error) {
            toast.error("Failed to retry job");
        }
    };

    const formatFileSize = (bytes: string | null) => {
        if (!bytes) return "—";
        const size = parseInt(bytes);
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "—";
        return `${seconds.toFixed(1)}s`;
    };

    // Calculate stats
    const activeJobs = jobs.filter(j => j.status === "QUEUED" || j.status === "RUNNING").length;
    const completedJobs = jobs.filter(j => j.status === "SUCCEEDED").length;
    const failedJobs = jobs.filter(j => j.status === "FAILED").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight italic">Export <span className="text-primary">History</span></h1>
                    <p className="text-muted-foreground">Manage and download your rendered animations.</p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2 border-white/5 bg-card/50"
                    onClick={fetchJobs}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={isRefreshing ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-card/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Loader2 className={`w-5 h-5 text-blue-400 ${activeJobs > 0 ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeJobs}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-card/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{completedJobs}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-card/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{failedJobs}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Failed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest">Project</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest">Format</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest">Progress</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest">Size / Duration</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest">Created</TableHead>
                            <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Film className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                        <h3 className="font-bold mb-1">No exports yet</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Go to a project and click Export to render your first animation.
                                        </p>
                                        <Link href="/dashboard">
                                            <Button variant="outline" size="sm" className="border-white/10">
                                                Go to Dashboard
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <Link href={`/studio/${job.projectId}`} className="text-sm font-semibold hover:text-primary transition-colors">
                                                {job.project?.name || "Unknown Project"}
                                            </Link>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                {job.id.slice(0, 12)}...
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] border-white/10 uppercase gap-1">
                                            <Zap className="w-2.5 h-2.5" />
                                            {job.outputFormat} @ {job.resolution}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={job.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5">
                                            <Progress value={job.progress} className="h-1.5 w-20" />
                                            <span className="text-[10px] text-muted-foreground">{job.progress}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span>{formatFileSize(job.outputSizeBytes)}</span>
                                            <span className="text-[10px]">{formatDuration(job.durationSeconds)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {job.status === "SUCCEEDED" && job.outputUrl ? (
                                            <a href={job.outputUrl} download target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="default" className="gap-2 h-8">
                                                    <Download className="w-3.5 h-3.5" /> Download
                                                </Button>
                                            </a>
                                        ) : job.status === "FAILED" ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 h-8 border-white/10 text-amber-400 hover:text-amber-300"
                                                onClick={() => handleRetry(job)}
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" /> Retry
                                            </Button>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                                <span>Processing</span>
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

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "QUEUED":
            return (
                <Badge variant="secondary" className="gap-1.5 text-[10px]">
                    <Clock className="w-3 h-3" /> Queued
                </Badge>
            );
        case "RUNNING":
            return (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 gap-1.5 text-[10px]">
                    <Loader2 className="w-3 h-3 animate-spin" /> Rendering
                </Badge>
            );
        case "SUCCEEDED":
            return (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1.5 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Complete
                </Badge>
            );
        case "FAILED":
            return (
                <Badge variant="destructive" className="gap-1.5 text-[10px]">
                    <XCircle className="w-3 h-3" /> Failed
                </Badge>
            );
        default:
            return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
}
