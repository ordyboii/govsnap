export interface JourneyLogEntry {
  sequenceNo: number;
  fileName: string;
  pageTitle: string;
  url: string;
  status: 'captured' | 'waiting' | 'error';
  timestamp: string;
}

export interface DataProfile {
  id: string;
  name: string;
  description: string;
}

export interface CaptureResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  url?: string;
  pageTitle?: string;
  error?: string;
}

export interface AppState {
  projectName: string;
  currentUrl: string;
  currentTitle: string;
  journeyLog: JourneyLogEntry[];
  sequenceNo: number;
  selectedProfile: string;
  isCapturing: boolean;
}
