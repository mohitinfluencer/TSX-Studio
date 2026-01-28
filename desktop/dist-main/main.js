"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const render_1 = require("./engine/render");
const system_check_1 = require("./engine/system-check");
const transcribe_1 = require("./engine/transcribe");
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hiddenInset',
        icon: path_1.default.join(__dirname, 'logo.jpg'),
        show: false, // Don't show until ready
        webPreferences: {
            preload: path_1.default.resolve(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // Needed for compute-heavy tasks if node APIs used in main
            webSecurity: false // Temporary allow for local file access if needed
        },
    });
    // FORCE LOCALHOST for development/testing
    const loadUrl = process.env.TSX_APP_URL || 'http://localhost:3000';
    mainWindow.loadURL(loadUrl);
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    // DevTools disabled as requested
    mainWindow.webContents.on('devtools-opened', () => {
        mainWindow?.webContents.closeDevTools();
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// IPC Handlers
electron_1.ipcMain.handle('check-system', async () => {
    return await (0, system_check_1.checkSystem)();
});
electron_1.ipcMain.handle('render-project', async (event, options) => {
    try {
        const result = await (0, render_1.renderProject)({
            ...options,
            onProgress: (p) => event.sender.send('render-progress', p),
            onLog: (l) => event.sender.send('render-log', l),
        });
        return { success: true, path: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('transcribe-media', async (event, options) => {
    try {
        const result = await (0, transcribe_1.transcribeAudio)({
            ...options,
            onProgress: (p) => event.sender.send('transcribe-progress', p),
            onLog: (l) => event.sender.send('transcribe-log', l),
        });
        return { success: true, transcription: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('login', async () => {
    // Open browser for OAuth
    const authUrl = 'https://tsx-studio.vercel.app/api/auth/desktop';
    await electron_1.shell.openExternal(authUrl);
});
// Simple token storage (Should use safeStorage in production)
let userToken = null;
electron_1.ipcMain.handle('save-token', (_, token) => {
    userToken = token;
});
electron_1.ipcMain.handle('get-token', () => {
    return userToken;
});
electron_1.ipcMain.handle('open-path', (_, path) => {
    electron_1.shell.showItemInFolder(path);
});
electron_1.ipcMain.handle('install-whisper-engine', async (event) => {
    const { exec } = require('child_process');
    const runCommand = (cmd) => {
        return new Promise((resolve, reject) => {
            event.sender.send('transcribe-log', `[SETUP] Running: ${cmd}`);
            const proc = exec(cmd);
            proc.stdout.on('data', (data) => {
                event.sender.send('transcribe-log', `[SETUP] ${data.toString().trim()}`);
            });
            proc.stderr.on('data', (data) => {
                event.sender.send('transcribe-log', `[SETUP-INFO] ${data.toString().trim()}`);
            });
            proc.on('close', (code) => {
                if (code === 0)
                    resolve(true);
                else
                    reject(new Error(`Command failed with code ${code}`));
            });
        });
    };
    try {
        event.sender.send('transcribe-log', "[SETUP] Starting automatic environment configuration...");
        // 1. Install Whisper via Pip
        await runCommand('pip install -U openai-whisper');
        // 2. Install FFmpeg via Winget (Standard on Windows 10/11)
        event.sender.send('transcribe-log', "[SETUP] Attempting to install FFmpeg...");
        try {
            await runCommand('winget install ffmpeg --accept-source-agreements --accept-package-agreements');
        }
        catch (e) {
            event.sender.send('transcribe-log', "[SETUP-WARNING] Winget install failed or FFmpeg already exists. Checking path...");
        }
        event.sender.send('transcribe-log', "[SETUP] Configuration complete! Please restart the app to apply changes.");
        return { success: true };
    }
    catch (error) {
        event.sender.send('transcribe-log', `[SETUP-ERROR] ${error.message}`);
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=main.js.map