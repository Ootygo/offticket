import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import InstallAppButton from '../InstallAppButton'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">OT</span>
          <span className="text-lg font-bold text-gray-900">OFFTICKET</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/search" className={navLinkClass}>Find a Vehicle</NavLink>
          <NavLink to="/list-vehicle" className={navLinkClass}>List Your Vehicle</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          {user?.userType === 'customer' && <NavLink to="/dashboard" className={navLinkClass}>My Bookings</NavLink>}
          {user?.userType === 'owner' && <NavLink to="/owner/dashboard" className={navLinkClass}>My Vehicles</NavLink>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <InstallAppButton />
          {user ? (
            <>
              <span className="text-sm text-gray-500">Hi, {user.name.split(' ')[0]}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">Log in</Button>
              <Button as={Link} to="/login" variant="primary" size="sm">Get Started</Button>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 px-4 py-3 md:hidden">
          <NavLink to="/search" className={navLinkClass} onClick={() => setOpen(false)}>Find a Vehicle</NavLink>
          <NavLink to="/list-vehicle" className={navLinkClass} onClick={() => setOpen(false)}>List Your Vehicle</NavLink>
          <NavLink to="/about" className={navLinkClass} onClick={() => setOpen(false)}>About</NavLink>
          {user?.userType === 'customer' && <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>My Bookings</NavLink>}
          {user?.userType === 'owner' && <NavLink to="/owner/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>My Vehicles</NavLink>}
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
            ) : (
              <Button as={Link} to="/login" variant="primary" size="sm" onClick={() => setOpen(false)}>Log in / Sign up</Button>
            )}
            <InstallAppButton />
          </div>
        </nav>
      )}
    </header>
  )
}
