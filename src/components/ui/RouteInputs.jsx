import CityInput from './CityInput'

// Paired From/To city inputs with an instant swap button between them.
export default function RouteInputs({ from, to, onFromChange, onToChange, className = '' }) {
  function handleSwap() {
    onFromChange(to)
    onToChange(from)
  }

  return (
    <div className={`relative flex flex-col gap-3 sm:flex-row sm:items-end ${className}`}>
      <CityInput label="From" value={from} onChange={onFromChange} className="flex-1" />

      <button
        type="button"
        onClick={handleSwap}
        aria-label="Swap from and to"
        title="Swap from and to"
        className="mx-auto flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-primary hover:text-primary sm:mb-2.5 sm:self-auto"
      >
        <span className="sm:hidden">⇅</span>
        <span className="hidden sm:inline">⇄</span>
      </button>

      <CityInput label="To" value={to} onChange={onToChange} className="flex-1" />
    </div>
  )
}
