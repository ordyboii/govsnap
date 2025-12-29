import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  captureScreenshot: (data: { projectName: string; sequenceNo: number }) => 
    ipcRenderer.invoke('capture-screenshot', data),
  onUrlChanged: (callback: (url: string) => void) => 
    ipcRenderer.on('url-changed', (_event, url) => callback(url)),
});
