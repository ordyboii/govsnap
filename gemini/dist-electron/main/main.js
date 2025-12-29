"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const playwright_1 = require("playwright");
const fs = __importStar(require("fs"));
let mainWindow = null;
let observerBrowser = null;
let observerPage = null;
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        title: 'GovSnap',
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true,
        },
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
}
async function startObserver() {
    observerBrowser = await playwright_1.chromium.launch({ headless: false });
    const context = await observerBrowser.newContext();
    observerPage = await context.newPage();
    // Update the renderer with the current URL
    observerPage.on('framenavigated', (frame) => {
        if (frame === observerPage?.mainFrame()) {
            mainWindow?.webContents.send('url-changed', frame.url());
        }
    });
    await observerPage.goto('https://www.gov.uk');
}
electron_1.ipcMain.handle('capture-screenshot', async (event, { projectName, sequenceNo }) => {
    if (!observerPage)
        return { success: false, error: 'No observer page' };
    const url = new URL(observerPage.url());
    const title = await observerPage.title();
    const sanitizedSlug = url.pathname.replace(/\//g, '-').replace(/^-|-$/g, '') || 'index';
    const timestamp = new Date().toISOString().replace(/[:T]/g, '').split('.')[0];
    // pattern: [Sequence_No]__[Sanitized_URL_Slug]__[Timestamp].png
    const fileName = `${sequenceNo.toString().padStart(2, '0')}__${sanitizedSlug}__${timestamp}.png`;
    const storagePath = path.join(electron_1.app.getPath('userData'), 'captures', projectName);
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    const filePath = path.join(storagePath, fileName);
    await observerPage.screenshot({ path: filePath });
    // Update manifest.json
    const manifestPath = path.join(storagePath, 'manifest.json');
    let manifest = [];
    if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
    manifest.push({
        fileName,
        url: observerPage.url(),
        title,
        timestamp,
        sequenceNo
    });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return { success: true, fileName, filePath, title };
});
electron_1.app.whenReady().then(async () => {
    await createWindow();
    await startObserver();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', async () => {
    if (observerBrowser)
        await observerBrowser.close();
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
