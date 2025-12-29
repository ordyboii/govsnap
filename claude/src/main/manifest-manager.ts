import * as fs from 'fs';
import * as path from 'path';

export interface ManifestEntry {
  sequenceNo: number;
  fileName: string;
  url: string;
  pageTitle: string;
  timestamp: string;
  status: 'captured' | 'pending' | 'error';
}

export interface ProjectManifest {
  projectName: string;
  createdAt: string;
  updatedAt: string;
  entries: ManifestEntry[];
}

export class ManifestManager {
  private baseStoragePath: string;

  constructor(userDataPath: string) {
    this.baseStoragePath = path.join(userDataPath, 'captures');
  }

  private getManifestPath(projectDir: string): string {
    return path.join(this.baseStoragePath, projectDir, 'manifest.json');
  }

  getManifest(projectDir: string): ProjectManifest | null {
    const manifestPath = this.getManifestPath(projectDir);

    if (!fs.existsSync(manifestPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content) as ProjectManifest;
    } catch {
      return null;
    }
  }

  addEntry(projectDir: string, entry: ManifestEntry): void {
    const manifestPath = this.getManifestPath(projectDir);
    let manifest: ProjectManifest;

    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      manifest = JSON.parse(content) as ProjectManifest;
    } else {
      manifest = {
        projectName: projectDir,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entries: [],
      };
    }

    manifest.entries.push(entry);
    manifest.updatedAt = new Date().toISOString();

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  updateEntry(
    projectDir: string,
    sequenceNo: number,
    updates: Partial<ManifestEntry>
  ): boolean {
    const manifest = this.getManifest(projectDir);
    if (!manifest) return false;

    const entryIndex = manifest.entries.findIndex(e => e.sequenceNo === sequenceNo);
    if (entryIndex === -1) return false;

    manifest.entries[entryIndex] = { ...manifest.entries[entryIndex], ...updates };
    manifest.updatedAt = new Date().toISOString();

    const manifestPath = this.getManifestPath(projectDir);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return true;
  }
}
