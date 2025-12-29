import { contextBridge, ipcRenderer } from 'electron';

export interface CaptureResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  url?: string;
  pageTitle?: string;
  error?: string;
}

export interface ElectronAPI {
  navigateTo: (url: string) => Promise<{ success: boolean; error?: string }>;
  getCurrentUrl: () => Promise<string | null>;
  captureScreenshot: (params: {
    projectName: string;
    sequenceNo: number;
  }) => Promise<CaptureResult>;
  getManifest: (projectName: string) => Promise<unknown>;
  onUrlChanged: (callback: (url: string) => void) => void;
  onTitleChanged: (callback: (title: string) => void) => void;
  removeUrlChangedListener: () => void;
  removeTitleChangedListener: () => void;
}

contextBridge.exposeInMainWorld('electronAPI', {
  navigateTo: (url: string) => ipcRenderer.invoke('navigate-to', url),

  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),

  captureScreenshot: (params: { projectName: string; sequenceNo: number }) =>
    ipcRenderer.invoke('capture-screenshot', params),

  getManifest: (projectName: string) => ipcRenderer.invoke('get-manifest', projectName),

  onUrlChanged: (callback: (url: string) => void) => {
    ipcRenderer.on('url-changed', (_event, url) => callback(url));
  },

  onTitleChanged: (callback: (title: string) => void) => {
    ipcRenderer.on('title-changed', (_event, title) => callback(title));
  },

  removeUrlChangedListener: () => {
    ipcRenderer.removeAllListeners('url-changed');
  },

  removeTitleChangedListener: () => {
    ipcRenderer.removeAllListeners('title-changed');
  },
} as ElectronAPI);
