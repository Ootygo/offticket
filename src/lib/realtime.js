// Realtime bid updates. If VITE_WS_URL is set, connects to the real
// WebSocket API; otherwise falls back to an in-memory pub/sub so the whole
// bidding flow (including "live" updates) can be exercised standalone,
// consistent with how src/lib/api.js falls back to mock data.
const WS_URL = import.meta.env.VITE_WS_URL || ''
const USE_MOCKS = !WS_URL

const mockListeners = new Map() // demandPostId -> Set<callback>

// Called by the mock branches of api.js (createBid, acceptBid) to simulate
// the DynamoDB-Streams-triggered broadcast a real deploy would do.
export function mockEmit(demandPostId, message) {
  const listeners = mockListeners.get(demandPostId)
  if (listeners) listeners.forEach((cb) => cb(message))
}

// Subscribes to updates for one demand post. Returns an unsubscribe
// function. `token` is the caller's Cognito ID token (customer or owner) —
// the WebSocket API verifies it server-side to decide what this connection
// is allowed to see; it is never trusted as self-asserted identity.
export function connectRealtime(demandPostId, token, onMessage) {
  if (USE_MOCKS) {
    if (!mockListeners.has(demandPostId)) mockListeners.set(demandPostId, new Set())
    mockListeners.get(demandPostId).add(onMessage)
    return () => mockListeners.get(demandPostId)?.delete(onMessage)
  }

  const socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token || '')}`)

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ action: 'subscribe', demandPostId }))
  })
  socket.addEventListener('message', (event) => {
    try {
      onMessage(JSON.parse(event.data))
    } catch {
      // ignore malformed frames
    }
  })

  return () => socket.close()
}
