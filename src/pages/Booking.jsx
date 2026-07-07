import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EpassBanner from '../components/EpassBanner'
import { VEHICLE_TYPES, isNilgirisRoute } from '../data/mockData'
import { getListing, createBooking } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useRequireUser } from '../hooks/useRequireUser'

export default function Booking() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const user = useRequireUser('customer')

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [goodsDetails, setGoodsDetails] = useState('')
  const [weight, setWeight] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getListing(listingId)
      .then(setListing)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [listingId])

  if (loading) return <p className="mx-auto max-w-3xl px-4 py-8 text-gray-500">Loading listing...</p>
  if (error || !listing) return <p className="mx-auto max-w-3xl px-4 py-8 text-red-600">{error || 'Listing not found'}</p>

  const isPassenger = listing.vehicleType === 'cab'
  const typeLabel = VEHICLE_TYPES.find((t) => t.value === listing.vehicleType)?.label || listing.vehicleType
  const savings = listing.normalPrice - listing.pricePerUnit
  const savingsPct = Math.round((savings / listing.normalPrice) * 100)
  const needsEpass = isNilgirisRoute(listing.fromCity, listing.toCity)

  async function handleConfirm() {
    if (!user) return
    setSubmitting(true)
    try {
      const booking = await createBooking({
        listingId: listing.listingId,
        customerId: user.userId,
        ownerId: listing.ownerId,
        goodsDetails: isPassenger ? null : { description: goodsDetails, weight },
        passengerCount: isPassenger ? Number(passengerCount) : null,
        totalPrice: listing.pricePerUnit,
      }, token)
      navigate(`/booking-confirmation/${booking.bookingId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h1>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{typeLabel}</h2>
            <p className="text-sm text-gray-500">{listing.fromCity} → {listing.toCity}</p>
            <p className="text-sm text-gray-500">{listing.departureDate} at {listing.departureTime}</p>
          </div>
          {listing.isHeavyVehicle && <Badge variant="warning">Heavy vehicle</Badge>}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="font-semibold text-gray-900">{isPassenger ? 'Passenger details' : 'Goods details'}</h3>
          {isPassenger ? (
            <label className="mt-3 block text-sm text-gray-700">
              Number of passengers
              <input
                type="number"
                min={1}
                max={parseInt(listing.availableCapacity, 10) || 4}
                value={passengerCount}
                onChange={(e) => setPassengerCount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-700 sm:col-span-2">
                Description of goods
                <input
                  placeholder="e.g. vegetables, furniture, hardware supplies"
                  value={goodsDetails}
                  onChange={(e) => setGoodsDetails(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700">
                Approx. weight (kg)
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="font-semibold text-gray-900">Price summary</h3>
          <div className="mt-3 flex justify-between text-sm text-gray-600">
            <span>Normal market price</span>
            <span className="line-through">₹{listing.normalPrice}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-gray-600">
            <span>OFFTICKET price</span>
            <span className="font-semibold text-gray-900">₹{listing.pricePerUnit}</span>
          </div>
          <div className="mt-2 flex justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <span>You save</span>
            <span>₹{savings} ({savingsPct}%)</span>
          </div>
        </div>

        {needsEpass && (
          <div className="mt-6">
            <EpassBanner />
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={submitting}
          variant="accent"
          size="lg"
          className="mt-6 w-full"
        >
          {submitting ? 'Processing...' : `Confirm & Pay ₹${listing.pricePerUnit}`}
        </Button>
      </Card>
    </div>
  )
}
