import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import RouteInputs from '../../components/ui/RouteInputs'
import { VEHICLE_TYPES } from '../../data/mockData'
import { createListing } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useRequireUser } from '../../hooks/useRequireUser'
import { correctCityName } from '../../lib/format'

const initialForm = {
  vehicleType: 'mini_truck',
  registrationNumber: '',
  capacity: '',
  fromCity: 'Coimbatore',
  toCity: 'Ooty',
  departureDate: '',
  departureTime: '',
  availableCapacity: '',
  pricePerUnit: '',
  normalPrice: '',
  contactNumber: '',
  photo: null,
}

export default function ListVehicle() {
  const { token } = useAuth()
  const user = useRequireUser('owner')
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  const isHeavy = form.vehicleType === 'truck'
  const suggestedMin = form.normalPrice ? Math.round(form.normalPrice * 0.4) : null
  const suggestedMax = form.normalPrice ? Math.round(form.normalPrice * 0.6) : null

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    update('photo', file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      const listing = await createListing({
        ownerId: user.userId,
        ownerName: user.name,
        vehicleType: form.vehicleType,
        registrationNumber: form.registrationNumber,
        capacity: form.capacity,
        fromCity: correctCityName(form.fromCity),
        toCity: correctCityName(form.toCity),
        departureDate: form.departureDate,
        departureTime: form.departureTime,
        availableCapacity: form.availableCapacity,
        pricePerUnit: Number(form.pricePerUnit),
        normalPrice: Number(form.normalPrice),
        isHeavyVehicle: isHeavy,
      }, token)
      navigate(`/owner/dashboard?created=${listing.listingId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">List Your Empty Vehicle</h1>
      <p className="mt-1 text-sm text-gray-500">
        Turn your empty return trip into income. Fill in your route and pricing below.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="font-semibold text-gray-900">Vehicle details</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-700">
                Vehicle type
                <select
                  value={form.vehicleType}
                  onChange={(e) => update('vehicleType', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label className="text-sm text-gray-700">
                Registration number
                <input
                  required
                  placeholder="TN 38 AB 1234"
                  value={form.registrationNumber}
                  onChange={(e) => update('registrationNumber', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700 sm:col-span-2">
                Total capacity (e.g. "1000 kg" or "4 seats")
                <input
                  required
                  value={form.capacity}
                  onChange={(e) => update('capacity', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
            {isHeavy && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                ⚠️ Heavy vehicles are restricted in Ooty from 8 AM–9 PM during peak season. Plan your departure time accordingly.
              </p>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">Route & schedule</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <RouteInputs
                from={form.fromCity}
                to={form.toCity}
                onFromChange={(v) => update('fromCity', v)}
                onToChange={(v) => update('toCity', v)}
                className="sm:col-span-2"
              />
              <label className="text-sm text-gray-700">
                Departure date
                <input required type="date" value={form.departureDate} onChange={(e) => update('departureDate', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="text-sm text-gray-700">
                Expected departure time
                <input required type="time" value={form.departureTime} onChange={(e) => update('departureTime', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="text-sm text-gray-700 sm:col-span-2">
                Available space / seats remaining
                <input
                  required
                  placeholder="e.g. 500 kg or 3 seats"
                  value={form.availableCapacity}
                  onChange={(e) => update('availableCapacity', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">Pricing</h2>
            <p className="mt-1 text-xs text-gray-500">
              Guidance: since this is an empty return trip, price it at 40–60% of the normal one-way rate.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-700">
                Normal one-way market price (₹)
                <input required type="number" value={form.normalPrice} onChange={(e) => update('normalPrice', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="text-sm text-gray-700">
                Your price (₹)
                <input required type="number" value={form.pricePerUnit} onChange={(e) => update('pricePerUnit', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
            </div>
            {suggestedMin && (
              <p className="mt-2 text-sm text-gray-600">
                Suggested range: <Badge variant="primary">₹{suggestedMin} – ₹{suggestedMax}</Badge>
              </p>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">Photo & contact</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-700">
                Vehicle photo
                <input type="file" accept="image/*" onChange={handlePhoto} className="mt-1 w-full text-sm" />
                {photoPreview && <img src={photoPreview} alt="Vehicle preview" className="mt-2 h-24 w-full rounded-lg object-cover" />}
              </label>
              <label className="text-sm text-gray-700">
                Contact number
                <input required type="tel" placeholder="10-digit mobile number" value={form.contactNumber} onChange={(e) => update('contactNumber', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                <span className="mt-1 block text-xs text-gray-400">Shown to customers only after booking is confirmed</span>
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? 'Listing...' : 'List My Vehicle'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
