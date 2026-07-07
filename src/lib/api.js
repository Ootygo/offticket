// Thin API client. If VITE_API_BASE_URL is set, calls go to real API Gateway
// endpoints; otherwise falls back to mock data so the UI can be built/tested
// standalone. Pages should only ever import from this file, never mockData
// directly, so wiring up the backend later is a one-file change.

import {
  mockListings,
  mockBookings,
  mockUsers,
  mockDemandPosts,
  mockBids,
  RECENT_TRIPS_COUNT,
} from '../data/mockData'
import { correctCityName } from './format'
import { mockEmit } from './realtime'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const USE_MOCKS = !API_BASE_URL

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function searchListings({ from, to, date, type } = {}) {
  const correctedFrom = from ? correctCityName(from) : from
  const correctedTo = to ? correctCityName(to) : to

  if (USE_MOCKS) {
    await delay()
    return mockListings.filter((l) => {
      if (correctedFrom && l.fromCity !== correctedFrom) return false
      if (correctedTo && l.toCity !== correctedTo) return false
      if (date && l.departureDate !== date) return false
      if (type === 'goods' && l.vehicleType === 'cab') return false
      if (type === 'passenger' && l.vehicleType !== 'cab') return false
      return l.status === 'active'
    })
  }
  const params = new URLSearchParams()
  if (correctedFrom) params.set('from', correctedFrom)
  if (correctedTo) params.set('to', correctedTo)
  if (date) params.set('date', date)
  if (type) params.set('type', type)
  return request(`/listings?${params.toString()}`)
}

export async function getListing(listingId) {
  if (USE_MOCKS) {
    await delay()
    const listing = mockListings.find((l) => l.listingId === listingId)
    if (!listing) throw new Error('Listing not found')
    return listing
  }
  return request(`/listings/${listingId}`)
}

