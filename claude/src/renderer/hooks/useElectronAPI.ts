import { useCallback, useRef } from 'react';

export function useElectronAPI() {
  const isElectron = useRef(typeof window !== 'undefined' && !!window.electronAPI);

  const navigateTo = useCallback(async (url: string) => {
    if (!isElectron.current) {
      return { success: false, error: 'Not in Electron environment' };
    }
    return window.electronAPI.navigateTo(url);
  }, []);

  const captureScreenshot = useCallback(async (projectName: string, sequenceNo: number) => {
    if (!isElectron.current) {
      return { success: false, error: 'Not in Electron environment' };
    }
    return window.electronAPI.captureScreenshot({ projectName, sequenceNo });
  }, []);

  const getCurrentUrl = useCallback(async () => {
    if (!isElectron.current) return null;
    return window.electronAPI.getCurrentUrl();
  }, []);

  const subscribeToUrlChanges = useCallback((callback: (url: string) => void) => {
    if (!isElectron.current) return () => {};
    window.electronAPI.onUrlChanged(callback);
    return () => window.electronAPI.removeUrlChangedListener();
  }, []);

  const subscribeToTitleChanges = useCallback((callback: (title: string) => void) => {
    if (!isElectron.current) return () => {};
    window.electronAPI.onTitleChanged(callback);
    return () => window.electronAPI.removeTitleChangedListener();
  }, []);

  return {
    isElectron: isElectron.current,
    navigateTo,
    captureScreenshot,
    getCurrentUrl,
    subscribeToUrlChanges,
    subscribeToTitleChanges,
  };
}
