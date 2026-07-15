const { GetCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')

// GET /demand-posts/{id} — public. Returns the post itself only, never
// bid details (see bids/listForPost.js for that, which is customer-gated).
exports.handler = async (event) => {
  setRequestOrigin(event)
  const demandPostId = event.pathParameters?.id
  const result = await ddb.send(new GetCommand({ TableName: TABLES.DEMAND_POSTS, Key: { demandPostId } }))
  if (!result.Item) return fail('Request not found', 404)
  return ok(result.Item)
}
