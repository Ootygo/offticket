const { randomUUID } = require('crypto')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail } = require('../../lib/response')
const { getUserId } = require('../../lib/auth')
const { correctCityName } = require('../../lib/format')

// POST /listings (owner only — requires Cognito owner-pool token)
exports.handler = async (event) => {
  const ownerId = getUserId(event)
  if (!ownerId) return fail('Unauthorized', 401)

  const body = JSON.parse(event.body || '{}')
  const {
    vehicleType,
    registrationNumber,
    capacity,
    photo,
    fromCity,
    toCity,
    departureDate,
    departureTime,
    availableCapacity,
    pricePerUnit,
    normalPrice,
    ownerName,
  } = body

  if (!vehicleType || !registrationNumber || !fromCity || !toCity || !departureDate || !pricePerUnit) {
    return fail('Missing required listing fields')
  }

  const now = new Date().toISOString()
  const vehicleId = `v-${randomUUID()}`
  const listingId = `l-${randomUUID()}`
  const isHeavyVehicle = vehicleType === 'truck'
  const normalizedFrom = correctCityName(fromCity)
  const normalizedTo = correctCityName(toCity)

  await ddb.send(new PutCommand({
    TableName: TABLES.VEHICLES,
    Item: { vehicleId, ownerId, type: vehicleType, registrationNumber, capacity, photo: photo || null, verified: false },
  }))

  const listing = {
    listingId,
    vehicleId,
    ownerId,
    ownerName,
    vehicleType,
    registrationNumber,
    routeKey: `${normalizedFrom}#${normalizedTo}`,
    fromCity: normalizedFrom,
    toCity: normalizedTo,
    departureDate,
    departureTime,
    availableCapacity,
    pricePerUnit: Number(pricePerUnit),
    normalPrice: Number(normalPrice),
    isHeavyVehicle,
    driverRating: 0,
    tripsCompleted: 0,
    status: 'active',
    createdAt: now,
  }

  await ddb.send(new PutCommand({ TableName: TABLES.LISTINGS, Item: listing }))

  return ok(listing, 201)
}
