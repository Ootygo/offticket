const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { verifyToken } = require('../../lib/verifyToken')

// $connect — identity (if any) is established here via a verified Cognito
// ID token passed as ?token=..., never trusted from client-supplied fields
// later. Which demand post this connection cares about comes via a
// separate "subscribe" message once the client has loaded a post.
exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId
  const token = event.queryStringParameters?.token

  const identity = token ? await verifyToken(token).catch(() => null) : null

  await ddb.send(new PutCommand({
    TableName: TABLES.CONNECTIONS,
    Item: {
      connectionId,
      userId: identity?.userId || null,
      userType: identity?.userType || null,
      connectedAt: new Date().toISOString(),
    },
  }))
  return { statusCode: 200, body: 'Connected' }
}
