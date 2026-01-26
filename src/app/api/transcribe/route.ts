import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { writeFile, mkdir, unlink, readFile } from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";

const ALLOWED_TYPES = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "video/mp4", "audio/mp3"];
const ALLOWED_EXTENSIONS = [".mp3", ".mp4", ".wav", ".m4a"];
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const TRANSCRIPTION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// POST /api/transcribe - Upload and start transcription
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const model = (formData.get("model") as string) || "base";
        const languageMode = formData.get("languageMode") as string | null;
        const scriptOutput = formData.get("scriptOutput") as string | null;
        const clientPrompt = formData.get("prompt") as string | null;

        let finalLanguage: string | null = null;
        let finalPrompt: string | null = clientPrompt;

        // Backend Logic for Language modes
        if (languageMode === "hi") {
            finalLanguage = "hi";
            if (!finalPrompt) finalPrompt = "Transcribe in Hindi using Devanagari script only.";
        } else if (languageMode === "hinglish") {
            finalLanguage = null; // Auto-detect for mixed speech
            if (scriptOutput === "Romanized") {
                finalPrompt = "Sabse pehle ye dekho, ye AI trend viral ho raha hai. Transcribe Hinglish speech mixing Hindi and English using ONLY Latin script (English letters). Write Hindi words as they are pronounced using English letters.";
            } else if (!finalPrompt) {
                finalPrompt = "Transcribe Hinglish speech mixing Hindi and English. Write Hindi in Devanagari and English in Latin. Keep terms like AI, GPT, OpenAI in English.";
            }
        } else if (languageMode === "en") {
            finalLanguage = "en";
        } else if (languageMode === "auto") {
            finalLanguage = null;
        }

        // Validate model
        const validModels = ["tiny", "base", "small", "medium"];
        if (!validModels.includes(model)) {
            return NextResponse.json({ error: "Invalid model. Use: tiny, base, small, medium" }, { status: 400 });
        }

        // Validate file
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json({ error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large. Maximum 200MB allowed" }, { status: 400 });
        }

        // Create job record
        const job = await db.transcriptionJob.create({
            data: {
                userId: session.user.id,
                fileName: file.name,
                filePath: "", // Will be updated
                model,
                status: "QUEUED",
            },
        });

        // Create temp directory and save file
        const tmpDir = path.join(process.cwd(), "tmp", "transcriptions", job.id);
        await mkdir(tmpDir, { recursive: true });

        const inputPath = path.join(tmpDir, file.name);
        const outputPath = path.join(tmpDir, "output.json");

        const bytes = await file.arrayBuffer();
        await writeFile(inputPath, Buffer.from(bytes));

        // Update job with file path
        await db.transcriptionJob.update({
            where: { id: job.id },
            data: { filePath: inputPath, status: "RUNNING" },
        });

        // Start transcription in background
        runTranscription(job.id, inputPath, model, outputPath, finalLanguage, finalPrompt, scriptOutput);

        return NextResponse.json({
            id: job.id,
            status: "RUNNING",
            message: "Transcription started",
        });

    } catch (error: any) {
        console.error("[Transcribe API] Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// GET /api/transcribe - List user's transcription jobs
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const jobs = await db.transcriptionJob.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json(jobs);
    } catch (error: any) {
        console.error("[Transcribe API] Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// Background transcription process
async function runTranscription(
    jobId: string,
    inputPath: string,
    model: string,
    outputPath: string,
    language?: string | null,
    prompt?: string | null,
    script?: string | null
) {
    const pythonScript = path.join(process.cwd(), "transcriber", "transcribe.py");

    const pythonCommand = process.platform === "win32" ? "python" : "python3";

    const args = [pythonScript, inputPath, model, outputPath];
    if (language && language !== "auto") args.push("--language", language);
    if (prompt) args.push("--prompt", prompt);
    if (script && script !== "Auto") args.push("--script", script);

    const child = spawn(pythonCommand, args, {
        timeout: TRANSCRIPTION_TIMEOUT,
    });

    let stderr = "";
    let stdout = "";

    child.stdout.on("data", (data) => {
        stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
        stderr += data.toString();
        // Check for progress updates
        const progressMatch = data.toString().match(/PROGRESS:(\d+)/);
        if (progressMatch) {
            console.log(`[Transcribe] Job ${jobId} progress: ${progressMatch[1]}%`);
        }
    });

    child.on("close", async (code) => {
        try {
            if (code === 0 && existsSync(outputPath)) {
                // Read output JSON
                const jsonContent = await readFile(outputPath, "utf-8");
                const parsed = JSON.parse(jsonContent);

                await db.transcriptionJob.update({
                    where: { id: jobId },
                    data: {
                        status: "DONE",
                        jsonOutput: jsonContent,
                        durationSeconds: parsed.duration || null,
                    },
                });

                console.log(`[Transcribe] Job ${jobId} completed successfully`);
            } else {
                const errorMessage = stderr || stdout || "Unknown error";
                await db.transcriptionJob.update({
                    where: { id: jobId },
                    data: {
                        status: "FAILED",
                        errorMessage: errorMessage.substring(0, 1000),
                    },
                });
                console.error(`[Transcribe] Job ${jobId} failed:`, errorMessage);
            }

            // Cleanup temp files
            try {
                const tmpDir = path.dirname(inputPath);
                if (existsSync(inputPath)) await unlink(inputPath);
                if (existsSync(outputPath)) await unlink(outputPath);
                // Note: Directory cleanup can be done periodically
            } catch (cleanupError) {
                console.warn("[Transcribe] Cleanup warning:", cleanupError);
            }
        } catch (updateError) {
            console.error(`[Transcribe] Failed to update job ${jobId}:`, updateError);
        }
    });

    child.on("error", async (error) => {
        console.error(`[Transcribe] Process error for job ${jobId}:`, error);
        await db.transcriptionJob.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                errorMessage: `Process error: ${error.message}`,
            },
        });
    });
}
