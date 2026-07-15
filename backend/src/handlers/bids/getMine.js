const { QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')
const { getUserId } = require('../../lib/auth')

// GET /demand-posts/{id}/bids/mine (owner only). Returns only the
// requesting owner's own bid on this post (or null) — never anyone else's.
exports.handler = async (event) => {
  setRequestOrigin(event)
  const ownerId = getUserId(event)
  if (!ownerId) return fail('Unauthorized', 401)

  const demandPostId = event.pathParameters?.id
  const result = await ddb.send(new QueryCommand({
    TableName: TABLES.BIDS,
    IndexName: 'OwnerBidsIndex',
    KeyConditionExpression: 'ownerId = :o',
    FilterExpression: 'demandPostId = :d',
    ExpressionAttributeValues: { ':o': ownerId, ':d': demandPostId },
  }))

  return ok((result.Items || [])[0] || null)
}
