const { UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')

// Client sends: { action: "subscribe", demandPostId }. Identity was already
// established (and verified) at $connect time, so this only records which
// post's updates this connection wants to receive.
exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId
  const body = JSON.parse(event.body || '{}')
  const { demandPostId } = body
  if (!demandPostId) return { statusCode: 400, body: 'demandPostId is required' }

  await ddb.send(new UpdateCommand({
    TableName: TABLES.CONNECTIONS,
    Key: { connectionId },
    UpdateExpression: 'SET demandPostId = :d',
    ExpressionAttributeValues: { ':d': demandPostId },
  }))
  return { statusCode: 200, body: 'Subscribed' }
}
