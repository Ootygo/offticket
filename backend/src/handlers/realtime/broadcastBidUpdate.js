const { unmarshall } = require('@aws-sdk/util-dynamodb')
const { QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { sendToConnection } = require('../../lib/websocket')

// Triggered by the Bids table's DynamoDB Stream. This is the privacy
// boundary for realtime updates, mirroring the REST API's rule: the
// customer who owns the post gets full bid details pushed live; other
// owners' connections only ever get a content-free "activity" ping or a
// status update about *their own* bid — never another owner's price.
exports.handler = async (event) => {
  for (const record of event.Records) {
    const newImage = record.dynamodb?.NewImage
    if (!newImage) continue

    const bid = unmarshall(newImage)
    const demandPostId = bid.demandPostId
    if (!demandPostId) continue

    const connResult = await ddb.send(new QueryCommand({
      TableName: TABLES.CONNECTIONS,
      IndexName: 'DemandPostConnectionsIndex',
      KeyConditionExpression: 'demandPostId = :d',
      ExpressionAttributeValues: { ':d': demandPostId },
    }))
    const connections = connResult.Items || []
    if (connections.length === 0) continue

    if (record.eventName === 'INSERT') {
      await Promise.all(connections.map((conn) => {
        const payload = conn.userType === 'customer'
          ? { type: 'new_bid', bid }
          : { type: 'bid_activity' }
        return sendToConnection(conn.connectionId, payload).catch(() => {})
      }))
      continue
    }

    if (record.eventName === 'MODIFY') {
      const oldImage = record.dynamodb.OldImage
      const oldBid = oldImage ? unmarshall(oldImage) : null
      if (oldBid && oldBid.status === bid.status) continue

      await Promise.all(connections.map((conn) => {
        if (conn.userType === 'customer') {
          return sendToConnection(conn.connectionId, { type: 'bid_updated', bid }).catch(() => {})
        }
        if (conn.userId === bid.ownerId) {
          return sendToConnection(conn.connectionId, {
            type: 'your_bid_status',
            bidId: bid.bidId,
            status: bid.status,
          }).catch(() => {})
        }
        return Promise.resolve()
      }))
    }
  }

  return { statusCode: 200, body: 'OK' }
}
