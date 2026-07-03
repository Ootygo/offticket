const { QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail } = require('../../lib/response')
const { correctCityName } = require('../../lib/format')

// GET /listings?from=&to=&date=&type=
exports.handler = async (event) => {
  const { from, to, date, type } = event.queryStringParameters || {}
  if (!from || !to) return fail('from and to query params are required')

  const routeKey = `${correctCityName(from)}#${correctCityName(to)}`
  const params = {
    TableName: TABLES.LISTINGS,
    IndexName: 'RouteIndex',
    KeyConditionExpression: 'routeKey = :routeKey' + (date ? ' AND departureDate = :date' : ''),
    FilterExpression: '#status = :active',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':routeKey': routeKey,
      ':active': 'active',
      ...(date ? { ':date': date } : {}),
    },
  }

  const result = await ddb.send(new QueryCommand(params))
  let items = result.Items || []

  if (type === 'goods') items = items.filter((l) => l.vehicleType !== 'cab')
  if (type === 'passenger') items = items.filter((l) => l.vehicleType === 'cab')

  return ok(items)
}
