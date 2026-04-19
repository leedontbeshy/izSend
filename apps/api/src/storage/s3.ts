import { S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "node:stream";
import { env } from "../env.js";

export const s3 = new S3Client({
  region: env.awsRegion,
  endpoint: env.s3Endpoint,
  forcePathStyle: env.s3ForcePathStyle
});

export async function uploadStream(params: {
  key: string;
  body: Readable;
  contentType: string;
}) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: env.s3Bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType
    }
  });

  await upload.done();
}

export async function deleteObject(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.s3Bucket,
      Key: key
    })
  );
}

/**
 * Encode a filename for use in a Content-Disposition header.
 * Falls back to ASCII-safe name while preserving UTF-8 via RFC 5987.
 */
function contentDispositionAttachment(filename: string): string {
  // Strip control characters
  const safe = filename.replace(/[\x00-\x1f\x7f]/g, "");
  const asciiOnly = safe.replace(/[^\x20-\x7e]/g, "_");
  // Always include both for compatibility: filename= (ASCII) and filename*= (UTF-8)
  return `attachment; filename="${asciiOnly}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

export async function presignGetObject(params: {
  key: string;
  filename: string;
  expiresInSeconds: number;
}) {
  const command = new GetObjectCommand({
    Bucket: env.s3Bucket,
    Key: params.key,
    ResponseContentDisposition: contentDispositionAttachment(params.filename)
  });

  return getSignedUrl(s3, command, { expiresIn: params.expiresInSeconds });
}
