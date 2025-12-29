import type { CaptureResult } from './types';

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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }

  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          autosize?: string;
          minwidth?: string;
          minheight?: string;
          partition?: string;
          allowpopups?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
