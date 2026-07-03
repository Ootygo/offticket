import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

const MODES = { SIGN_IN: 'sign_in', SIGN_UP: 'sign_up', CONFIRM: 'confirm' }

export default function Login() {
  const { login, signup, confirmSignup, useCognito } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [userType, setUserType] = useState(params.get('as') === 'owner' ? 'owner' : 'customer')
  const [mode, setMode] = useState(MODES.SIGN_IN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function goToDashboard() {
    navigate(userType === 'owner' ? '/owner/dashboard' : '/dashboard')
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(userType, { email, password })
      goToDashboard()
    } catch (err) {
      setError(err.message || 'Could not sign in')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup(userType, { email, password, name })
      if (useCognito) {
        setMode(MODES.CONFIRM)
      } else {
        goToDashboard()
      }
    } catch (err) {
      setError(err.message || 'Could not sign up')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirm(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await confirmSignup(userType, { email, code })
      await login(userType, { email, password })
      goToDashboard()
    } catch (err) {
      setError(err.message || 'Could not verify code')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === MODES.SIGN_UP ? 'Create your account' : mode === MODES.CONFIRM ? 'Verify your email' : 'Log in to OFFTICKET'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {useCognito
            ? 'Secured by AWS Cognito'
            : 'Demo login — connect Cognito env vars for real email verification.'}
        </p>

        {mode !== MODES.CONFIRM && (
          <div className="mt-6 flex gap-2 rounded-lg bg-gray-100 p-1">
            {['customer', 'owner'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setUserType(t)}
                className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors ${
                  userType === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                }`}
              >
                {t === 'owner' ? 'Vehicle Owner' : 'Customer'}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {mode === MODES.SIGN_IN && (
          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <label className="block text-sm text-gray-700">
              Email address
              <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            {useCognito && (
              <label className="block text-sm text-gray-700">
                Password
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
            )}
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? 'Please wait...' : 'Continue'}
            </Button>
            {useCognito && (
              <button type="button" onClick={() => setMode(MODES.SIGN_UP)} className="w-full text-center text-sm text-primary underline">
                New here? Create an account
              </button>
            )}
          </form>
        )}

        {mode === MODES.SIGN_UP && (
          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            <label className="block text-sm text-gray-700">
              Full name
              <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label className="block text-sm text-gray-700">
              Email address
              <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label className="block text-sm text-gray-700">
              Password
              <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? 'Please wait...' : 'Sign up'}
            </Button>
            <button type="button" onClick={() => setMode(MODES.SIGN_IN)} className="w-full text-center text-sm text-primary underline">
              Already have an account? Log in
            </button>
          </form>
        )}

        {mode === MODES.CONFIRM && (
          <form onSubmit={handleConfirm} className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">Enter the verification code sent to {email}</p>
            <label className="block text-sm text-gray-700">
              Verification code
              <input required value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? 'Verifying...' : 'Verify & continue'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
