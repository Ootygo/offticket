const { QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')

// GET /users/{id}/bookings[?role=owner]
// Default role is customer (bookings the user made). role=owner returns
// incoming booking requests for vehicles that user owns.
exports.handler = async (event) => {
  setRequestOrigin(event)
  const userId = event.pathParameters?.id
  const role = event.queryStringParameters?.role
  if (!userId) return fail('userId is required')

  const isOwner = role === 'owner'
  const result = await ddb.send(new QueryCommand({
    TableName: TABLES.BOOKINGS,
    IndexName: isOwner ? 'OwnerBookingsIndex' : 'CustomerBookingsIndex',
    KeyConditionExpression: `${isOwner ? 'ownerId' : 'customerId'} = :userId`,
    ExpressionAttributeValues: { ':userId': userId },
  }))

  return ok(result.Items || [])
}
