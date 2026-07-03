import { createContext, useContext, useEffect, useState } from 'react'
import { mockUsers } from '../data/mockData'
import {
  isCognitoConfigured,
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirmSignUp,
  signOut as cognitoSignOut,
  getCurrentSession,
} from '../lib/cognito'

const AuthContext = createContext(null)
const STORAGE_KEY = 'offticket_mock_session'
const USE_COGNITO = isCognitoConfigured()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      if (USE_COGNITO) {
        for (const userType of ['customer', 'owner']) {
          const session = await getCurrentSession(userType).catch(() => null)
          if (session) {
            setUser(claimsToUser(session.claims, userType))
            setToken(session.idToken)
            break
          }
        }
      } else {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            setUser(JSON.parse(stored))
            setToken('mock-token')
          } catch {
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  function claimsToUser(claims, userType) {
    return {
      userId: claims.sub,
      name: claims.name || 'User',
      phone: claims.phone_number,
      userType,
    }
  }

  // Mock-mode login (no Cognito env vars set) — instant, for local UI dev.
  function loginMock(userType) {
    const found = mockUsers.find((u) => u.userType === userType) || mockUsers[0]
    setUser(found)
    setToken('mock-token')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    return found
  }

  async function login(userType, credentials) {
    if (!USE_COGNITO) return loginMock(userType)
    const session = await cognitoSignIn(userType, credentials)
    const loggedInUser = claimsToUser(session.claims, userType)
    setUser(loggedInUser)
    setToken(session.idToken)
    return loggedInUser
  }

  async function signup(userType, details) {
    if (!USE_COGNITO) return loginMock(userType)
    return cognitoSignUp(userType, details)
  }

  async function confirmSignup(userType, details) {
    if (!USE_COGNITO) return true
    return cognitoConfirmSignUp(userType, details)
  }

  function logout() {
    if (USE_COGNITO && user) {
      cognitoSignOut(user.userType)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, token, login, signup, confirmSignup, logout, useCognito: USE_COGNITO }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
