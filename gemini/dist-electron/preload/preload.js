"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    captureScreenshot: (data) => electron_1.ipcRenderer.invoke('capture-screenshot', data),
    onUrlChanged: (callback) => electron_1.ipcRenderer.on('url-changed', (_event, url) => callback(url)),
});
