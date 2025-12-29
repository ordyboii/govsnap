import { useEffect, useRef } from 'react';
import './BrowserView.scss';

interface BrowserViewProps {
  currentUrl: string;
}

export function BrowserView({ currentUrl }: BrowserViewProps) {
  const webviewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const webview = webviewRef.current;
    if (webview && currentUrl) {
      // Navigate webview when URL changes
      (webview as unknown as { src: string }).src = currentUrl;
    }
  }, [currentUrl]);

  return (
    <section className="browser-view" aria-label="Browser view">
      <div className="browser-view__url-bar">
        <label htmlFor="url-display" className="visually-hidden">
          Current URL
        </label>
        <input
          id="url-display"
          type="text"
          value={currentUrl}
          readOnly
          aria-readonly="true"
          className="browser-view__url-input"
        />
      </div>

      <div className="browser-view__viewport">
        <webview
          ref={webviewRef as React.RefObject<HTMLElement>}
          src={currentUrl}
          className="browser-view__webview"
          allowpopups="true"
        />
      </div>
    </section>
  );
}
