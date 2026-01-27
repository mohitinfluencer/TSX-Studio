import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";

export interface StorageProvider {
    putObject(localFilePath: string, destinationName: string): Promise<string>;
    deleteObject(url: string): Promise<void>;
}

class S3StorageProvider implements StorageProvider {
    private client: S3Client;
    private bucket: string;

    constructor() {
        this.client = new S3Client({
            region: process.env.AWS_REGION || "auto",
            endpoint: process.env.AWS_ENDPOINT,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
            },
        });
        this.bucket = process.env.AWS_S3_BUCKET || "";
    }

    async putObject(localFilePath: string, destinationName: string): Promise<string> {
        const fileContent = await fs.readFile(localFilePath);
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: `exports/${destinationName}`,
            Body: fileContent,
            ContentType: this.getContentType(destinationName),
        });

        await this.client.send(command);

        // Return public URL or internal key based on configuration
        // For production R2/S3, usually: https://bucket.s3.region.amazonaws.com/key
        // Or if using a CDN/Custom domain:
        const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        return `${baseUrl}/exports/${destinationName}`;
    }

    async deleteObject(url: string): Promise<void> {
        const key = url.split(".com/").pop(); // Basic key extraction
        if (!key) return;

        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await this.client.send(command);
    }

    private getContentType(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'mp4') return 'video/mp4';
        if (ext === 'mov') return 'video/quicktime';
        if (ext === 'json') return 'application/json';
        return 'application/octet-stream';
    }
}

export const storage = new S3StorageProvider();
