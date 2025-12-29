import type { JourneyLogEntry } from '../../types';
import './JourneyLog.scss';

interface JourneyLogProps {
  entries: JourneyLogEntry[];
}

export function JourneyLog({ entries }: JourneyLogProps) {
  if (entries.length === 0) {
    return (
      <div className="journey-log__empty">
        <p>No captures yet</p>
        <p className="journey-log__empty-hint">
          Click "Capture and next" to begin documenting
        </p>
      </div>
    );
  }

  return (
    <ul className="journey-log" aria-live="polite">
      {entries.map((entry) => (
        <li key={entry.sequenceNo} className="journey-log__item">
          <div className="journey-log__item-content">
            <span className="journey-log__item-number">
              {entry.sequenceNo}.
            </span>
            <div className="journey-log__item-details">
              <span className="journey-log__item-title" title={entry.pageTitle}>
                {entry.pageTitle}
              </span>
              <span className="journey-log__item-filename" title={entry.fileName}>
                ({entry.fileName})
              </span>
            </div>
          </div>
          <Tag status={entry.status} />
        </li>
      ))}
    </ul>
  );
}

interface TagProps {
  status: 'captured' | 'waiting' | 'error';
}

function Tag({ status }: TagProps) {
  const tagConfig = {
    captured: { label: 'Captured', className: 'journey-log__tag--green' },
    waiting: { label: 'Waiting', className: 'journey-log__tag--grey' },
    error: { label: 'Error', className: 'journey-log__tag--red' },
  };

  const config = tagConfig[status];

  return (
    <strong className={`journey-log__tag ${config.className}`}>
      {config.label}
    </strong>
  );
}
