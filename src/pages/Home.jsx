import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import RouteInputs from '../components/ui/RouteInputs'
import HeroBackground from '../components/HeroBackground'
import { getStats } from '../lib/api'
import { correctCityName } from '../lib/format'

const routes = [
  { from: 'Coimbatore', to: 'Ooty', tamil: 'கோயம்புத்தூர் → ஊட்டி' },
  { from: 'Ooty', to: 'Coimbatore', tamil: 'ஊட்டி → கோயம்புத்தூர்' },
]

export default function Home() {
  const navigate = useNavigate()
  const [from, setFrom] = useState('Coimbatore')
  const [to, setTo] = useState('Ooty')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then(setStats)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/search?from=${correctCityName(from)}&to=${correctCityName(to)}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark text-white">
        <HeroBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/95 via-primary-dark/55 to-primary-dark/40" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              Empty vehicles, full savings.
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Trucks and cabs returning empty from Ooty to Coimbatore (and back) at 40–50% off.
              Book the return leg, save the difference.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/search" variant="accent" size="lg">Find a Vehicle</Button>
              <Button as={Link} to="/list-vehicle" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                List Your Empty Vehicle
              </Button>
            </div>
          </div>

          {/* Quick search */}
          <Card className="mt-10 max-w-xl bg-white/95 p-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <RouteInputs from={from} to={to} onFromChange={setFrom} onToChange={setTo} className="flex-1 text-left text-gray-900" />
              <Button type="submit" variant="primary">Search</Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3">
          {[
            { icon: '✅', title: 'Verified Drivers', desc: 'KYC-checked owners and drivers' },
            { icon: '🔒', title: 'Secure Booking', desc: 'UPI payments, booking confirmation IDs' },
            { icon: '💰', title: '40–50% Savings', desc: 'vs. normal one-way market rates' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <span className="text-3xl">{b.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{b.title}</p>
                <p className="text-sm text-gray-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">How It Works</h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-primary">For Customers</h3>
            <ol className="mt-4 space-y-4">
              {[
                'Search for empty vehicles on your route and date',
                'Compare discounted price vs. normal market rate',
                'Book instantly and pay securely via UPI',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
                  <p className="text-gray-600">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-accent-dark">For Vehicle Owners</h3>
            <ol className="mt-4 space-y-4">
              {[
                'List your empty return trip with route and date',
                'Get booking requests from verified customers',
                'Accept, complete the trip, and earn on an otherwise empty run',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{i + 1}</span>
                  <p className="text-gray-600">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Active routes */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Active Routes</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {routes.map((r) => (
              <Card key={r.from} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-gray-900">{r.from} → {r.to}</p>
                  <p className="text-sm text-gray-500">{r.tamil}</p>
                </div>
                <Button as={Link} to={`/search?from=${r.from}&to=${r.to}`} variant="outline" size="sm">View</Button>
              </Card>
            ))}
          </div>
          {stats && (
            <p className="mt-8 text-center text-gray-600">
              <span className="text-2xl font-bold text-primary">{stats.recentTrips.toLocaleString()}</span> successful trips completed so far
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
