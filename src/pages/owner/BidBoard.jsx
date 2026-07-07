import { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import RouteInputs from '../../components/ui/RouteInputs'
import { VEHICLE_TYPES } from '../../data/mockData'
import { searchDemandPosts, createBid, getMyBidForPost } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useRequireUser } from '../../hooks/useRequireUser'

const statusVariant = { pending: 'warning', accepted: 'success', rejected: 'neutral' }

function BidForm({ post, myBid, onSubmit }) {
  const [price, setPrice] = useState('')
  const [vehicleType, setVehicleType] = useState('mini_truck')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (myBid) {
    return (
      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
        <p className="text-gray-700">Your bid: <span className="font-semibold text-gray-900">₹{myBid.price}</span></p>
        <Badge variant={statusVariant[myBid.status] || 'neutral'} className="mt-1">{myBid.status}</Badge>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({ price: Number(price), vehicleType, registrationNumber, message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-2 sm:grid-cols-2">
      <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
        {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <input required type="number" placeholder="Your price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input placeholder="Registration number (optional)" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
      <input placeholder="Message to customer (optional)" value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
      <Button type="submit" variant="accent" size="sm" disabled={submitting} className="sm:col-span-2">
        {submitting ? 'Placing bid...' : 'Place Bid'}
      </Button>
    </form>
  )
}

export default function BidBoard() {
  const { token } = useAuth()
  const user = useRequireUser('owner')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [posts, setPosts] = useState([])
  const [myBids, setMyBids] = useState({})
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const results = await searchDemandPosts({ from: from || undefined, to: to || undefined, status: 'open' })
      setPosts(results)
      if (user) {
        const entries = await Promise.all(
          results.map(async (p) => [p.demandPostId, await getMyBidForPost(p.demandPostId, user.userId, token)])
        )
        setMyBids(Object.fromEntries(entries))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function handleSearch(e) {
    e.preventDefault()
    load()
  }

  async function handleBid(demandPostId, bid) {
    const newBid = await createBid(demandPostId, bid, token)
    setMyBids((prev) => ({ ...prev, [demandPostId]: newBid }))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Bid Board</h1>
      <p className="mt-1 text-sm text-gray-500">
        Customer requests looking for a vehicle. Bid blind — you won't see other owners' offers, and they won't see yours.
      </p>

      <Card className="mt-6 p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <RouteInputs from={from} to={to} onFromChange={setFrom} onToChange={setTo} className="flex-1" />
          <Button type="submit" variant="primary">Filter</Button>
        </form>
      </Card>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-gray-500">Loading requests...</p>}
        {!loading && posts.length === 0 && (
          <Card className="p-8 text-center text-gray-500">No open requests right now. Check back soon.</Card>
        )}
        {!loading && posts.map((post) => (
          <Card key={post.demandPostId} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{post.fromCity} → {post.toCity}</p>
                <p className="text-sm text-gray-500">
                  {post.needType === 'goods' ? 'Goods' : 'Passengers'} · {post.preferredDate}{post.preferredTime ? ` at ${post.preferredTime}` : ''}
                </p>
                {post.needType === 'goods' && post.goodsDetails && (
                  <p className="text-sm text-gray-500">
                    {post.goodsDetails.description}{post.goodsDetails.weight ? ` · ~${post.goodsDetails.weight} kg` : ''}
                  </p>
                )}
                {post.needType === 'passenger' && <p className="text-sm text-gray-500">{post.passengerCount} passenger(s)</p>}
              </div>
              <div className="text-right">
                {post.budgetHint && <p className="text-sm text-gray-500">Budget hint: ₹{post.budgetHint}</p>}
                <Badge variant="neutral">{post.bidCount} bid{post.bidCount === 1 ? '' : 's'} so far</Badge>
              </div>
            </div>
            <BidForm post={post} myBid={myBids[post.demandPostId]} onSubmit={(bid) => handleBid(post.demandPostId, bid)} />
          </Card>
        ))}
      </div>
    </div>
  )
}
