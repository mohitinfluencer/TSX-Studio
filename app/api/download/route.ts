import { head } from "@vercel/blob";
import { NextResponse } from "next/server";

// This route serves as a professional proxy/redirect to Vercel Blob
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "windows";

    // In a real production environment, you would store this URL in an Env Var
    // or use the 'list' function to find the latest installer.
    // For now, we use the specific Vercel Blob URL we'll generate.

    // FALLBACK: If no blob is configured yet, we handle it gracefully.
    const blobUrl = process.env.NEXT_PUBLIC_INSTALLER_URL;

    if (!blobUrl && platform === "windows") {
        return new NextResponse("Installer not yet uploaded to Vercel Blob. Please run the upload script.", { status: 404 });
    }

    // Redirect to the Blob URL. 
    // Vercel Blob automatically handles 'content-disposition' if configured during upload,
    // ensuring it downloads as a file rather than opening in the browser.
    return NextResponse.redirect(new URL(blobUrl || "", request.url));
}
