const { app } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * TSX STUDIO - HARDENED PRODUCTION BOOTSTRAP
 * This is the ultimate "Unlock" for native Windows binaries.
 */

if (app.isPackaged) {
    const resourcesPath = process.resourcesPath;
    const unpackedPath = path.join(resourcesPath, 'app.asar.unpacked');
    const unpackedNodeModules = path.join(unpackedPath, 'node_modules');

    // 1. Force-Unlock Remotion Compositor (The Render Engine)
    // We point directly to the package folder where remotion.exe lives
    const compositorPkg = path.join(unpackedNodeModules, '@remotion', 'compositor-win32-x64-msvc');
    if (fs.existsSync(compositorPkg)) {
        process.env.REMOTION_COMPOSITOR_BINARY_PATH = compositorPkg;
    }

    // 2. Force-Unlock esbuild (The Project Builder)
    const esbuildPath = path.join(unpackedNodeModules, '@esbuild', 'win32-x64', 'esbuild.exe');
    if (fs.existsSync(esbuildPath)) {
        process.env.ESBUILD_BINARY_PATH = esbuildPath;
    }

    // 3. Force-Unlock FFmpeg (The Video Encoder)
    const ffmpegPath = path.join(unpackedNodeModules, 'ffmpeg-static', 'ffmpeg.exe');
    const ffprobePath = path.join(unpackedNodeModules, 'ffprobe-static', 'bin', 'win32', 'x64', 'ffprobe.exe');

    if (fs.existsSync(ffmpegPath)) process.env.FFMPEG_BINARY = ffmpegPath;
    if (fs.existsSync(ffprobePath)) process.env.FFPROBE_BINARY = ffprobePath;

    // 4. Disable Security Sandbox
    // This is required for Electron to let these tools "talk" to each other
    process.env.ELECTRON_DISABLE_SANDBOX = '1';
    app.commandLine.appendSwitch('no-sandbox');
    app.commandLine.appendSwitch('disable-gpu-sandbox');
}

const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

if (isDev) {
    require('tsx/cjs');
    require('./main.ts');
} else {
    require('./dist-main/main.js');
}
