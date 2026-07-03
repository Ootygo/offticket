// Thin wrapper around amazon-cognito-identity-js. OFFTICKET uses two
// separate Cognito User Pools (customer / owner) instead of Amplify's
// single-pool config, so each user type is authenticated against its own
// pool. Set the VITE_*_USER_POOL_* env vars to enable real auth; if they
// are absent, AuthContext falls back to a mock/demo login.
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js'

const poolConfigs = {
  customer: {
    UserPoolId: import.meta.env.VITE_CUSTOMER_USER_POOL_ID,
    ClientId: import.meta.env.VITE_CUSTOMER_USER_POOL_CLIENT_ID,
  },
  owner: {
    UserPoolId: import.meta.env.VITE_OWNER_USER_POOL_ID,
    ClientId: import.meta.env.VITE_OWNER_USER_POOL_CLIENT_ID,
  },
}

export function isCognitoConfigured() {
  return Boolean(
    poolConfigs.customer.UserPoolId &&
    poolConfigs.customer.ClientId &&
    poolConfigs.owner.UserPoolId &&
    poolConfigs.owner.ClientId
  )
}

function getPool(userType) {
  const config = poolConfigs[userType]
  if (!config?.UserPoolId) throw new Error(`Cognito pool not configured for userType: ${userType}`)
  return new CognitoUserPool(config)
}

export function signUp(userType, { email, password, name }) {
  const pool = getPool(userType)
  const attributes = [
    new CognitoUserAttribute({ Name: 'name', Value: name }),
    new CognitoUserAttribute({ Name: 'email', Value: email }),
  ]
  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attributes, null, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

export function confirmSignUp(userType, { email, code }) {
  const pool = getPool(userType)
  const user = new CognitoUser({ Username: email, Pool: pool })
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

export function signIn(userType, { email, password }) {
  const pool = getPool(userType)
  const user = new CognitoUser({ Username: email, Pool: pool })
  const authDetails = new AuthenticationDetails({ Username: email, Password: password })

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve({
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
          claims: session.getIdToken().decodePayload(),
        })
      },
      onFailure: (err) => reject(err),
    })
  })
}

export function signOut(userType) {
  const pool = getPool(userType)
  const user = pool.getCurrentUser()
  if (user) user.signOut()
}

export function getCurrentSession(userType) {
  const pool = getPool(userType)
  const user = pool.getCurrentUser()
  if (!user) return Promise.resolve(null)

  return new Promise((resolve, reject) => {
    user.getSession((err, session) => {
      if (err) return reject(err)
      if (!session?.isValid()) return resolve(null)
      resolve({
        idToken: session.getIdToken().getJwtToken(),
        claims: session.getIdToken().decodePayload(),
      })
    })
  })
}
