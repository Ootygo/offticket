const { QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, setRequestOrigin } = require('../../lib/response')
const { correctCityName } = require('../../lib/format')

// GET /demand-posts?from=&to=&status= — public browse for vehicle owners
// looking for trips to bid on. Never includes bid details/prices, only
// the post itself and a bare bidCount, so there is nothing for one owner
// to learn about another owner's bid from this endpoint.
exports.handler = async (event) => {
  setRequestOrigin(event)
  const { from, to, status } = event.queryStringParameters || {}
  const wantedStatus = status || 'open'

  let items
  if (from && to) {
    const routeKey = `${correctCityName(from)}#${correctCityName(to)}`
    const result = await ddb.send(new QueryCommand({
      TableName: TABLES.DEMAND_POSTS,
      IndexName: 'RouteIndex',
      KeyConditionExpression: 'routeKey = :r',
      FilterExpression: '#status = :s',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':r': routeKey, ':s': wantedStatus },
      ScanIndexForward: false,
    }))
    items = result.Items || []
  } else {
    const result = await ddb.send(new QueryCommand({
      TableName: TABLES.DEMAND_POSTS,
      IndexName: 'OpenPostsIndex',
      KeyConditionExpression: '#status = :s',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':s': wantedStatus },
      ScanIndexForward: false,
    }))
    items = result.Items || []
  }

  return ok(items)
}
