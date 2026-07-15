const { randomUUID } = require('crypto')
const { GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')
const { getUserId, getClaims } = require('../../lib/auth')

// POST /demand-posts/{id}/bids (owner only). Deliberately does not return
// or expose any other bid on this post — an owner only ever gets back
// their own bid they just placed.
exports.handler = async (event) => {
  setRequestOrigin(event)
  const ownerId = getUserId(event)
  if (!ownerId) return fail('Unauthorized', 401)
  const claims = getClaims(event)

  const demandPostId = event.pathParameters?.id
  const body = JSON.parse(event.body || '{}')
  const { price, vehicleType, registrationNumber, message } = body
  if (!price || !vehicleType) return fail('price and vehicleType are required')

  const postResult = await ddb.send(new GetCommand({ TableName: TABLES.DEMAND_POSTS, Key: { demandPostId } }))
  const post = postResult.Item
  if (!post) return fail('Request not found', 404)
  if (post.status !== 'open') return fail('This request is no longer accepting bids', 409)

  const now = new Date().toISOString()
  const bidId = `bid-${randomUUID()}`
  const bid = {
    bidId,
    demandPostId,
    ownerId,
    ownerName: claims?.name || 'Owner',
    vehicleType,
    registrationNumber: registrationNumber || null,
    price: Number(price),
    message: message || null,
    status: 'pending',
    createdAt: now,
  }

  await ddb.send(new PutCommand({ TableName: TABLES.BIDS, Item: bid }))
  await ddb.send(new UpdateCommand({
    TableName: TABLES.DEMAND_POSTS,
    Key: { demandPostId },
    UpdateExpression: 'SET bidCount = bidCount + :one',
    ExpressionAttributeValues: { ':one': 1 },
  }))

  return ok(bid, 201)
}
