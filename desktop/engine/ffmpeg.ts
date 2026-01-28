import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import path from 'path';
import { app } from 'electron';

export function getFFmpegPath() {
    const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

    if (isDev) {
        return ffmpeg;
    }

    // In production, Electron moves unpacked binaries to app.asar.unpacked
    // We must point to that location or the binary won't execute
    return ffmpeg.replace('app.asar', 'app.asar.unpacked');
}

export function getFFprobePath() {
    const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';
    const binaryPath = ffprobe.path;

    if (isDev) {
        return binaryPath;
    }

    // Fix for production unpacked ASAR
    return binaryPath.replace('app.asar', 'app.asar.unpacked');
}
