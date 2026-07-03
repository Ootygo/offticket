const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

const TABLES = {
  USERS: process.env.USERS_TABLE,
  VEHICLES: process.env.VEHICLES_TABLE,
  LISTINGS: process.env.LISTINGS_TABLE,
  BOOKINGS: process.env.BOOKINGS_TABLE,
}

module.exports = { ddb, TABLES }
