const { randomUUID } = require('crypto')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail } = require('../../lib/response')
const { getUserId, getClaims } = require('../../lib/auth')
const { correctCityName } = require('../../lib/format')

// POST /demand-posts (customer only) — a customer posts an upcoming trip
// need; vehicle owners then bid on it blind (see bids/create.js).
exports.handler = async (event) => {
  const customerId = getUserId(event)
  if (!customerId) return fail('Unauthorized', 401)
  const claims = getClaims(event)

  const body = JSON.parse(event.body || '{}')
  const { fromCity, toCity, needType, goodsDetails, passengerCount, preferredDate, preferredTime, budgetHint } = body

  if (!fromCity || !toCity || !needType || !preferredDate) {
    return fail('fromCity, toCity, needType and preferredDate are required')
  }

  const normalizedFrom = correctCityName(fromCity)
  const normalizedTo = correctCityName(toCity)
  const now = new Date().toISOString()
  const demandPostId = `dp-${randomUUID()}`

  const post = {
    demandPostId,
    customerId,
    customerName: claims?.name || 'Customer',
    fromCity: normalizedFrom,
    toCity: normalizedTo,
    routeKey: `${normalizedFrom}#${normalizedTo}`,
    needType,
    goodsDetails: needType === 'goods' ? (goodsDetails || null) : null,
    passengerCount: needType === 'passenger' ? Number(passengerCount) || null : null,
    preferredDate,
    preferredTime: preferredTime || null,
    budgetHint: budgetHint ? Number(budgetHint) : null,
    status: 'open',
    bidCount: 0,
    awardedBidId: null,
    createdAt: now,
  }

  await ddb.send(new PutCommand({ TableName: TABLES.DEMAND_POSTS, Item: post }))
  return ok(post, 201)
}
