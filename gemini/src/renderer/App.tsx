import { useState, useEffect } from 'react'

interface LogEntry {
  fileName: string;
  title?: string;
  status: 'Captured' | 'waiting for input';
}

function App() {
  const [projectName, setProjectName] = useState('');
  const [currentUrl, setCurrentUrl] = useState('https://www.gov.uk/apply-for-bus-pass');
  const [journeyLog, setJourneyLog] = useState<LogEntry[]>([]);
  const [sequenceNo, setSequenceNo] = useState(1);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onUrlChanged((url: string) => {
        setCurrentUrl(url);
      });
    }
  }, []);

  const handleCapture = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.captureScreenshot({
        projectName,
        sequenceNo,
      });

      if (result.success) {
        const newLog = [...journeyLog];
        // Replace 'waiting for input' if exists or just add
        const waitingIndex = newLog.findIndex(item => item.status === 'waiting for input');
        if (waitingIndex !== -1) {
          newLog[waitingIndex] = { fileName: result.fileName, title: result.title, status: 'Captured' };
        } else {
          newLog.push({ fileName: result.fileName, title: result.title, status: 'Captured' });
        }
        
        // Add a new "waiting" entry for the next step (mocking UI behavior)
        newLog.push({ fileName: '...', status: 'waiting for input' });
        
        setJourneyLog(newLog);
        setSequenceNo(sequenceNo + 1);
      }
    }
  };

  const truncateFileName = (name: string) => {
    if (name === '...') return name;
    if (name.length <= 30) return name;
    const start = name.slice(0, 15);
    const end = name.slice(-12);
    return `${start}...${end}`;
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">GovSnap</h1>
      </header>

      <main className="main-container">
        <section className="browser-view" aria-label="Browser view">
          <div className="browser-view__url-bar">
            <label htmlFor="url-display" className="visually-hidden">Current URL</label>
            <input 
              id="url-display" 
              type="text" 
              value={currentUrl} 
              readOnly 
              aria-readonly="true"
            />
          </div>
          <div className="browser-view__viewport">
            <webview 
              src={currentUrl} 
              style={{ width: '100%', height: '100%', display: 'flex' }}
            />
          </div>
        </section>

        <aside className="control-panel" aria-label="Control panel">
          <div className="control-panel__top">
            <section className="control-panel__section">
              <div className="control-panel__input-group">
                <label htmlFor="project-name">Project details</label>
                <input 
                  id="project-name" 
                  type="text" 
                  value={projectName}
                  placeholder="Enter project name..."
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </section>
          </div>

          <div className="control-panel__scroll-area">
            <section className="control-panel__section">
              <h2>Journey log</h2>
              {journeyLog.length === 0 ? (
                <div className="empty-state">
                  <p>Nothing captured yet</p>
                </div>
              ) : (
                <ul className="journey-log" aria-live="polite">
                  {journeyLog.map((entry, index) => (
                    <li 
                      key={index} 
                      className={`journey-log__item ${entry.status === 'waiting for input' ? 'journey-log__item--waiting' : ''}`}
                    >
                      <div className="journey-log__item__content">
                        <span className="journey-log__item__title" title={entry.title}>
                          {index + 1}. {entry.title || (entry.status === 'waiting for input' ? 'Next step...' : 'Untitled Page')}
                        </span>
                        <span className="journey-log__item__filename" title={entry.fileName}>
                          {truncateFileName(entry.fileName)}
                        </span>
                      </div>
                      <strong className={`govuk-tag ${entry.status === 'Captured' ? 'govuk-tag--green' : 'govuk-tag--grey'}`}>
                        {entry.status === 'Captured' ? 'Captured' : 'Waiting'}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="control-panel__bottom">
            <section className="control-panel__section">
              <div className="control-panel__input-group">
                <label htmlFor="data-profile">Data profile</label>
                <select id="data-profile">
                  <option>Profile: Standard user (Jane Doe)</option>
                  <option>Profile: empty</option>
                </select>
              </div>
            </section>

            <div className="action-block">
              <button 
                className="action-block__button action-block__button--primary"
                onClick={handleCapture}
              >
                Capture & next
              </button>
              <button className="action-block__button action-block__button--secondary">
                Manual snapshot
              </button>
              <button className="action-block__button action-block__button--final">
                Generate map & zip
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App