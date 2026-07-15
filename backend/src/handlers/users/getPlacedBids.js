const { QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, setRequestOrigin } = require('../../lib/response')

// GET /users/{id}/placed-bids — an owner's own bid history (their bids
// only, across every post they've bid on — never other owners' bids).
exports.handler = async (event) => {
  setRequestOrigin(event)
  const ownerId = event.pathParameters?.id
  const result = await ddb.send(new QueryCommand({
    TableName: TABLES.BIDS,
    IndexName: 'OwnerBidsIndex',
    KeyConditionExpression: 'ownerId = :o',
    ExpressionAttributeValues: { ':o': ownerId },
    ScanIndexForward: false,
  }))
  return ok(result.Items || [])
}
