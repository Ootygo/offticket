const { DeleteCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId
  await ddb.send(new DeleteCommand({ TableName: TABLES.CONNECTIONS, Key: { connectionId } }))
  return { statusCode: 200, body: 'Disconnected' }
}
