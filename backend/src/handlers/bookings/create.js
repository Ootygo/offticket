const { randomUUID } = require('crypto')
const { GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')
const { getUserId } = require('../../lib/auth')

function generateBookingId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randPart = Math.floor(1000 + Math.random() * 9000)
  return `OT-${datePart}-${randPart}`
}

// POST /bookings (customer only — requires Cognito customer-pool token)
exports.handler = async (event) => {
  setRequestOrigin(event)
  const customerId = getUserId(event)
  if (!customerId) return fail('Unauthorized', 401)

  const body = JSON.parse(event.body || '{}')
  const { listingId, goodsDetails, passengerCount } = body
  if (!listingId) return fail('listingId is required')

  const listingResult = await ddb.send(
    new GetCommand({ TableName: TABLES.LISTINGS, Key: { listingId } })
  )
  const listing = listingResult.Item
  if (!listing || listing.status !== 'active') {
    return fail('Listing is no longer available', 409)
  }

  const bookingId = generateBookingId()
  const now = new Date().toISOString()

  const booking = {
    bookingId,
    listingId,
    customerId,
    ownerId: listing.ownerId,
    goodsDetails: goodsDetails || null,
    passengerCount: passengerCount || null,
    totalPrice: listing.pricePerUnit,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: now,
  }

  await ddb.send(new PutCommand({ TableName: TABLES.BOOKINGS, Item: booking }))

  // Reserve the listing so it can't be double-booked while the owner reviews it.
  await ddb.send(new UpdateCommand({
    TableName: TABLES.LISTINGS,
    Key: { listingId },
    UpdateExpression: 'SET #status = :booked',
    ConditionExpression: '#status = :active',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':booked': 'booked', ':active': 'active' },
  }))

  return ok(booking, 201)
}
