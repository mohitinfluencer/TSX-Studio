import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "windows";

    const filenames = {
        windows: "TSX-Studio-Setup.exe",
        windows_portable: "TSX-Studio-Portable.zip",
        mac: "TSX-Studio.dmg",
        linux: "TSX-Studio.AppImage"
    };

    let filename = filenames[platform as keyof typeof filenames] || filenames.windows;
    let localPath = path.join(process.cwd(), "public", "installers", filename);

    // Smart local fallback for Windows: 
    if (platform === "windows" && !fs.existsSync(localPath)) {
        const portablePath = path.join(process.cwd(), "public", "installers", filenames.windows_portable);
        if (fs.existsSync(portablePath)) {
            filename = filenames.windows_portable;
            localPath = portablePath;
        }
    }

    // 1. Serve local file DIRECTLY (One-Click, stays on domain)
    if (fs.existsSync(localPath)) {
        try {
            const file = fs.readFileSync(localPath);
            return new NextResponse(file, {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        } catch (e) {
            console.error("Local serve failed:", e);
        }
    }

    // 2. Fallback to GitHub Release (Direct Download)
    const githubBase = "https://github.com/mohitinfluencer/TSX-Studio/releases/latest/download";
    const githubUrl = `${githubBase}/${filename}`;

    return NextResponse.redirect(githubUrl);
}
