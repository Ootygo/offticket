import { Link } from 'react-router-dom'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { VEHICLE_TYPES, ROUTE_DISTANCES } from '../data/mockData'

const typeIcons = {
  mini_truck: '🚚',
  truck: '🚛',
  pickup: '🛻',
  cab: '🚕',
}

export default function VehicleResultCard({ listing }) {
  const typeLabel = VEHICLE_TYPES.find((t) => t.value === listing.vehicleType)?.label || listing.vehicleType
  const distance = ROUTE_DISTANCES[`${listing.fromCity}-${listing.toCity}`]
  const savingsPct = Math.round(100 - (listing.pricePerUnit / listing.normalPrice) * 100)

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl">
          {typeIcons[listing.vehicleType] || '🚗'}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{typeLabel}</h3>
            {listing.isHeavyVehicle && <Badge variant="warning">Heavy vehicle</Badge>}
            <Badge variant="success">{savingsPct}% off</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {listing.fromCity} → {listing.toCity} {distance ? `· ${distance} km` : ''}
          </p>
          <p className="text-sm text-gray-500">
            {listing.departureDate} at {listing.departureTime} · {listing.availableCapacity} available
          </p>
          <p className="mt-1 text-sm text-gray-600">
            ⭐ {listing.driverRating} · {listing.tripsCompleted} trips · {listing.ownerName}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="text-right">
          <span className="text-sm text-gray-400 line-through">₹{listing.normalPrice}</span>
          <p className="text-2xl font-bold text-primary">₹{listing.pricePerUnit}</p>
        </div>
        <Button as={Link} to={`/booking/${listing.listingId}`} variant="accent" size="sm">
          Book now
        </Button>
      </div>
    </Card>
  )
}
