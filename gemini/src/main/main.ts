import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let observerBrowser: Browser | null = null;
let observerPage: Page | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
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
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

async function startObserver() {
  observerBrowser = await chromium.launch({ headless: false });
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

ipcMain.handle('capture-screenshot', async (event, { projectName, sequenceNo }) => {
  if (!observerPage) return { success: false, error: 'No observer page' };

  const url = new URL(observerPage.url());
  const title = await observerPage.title();
  const sanitizedSlug = url.pathname.replace(/\//g, '-').replace(/^-|-$/g, '') || 'index';
  const timestamp = new Date().toISOString().replace(/[:T]/g, '').split('.')[0];
  
  // pattern: [Sequence_No]__[Sanitized_URL_Slug]__[Timestamp].png
  const fileName = `${sequenceNo.toString().padStart(2, '0')}__${sanitizedSlug}__${timestamp}.png`;
  const storagePath = path.join(app.getPath('userData'), 'captures', projectName);
  
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

app.whenReady().then(async () => {
  await createWindow();
  await startObserver();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', async () => {
  if (observerBrowser) await observerBrowser.close();
  if (process.platform !== 'darwin') app.quit();
});
