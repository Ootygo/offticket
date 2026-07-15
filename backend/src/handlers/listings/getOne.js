const { GetCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail, setRequestOrigin } = require('../../lib/response')

// GET /listings/{id}
exports.handler = async (event) => {
  setRequestOrigin(event)
  const listingId = event.pathParameters?.id
  const result = await ddb.send(
    new GetCommand({ TableName: TABLES.LISTINGS, Key: { listingId } })
  )
  if (!result.Item) return fail('Listing not found', 404)
  return ok(result.Item)
}
