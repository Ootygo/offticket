const { ScanCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok } = require('../../lib/response')

// GET /stats — homepage counters
exports.handler = async () => {
  const result = await ddb.send(new ScanCommand({
    TableName: TABLES.BOOKINGS,
    FilterExpression: '#status = :completed',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':completed': 'completed' },
    Select: 'COUNT',
  }))

  return ok({ recentTrips: result.Count || 0 })
}
