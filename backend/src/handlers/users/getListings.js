const { QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')

// GET /users/{id}/listings — vehicles/listings owned by this user
exports.handler = async (event) => {
  setRequestOrigin(event)
  const ownerId = event.pathParameters?.id
  if (!ownerId) return fail('userId is required')

  const result = await ddb.send(new QueryCommand({
    TableName: TABLES.LISTINGS,
    IndexName: 'OwnerListingsIndex',
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: { ':ownerId': ownerId },
  }))

  return ok(result.Items || [])
}
