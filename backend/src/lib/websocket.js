const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi')
const { DeleteCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('./dynamodb')

function getClient() {
  return new ApiGatewayManagementApiClient({ endpoint: process.env.WEBSOCKET_ENDPOINT })
}

// Pushes a JSON payload to one connected client. If the connection has
// already gone away (browser closed, network drop), API Gateway returns a
// 410 — clean up that stale connection record instead of throwing.
async function sendToConnection(connectionId, payload) {
  const client = getClient()
  try {
    await client.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(payload)),
    }))
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 410) {
      await ddb.send(new DeleteCommand({ TableName: TABLES.CONNECTIONS, Key: { connectionId } }))
    } else {
      throw err
    }
  }
}

module.exports = { sendToConnection }
