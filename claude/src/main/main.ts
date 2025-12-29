import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { PlaywrightController } from './playwright-controller';
import { ScreenshotService } from './screenshot-service';
import { ManifestManager } from './manifest-manager';

let mainWindow: BrowserWindow | null = null;
let playwrightController: PlaywrightController | null = null;
let screenshotService: ScreenshotService | null = null;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
    },
    title: 'GovSnap',
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

async function initializePlaywright(): Promise<void> {
  playwrightController = new PlaywrightController();
  await playwrightController.initialize();

  // Forward URL changes to renderer
  playwrightController.onUrlChanged((url: string) => {
    mainWindow?.webContents.send('url-changed', url);
  });

  // Forward page title changes
  playwrightController.onTitleChanged((title: string) => {
    mainWindow?.webContents.send('title-changed', title);
  });

  screenshotService = new ScreenshotService(playwrightController, app.getPath('userData'));
}

function registerIpcHandlers(): void {
  // Navigate to URL
  ipcMain.handle('navigate-to', async (_event, url: string) => {
    if (!playwrightController) {
      return { success: false, error: 'Playwright not initialized' };
    }
    try {
      await playwrightController.navigateTo(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Capture screenshot
  ipcMain.handle('capture-screenshot', async (_event, params: {
    projectName: string;
    sequenceNo: number;
  }) => {
    if (!screenshotService) {
      return { success: false, error: 'Screenshot service not initialized' };
    }

    try {
      const result = await screenshotService.capture(params.projectName, params.sequenceNo);
      return result;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Get current URL
  ipcMain.handle('get-current-url', async () => {
    if (!playwrightController) return null;
    return playwrightController.getCurrentUrl();
  });

  // Get manifest
  ipcMain.handle('get-manifest', async (_event, projectName: string) => {
    const manifestManager = new ManifestManager(app.getPath('userData'));
    return manifestManager.getManifest(projectName);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  registerIpcHandlers();
  await createWindow();
  await initializePlaywright();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (playwrightController) {
    await playwrightController.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
