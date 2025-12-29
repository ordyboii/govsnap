import './DataProfileSelector.scss';

interface DataProfileSelectorProps {
  selectedProfile: string;
  onProfileChange: (profileId: string) => void;
}

const DATA_PROFILES = [
  { id: 'standard', name: 'Standard User (Jane Doe)' },
  { id: 'empty', name: 'Empty profile' },
];

export function DataProfileSelector({
  selectedProfile,
  onProfileChange,
}: DataProfileSelectorProps) {
  return (
    <div className="data-profile-selector">
      <label htmlFor="data-profile" className="data-profile-selector__label">
        Data profile
      </label>
      <select
        id="data-profile"
        value={selectedProfile}
        onChange={(e) => onProfileChange(e.target.value)}
        className="data-profile-selector__select"
      >
        {DATA_PROFILES.map((profile) => (
          <option key={profile.id} value={profile.id}>
            Profile: {profile.name}
          </option>
        ))}
      </select>
    </div>
  );
}
