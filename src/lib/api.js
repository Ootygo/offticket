// Thin API client. If VITE_API_BASE_URL is set, calls go to real API Gateway
// endpoints; otherwise falls back to mock data so the UI can be built/tested
// standalone. Pages should only ever import from this file, never mockData
// directly, so wiring up the backend later is a one-file change.

import {
  mockListings,
  mockBookings,
  mockUsers,
  RECENT_TRIPS_COUNT,
} from '../data/mockData'
import { correctCityName } from './format'

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
