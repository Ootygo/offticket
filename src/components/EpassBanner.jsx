export default function EpassBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <span className="text-lg">⚠️</span>
      <div>
        <p className="font-semibold">e-Pass required for Nilgiris district entry</p>
        <p className="mt-1 text-amber-800">
          All vehicles entering the Nilgiris district (including Ooty) need a valid e-pass year-round. Apply at{' '}
          <a href="https://epass.tnega.org" target="_blank" rel="noreferrer" className="font-medium underline">
            epass.tnega.org
          </a>{' '}
          before your trip.
        </p>
      </div>
    </div>
  )
}
