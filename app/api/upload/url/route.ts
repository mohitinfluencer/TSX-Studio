import { auth } from "@/auth";
import { getUploadUrl } from "@/lib/s3";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Create a unique key for the file
    const fileExtension = fileName.split('.').pop();
    const uniqueId = crypto.randomUUID();
    const key = `uploads/${session.user.id}/${uniqueId}.${fileExtension}`;

    try {
        const uploadUrl = await getUploadUrl(key, contentType);
        return NextResponse.json({ uploadUrl, key });
    } catch (error) {
        console.error("S3 Presigned URL error:", error);
        return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }
}
