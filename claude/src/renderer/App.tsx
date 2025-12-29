import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header/Header';
import { BrowserView } from './components/BrowserView/BrowserView';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { useElectronAPI } from './hooks/useElectronAPI';
import type { JourneyLogEntry, AppState } from './types';
import './styles/main.scss';

const DEFAULT_URL = 'https://www.gov.uk';

function App() {
  const { subscribeToUrlChanges, subscribeToTitleChanges, captureScreenshot } = useElectronAPI();

  const [state, setState] = useState<AppState>({
    projectName: '',
    currentUrl: DEFAULT_URL,
    currentTitle: 'GOV.UK',
    journeyLog: [],
    sequenceNo: 1,
    selectedProfile: 'standard',
    isCapturing: false,
  });

  // Subscribe to URL changes from Playwright
  useEffect(() => {
    const unsubscribeUrl = subscribeToUrlChanges((url: string) => {
      setState(prev => ({ ...prev, currentUrl: url }));
    });

    const unsubscribeTitle = subscribeToTitleChanges((title: string) => {
      setState(prev => ({ ...prev, currentTitle: title }));
    });

    return () => {
      unsubscribeUrl();
      unsubscribeTitle();
    };
  }, [subscribeToUrlChanges, subscribeToTitleChanges]);

  const handleProjectNameChange = useCallback((name: string) => {
    setState(prev => ({ ...prev, projectName: name }));
  }, []);

  const handleProfileChange = useCallback((profileId: string) => {
    setState(prev => ({ ...prev, selectedProfile: profileId }));
  }, []);

  const handleCapture = useCallback(async () => {
    if (!state.projectName.trim()) {
      alert('Please enter a project name before capturing.');
      return;
    }

    setState(prev => ({ ...prev, isCapturing: true }));

    try {
      const result = await captureScreenshot(state.projectName, state.sequenceNo);

      if (result.success && result.fileName) {
        const newEntry: JourneyLogEntry = {
          sequenceNo: state.sequenceNo,
          fileName: result.fileName,
          pageTitle: result.pageTitle || 'Untitled',
          url: result.url || state.currentUrl,
          status: 'captured',
          timestamp: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          journeyLog: [...prev.journeyLog, newEntry],
          sequenceNo: prev.sequenceNo + 1,
          isCapturing: false,
        }));
      } else {
        console.error('Capture failed:', result.error);
        setState(prev => ({ ...prev, isCapturing: false }));
      }
    } catch (error) {
      console.error('Capture error:', error);
      setState(prev => ({ ...prev, isCapturing: false }));
    }
  }, [state.projectName, state.sequenceNo, state.currentUrl, captureScreenshot]);

  const handleManualSnapshot = useCallback(() => {
    handleCapture();
  }, [handleCapture]);

  const handleGenerateMapZip = useCallback(() => {
    // Placeholder for Sprint 5 functionality
    console.log('Generate map and zip - coming in Sprint 5');
  }, []);

  return (
    <div className="app">
      <Header title="GovSnap" />

      <main className="main-content">
        <BrowserView currentUrl={state.currentUrl} />

        <ControlPanel
          projectName={state.projectName}
          onProjectNameChange={handleProjectNameChange}
          journeyLog={state.journeyLog}
          selectedProfile={state.selectedProfile}
          onProfileChange={handleProfileChange}
          onCaptureAndNext={handleCapture}
          onManualSnapshot={handleManualSnapshot}
          onGenerateMapZip={handleGenerateMapZip}
          isCapturing={state.isCapturing}
        />
      </main>
    </div>
  );
}

export default App;
