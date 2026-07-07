import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import RouteInputs from '../components/ui/RouteInputs'
import VehicleResultCard from '../components/VehicleResultCard'
import { searchListings } from '../lib/api'
import { correctCityName } from '../lib/format'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const rawFrom = params.get('from') || ''
  const rawTo = params.get('to') || ''
  const searchFrom = rawFrom ? correctCityName(rawFrom) : ''
  const searchTo = rawTo ? correctCityName(rawTo) : ''
  const searchDate = params.get('date') || ''
  const searchType = params.get('type') || 'goods'
  const hasRoute = Boolean(searchFrom && searchTo)

  const [from, setFrom] = useState(searchFrom)
  const [to, setTo] = useState(searchTo)
  const [date, setDate] = useState(searchDate)
  const [type, setType] = useState(searchType)
  const [minCapacity, setMinCapacity] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(hasRoute)

  // The actual search only re-runs when the committed URL params change
  // (i.e. after the form is submitted), not on every keystroke — From/To
  // are free text now, so mid-typing values rarely match anything yet. It
  // also only runs once a route is actually selected — this is a statewide
  // marketplace, so there's no default corridor to fall back to.
  useEffect(() => {
    if (!hasRoute) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    searchListings({ from: searchFrom, to: searchTo, date: searchDate || undefined, type: searchType })
      .then(setResults)
      .finally(() => setLoading(false))
  }, [hasRoute, searchFrom, searchTo, searchDate, searchType])

  function handleSubmit(e) {
    e.preventDefault()
    setParams({
      from: correctCityName(from),
      to: correctCityName(to),
      ...(date ? { date } : {}),
      type,
    })
  }

  const filteredResults = results.filter((r) => {
    if (type !== 'goods' || !minCapacity) return true
    const kg = parseInt(r.availableCapacity, 10)
    return !Number.isNaN(kg) && kg >= parseInt(minCapacity, 10)
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Find a Vehicle</h1>
      <p className="mt-1 text-sm text-gray-500">Search empty return-trip vehicles anywhere in Tamil Nadu</p>

      <Card className="mt-6 p-5">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <RouteInputs from={from} to={to} onFromChange={setFrom} onToChange={setTo} required className="sm:col-span-2 lg:col-span-2" />
          <label className="text-sm text-gray-700">
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="text-sm text-gray-700">
            Type
            <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="goods">Goods Transport</option>
              <option value="passenger">Passenger</option>
            </select>
          </label>
          {type === 'goods' ? (
            <label className="text-sm text-gray-700">
              Min. capacity (kg)
              <input
                type="number"
                placeholder="e.g. 500"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
          ) : <div className="hidden lg:block" />}
          <div className="sm:col-span-2 lg:col-span-5">
            <Button type="submit" variant="primary">Search</Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 space-y-4">
        {!hasRoute && (
          <Card className="p-8 text-center text-gray-500">
            Enter a From and To city above to see available empty-return vehicles on that route.
          </Card>
        )}
        {hasRoute && loading && <p className="text-gray-500">Searching...</p>}
        {hasRoute && !loading && filteredResults.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            No empty vehicles found for this route and date yet. Try another date or check back soon.
          </Card>
        )}
        {hasRoute && !loading && filteredResults.map((listing) => (
          <VehicleResultCard key={listing.listingId} listing={listing} />
        ))}
      </div>
    </div>
  )
}
