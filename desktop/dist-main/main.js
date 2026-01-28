"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const render_1 = require("./engine/render");
const system_check_1 = require("./engine/system-check");
const fs_extra_1 = __importDefault(require("fs-extra"));
let mainWindow = null;
const isDev = !electron_1.app.isPackaged && process.env.NODE_ENV === 'development';
// 1. Register Custom Protocol (Deep Linking)
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        electron_1.app.setAsDefaultProtocolClient('tsx-studio', process.execPath, [path_1.default.resolve(process.argv[1])]);
    }
}
else {
    electron_1.app.setAsDefaultProtocolClient('tsx-studio');
}
/**
 * Handle Auth Callback from Browser
 */
function handleAuthProtocol(url) {
    if (!url)
        return;
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
    }
    catch (e) {
        console.error('Failed to parse protocol URL:', e);
    }
}
// 2. Single Instance Lock (Required for Deep Linking on Windows)
const gotLock = electron_1.app.requestSingleInstanceLock();
if (!gotLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', (event, commandLine) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
        // Protocol Handling for Windows
        const url = commandLine.pop();
        if (url && url.startsWith('tsx-studio://')) {
            handleAuthProtocol(url);
        }
    });
    electron_1.app.whenReady().then(() => {
        createWindow();
        electron_1.app.on('activate', () => {
            if (electron_1.BrowserWindow.getAllWindows().length === 0)
                createWindow();
        });
        // Protocol Handling for macOS
        electron_1.app.on('open-url', (event, url) => {
            event.preventDefault();
            handleAuthProtocol(url);
        });
    });
}
function createWindow() {
    const rootPath = electron_1.app.isPackaged ? path_1.default.join(__dirname, '..') : __dirname;
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        title: 'TSX Studio',
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
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173'); // Updated to vite default port if renderer is separate, but main.ts was 3000
    }
    else {
        const prodUrl = 'https://tsx-studio-v2.vercel.app';
        mainWindow.loadURL(prodUrl).catch(() => {
            mainWindow?.loadFile(path_1.default.join(rootPath, 'dist-renderer', 'index.html'));
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
let userToken = null;
electron_1.ipcMain.handle('save-token', (_, token) => { userToken = token; });
electron_1.ipcMain.handle('get-token', () => { return userToken; });
electron_1.ipcMain.handle('open-path', (_, path) => { electron_1.shell.showItemInFolder(path); });
electron_1.ipcMain.handle('login', async () => {
    // UPDATED: Now points to the web app's desktop auth endpoint
    const authUrl = 'https://tsx-studio-v2.vercel.app/api/auth/desktop';
    await electron_1.shell.openExternal(authUrl);
});
electron_1.ipcMain.handle('get-render-logs', async () => {
    const logPath = path_1.default.join(electron_1.app.getPath('userData'), 'render-debug.log');
    if (await fs_extra_1.default.pathExists(logPath)) {
        return await fs_extra_1.default.readFile(logPath, 'utf8');
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