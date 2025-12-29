import { JourneyLog } from '../JourneyLog/JourneyLog';
import { DataProfileSelector } from '../DataProfileSelector/DataProfileSelector';
import { ActionBlock } from '../ActionBlock/ActionBlock';
import type { JourneyLogEntry } from '../../types';
import './ControlPanel.scss';

interface ControlPanelProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  journeyLog: JourneyLogEntry[];
  selectedProfile: string;
  onProfileChange: (profileId: string) => void;
  onCaptureAndNext: () => void;
  onManualSnapshot: () => void;
  onGenerateMapZip: () => void;
  isCapturing: boolean;
}

export function ControlPanel({
  projectName,
  onProjectNameChange,
  journeyLog,
  selectedProfile,
  onProfileChange,
  onCaptureAndNext,
  onManualSnapshot,
  onGenerateMapZip,
  isCapturing,
}: ControlPanelProps) {
  return (
    <aside className="control-panel" aria-label="Control panel">
      <div className="control-panel__top">
        <section className="control-panel__section">
          <h2 className="control-panel__heading">Project details</h2>
          <div className="control-panel__input-group">
            <label htmlFor="project-name" className="control-panel__label">
              Project name
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              placeholder="Enter project name..."
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="control-panel__input"
            />
          </div>
        </section>
      </div>

      <div className="control-panel__middle">
        <section className="control-panel__section">
          <h2 className="control-panel__heading control-panel__heading--small">
            Journey log
          </h2>
          <div className="control-panel__journey-log-container">
            <JourneyLog entries={journeyLog} />
          </div>
        </section>
      </div>

      <div className="control-panel__bottom">
        <DataProfileSelector
          selectedProfile={selectedProfile}
          onProfileChange={onProfileChange}
        />

        <ActionBlock
          onCaptureAndNext={onCaptureAndNext}
          onManualSnapshot={onManualSnapshot}
          onGenerateMapZip={onGenerateMapZip}
          isCapturing={isCapturing}
        />
      </div>
    </aside>
  );
}
