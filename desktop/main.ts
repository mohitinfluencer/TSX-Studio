import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { renderProject } from './engine/render';
import { checkSystem } from './engine/system-check';
import { transcribeAudio } from './engine/transcribe';
import fs from 'fs-extra';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

// 1. Register Custom Protocol (Deep Linking)
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('tsx-studio', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('tsx-studio');
}

/**
 * Handle Auth Callback from Browser
 */
function handleAuthProtocol(url: string) {
    if (!url) return;

    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'auth' || urlObj.pathname.includes('auth')) {
            const token = urlObj.searchParams.get('token');
            if (token) {
                console.log('Successfully extracted auth token via protocol');
                if (mainWindow) {
                    mainWindow.webContents.send('auth-success', token);
                    mainWindow.focus();
                }
                // Also store it for safety
                userToken = token;
            }
        }
    } catch (e) {
        console.error('Failed to parse protocol URL:', e);
    }
}

// 2. Single Instance Lock (Required for Deep Linking on Windows)
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }

        // Protocol Handling for Windows
        const url = commandLine.pop();
        if (url && url.startsWith('tsx-studio://')) {
            handleAuthProtocol(url);
        }
    });

    app.whenReady().then(() => {
        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });

        // Protocol Handling for macOS
        app.on('open-url', (event, url) => {
            event.preventDefault();
            handleAuthProtocol(url);
        });
    });
}

function createWindow() {
    const rootPath = app.isPackaged ? path.join(__dirname, '..') : __dirname;

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        title: 'TSX Studio',
        icon: path.join(rootPath, 'logo.jpg'),
        show: false,
        backgroundColor: '#000000',
        webPreferences: {
            preload: app.isPackaged
                ? path.join(__dirname, 'preload.js')
                : path.join(rootPath, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webSecurity: false
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173'); // Updated to vite default port if renderer is separate, but main.ts was 3000
    } else {
        const prodUrl = 'https://tsx-studio-v2.vercel.app';
        mainWindow.loadURL(prodUrl).catch(() => {
            mainWindow?.loadFile(path.join(rootPath, 'dist-renderer', 'index.html'));
        });
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();

        // Check if app was started via protocol
        const args = process.argv;
        const protocolArg = args.find(arg => arg.startsWith('tsx-studio://'));
        if (protocolArg) {
            handleAuthProtocol(protocolArg);
        }
    });

    if (!isDev) {
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow?.webContents.closeDevTools();
        });
    }
}

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

let userToken: string | null = null;
ipcMain.handle('save-token', (_, token) => { userToken = token; });
ipcMain.handle('get-token', () => { return userToken; });
ipcMain.handle('open-path', (_, path) => { shell.showItemInFolder(path); });

ipcMain.handle('login', async () => {
    // UPDATED: Now points to the web app's desktop auth endpoint
    const authUrl = 'https://tsx-studio-v2.vercel.app/api/auth/desktop';
    await shell.openExternal(authUrl);
});

ipcMain.handle('get-render-logs', async () => {
    const logPath = path.join(app.getPath('userData'), 'render-debug.log');
    if (await fs.pathExists(logPath)) {
        return await fs.readFile(logPath, 'utf8');
    }
    return 'No logs found in secure storage.';
});

ipcMain.handle('install-whisper-engine', async (event) => {
    const { exec } = require('child_process');
    const runCommand = (cmd: string) => {
        return new Promise((resolve, reject) => {
            event.sender.send('transcribe-log', `[SETUP] Running: ${cmd}`);
            const proc = exec(cmd);
            proc.stdout.on('data', (data: any) => { event.sender.send('transcribe-log', `[SETUP] ${data.toString()}`); });
            proc.on('close', (code: number) => { code === 0 ? resolve(true) : reject(new Error(`Failed ${code}`)); });
        });
    };

    try {
        await runCommand('pip install -U openai-whisper');
        try { await runCommand('winget install ffmpeg --accept-source-agreements'); } catch (e) { }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});
