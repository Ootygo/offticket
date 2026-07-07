const { QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok } = require('../../lib/response')

// GET /users/{id}/demand-posts — a customer's own posted requirements.
exports.handler = async (event) => {
  const customerId = event.pathParameters?.id
  const result = await ddb.send(new QueryCommand({
    TableName: TABLES.DEMAND_POSTS,
    IndexName: 'CustomerPostsIndex',
    KeyConditionExpression: 'customerId = :c',
    ExpressionAttributeValues: { ':c': customerId },
    ScanIndexForward: false,
  }))
  return ok(result.Items || [])
}
