import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "windows";

    const filenames = {
        windows: "TSX-Studio-Setup.exe",
        mac: "TSX-Studio.dmg",
        linux: "TSX-Studio.AppImage"
    };

    const filename = filenames[platform as keyof typeof filenames] || filenames.windows;
    const localPath = path.join(process.cwd(), "public", "installers", filename);

    // 1. Try local file first (highest priority for "one click" experience)
    if (fs.existsSync(localPath)) {
        return NextResponse.redirect(new URL(`/installers/${filename}`, request.url));
    }

    // 2. Fallback to GitHub Release (Direct Download)
    // We use the direct download URL format which triggers a download without showing the GitHub UI
    const githubBase = "https://github.com/mohitinfluencer/TSX-Studio/releases/latest/download";
    const githubUrl = `${githubBase}/${filename}`;

    return NextResponse.redirect(githubUrl);
}
