const { GetCommand, UpdateCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')
const { getUserId } = require('../../lib/auth')

function generateBookingId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randPart = Math.floor(1000 + Math.random() * 9000)
  return `OT-${datePart}-${randPart}`
}

// PUT /demand-posts/{id}/bids/{bidId}/accept (customer only, must own the
// post). Accepts the winning bid, rejects every other pending bid on the
// post, closes the post, and creates an already-confirmed booking — the
// owner committed to this price by bidding, so there's no separate
// owner-confirmation step like the listing-based booking flow has.
exports.handler = async (event) => {
  setRequestOrigin(event)
  const customerId = getUserId(event)
  if (!customerId) return fail('Unauthorized', 401)

  const { id: demandPostId, bidId } = event.pathParameters || {}

  const postResult = await ddb.send(new GetCommand({ TableName: TABLES.DEMAND_POSTS, Key: { demandPostId } }))
  const post = postResult.Item
  if (!post) return fail('Request not found', 404)
  if (post.customerId !== customerId) return fail('Forbidden', 403)
  if (post.status !== 'open') return fail('This request has already been awarded or closed', 409)

  const bidResult = await ddb.send(new GetCommand({ TableName: TABLES.BIDS, Key: { bidId } }))
  const bid = bidResult.Item
  if (!bid || bid.demandPostId !== demandPostId) return fail('Bid not found', 404)

  await ddb.send(new UpdateCommand({
    TableName: TABLES.BIDS,
    Key: { bidId },
    UpdateExpression: 'SET #status = :accepted',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':accepted': 'accepted' },
  }))

  const otherBids = await ddb.send(new QueryCommand({
    TableName: TABLES.BIDS,
    IndexName: 'DemandPostBidsIndex',
    KeyConditionExpression: 'demandPostId = :d',
    ExpressionAttributeValues: { ':d': demandPostId },
  }))
  await Promise.all(
    (otherBids.Items || [])
      .filter((b) => b.bidId !== bidId && b.status === 'pending')
      .map((b) => ddb.send(new UpdateCommand({
        TableName: TABLES.BIDS,
        Key: { bidId: b.bidId },
        UpdateExpression: 'SET #status = :rejected',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':rejected': 'rejected' },
      })))
  )

  await ddb.send(new UpdateCommand({
    TableName: TABLES.DEMAND_POSTS,
    Key: { demandPostId },
    UpdateExpression: 'SET #status = :awarded, awardedBidId = :bidId',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':awarded': 'awarded', ':bidId': bidId },
  }))

  const bookingId = generateBookingId()
  const booking = {
    bookingId,
    demandPostId,
    bidId,
    listingId: null,
    customerId,
    ownerId: bid.ownerId,
    goodsDetails: post.goodsDetails,
    passengerCount: post.passengerCount,
    totalPrice: bid.price,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
  }
  await ddb.send(new PutCommand({ TableName: TABLES.BOOKINGS, Item: booking }))

  return ok(booking)
}
