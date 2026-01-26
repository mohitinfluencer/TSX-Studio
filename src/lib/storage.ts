import fs from "fs/promises";
import path from "path";
import { createReadStream } from "fs";

export interface StorageProvider {
    putObject(localFilePath: string, destinationName: string): Promise<string>;
    deleteObject(url: string): Promise<void>;
    getDownloadUrl(destinationName: string): Promise<string>;
}

class LocalStorageProvider implements StorageProvider {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), "public", "exports");
        this.ensureDir();
    }

    private async ensureDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
        } catch (err) {
            // Ignore
        }
    }

    async putObject(localFilePath: string, destinationName: string): Promise<string> {
        await this.ensureDir();
        const destPath = path.join(this.uploadDir, destinationName);
        await fs.copyFile(localFilePath, destPath);
        return `/exports/${destinationName}`;
    }

    async deleteObject(url: string): Promise<void> {
        const fileName = url.split("/").pop();
        if (fileName) {
            const filePath = path.join(this.uploadDir, fileName);
            try {
                await fs.unlink(filePath);
            } catch (err) {
                // Ignore if file not found
            }
        }
    }

    async getDownloadUrl(destinationName: string): Promise<string> {
        return `/exports/${destinationName}`;
    }
}

// In production, we'd use an S3 provider
export const storage = new LocalStorageProvider();
