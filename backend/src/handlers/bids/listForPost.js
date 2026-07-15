const { GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')
const { getUserId } = require('../../lib/auth')

// GET /demand-posts/{id}/bids (customer only). This is the core privacy
// boundary of the whole bidding system: only the customer who created the
// request can ever see the list of bids on it. Vehicle owners never get
// this — see bids/getMine.js for what an owner is allowed to see instead.
exports.handler = async (event) => {
  setRequestOrigin(event)
  const customerId = getUserId(event)
  if (!customerId) return fail('Unauthorized', 401)

  const demandPostId = event.pathParameters?.id
  const postResult = await ddb.send(new GetCommand({ TableName: TABLES.DEMAND_POSTS, Key: { demandPostId } }))
  const post = postResult.Item
  if (!post) return fail('Request not found', 404)
  if (post.customerId !== customerId) return fail('Forbidden', 403)

  const result = await ddb.send(new QueryCommand({
    TableName: TABLES.BIDS,
    IndexName: 'DemandPostBidsIndex',
    KeyConditionExpression: 'demandPostId = :d',
    ExpressionAttributeValues: { ':d': demandPostId },
    ScanIndexForward: true,
  }))

  return ok(result.Items || [])
}
