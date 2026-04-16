import type { FastifyInstance } from "fastify";
import { customAlphabet, nanoid } from "nanoid";
import { randomUUID } from "node:crypto";
import path from "node:path";
import bcrypt from "bcryptjs";
import { Transform } from "node:stream";
import { pool } from "../db.js";
import { env } from "../env.js";
import { deleteObject, presignGetObject, uploadStream } from "../storage/s3.js";

const codeAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const makeCode = customAlphabet(codeAlphabet, 8);

type FileRecord = {
  id: string;
  slug: string;
  code: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  expires_at: string;
  passcode_hash: string | null;
  s3_key: string;
  deleted_at: string | null;
};

function sanitizeFilename(name: string): string {
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function computeExpiresAt(): Date {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + env.fileTtlDays);
  return now;
}

async function insertWithRetry(params: {
  originalName: string;
  contentType: string;
  sizeBytes: number;
  s3Key: string;
  passcodeHash: string | null;
  expiresAt: Date;
}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = randomUUID();
    const slug = nanoid(12);
    const code = makeCode();

    try {
      const { rows } = await pool.query<FileRecord>(
        `
        INSERT INTO files (
          id, slug, code, original_name, content_type, size_bytes, s3_key, passcode_hash, expires_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
          id,
          slug,
          code,
          params.originalName,
          params.contentType,
          params.sizeBytes,
          params.s3Key,
          params.passcodeHash,
          params.expiresAt
        ]
      );

      return rows[0]!;
    } catch (err: any) {
      // 23505 = unique_violation
      if (err?.code === "23505") continue;
      throw err;
    }
  }

  throw new Error("Failed to generate unique slug/code");
}

function isExpired(file: FileRecord): boolean {
  return new Date(file.expires_at).getTime() < Date.now();
}

async function getBySlug(slug: string): Promise<FileRecord | null> {
  const { rows } = await pool.query<FileRecord>(
    "SELECT * FROM files WHERE slug = $1 LIMIT 1",
    [slug]
  );
  return rows[0] ?? null;
}

async function getByCode(code: string): Promise<FileRecord | null> {
  const { rows } = await pool.query<FileRecord>(
    "SELECT * FROM files WHERE code = $1 LIMIT 1",
    [code]
  );
  return rows[0] ?? null;
}

function publicMetadata(file: FileRecord) {
  return {
    id: file.id,
    slug: file.slug,
    code: file.code,
    originalName: file.original_name,
    contentType: file.content_type,
    sizeBytes: file.size_bytes,
    expiresAt: file.expires_at,
    requiresPasscode: Boolean(file.passcode_hash)
  };
}

export async function filesRoutes(fastify: FastifyInstance) {
  fastify.get("/api/health", async () => ({ ok: true }));

  function drainStream(stream: NodeJS.ReadableStream): Promise<void> {
    return new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("end", resolve);
      stream.resume();
    });
  }

  fastify.post(
    "/api/files",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      let passcode: string | undefined;
      let uploaded:
        | {
            originalName: string;
            contentType: string;
            sizeBytes: number;
            s3Key: string;
          }
        | undefined;

      try {
        const parts = request.parts();
        for await (const part of parts) {
          if (part.type === "file") {
            if (part.fieldname !== "file") {
              await drainStream(part.file);
              continue;
            }

            if (uploaded) {
              await drainStream(part.file);
              continue;
            }

            const cleanName = sanitizeFilename(part.filename || "file");
            const s3Key = `files/${randomUUID()}/${cleanName}`;

            let sizeBytes = 0;
            const counter = new Transform({
              transform(chunk, _enc, cb) {
                sizeBytes += Buffer.byteLength(chunk);
                cb(null, chunk);
              }
            });

            part.file.pipe(counter);
            try {
              await uploadStream({
                key: s3Key,
                body: counter,
                contentType: part.mimetype || "application/octet-stream"
              });
            } catch (err: any) {
              // Ensure we don't leak a half-uploaded object.
              await deleteObject(s3Key).catch(() => undefined);
              const message = err?.message ? String(err.message) : "S3 upload failed";
              return reply.status(502).send({ error: message });
            }

            uploaded = {
              originalName: cleanName,
              contentType: part.mimetype || "application/octet-stream",
              sizeBytes,
              s3Key
            };
          } else if (part.type === "field") {
            if (part.fieldname === "passcode") {
              const value = String(part.value ?? "").trim();
              passcode = value ? value : undefined;
            }
          }
        }
      } catch (err: any) {
        if (err?.code === "FST_REQ_FILE_TOO_LARGE") {
          return reply.status(413).send({ error: "File too large" });
        }
        throw err;
      }

      if (passcode && (passcode.length < 4 || passcode.length > 64)) {
        if (uploaded) {
          await deleteObject(uploaded.s3Key);
        }
        return reply.status(400).send({ error: "Invalid passcode" });
      }

      if (!uploaded) return reply.status(400).send({ error: "Missing file" });

      const passcodeHash = passcode ? await bcrypt.hash(passcode, 10) : null;
      const expiresAt = computeExpiresAt();

      let record: FileRecord;
      try {
        record = await insertWithRetry({
          originalName: uploaded.originalName,
          contentType: uploaded.contentType,
          sizeBytes: uploaded.sizeBytes,
          s3Key: uploaded.s3Key,
          passcodeHash,
          expiresAt
        });
      } catch (err) {
        await deleteObject(uploaded.s3Key);
        throw err;
      }

      return reply.send({
        ...publicMetadata(record),
        share: {
          slugPath: `/f/${record.slug}`,
          codePath: `/c/${record.code}`
        }
      });
    }
  );

  fastify.get(
    "/api/files/slug/:slug",
    {
      config: {
        rateLimit: {
          max: 120,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const slug = String((request.params as any).slug);
      const file = await getBySlug(slug);
      if (!file || file.deleted_at) return reply.status(404).send({ error: "Not found" });
      if (isExpired(file)) return reply.status(410).send({ error: "Expired" });
      return reply.send(publicMetadata(file));
    }
  );

  fastify.get(
    "/api/files/code/:code",
    {
      config: {
        rateLimit: {
          max: 120,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const code = String((request.params as any).code).toUpperCase();
      const file = await getByCode(code);
      if (!file || file.deleted_at) return reply.status(404).send({ error: "Not found" });
      if (isExpired(file)) return reply.status(410).send({ error: "Expired" });
      return reply.send(publicMetadata(file));
    }
  );

  fastify.post(
    "/api/files/:id/presign",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const id = String((request.params as any).id);
      const body = (request.body ?? {}) as any;
      const passcode = body?.passcode ? String(body.passcode) : undefined;

      const { rows } = await pool.query<FileRecord>("SELECT * FROM files WHERE id = $1 LIMIT 1", [id]);
      const file = rows[0];
      if (!file || file.deleted_at) return reply.status(404).send({ error: "Not found" });
      if (isExpired(file)) return reply.status(410).send({ error: "Expired" });

      if (file.passcode_hash) {
        if (!passcode) return reply.status(401).send({ error: "Passcode required" });
        const ok = await bcrypt.compare(passcode, file.passcode_hash);
        if (!ok) return reply.status(403).send({ error: "Invalid passcode" });
      }

      const url = await presignGetObject({
        key: file.s3_key,
        expiresInSeconds: Math.max(10, env.presignTtlSeconds)
      });

      return reply.send({ url });
    }
  );
}
