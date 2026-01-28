import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import path from 'path';
import fs from 'fs-extra';

export function getFFmpegPath() {
    if (process.env.NODE_ENV === 'development') {
        return ffmpeg;
    }

    // In production (Electron packed), we need to handle the path correctly
    // This depends on how electron-builder bundles the static bin
    return ffmpeg;
}

export function getFFprobePath() {
    return ffprobe.path;
}
