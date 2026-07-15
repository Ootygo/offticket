const { randomUUID } = require('crypto')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { ok, fail, setRequestOrigin } = require('../../lib/response')
const { getUserId } = require('../../lib/auth')

const s3 = new S3Client({})

// POST /uploads/presign { fileName, fileType } -> { uploadUrl, fileUrl }
// Owner uploads the vehicle photo directly to S3 using the returned
// presigned PUT URL, then submits fileUrl as the listing's photo field.
exports.handler = async (event) => {
  setRequestOrigin(event)
  const ownerId = getUserId(event)
  if (!ownerId) return fail('Unauthorized', 401)

  const { fileName, fileType } = JSON.parse(event.body || '{}')
  if (!fileName || !fileType) return fail('fileName and fileType are required')

  const key = `vehicle-photos/${ownerId}/${randomUUID()}-${fileName}`
  const command = new PutObjectCommand({
    Bucket: process.env.PHOTOS_BUCKET,
    Key: key,
    ContentType: fileType,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const fileUrl = `https://${process.env.PHOTOS_BUCKET}.s3.amazonaws.com/${key}`

  return ok({ uploadUrl, fileUrl })
}
