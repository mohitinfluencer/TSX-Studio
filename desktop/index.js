const { app } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * TSX STUDIO - PRODUCTION BOOTSTRAP
 * Sets up the environment for native binary execution (FFmpeg, esbuild, compositor, etc.)
 */

if (app.isPackaged) {
    const resourcesPath = process.resourcesPath;
    const unpackedPath = path.join(resourcesPath, 'app.asar.unpacked');

    // 1. Fix esbuild (Bundling Engine)
    const esbuildPath = path.join(unpackedPath, 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe');
    if (fs.existsSync(esbuildPath)) {
        process.env.ESBUILD_BINARY_PATH = esbuildPath;
    }

    // 2. Fix Remotion Compositor (Native Rendering Engine)
    const compositorDir = path.join(unpackedPath, 'node_modules', '@remotion', 'compositor-win32-x64-msvc');
    if (fs.existsSync(compositorDir)) {
        process.env.REMOTION_COMPOSITOR_BINARY_PATH = compositorDir;
    }

    // 3. Fix FFmpeg / FFprobe (Media Encoding)
    const ffmpegPath = path.join(unpackedPath, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
    const ffprobePath = path.join(unpackedPath, 'node_modules', 'ffprobe-static', 'bin', 'win32', 'x64', 'ffprobe.exe');

    if (fs.existsSync(ffmpegPath)) process.env.FFMPEG_BINARY = ffmpegPath;
    if (fs.existsSync(ffprobePath)) process.env.FFPROBE_BINARY = ffprobePath;

    // 4. Permission & Sandbox Fixes
    process.env.ELECTRON_DISABLE_SANDBOX = '1';
}

const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

if (isDev) {
    require('tsx/cjs');
    require('./main.ts');
} else {
    require('./dist-main/main.js');
}
