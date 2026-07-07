import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { VEHICLE_TYPES } from '../../data/mockData'
import { getDemandPost, getBidsForPost, acceptBid } from '../../lib/api'
import { connectRealtime } from '../../lib/realtime'
import { useAuth } from '../../context/AuthContext'
import { useRequireUser } from '../../hooks/useRequireUser'

const statusVariant = { pending: 'warning', accepted: 'success', rejected: 'neutral' }

export default function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const user = useRequireUser('customer')

  const [post, setPost] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([getDemandPost(id), getBidsForPost(id, token)])
      .then(([p, b]) => { setPost(p); setBids(b) })
      .finally(() => setLoading(false))
  }, [id, user, token])

  useEffect(() => {
    if (!user) return
    setLive(true)
    const unsubscribe = connectRealtime(id, token, (message) => {
      if (message.type === 'new_bid') {
        setBids((prev) => (prev.some((b) => b.bidId === message.bid.bidId) ? prev : [...prev, message.bid]))
        setPost((prev) => (prev ? { ...prev, bidCount: prev.bidCount + 1 } : prev))
      }
      if (message.type === 'bid_updated') {
        setBids((prev) => prev.map((b) => (b.bidId === message.bid.bidId ? message.bid : b)))
      }
    })
    return () => {
      unsubscribe()
      setLive(false)
    }
  }, [id, user, token])

  async function handleAccept(bidId) {
    setAccepting(bidId)
    try {
      const booking = await acceptBid(id, bidId, token)
      navigate(`/booking-confirmation/${booking.bookingId}`)
    } finally {
      setAccepting(null)
    }
  }

  if (loading) return <p className="mx-auto max-w-3xl px-4 py-8 text-gray-500">Loading...</p>
  if (!post) return <p className="mx-auto max-w-3xl px-4 py-8 text-red-600">Request not found</p>

  const typeLabel = post.needType === 'goods' ? 'Goods transport' : 'Passenger trip'
  const sortedBids = [...bids].sort((a, b) => a.price - b.price)
  const isOpen = post.status === 'open'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Requirement</h1>
        <Badge variant={isOpen ? 'primary' : 'success'}>{post.status}</Badge>
      </div>

      <Card className="mt-6 p-6">
        <p className="font-semibold text-gray-900">{post.fromCity} → {post.toCity}</p>
        <p className="text-sm text-gray-500">{typeLabel} · {post.preferredDate}{post.preferredTime ? ` at ${post.preferredTime}` : ''}</p>
        {post.needType === 'goods' && post.goodsDetails && (
          <p className="mt-1 text-sm text-gray-500">
            {post.goodsDetails.description}{post.goodsDetails.weight ? ` · ~${post.goodsDetails.weight} kg` : ''}
          </p>
        )}
        {post.needType === 'passenger' && (
          <p className="mt-1 text-sm text-gray-500">{post.passengerCount} passenger(s)</p>
        )}
        {post.budgetHint && <p className="mt-1 text-sm text-gray-500">Budget hint: ₹{post.budgetHint}</p>}
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Bids ({sortedBids.length})</h2>
        <span className={`flex items-center gap-1.5 text-xs ${live ? 'text-emerald-600' : 'text-gray-400'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          {live ? 'Live' : 'Connecting...'}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-400">Only you can see these bids — owners can't see each other's offers.</p>

      <div className="mt-3 space-y-3">
        {sortedBids.length === 0 && (
          <Card className="p-6 text-center text-sm text-gray-500">
            No bids yet — vehicle owners on this route will see your request and can bid any time.
          </Card>
        )}
        {sortedBids.map((bid, i) => {
          const typeLabel = VEHICLE_TYPES.find((t) => t.value === bid.vehicleType)?.label || bid.vehicleType
          return (
            <Card key={bid.bidId} className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{bid.ownerName}</p>
                  {i === 0 && isOpen && <Badge variant="success">Best price</Badge>}
                  <Badge variant={statusVariant[bid.status] || 'neutral'}>{bid.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">{typeLabel}{bid.registrationNumber ? ` · ${bid.registrationNumber}` : ''}</p>
                {bid.message && <p className="mt-1 text-sm text-gray-500">"{bid.message}"</p>}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">₹{bid.price}</p>
                {isOpen && bid.status === 'pending' && (
                  <Button
                    variant="accent"
                    size="sm"
                    className="mt-2"
                    disabled={accepting === bid.bidId}
                    onClick={() => handleAccept(bid.bidId)}
                  >
                    {accepting === bid.bidId ? 'Accepting...' : 'Accept'}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
