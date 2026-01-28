import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { renderProject } from './engine/render';
import { checkSystem } from './engine/system-check';
import { transcribeAudio } from './engine/transcribe';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

function createWindow() {
    const rootPath = app.isPackaged ? path.join(__dirname, '..') : __dirname;

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        titleBarStyle: 'hidden',
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

    // PIVOT: Load the Full Studio UI
    // In Dev, we load localhost. In Production, we load the live hosted Studio.
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        // Replace with your actual production URL
        const prodUrl = 'https://tsx-studio-v2.vercel.app';
        mainWindow.loadURL(prodUrl).catch(() => {
            // Fallback to local dashboard if internet is down
            mainWindow?.loadFile(path.join(rootPath, 'dist-renderer', 'index.html'));
        });
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    // Keep DevTools hidden in production for a clean look
    if (!isDev) {
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow?.webContents.closeDevTools();
        });
    }
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
    const authUrl = 'https://tsx-studio-v2.vercel.app/api/auth/desktop';
    await shell.openExternal(authUrl);
});

let userToken: string | null = null;
ipcMain.handle('save-token', (_, token) => { userToken = token; });
ipcMain.handle('get-token', () => { return userToken; });
ipcMain.handle('open-path', (_, path) => { shell.showItemInFolder(path); });

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
