import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Ensures a user of the given type is present before a page runs its data
// fetch. In mock mode (no Cognito configured) it auto-logs-in a demo user
// so the UI can be exercised without a login step. With real Cognito, it
// redirects to /login if no session exists.
export function useRequireUser(userType) {
  const { user, login, useCognito } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) return
    if (useCognito) {
      navigate(`/login?as=${userType}`)
    } else {
      login(userType)
    }
  }, [user, useCognito, userType, login, navigate])

  return user
}
