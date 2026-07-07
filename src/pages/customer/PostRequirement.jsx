import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import RouteInputs from '../../components/ui/RouteInputs'
import { createDemandPost } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useRequireUser } from '../../hooks/useRequireUser'

const initialForm = {
  fromCity: '',
  toCity: '',
  needType: 'goods',
  goodsDescription: '',
  goodsWeight: '',
  passengerCount: 1,
  preferredDate: '',
  preferredTime: '',
  budgetHint: '',
}

export default function PostRequirement() {
  const { token } = useAuth()
  const user = useRequireUser('customer')
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      const post = await createDemandPost({
        customerId: user.userId,
        customerName: user.name,
        fromCity: form.fromCity,
        toCity: form.toCity,
        needType: form.needType,
        goodsDetails: form.needType === 'goods'
          ? { description: form.goodsDescription, weight: form.goodsWeight }
          : null,
        passengerCount: form.needType === 'passenger' ? Number(form.passengerCount) : null,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime || null,
        budgetHint: form.budgetHint ? Number(form.budgetHint) : null,
      }, token)
      navigate(`/requirements/${post.demandPostId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Post Your Requirement</h1>
      <p className="mt-1 text-sm text-gray-500">
        Tell us what you need moved and when — vehicle owners bid on it, and you pick the best price.
        Bids are private to you; owners never see each other's offers.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="font-semibold text-gray-900">Route & date</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <RouteInputs
                from={form.fromCity}
                to={form.toCity}
                onFromChange={(v) => update('fromCity', v)}
                onToChange={(v) => update('toCity', v)}
                required
                className="sm:col-span-2"
              />
              <label className="text-sm text-gray-700">
                Preferred date
                <input required type="date" value={form.preferredDate} onChange={(e) => update('preferredDate', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="text-sm text-gray-700">
                Preferred time (optional)
                <input type="time" value={form.preferredTime} onChange={(e) => update('preferredTime', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">What do you need moved?</h2>
            <div className="mt-3 flex gap-2 rounded-lg bg-gray-100 p-1">
              {['goods', 'passenger'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update('needType', t)}
                  className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors ${
                    form.needType === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {t === 'goods' ? 'Goods' : 'Passengers'}
                </button>
              ))}
            </div>

            {form.needType === 'goods' ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-gray-700 sm:col-span-2">
                  Description of goods
                  <input
                    required
                    placeholder="e.g. household shifting, vegetables, hardware supplies"
                    value={form.goodsDescription}
                    onChange={(e) => update('goodsDescription', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Approx. weight (kg)
                  <input
                    type="number"
                    value={form.goodsWeight}
                    onChange={(e) => update('goodsWeight', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
              </div>
            ) : (
              <label className="mt-3 block text-sm text-gray-700">
                Number of passengers
                <input
                  required
                  type="number"
                  min={1}
                  value={form.passengerCount}
                  onChange={(e) => update('passengerCount', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">Budget (optional)</h2>
            <p className="mt-1 text-xs text-gray-500">
              A rough number helps owners bid sensibly — it's a hint, not a cap.
            </p>
            <label className="mt-3 block text-sm text-gray-700">
              Budget in ₹
              <input type="number" value={form.budgetHint} onChange={(e) => update('budgetHint', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
            {submitting ? 'Posting...' : 'Post Requirement & Get Bids'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
