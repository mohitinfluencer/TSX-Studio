const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    renderProject: (options) => ipcRenderer.invoke('render-project', options),
    onRenderProgress: (callback) => ipcRenderer.on('render-progress', (_event, value) => callback(value)),
    onRenderLog: (callback) => ipcRenderer.on('render-log', (_event, value) => callback(value)),
    checkSystem: () => ipcRenderer.invoke('check-system'),
    login: () => ipcRenderer.invoke('login'),
    saveToken: (token) => ipcRenderer.invoke('save-token', token),
    getToken: () => ipcRenderer.invoke('get-token'),
    openPath: (path) => ipcRenderer.invoke('open-path', path),
    transcribeMedia: (options) => ipcRenderer.invoke('transcribe-media', options),
    onTranscribeProgress: (callback) => ipcRenderer.on('transcribe-progress', (_event, value) => callback(value)),
    onTranscribeLog: (callback) => ipcRenderer.on('transcribe-log', (_event, value) => callback(value)),
    onAuthSuccess: (callback) => ipcRenderer.on('auth-success', (_event, value) => callback(value)),
    getPendingToken: () => ipcRenderer.invoke('get-pending-token'),
    installWhisperEngine: () => ipcRenderer.invoke('install-whisper-engine'),
});
