import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { mockBookings, mockListings } from '../data/mockData'

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [listing, setListing] = useState(null)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    const b = mockBookings.find((x) => x.bookingId === bookingId)
    setBooking(b)
    if (b) setListing(mockListings.find((l) => l.listingId === b.listingId))
  }, [bookingId])

  if (!booking) {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-gray-500">Loading booking...</p>
  }

  function handlePay() {
    // Placeholder for Razorpay/PhonePe UPI checkout integration.
    booking.paymentStatus = 'paid'
    booking.status = 'confirmed'
    setPaid(true)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          {paid ? '✅' : '🎟️'}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {paid ? 'Booking Confirmed!' : 'Booking Created'}
        </h1>
        <p className="mt-2 text-gray-500">Your OFFTICKET booking ID</p>
        <p className="mt-1 text-xl font-mono font-bold text-primary">{booking.bookingId}</p>

        {listing && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left text-sm text-gray-700">
            <p><strong>Route:</strong> {listing.fromCity} → {listing.toCity}</p>
            <p><strong>Departure:</strong> {listing.departureDate} at {listing.departureTime}</p>
            <p><strong>Amount:</strong> ₹{booking.totalPrice}</p>
            <p className="mt-2">
              <Badge variant={paid ? 'success' : 'warning'}>{paid ? 'Paid' : 'Payment pending'}</Badge>
            </p>
          </div>
        )}

        {!paid ? (
          <Button onClick={handlePay} variant="accent" size="lg" className="mt-6 w-full">
            Pay ₹{booking.totalPrice} via UPI
          </Button>
        ) : (
          <p className="mt-6 text-sm text-gray-500">
            The driver's contact number will now be shared with you. Carry a valid ID for the trip.
          </p>
        )}

        <Button as={Link} to="/dashboard" variant="ghost" size="sm" className="mt-4">
          Go to My Bookings
        </Button>
      </Card>
    </div>
  )
}
