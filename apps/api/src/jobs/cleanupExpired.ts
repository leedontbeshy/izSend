import type { FastifyBaseLogger } from "fastify";
import { pool } from "../db.js";
import { deleteObject } from "../storage/s3.js";

type FileRow = {
  id: string;
  s3_key: string;
};

const BATCH_SIZE = 100;
const MAX_BATCHES_PER_RUN = 50; // safety cap: up to 5000 files per run

async function cleanupOnce(log: FastifyBaseLogger) {
  let totalDeleted = 0;

  for (let batch = 0; batch < MAX_BATCHES_PER_RUN; batch++) {
    const { rows } = await pool.query<FileRow>(
      `
      SELECT id, s3_key
      FROM files
      WHERE deleted_at IS NULL
        AND expires_at < now()
      LIMIT $1
      `,
      [BATCH_SIZE]
    );

    if (rows.length === 0) break;

    for (const row of rows) {
      try {
        await deleteObject(row.s3_key);
      } catch (err) {
        // If delete fails, keep record for next run.
        log.warn({ err, fileId: row.id }, "cleanup: failed to delete S3 object");
        continue;
      }

      await pool.query("UPDATE files SET deleted_at = now() WHERE id = $1", [row.id]);
      totalDeleted++;
    }

    // If we got fewer rows than the batch size, we've exhausted the backlog.
    if (rows.length < BATCH_SIZE) break;
  }

  if (totalDeleted > 0) {
    log.info({ totalDeleted }, "cleanup: deleted expired files");
  }
}

export function startCleanupJob(log: FastifyBaseLogger, intervalMinutes: number) {
  const intervalMs = Math.max(1, intervalMinutes) * 60_000;

  // Run once on startup
  cleanupOnce(log).catch((err) => log.error({ err }, "cleanup: startup run failed"));

  const timer = setInterval(() => {
    cleanupOnce(log).catch((err) => log.error({ err }, "cleanup: scheduled run failed"));
  }, intervalMs);

  timer.unref();
}
