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

export async function presignGetObject(params: { key: string; expiresInSeconds: number }) {
  const command = new GetObjectCommand({
    Bucket: env.s3Bucket,
    Key: params.key
  });

  return getSignedUrl(s3, command, { expiresIn: params.expiresInSeconds });
}