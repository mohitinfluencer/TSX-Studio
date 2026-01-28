import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function upload() {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.error('❌ Missing BLOB_READ_WRITE_TOKEN in .env file!');
        process.exit(1);
    }

    const filePath = path.join(process.cwd(), 'desktop', 'dist', 'TSX Studio Setup 1.0.0.exe');

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Could not find installer at: ${filePath}`);
        console.log('Please make sure you have built the electron app first.');
        process.exit(1);
    }

    console.log('🚀 Uploading 216MB installer to Vercel Blob... (This may take a few minutes)');

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const blob = await put('installers/TSX-Studio-Setup-1.0.0.exe', fileBuffer, {
            access: 'public',
            addRandomSuffix: false, // Keep the URL clean
            contentType: 'application/octet-stream',
            token: token
        });

        console.log('✅ Upload Success!');
        console.log('-------------------');
        console.log('Blob URL:', blob.url);
        console.log('-------------------');
        console.log('👉 ACTION REQUIRED: Add this to your .env file:');
        console.log(`NEXT_PUBLIC_INSTALLER_URL="${blob.url}"`);
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
    }
}

upload();
