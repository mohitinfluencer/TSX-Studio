"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    FileAudio,
    Loader2,
    CheckCircle2,
    XCircle,
    Download,
    Copy,
    Clock,
    Mic,
    Play,
    Trash2,
    RefreshCw,
    FileJson2,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface TranscriptionJob {
    id: string;
    status: string;
    model: string;
    fileName: string;
    durationSeconds: number | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
    hasOutput: boolean;
}

interface TranscribeClientProps {
    initialJobs: TranscriptionJob[];
}

const MODELS = [
    { value: "tiny", label: "Tiny", desc: "~75MB, Fastest" },
    { value: "base", label: "Base", desc: "~150MB, Balanced" },
    { value: "small", label: "Small", desc: "~500MB, Better" },
    { value: "medium", label: "Medium", desc: "~1.5GB, Best" },
];

export function TranscribeClient({ initialJobs }: TranscribeClientProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [jobs, setJobs] = useState<TranscriptionJob[]>(initialJobs);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedModel, setSelectedModel] = useState("base");
    const [isUploading, setIsUploading] = useState(false);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [previewJson, setPreviewJson] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Poll for active job status
    useEffect(() => {
        if (!activeJobId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/transcribe/${activeJobId}`);
                if (res.ok) {
                    const job = await res.json();

                    setJobs(prev => prev.map(j =>
                        j.id === activeJobId
                            ? { ...j, status: job.status, hasOutput: !!job.jsonOutput, errorMessage: job.errorMessage }
                            : j
                    ));

                    if (job.status === "DONE") {
                        setActiveJobId(null);
                        setPreviewJson(job.jsonOutput);
                        toast.success("Transcription complete!");
                    } else if (job.status === "FAILED") {
                        setActiveJobId(null);
                        toast.error(job.errorMessage || "Transcription failed");
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [activeJobId]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && isValidFile(file)) {
            setSelectedFile(file);
        } else {
            toast.error("Invalid file type. Use MP3, MP4, WAV, or M4A");
        }
    }, []);

    const isValidFile = (file: File) => {
        const ext = file.name.toLowerCase().split(".").pop();
        return ["mp3", "mp4", "wav", "m4a"].includes(ext || "");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && isValidFile(file)) {
            setSelectedFile(file);
        } else if (file) {
            toast.error("Invalid file type. Use MP3, MP4, WAV, or M4A");
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("model", selectedModel);

            const res = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Transcription started!");
                setActiveJobId(data.id);
                setJobs(prev => [{
                    id: data.id,
                    status: "RUNNING",
                    model: selectedModel,
                    fileName: selectedFile.name,
                    durationSeconds: null,
                    errorMessage: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    hasOutput: false,
                }, ...prev]);
                setSelectedFile(null);
                setPreviewJson(null);
            } else {
                toast.error(data.error || "Upload failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Upload failed");
        }
        setIsUploading(false);
    };

    const handleViewJob = async (jobId: string) => {
        try {
            const res = await fetch(`/api/transcribe/${jobId}`);
            if (res.ok) {
                const job = await res.json();
                if (job.jsonOutput) {
                    setPreviewJson(job.jsonOutput);
                }
            }
        } catch (error) {
            toast.error("Failed to load transcription");
        }
    };

    const handleDownload = async (jobId: string) => {
        window.open(`/api/transcribe/${jobId}/download`, "_blank");
    };

    const handleCopyJson = () => {
        if (previewJson) {
            navigator.clipboard.writeText(previewJson);
            toast.success("JSON copied to clipboard!");
        }
    };

    const handleCopyClaudePrompt = () => {
        if (previewJson) {
            const prompt = `I have a video/audio transcription with timestamps. Please analyze it and help me:

1. Summarize the key points
2. Identify important timestamps
3. Suggest ways to structure this content

Here is the transcription JSON:

\`\`\`json
${previewJson}
\`\`\``;
            navigator.clipboard.writeText(prompt);
            toast.success("Claude prompt copied!");
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        try {
            const res = await fetch(`/api/transcribe/${jobId}`, { method: "DELETE" });
            if (res.ok) {
                setJobs(prev => prev.filter(j => j.id !== jobId));
                if (previewJson) setPreviewJson(null);
                toast.success("Job deleted");
            }
        } catch (error) {
            toast.error("Failed to delete job");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "DONE":
                return <Badge className="bg-green-500/10 text-green-400 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Done</Badge>;
            case "RUNNING":
                return <Badge className="bg-primary/10 text-primary border-primary/20"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running</Badge>;
            case "FAILED":
                return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
            default:
                return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Queued</Badge>;
        }
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter">
                        Audio <span className="text-primary">Transcriber</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Generate timestamped captions from video or audio using Whisper AI.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.refresh()}
                    className="border-white/10"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel - Uploader */}
                <div className="space-y-6">
                    {/* Dropzone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300
                            ${isDragOver
                                ? "border-primary bg-primary/5 scale-[1.02]"
                                : "border-white/10 hover:border-white/20 bg-card/30"
                            }
                            ${selectedFile ? "border-primary bg-primary/5" : ""}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".mp3,.mp4,.wav,.m4a"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {selectedFile ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                                    <FileAudio className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{selectedFile.name}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                >
                                    Change File
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Drop your file here</p>
                                    <p className="text-muted-foreground text-sm">
                                        or click to browse (MP3, MP4, WAV, M4A up to 200MB)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                Whisper Model
                            </label>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="bg-card/50 border-white/10 h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card/90 backdrop-blur-xl border-white/10">
                                    {MODELS.map(model => (
                                        <SelectItem key={model.value} value={model.value}>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold">{model.label}</span>
                                                <span className="text-xs text-muted-foreground">{model.desc}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-6">
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading || !!activeJobId}
                                className="h-12 px-8 rounded-xl font-black italic uppercase text-xs tracking-widest"
                            >
                                {isUploading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading</>
                                ) : activeJobId ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing</>
                                ) : (
                                    <><Mic className="w-4 h-4 mr-2" /> Transcribe</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Job History */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Recent Transcriptions
                        </h3>

                        {jobs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileJson2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p>No transcriptions yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {jobs.map(job => (
                                    <div
                                        key={job.id}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-card/30 border border-white/5 hover:border-white/10 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <FileAudio className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{job.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(job.status)}
                                            {job.hasOutput && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                        onClick={() => handleViewJob(job.id)}
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                        onClick={() => handleDownload(job.id)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                                                onClick={() => handleDeleteJob(job.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="space-y-6">
                    {/* Status Card */}
                    {activeJobId && (
                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            </div>
                            <div>
                                <p className="font-bold">Transcription in Progress</p>
                                <p className="text-sm text-muted-foreground">
                                    This may take a few minutes depending on file length and model size.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* JSON Preview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                JSON Output
                            </h3>
                            {previewJson && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyJson}
                                        className="h-8 text-xs"
                                    >
                                        <Copy className="w-3 h-3 mr-1" />
                                        Copy JSON
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyClaudePrompt}
                                        className="h-8 text-xs text-primary"
                                    >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Copy Claude Prompt
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="relative rounded-2xl bg-[#0A0A0B] border border-white/5 overflow-hidden min-h-[400px]">
                            {previewJson ? (
                                <pre className="p-6 text-sm font-mono text-green-400/80 overflow-auto max-h-[500px]">
                                    {JSON.stringify(JSON.parse(previewJson), null, 2)}
                                </pre>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <FileJson2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm">Upload and transcribe a file to see the JSON output</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {previewJson && (
                        <div className="flex gap-4">
                            <Button
                                onClick={() => jobs[0]?.id && handleDownload(jobs[0].id)}
                                className="flex-1 h-12 rounded-xl font-black italic uppercase text-xs tracking-widest"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download JSON
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCopyClaudePrompt}
                                className="flex-1 h-12 rounded-xl font-black italic uppercase text-xs tracking-widest border-primary/20 text-primary hover:bg-primary/10"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Copy Claude Prompt
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
