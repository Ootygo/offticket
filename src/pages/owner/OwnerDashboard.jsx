import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { getUserListings, getIncomingBookingsForOwner, confirmBooking } from '../../lib/api'
import { VEHICLE_TYPES } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { useRequireUser } from '../../hooks/useRequireUser'

export default function OwnerDashboard() {
  const { token } = useAuth()
  const user = useRequireUser('owner')
  const [listings, setListings] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getUserListings(user.userId, token),
      getIncomingBookingsForOwner(user.userId, token),
    ]).then(([l, b]) => {
      setListings(l)
      setBookings(b)
    }).finally(() => setLoading(false))
  }, [user, token])

  async function handleAccept(bookingId) {
    const updated = await confirmBooking(bookingId, token)
    setBookings((prev) => prev.map((b) => (b.bookingId === bookingId ? { ...b, ...updated } : b)))
  }

  function handleDecline(bookingId) {
    setBookings((prev) => prev.map((b) => (b.bookingId === bookingId ? { ...b, status: 'declined' } : b)))
  }

  const pendingRequests = bookings.filter((b) => b.status === 'pending')
  const completed = bookings.filter((b) => b.status === 'completed')
  const earnings = completed.reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}</p>
        </div>
        <Button as={Link} to="/list-vehicle" variant="primary" size="sm">+ List a vehicle</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total earnings</p>
          <p className="mt-1 text-2xl font-bold text-primary">₹{earnings.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Completed trips</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{completed.length}</p>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="font-semibold text-gray-900">Incoming booking requests</h2>
        {!loading && pendingRequests.length === 0 && (
          <Card className="mt-3 p-6 text-center text-sm text-gray-500">No pending requests right now.</Card>
        )}
        <div className="mt-3 space-y-3">
          {pendingRequests.map((b) => (
            <Card key={b.bookingId} className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono text-sm text-gray-500">{b.bookingId}</p>
                <p className="font-medium text-gray-900">₹{b.totalPrice}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => handleAccept(b.bookingId)}>Accept</Button>
                <Button variant="outline" size="sm" onClick={() => handleDecline(b.bookingId)}>Decline</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-gray-900">My listed vehicles</h2>
        {!loading && listings.length === 0 && (
          <Card className="mt-3 p-6 text-center text-sm text-gray-500">You haven't listed a vehicle yet.</Card>
        )}
        <div className="mt-3 space-y-3">
          {listings.map((l) => {
            const typeLabel = VEHICLE_TYPES.find((t) => t.value === l.vehicleType)?.label || l.vehicleType
            return (
              <Card key={l.listingId} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{typeLabel} · {l.registrationNumber}</p>
                  <p className="text-sm text-gray-500">{l.fromCity} → {l.toCity} · {l.departureDate} {l.departureTime}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{l.pricePerUnit}</p>
                  <Badge variant={l.status === 'active' ? 'success' : 'neutral'}>{l.status}</Badge>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-gray-900">Completed trips</h2>
        {!loading && completed.length === 0 && (
          <Card className="mt-3 p-6 text-center text-sm text-gray-500">No completed trips yet.</Card>
        )}
        <div className="mt-3 space-y-3">
          {completed.map((b) => (
            <Card key={b.bookingId} className="flex items-center justify-between p-4">
              <p className="font-mono text-sm text-gray-500">{b.bookingId}</p>
              <p className="font-semibold text-gray-900">₹{b.totalPrice}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
