import { TN_PLACES } from '../../data/mockData'
import { correctCityName } from '../../lib/format'

// Free-text city/area input with autocomplete suggestions — not a fixed
// dropdown, so owners and customers can enter any place, not just the
// launch-corridor towns. On blur, likely misspellings (e.g. "Coimbatoor")
// are snapped to the closest known place name.
export default function CityInput({ label, value, onChange, listId, className = '' }) {
  const id = listId || `city-suggestions-${label.replace(/\s+/g, '-').toLowerCase()}`

  function handleBlur() {
    const corrected = correctCityName(value)
    if (corrected !== value) onChange(corrected)
  }

  return (
    <label className={`text-sm text-gray-700 ${className}`}>
      {label}
      <input
        list={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="e.g. Coimbatore, Coonoor, Gudalur..."
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
      />
      <datalist id={id}>
        {TN_PLACES.map((place) => <option key={place} value={place} />)}
      </datalist>
    </label>
  )
}
