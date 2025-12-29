import * as fs from 'fs';
import * as path from 'path';
import { PlaywrightController } from './playwright-controller';
import { generateScreenshotFilename, generateProjectDirectoryName } from './url-sanitizer';
import { ManifestManager, ManifestEntry } from './manifest-manager';

export interface CaptureResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  url?: string;
  pageTitle?: string;
  error?: string;
}

export class ScreenshotService {
  private playwrightController: PlaywrightController;
  private baseStoragePath: string;
  private manifestManager: ManifestManager;
  private projectDirectories: Map<string, string> = new Map();

  constructor(playwrightController: PlaywrightController, userDataPath: string) {
    this.playwrightController = playwrightController;
    this.baseStoragePath = path.join(userDataPath, 'captures');
    this.manifestManager = new ManifestManager(userDataPath);

    // Ensure base storage directory exists
    if (!fs.existsSync(this.baseStoragePath)) {
      fs.mkdirSync(this.baseStoragePath, { recursive: true });
    }
  }

  async capture(projectName: string, sequenceNo: number): Promise<CaptureResult> {
    try {
      const url = this.playwrightController.getCurrentUrl();
      if (!url) {
        return { success: false, error: 'No current URL available' };
      }

      const pageTitle = await this.playwrightController.getPageTitle();

      // Get or create timestamped project directory
      let projectDir = this.projectDirectories.get(projectName);
      if (!projectDir) {
        projectDir = generateProjectDirectoryName(projectName);
        this.projectDirectories.set(projectName, projectDir);
      }

      const storagePath = path.join(this.baseStoragePath, projectDir);

      // Create directory if it doesn't exist
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }

      // Generate filename and capture screenshot
      const fileName = generateScreenshotFilename(url, sequenceNo);
      const filePath = path.join(storagePath, fileName);

      const screenshotBuffer = await this.playwrightController.captureScreenshot();
      fs.writeFileSync(filePath, screenshotBuffer);

      // Update manifest
      const manifestEntry: ManifestEntry = {
        sequenceNo,
        fileName,
        url,
        pageTitle: pageTitle || 'Untitled',
        timestamp: new Date().toISOString(),
        status: 'captured',
      };

      this.manifestManager.addEntry(projectDir, manifestEntry);

      return {
        success: true,
        fileName,
        filePath,
        url,
        pageTitle: pageTitle || 'Untitled',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  getProjectStoragePath(projectName: string): string | null {
    const projectDir = this.projectDirectories.get(projectName);
    if (!projectDir) return null;
    return path.join(this.baseStoragePath, projectDir);
  }
}