export async function createListing(listing, token) {
  if (USE_MOCKS) {
    await delay()
    const listingId = `l-${Math.floor(1000 + Math.random() * 9000)}`
    const newListing = {
      ...listing,
      fromCity: correctCityName(listing.fromCity),
      toCity: correctCityName(listing.toCity),
      listingId,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    mockListings.unshift(newListing)
    return newListing
  }
  return request('/listings', { method: 'POST', body: listing, token })
}

export async function createBooking(booking, token) {
  if (USE_MOCKS) {
    await delay()
    const bookingId = `OT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    const newBooking = {
      ...booking,
      bookingId,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    }
    mockBookings.unshift(newBooking)
    return newBooking
  }
  return request('/bookings', { method: 'POST', body: booking, token })
}

export async function confirmBooking(bookingId, token) {
  if (USE_MOCKS) {
    await delay()
    const booking = mockBookings.find((b) => b.bookingId === bookingId)
    if (booking) booking.status = 'confirmed'
    return booking
  }
  return request(`/bookings/${bookingId}/confirm`, { method: 'PUT', token })
}

export async function getUserBookings(userId, token) {
  if (USE_MOCKS) {
    await delay()
    return mockBookings.filter((b) => b.customerId === userId)
  }
  return request(`/users/${userId}/bookings`, { token })
}

export async function getUserListings(userId, token) {
  if (USE_MOCKS) {
    await delay()
    return mockListings.filter((l) => l.ownerId === userId)
  }
  return request(`/users/${userId}/listings`, { token })
}

export async function getIncomingBookingsForOwner(ownerId, token) {
  if (USE_MOCKS) {
    await delay()
    return mockBookings.filter((b) => b.ownerId === ownerId)
  }
  return request(`/users/${ownerId}/bookings?role=owner`, { token })
}

export async function getStats() {
  if (USE_MOCKS) {
    await delay(150)
    return { recentTrips: RECENT_TRIPS_COUNT }
  }
  return request('/stats')
}

export async function getMockCustomer() {
  return mockUsers.find((u) => u.userType === 'customer')
}

export async function getMockOwner() {
  return mockUsers.find((u) => u.userType === 'owner')
}

// ── Demand posts (customer requests) + blind bidding ──────────────────────

export async function createDemandPost(post, token) {
  if (USE_MOCKS) {
    await delay()
    const demandPostId = `dp-${Math.floor(1000 + Math.random() * 9000)}`
    const newPost = {
      ...post,
      fromCity: correctCityName(post.fromCity),
      toCity: correctCityName(post.toCity),
      demandPostId,
      status: 'open',
      bidCount: 0,
      awardedBidId: null,
      createdAt: new Date().toISOString(),
    }
    mockDemandPosts.unshift(newPost)
    return newPost
  }
  return request('/demand-posts', { method: 'POST', body: post, token })
}

export async function searchDemandPosts({ from, to, status } = {}) {
  const correctedFrom = from ? correctCityName(from) : from
  const correctedTo = to ? correctCityName(to) : to
  const wantedStatus = status || 'open'

  if (USE_MOCKS) {
    await delay()
    return mockDemandPosts.filter((p) => {
      if (p.status !== wantedStatus) return false
      if (correctedFrom && p.fromCity !== correctedFrom) return false
      if (correctedTo && p.toCity !== correctedTo) return false
      return true
    })
  }
  const params = new URLSearchParams()
  if (correctedFrom) params.set('from', correctedFrom)
  if (correctedTo) params.set('to', correctedTo)
  params.set('status', wantedStatus)
  return request(`/demand-posts?${params.toString()}`)
}

export async function getDemandPost(demandPostId) {
  if (USE_MOCKS) {
    await delay()
    const post = mockDemandPosts.find((p) => p.demandPostId === demandPostId)
    if (!post) throw new Error('Request not found')
    return post
  }
  return request(`/demand-posts/${demandPostId}`)
}

export async function createBid(demandPostId, bid, token) {
  if (USE_MOCKS) {
    await delay()
    const post = mockDemandPosts.find((p) => p.demandPostId === demandPostId)
    if (!post || post.status !== 'open') throw new Error('This request is no longer accepting bids')
    const bidId = `bid-${Math.floor(1000 + Math.random() * 9000)}`
    const newBid = {
      ...bid,
      demandPostId,
      bidId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    mockBids.push(newBid)
    post.bidCount += 1
    mockEmit(demandPostId, { type: 'new_bid', bid: newBid })
    return newBid
  }
  return request(`/demand-posts/${demandPostId}/bids`, { method: 'POST', body: bid, token })
}

// Customer-only in the real API (enforced server-side by matching the JWT's
// sub against the post's customerId) — mock mode has no server boundary to
// enforce this against, so it trusts the caller the same way the rest of
// the mock layer does (e.g. getUserBookings).
export async function getBidsForPost(demandPostId, token) {
  if (USE_MOCKS) {
    await delay()
    return mockBids.filter((b) => b.demandPostId === demandPostId)
  }
  return request(`/demand-posts/${demandPostId}/bids`, { token })
}

export async function getMyBidForPost(demandPostId, ownerId, token) {
  if (USE_MOCKS) {
    await delay()
    return mockBids.find((b) => b.demandPostId === demandPostId && b.ownerId === ownerId) || null
  }
  return request(`/demand-posts/${demandPostId}/bids/mine`, { token })
}

export async function acceptBid(demandPostId, bidId, token) {
  if (USE_MOCKS) {
    await delay()
    const post = mockDemandPosts.find((p) => p.demandPostId === demandPostId)
    const bid = mockBids.find((b) => b.bidId === bidId)
    if (!post || !bid) throw new Error('Request or bid not found')

    bid.status = 'accepted'
    mockEmit(demandPostId, { type: 'bid_updated', bid })
    mockBids
      .filter((b) => b.demandPostId === demandPostId && b.bidId !== bidId && b.status === 'pending')
      .forEach((b) => {
        b.status = 'rejected'
        mockEmit(demandPostId, { type: 'bid_updated', bid: b })
      })

    post.status = 'awarded'
    post.awardedBidId = bidId

    const bookingId = `OT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    const booking = {
      bookingId,
      demandPostId,
      bidId,
      listingId: null,
      customerId: post.customerId,
      ownerId: bid.ownerId,
      goodsDetails: post.goodsDetails,
      passengerCount: post.passengerCount,
      totalPrice: bid.price,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    }
    mockBookings.unshift(booking)
    return booking
  }
  return request(`/demand-posts/${demandPostId}/bids/${bidId}/accept`, { method: 'PUT', token })
}

export async function getUserDemandPosts(customerId, token) {
  if (USE_MOCKS) {
    await delay()
    return mockDemandPosts.filter((p) => p.customerId === customerId)
  }
  return request(`/users/${customerId}/demand-posts`, { token })
}

export async function getUserPlacedBids(ownerId, token) {
  if (USE_MOCKS) {
    await delay()
    return mockBids.filter((b) => b.ownerId === ownerId)
  }
  return request(`/users/${ownerId}/placed-bids`, { token })
}
