import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">OT</span>
              <span className="text-lg font-bold text-gray-900">OFFTICKET</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Empty vehicles, full savings. Matching empty return-trip vehicles with people who need to move goods or themselves.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Quick links</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link to="/search" className="hover:text-primary">Find a Vehicle</Link></li>
              <li><Link to="/list-vehicle" className="hover:text-primary">List Your Empty Vehicle</Link></li>
              <li><Link to="/about" className="hover:text-primary">About OFFTICKET</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Coverage area</h3>
            <p className="mt-3 text-sm text-gray-500">Coimbatore ↔ Ooty ↔ Mettupalayam</p>
            <p className="mt-3 text-sm text-gray-500">
              e-pass required for Nilgiris district entry —{' '}
              <a href="https://epass.tnega.org" target="_blank" rel="noreferrer" className="text-primary underline">
                epass.tnega.org
              </a>
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-gray-100 pt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} OFFTICKET. Built for the Coimbatore–Ooty corridor.
        </p>
      </div>
    </footer>
  )
}
