export interface ElectronAPI {
  captureScreenshot: (data: { projectName: string; sequenceNo: number }) => Promise<{
    success: boolean;
    fileName: string;
    filePath: string;
    title?: string;
    error?: string;
  }>;
  onUrlChanged: (callback: (url: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { src?: string; autosize?: string; minwidth?: string; minheight?: string }, HTMLElement>;
    }
  }
}
