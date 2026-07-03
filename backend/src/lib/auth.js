// Reads the verified Cognito claims that API Gateway's JWT authorizer
// attaches to the request context. Returns null if the route is public
// (no authorizer configured) or the token was not verified.
function getClaims(event) {
  return event.requestContext?.authorizer?.jwt?.claims || null
}

function getUserId(event) {
  const claims = getClaims(event)
  return claims?.sub || null
}

module.exports = { getClaims, getUserId }
