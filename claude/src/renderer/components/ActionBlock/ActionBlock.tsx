import './ActionBlock.scss';

interface ActionBlockProps {
  onCaptureAndNext: () => void;
  onManualSnapshot: () => void;
  onGenerateMapZip: () => void;
  isCapturing: boolean;
}

export function ActionBlock({
  onCaptureAndNext,
  onManualSnapshot,
  onGenerateMapZip,
  isCapturing,
}: ActionBlockProps) {
  return (
    <div className="action-block">
      <button
        type="button"
        className="action-block__button action-block__button--primary"
        onClick={onCaptureAndNext}
        disabled={isCapturing}
        aria-busy={isCapturing}
      >
        {isCapturing ? 'Capturing...' : 'Capture and next'}
      </button>

      <button
        type="button"
        className="action-block__button action-block__button--secondary"
        onClick={onManualSnapshot}
        disabled={isCapturing}
      >
        Manual snapshot
      </button>

      <button
        type="button"
        className="action-block__button action-block__button--final"
        onClick={onGenerateMapZip}
        disabled={isCapturing}
      >
        Generate map and zip
      </button>
    </div>
  );
}
