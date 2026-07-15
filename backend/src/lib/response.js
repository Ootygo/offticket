// Access-Control-Allow-Origin must be a single exact origin (browsers
// reject a comma-joined list), so with multiple allowed origins (custom
// domain, www, the Amplify default, etc.) we have to echo back whichever
// one actually made this request rather than statically picking one.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

let currentAllowOrigin = ALLOWED_ORIGINS[0] || '*'

// Call once at the top of each handler, before any ok()/fail() calls, with
// the incoming event — Lambda processes one invocation at a time per
// execution environment, so this module-level value is safe to reuse
// across the handful of ok()/fail() calls a single invocation makes.
function setRequestOrigin(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin || null
  if (ALLOWED_ORIGINS.includes('*')) {
    currentAllowOrigin = '*'
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    currentAllowOrigin = origin
  } else {
    currentAllowOrigin = ALLOWED_ORIGINS[0] || '*'
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': currentAllowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  }
}

function ok(body, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  }
}

function fail(message, statusCode = 400) {
  return ok({ message }, statusCode)
}

module.exports = { ok, fail, setRequestOrigin }
