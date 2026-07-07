import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function About() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">About OFFTICKET</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-primary">Our Mission</h2>
        <p className="mt-2 text-gray-600">
          Every day, thousands of trucks and cabs travel across Tamil Nadu — from Chennai to Coimbatore, Madurai
          to Trichy, Coimbatore up to Ooty, and everywhere in between — fully loaded one way and completely
          empty on the return. OFFTICKET connects those empty return trips with customers who need to move
          goods or themselves, on any route in the state — cutting costs for everyone, reducing the number of
          extra vehicles on the road, and lowering emissions.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-primary">How Pricing Works</h2>
        <p className="mt-2 text-gray-600">
          A vehicle owner who has already covered their costs on the outbound trip is willing to carry goods or
          passengers on the empty return leg for far less than the usual one-way rate — typically 40–60% of the
          normal price. You get a lower price, they earn on a trip that would otherwise be a pure loss. OFFTICKET
          simply makes that match visible and bookable.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
        <Card className="mt-4 p-6">
          {sent ? (
            <p className="text-emerald-700">Thanks for reaching out — we'll get back to you soon.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm text-gray-700">
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Message
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <Button type="submit" variant="primary">Send Message</Button>
            </form>
          )}
        </Card>
      </section>
    </div>
  )
}
