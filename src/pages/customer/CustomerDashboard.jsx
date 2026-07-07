import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { getUserBookings, getUserDemandPosts } from '../../lib/api'
import { mockListings } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { useRequireUser } from '../../hooks/useRequireUser'

const statusVariant = { pending: 'warning', confirmed: 'primary', completed: 'success' }
const postStatusVariant = { open: 'warning', awarded: 'success', closed: 'neutral' }

export default function CustomerDashboard() {
  const { token } = useAuth()
  const user = useRequireUser('customer')
  const [bookings, setBookings] = useState([])
  const [demandPosts, setDemandPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getUserBookings(user.userId, token),
      getUserDemandPosts(user.userId, token),
    ]).then(([b, d]) => {
      setBookings(b)
      setDemandPosts(d)
    }).finally(() => setLoading(false))
  }, [user, token])

  const active = bookings.filter((b) => b.status !== 'completed')
  const past = bookings.filter((b) => b.status === 'completed')

  function listingFor(b) {
    return mockListings.find((l) => l.listingId === b.listingId)
  }

  // Routes this customer has actually booked before, not a fixed corridor —
  // OFFTICKET covers all of Tamil Nadu, so "frequent routes" has to come
  // from the customer's own history rather than a hardcoded pair.
  const savedRoutes = Array.from(
    new Map(
      bookings
        .map(listingFor)
        .filter(Boolean)
        .map((l) => [`${l.fromCity}-${l.toCity}`, { from: l.fromCity, to: l.toCity }])
    ).values()
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}</p>
        </div>
        <Button as={Link} to="/post-requirement" variant="primary" size="sm">+ Post a Requirement</Button>
      </div>

      <section className="mt-8">
        <h2 className="font-semibold text-gray-900">Your requirement posts</h2>
        <p className="mt-1 text-xs text-gray-500">Owners bid on these blind — only you can see the offers.</p>
        {!loading && demandPosts.length === 0 && (
          <Card className="mt-3 p-6 text-center text-sm text-gray-500">
            No requirements posted yet. Post one to get bids from vehicle owners.
          </Card>
        )}
        <div className="mt-3 space-y-3">
          {demandPosts.map((p) => (
            <Card key={p.demandPostId} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{p.fromCity} → {p.toCity}</p>
                <p className="text-sm text-gray-500">{p.preferredDate} · {p.bidCount} bid{p.bidCount === 1 ? '' : 's'}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={postStatusVariant[p.status] || 'neutral'}>{p.status}</Badge>
                <Button as={Link} to={`/requirements/${p.demandPostId}`} variant="outline" size="sm">
                  {p.status === 'open' ? 'Review bids' : 'View'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-gray-900">Active bookings</h2>
        {loading && <p className="mt-2 text-sm text-gray-500">Loading...</p>}
        {!loading && active.length === 0 && (
          <Card className="mt-3 p-6 text-center text-sm text-gray-500">No active bookings yet.</Card>
        )}
        <div className="mt-3 space-y-3">
          {active.map((b) => {
            const l = listingFor(b)
            return (
              <Card key={b.bookingId} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">{b.bookingId}</p>
                  <p className="font-medium text-gray-900">{l ? `${l.fromCity} → ${l.toCity}` : 'Route unavailable'}</p>
                  {l && <p className="text-sm text-gray-500">{l.departureDate} at {l.departureTime}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{b.totalPrice}</p>
                  <Badge variant={statusVariant[b.status] || 'neutral'}>{b.status}</Badge>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-gray-900">Past trips</h2>
        {!loading && past.length === 0 && (
          <Card className="mt-3 p-6 text-center text-sm text-gray-500">No completed trips yet.</Card>
        )}
        <div className="mt-3 space-y-3">
          {past.map((b) => {
            const l = listingFor(b)
            return (
              <Card key={b.bookingId} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">{b.bookingId}</p>
                  <p className="font-medium text-gray-900">{l ? `${l.fromCity} → ${l.toCity}` : 'Route unavailable'}</p>
                </div>
                <Badge variant="success">completed</Badge>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-gray-900">Your routes</h2>
        {savedRoutes.length === 0 ? (
          <Card className="mt-3 p-6 text-center text-sm text-gray-500">
            Routes you've booked before will show up here for quick re-search.
          </Card>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {savedRoutes.map((r) => (
              <Card key={`${r.from}-${r.to}`} className="flex items-center justify-between p-4">
                <p className="font-medium text-gray-900">{r.from} → {r.to}</p>
                <Button as={Link} to={`/search?from=${r.from}&to=${r.to}`} variant="outline" size="sm">Search again</Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
