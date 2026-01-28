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
const isDev = !electron_1.app.isPackaged && process.env.NODE_ENV === 'development';
function createWindow() {
    const rootPath = electron_1.app.isPackaged ? path_1.default.join(__dirname, '..') : __dirname;
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        titleBarStyle: 'hidden',
        icon: path_1.default.join(rootPath, 'logo.jpg'),
        show: false,
        backgroundColor: '#000000',
        webPreferences: {
            preload: electron_1.app.isPackaged
                ? path_1.default.join(__dirname, 'preload.js')
                : path_1.default.join(rootPath, 'preload.js'),
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
    }
    else {
        // Replace with your actual production URL
        const prodUrl = 'https://tsx-studio-v2.vercel.app';
        mainWindow.loadURL(prodUrl).catch(() => {
            // Fallback to local dashboard if internet is down
            mainWindow?.loadFile(path_1.default.join(rootPath, 'dist-renderer', 'index.html'));
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
    const authUrl = 'https://tsx-studio-v2.vercel.app/api/auth/desktop';
    await electron_1.shell.openExternal(authUrl);
});
let userToken = null;
electron_1.ipcMain.handle('save-token', (_, token) => { userToken = token; });
electron_1.ipcMain.handle('get-token', () => { return userToken; });
electron_1.ipcMain.handle('open-path', (_, path) => { electron_1.shell.showItemInFolder(path); });
electron_1.ipcMain.handle('get-render-logs', async () => {
    const fs = require('fs-extra');
    const logPath = path_1.default.join(electron_1.app.getPath('userData'), 'render-debug.log');
    if (await fs.pathExists(logPath)) {
        return await fs.readFile(logPath, 'utf8');
    }
    return 'No logs found in secure storage.';
});
electron_1.ipcMain.handle('install-whisper-engine', async (event) => {
    const { exec } = require('child_process');
    const runCommand = (cmd) => {
        return new Promise((resolve, reject) => {
            event.sender.send('transcribe-log', `[SETUP] Running: ${cmd}`);
            const proc = exec(cmd);
            proc.stdout.on('data', (data) => { event.sender.send('transcribe-log', `[SETUP] ${data.toString()}`); });
            proc.on('close', (code) => { code === 0 ? resolve(true) : reject(new Error(`Failed ${code}`)); });
        });
    };
    try {
        await runCommand('pip install -U openai-whisper');
        try {
            await runCommand('winget install ffmpeg --accept-source-agreements');
        }
        catch (e) { }
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=main.js.map