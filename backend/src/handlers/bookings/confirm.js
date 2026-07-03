const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { ddb, TABLES } = require('../../lib/dynamodb')
const { ok, fail } = require('../../lib/response')
const { getUserId } = require('../../lib/auth')

// PUT /bookings/{id}/confirm (owner only — requires Cognito owner-pool token)
exports.handler = async (event) => {
  const ownerId = getUserId(event)
  if (!ownerId) return fail('Unauthorized', 401)

  const bookingId = event.pathParameters?.id
  const bookingResult = await ddb.send(
    new GetCommand({ TableName: TABLES.BOOKINGS, Key: { bookingId } })
  )
  const booking = bookingResult.Item
  if (!booking) return fail('Booking not found', 404)
  if (booking.ownerId !== ownerId) return fail('Forbidden', 403)

  const updated = await ddb.send(new UpdateCommand({
    TableName: TABLES.BOOKINGS,
    Key: { bookingId },
    UpdateExpression: 'SET #status = :confirmed',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':confirmed': 'confirmed' },
    ReturnValues: 'ALL_NEW',
  }))

  return ok(updated.Attributes)
}
