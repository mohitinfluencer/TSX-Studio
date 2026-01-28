const { app } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * TSX STUDIO - PRODUCTION BOOTSTRAP
 * Discovers and "Unlocks" native binaries from the ASAR archive.
 */

if (app.isPackaged) {
    const resourcesPath = process.resourcesPath;
    const unpackedPath = path.join(resourcesPath, 'app.asar.unpacked');
    const unpackedNodeModules = path.join(unpackedPath, 'node_modules');

    // 1. Unlocked Compositor (Rust Engine)
    // Pointing to the node_modules folder allows Remotion to find @remotion/compositor-*
    if (fs.existsSync(unpackedNodeModules)) {
        process.env.REMOTION_COMPOSITOR_BINARY_PATH = unpackedNodeModules;
    }

    // 2. Unlocked Bundler (esbuild)
    const esbuildPath = path.join(unpackedNodeModules, 'esbuild', 'esbuild.exe');
    const esbuildWinPath = path.join(unpackedNodeModules, '@esbuild', 'win32-x64', 'esbuild.exe');

    if (fs.existsSync(esbuildWinPath)) {
        process.env.ESBUILD_BINARY_PATH = esbuildWinPath;
    } else if (fs.existsSync(esbuildPath)) {
        process.env.ESBUILD_BINARY_PATH = esbuildPath;
    }

    // 3. Unlocked Media Engine (FFmpeg)
    const ffmpegPath = path.join(unpackedNodeModules, 'ffmpeg-static', 'ffmpeg.exe');
    const ffprobePath = path.join(unpackedNodeModules, 'ffprobe-static', 'bin', 'win32', 'x64', 'ffprobe.exe');

    if (fs.existsSync(ffmpegPath)) process.env.FFMPEG_BINARY = ffmpegPath;
    if (fs.existsSync(ffprobePath)) process.env.FFPROBE_BINARY = ffprobePath;

    // 4. Critical: Disable sandbox for child processes
    // This removes the "Permission" blocks and "ENOENT" spawn errors.
    process.env.ELECTRON_DISABLE_SANDBOX = '1';
}

const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

if (isDev) {
    require('tsx/cjs');
    require('./main.ts');
} else {
    require('./dist-main/main.js');
}
