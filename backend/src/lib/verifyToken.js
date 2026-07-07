const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')

const region = process.env.AWS_REGION
const pools = {
  customer: process.env.CUSTOMER_USER_POOL_ID,
  owner: process.env.OWNER_USER_POOL_ID,
}

const clients = {}
function getJwksClient(userType) {
  if (!clients[userType]) {
    clients[userType] = jwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${pools[userType]}/.well-known/jwks.json`,
      cache: true,
    })
  }
  return clients[userType]
}

function getKey(userType) {
  return (header, callback) => {
    getJwksClient(userType).getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err)
      callback(null, key.getPublicKey())
    })
  }
}

// Verifies a Cognito ID token's signature against either user pool's JWKS
// (a WebSocket connection could come from a customer or an owner session).
// This is what actually establishes trusted identity for the realtime
// layer — connections never get to just assert their own userId/userType.
async function verifyToken(token) {
  for (const userType of ['customer', 'owner']) {
    try {
      const claims = await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          getKey(userType),
          { issuer: `https://cognito-idp.${region}.amazonaws.com/${pools[userType]}` },
          (err, decoded) => (err ? reject(err) : resolve(decoded))
        )
      })
      return { userType, userId: claims.sub, claims }
    } catch {
      // wrong pool for this token — try the other one
    }
  }
  return null
}

module.exports = { verifyToken }
