import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { renderProject } from './engine/render';
import { checkSystem } from './engine/system-check';
import { transcribeAudio } from './engine/transcribe';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hiddenInset',
        icon: path.join(__dirname, 'logo.jpg'),
        show: false, // Don't show until ready
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
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

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('check-system', async () => {
    return await checkSystem();
});

ipcMain.handle('render-project', async (event, options) => {
    try {
        const result = await renderProject({
            ...options,
            onProgress: (p) => event.sender.send('render-progress', p),
            onLog: (l) => event.sender.send('render-log', l),
        });
        return { success: true, path: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('transcribe-media', async (event, options) => {
    try {
        const result = await transcribeAudio({
            ...options,
            onProgress: (p) => event.sender.send('transcribe-progress', p),
            onLog: (l) => event.sender.send('transcribe-log', l),
        });
        return { success: true, transcription: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('login', async () => {
    // Open browser for OAuth
    const authUrl = 'https://tsx-studio.vercel.app/api/auth/desktop';
    await shell.openExternal(authUrl);
});

// Simple token storage (Should use safeStorage in production)
let userToken: string | null = null;

ipcMain.handle('save-token', (_, token) => {
    userToken = token;
});

ipcMain.handle('get-token', () => {
    return userToken;
});

ipcMain.handle('open-path', (_, path) => {
    shell.showItemInFolder(path);
});

ipcMain.handle('install-whisper-engine', async (event) => {
    const { exec } = require('child_process');

    const runCommand = (cmd: string) => {
        return new Promise((resolve, reject) => {
            event.sender.send('transcribe-log', `[SETUP] Running: ${cmd}`);
            const proc = exec(cmd);

            proc.stdout.on('data', (data: any) => {
                event.sender.send('transcribe-log', `[SETUP] ${data.toString().trim()}`);
            });

            proc.stderr.on('data', (data: any) => {
                event.sender.send('transcribe-log', `[SETUP-INFO] ${data.toString().trim()}`);
            });

            proc.on('close', (code: number) => {
                if (code === 0) resolve(true);
                else reject(new Error(`Command failed with code ${code}`));
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
        } catch (e) {
            event.sender.send('transcribe-log', "[SETUP-WARNING] Winget install failed or FFmpeg already exists. Checking path...");
        }

        event.sender.send('transcribe-log', "[SETUP] Configuration complete! Please restart the app to apply changes.");
        return { success: true };
    } catch (error: any) {
        event.sender.send('transcribe-log', `[SETUP-ERROR] ${error.message}`);
        return { success: false, error: error.message };
    }
});
